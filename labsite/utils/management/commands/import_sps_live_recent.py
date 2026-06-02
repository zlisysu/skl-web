import hashlib
import mimetypes
import re
from datetime import datetime, time
from io import BytesIO
from pathlib import Path
from urllib.parse import unquote, urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify
from PIL import Image as PILImage

from labsite.images.models import CustomImage
from labsite.news.models import ArticlePage, NewsListingPage
from labsite.standardpages.models import AchievementIndexPage, AchievementPage
from labsite.utils.models import ArticleTopic, AuthorSnippet


START_DATE = datetime(2023, 1, 1).date()
SITE = "https://sps.sysu.edu.cn"
DESKTOP_HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
}
WECHAT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) "
        "AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 "
        "MicroMessenger/8.0.42"
    ),
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
}
RESEARCH_TITLE_PATTERNS = (
    "课题组",
    "科研新进展",
    "科研取得",
    "研究团队",
    "团队发现",
    "研究成果",
    "研究中取得",
    "取得新",
    "取得系列",
    "揭示",
    "发现",
    "发表",
    "论文",
    "期刊",
    "PNAS",
    "NSR",
    "Cell",
    "Nature",
    "Science",
    "Gut",
    "Adv. Sci",
)


class Command(BaseCommand):
    help = "Import recent SPS official list items from 2023-01-01 through today."

    def handle(self, *args, **options):
        news_index = NewsListingPage.objects.first()
        research_index = AchievementIndexPage.objects.first()
        if not news_index:
            raise CommandError("No NewsListingPage found.")
        if not research_index:
            raise CommandError("No AchievementIndexPage found.")

        author = AuthorSnippet.objects.first() or AuthorSnippet.objects.create(title="实验室办公室")
        topic, _ = ArticleTopic.objects.get_or_create(slug="pharmacy-news", defaults={"title": "药学院新闻"})
        if topic.title != "药学院新闻":
            topic.title = "药学院新闻"
            topic.save(update_fields=["title"])

        end_date = timezone.localdate()
        listed_news = self.collect_list_items("/news", max_pages=80, end_date=end_date)
        news_items = [
            item
            for item in listed_news
            if "王红胜" not in item["title"] and not self.is_research_title(item["title"])
        ]
        research_items = self.collect_list_items("/research/achievements", max_pages=10, end_date=end_date)
        research_items.extend(
            item
            for item in listed_news
            if self.is_research_title(item["title"])
        )
        research_items = self.dedupe(research_items)

        with transaction.atomic():
            removed_news = self.delete_old_news()
            removed_research = self.delete_old_research()
            removed_wang = self.delete_wang_news()
            removed_wang_research = self.delete_wang_research()
            removed_misclassified_research = self.delete_misclassified_research(research_items)

            created_news = updated_news = 0
            for item in news_items:
                page, created = self.upsert_news(news_index, author, topic, item)
                if created:
                    created_news += 1
                else:
                    updated_news += 1

            created_research = updated_research = 0
            for item in research_items:
                page, created = self.upsert_research(research_index, item)
                if created:
                    created_research += 1
                else:
                    updated_research += 1

        self.stdout.write(
            self.style.SUCCESS(
                "Imported recent SPS list items: "
                f"news created={created_news}, updated={updated_news}; "
                f"research created={created_research}, updated={updated_research}; "
                f"removed old news={removed_news}, old research={removed_research}, "
                f"Wang news={removed_wang}, Wang research={removed_wang_research}, "
                f"misclassified research={removed_misclassified_research}."
            )
        )

    def collect_list_items(self, path, max_pages, end_date):
        items = []
        seen = set()
        for page_num in range(max_pages):
            url = urljoin(SITE, path)
            if page_num:
                url = f"{url}?page={page_num}"
            response = requests.get(url, timeout=20, headers=DESKTOP_HEADERS)
            response.raise_for_status()
            response.encoding = "utf-8"
            soup = BeautifulSoup(response.text, "html.parser")
            page_items = []
            for anchor in soup.find_all("a", href=True):
                text = self.normalize(anchor.get_text(" ", strip=True))
                match = re.match(r"(?P<date>20\d{2}-\d{2}-\d{2})\s+(?P<title>.+)", text)
                if not match:
                    continue
                date = datetime.strptime(match.group("date"), "%Y-%m-%d").date()
                if date < START_DATE or date > end_date:
                    continue
                href = urljoin(SITE, anchor["href"])
                key = (match.group("title"), date)
                if key in seen:
                    continue
                seen.add(key)
                page_items.append({"title": match.group("title").strip(), "date": date, "url": href})
            items.extend(page_items)
            if not page_items:
                break
            if min(item["date"] for item in page_items) < START_DATE:
                break
        return self.dedupe(items)

    def dedupe(self, items):
        deduped = {}
        for item in items:
            current = deduped.get(item["title"])
            if not current or self.prefer_url(item["url"], current["url"]):
                deduped[item["title"]] = item
        return list(deduped.values())

    def upsert_news(self, parent, author, topic, item):
        existing = ArticlePage.objects.child_of(parent).filter(title=item["title"]).specific().first()
        body = self.link_body(item["url"])
        intro = f"来源：中山大学药学院官网。原文链接：{item['url']}"
        image = self.import_image(
            self.extract_listing_image_url(item["url"]),
            title_prefix="Pharmacy news",
            filename_prefix="pharmacy-news",
        )
        if existing:
            existing.publication_date = self.as_datetime(item["date"])
            existing.introduction = intro
            existing.source_url = item["url"]
            existing.open_source_directly = self.should_open_source_directly(item["url"])
            existing.body = body
            existing.author = author
            existing.topic = topic
            if image:
                existing.listing_image = image
            existing.save_revision().publish()
            return existing, False

        page = ArticlePage(
            title=item["title"],
            slug=self.unique_slug(parent, item["title"]),
            author=author,
            topic=topic,
            publication_date=self.as_datetime(item["date"]),
            introduction=intro,
            source_url=item["url"],
            open_source_directly=self.should_open_source_directly(item["url"]),
            body=body,
            listing_image=image,
            listing_summary=intro[:255],
            search_description=intro[:255],
            live=True,
            has_unpublished_changes=False,
            show_in_menus=False,
        )
        parent.add_child(instance=page)
        page.save_revision().publish()
        return page, True

    def upsert_research(self, parent, item):
        existing = AchievementPage.objects.child_of(parent).filter(title=item["title"]).specific().first()
        body = self.link_body(item["url"])
        summary = f"来源：中山大学药学院官网。原文链接：{item['url']}"
        image = self.import_image(
            self.extract_listing_image_url(item["url"]),
            title_prefix="Achievement",
            filename_prefix="achievement",
        )
        if existing:
            existing.achievement_date = item["date"]
            existing.summary = summary
            existing.source_url = item["url"]
            existing.open_source_directly = self.should_open_source_directly(item["url"])
            if not existing.body:
                existing.body = body
            if image:
                existing.listing_image = image
            existing.save_revision().publish()
            return existing, False

        page = AchievementPage(
            title=item["title"],
            slug=self.unique_slug(parent, item["title"]),
            achievement_type="paper" if self.is_paper_like(item["title"]) else "project",
            achievement_date=item["date"],
            summary=summary,
            source_url=item["url"],
            open_source_directly=self.should_open_source_directly(item["url"]),
            body=body,
            listing_image=image,
            listing_summary=summary[:255],
            search_description=summary[:255],
            live=True,
            has_unpublished_changes=False,
            show_in_menus=False,
        )
        parent.add_child(instance=page)
        page.save_revision().publish()
        return page, True

    def delete_old_news(self):
        qs = ArticlePage.objects.filter(publication_date__lt=self.as_datetime(START_DATE)).specific()
        count = qs.count()
        for page in qs:
            page.delete()
        return count

    def delete_old_research(self):
        qs = AchievementPage.objects.filter(achievement_date__lt=START_DATE).specific()
        count = qs.count()
        for page in qs:
            page.delete()
        return count

    def delete_wang_news(self):
        pages = [
            page
            for page in ArticlePage.objects.specific()
            if self.contains_wang(page.title)
            or self.contains_wang(page.introduction)
            or self.contains_wang(page.body)
        ]
        count = len(pages)
        for page in pages:
            page.delete()
        return count

    def delete_wang_research(self):
        pages = [
            page
            for page in AchievementPage.objects.specific()
            if self.contains_wang(page.title)
            or self.contains_wang(page.summary)
            or self.contains_wang(page.body)
        ]
        count = len(pages)
        for page in pages:
            page.delete()
        return count

    def delete_misclassified_research(self, desired_items):
        desired_titles = {item["title"] for item in desired_items}
        pages = [
            page
            for page in AchievementPage.objects.specific()
            if page.title not in desired_titles
            and (
                self.is_imported_source_summary(page.summary)
                or self.is_imported_source_body(page.body)
            )
        ]
        count = len(pages)
        for page in pages:
            page.delete()
        return count

    def link_body(self, url):
        html = f'<p>原文链接：<a href="{url}">{url}</a></p>'
        return [("section", {"heading": "正文", "content": [("paragraph", html)]})]

    def extract_listing_image_url(self, source_url):
        if not source_url:
            return ""
        if "mp.weixin.qq.com" in source_url:
            return self.extract_wechat_image_url(source_url)
        return self.extract_sps_image_url(source_url)

    def extract_wechat_image_url(self, source_url):
        soup, html = self.fetch_soup(source_url, WECHAT_HEADERS)
        if not soup:
            return ""

        for selector in (
            'meta[property="og:image"]',
            'meta[name="twitter:image"]',
            'meta[property="twitter:image"]',
        ):
            meta = soup.select_one(selector)
            content = meta.get("content") if meta else ""
            if content:
                return content

        match = re.search(r'var\s+msg_cdn_url\s*=\s*"([^"]+)"', html)
        if match:
            return match.group(1)

        for image in soup.find_all("img"):
            src = self.image_src(image)
            if src and self.is_usable_wechat_image(src):
                return urljoin(source_url, src)
        return ""

    def extract_sps_image_url(self, source_url):
        soup, _html = self.fetch_soup(source_url, DESKTOP_HEADERS)
        if not soup:
            return ""

        candidates = list(soup.select('img[src*="/inline-images/"]'))
        candidates.extend(soup.find_all("img"))
        for image in candidates:
            src = self.image_src(image)
            if src and self.is_usable_sps_image(src):
                return urljoin(source_url, src)
        return ""

    def fetch_soup(self, url, headers):
        try:
            response = requests.get(url, timeout=25, headers=headers, allow_redirects=True)
            response.raise_for_status()
            response.encoding = response.encoding or "utf-8"
        except Exception:
            return None, ""
        return BeautifulSoup(response.text, "html.parser"), response.text

    def import_image(self, url, title_prefix="Pharmacy news", filename_prefix="pharmacy-news"):
        if not url:
            return None
        digest = hashlib.sha1(url.encode("utf-8")).hexdigest()[:16]
        existing = CustomImage.objects.filter(title=f"{title_prefix} {digest}").first()
        if existing:
            return existing

        try:
            response = requests.get(url, timeout=30, headers=WECHAT_HEADERS)
            response.raise_for_status()
            content = response.content
            content_type = response.headers.get("Content-Type", "").split(";")[0]
            with PILImage.open(BytesIO(content)) as pil_image:
                width, height = pil_image.size
        except Exception:
            return None

        suffix = Path(unquote(urlparse(url).path)).suffix.lower()
        if not suffix or len(suffix) > 8:
            suffix = mimetypes.guess_extension(content_type) or ".jpg"

        image = CustomImage(title=f"{title_prefix} {digest}")
        image.file.save(f"{filename_prefix}-{digest}{suffix}", ContentFile(content), save=False)
        image.width = width
        image.height = height
        image.save()
        return image

    def as_datetime(self, value):
        return timezone.make_aware(datetime.combine(value, time(hour=12)))

    def normalize(self, text):
        return re.sub(r"\s+", " ", text).strip()

    def image_src(self, image):
        for attr in ("data-src", "data-original", "data-backsrc", "src"):
            value = image.get(attr)
            if value:
                return value
        return ""

    def is_usable_sps_image(self, src):
        lower = src.lower()
        return "/inline-images/" in lower and not any(
            marker in lower
            for marker in ("ewm", "qrcode", "qr", "logo", "spslogo", "bottom", "icon")
        )

    def is_usable_wechat_image(self, src):
        lower = src.lower()
        return "mmbiz.qpic.cn" in lower and not any(
            marker in lower for marker in ("emoji", "icon", "profile_photo")
        )

    def is_research_title(self, title):
        return any(pattern in title for pattern in RESEARCH_TITLE_PATTERNS)

    def is_paper_like(self, title):
        return self.is_research_title(title)

    def should_open_source_directly(self, url):
        return "mp.weixin.qq.com" in url

    def contains_wang(self, value):
        return "王红胜" in str(value or "")

    def is_imported_source_summary(self, value):
        return str(value or "").startswith("来源：中山大学药学院官网。原文链接：")

    def is_imported_source_body(self, value):
        return "原文链接：" in str(value or "")

    def prefer_url(self, new_url, old_url):
        if "/article/" in new_url and "/article/" not in old_url:
            return True
        if "mp.weixin.qq.com" in new_url and "mp.weixin.qq.com" not in old_url:
            return True
        return False

    def unique_slug(self, parent, title):
        base = slugify(title, allow_unicode=True) or "page"
        slug = base[:240]
        candidate = slug
        counter = 2
        while parent.get_children().filter(slug=candidate).exists():
            suffix = f"-{counter}"
            candidate = f"{slug[: 255 - len(suffix)]}{suffix}"
            counter += 1
        return candidate
