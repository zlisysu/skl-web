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
from django.utils.text import Truncator, slugify
from PIL import Image as PILImage

from labsite.images.models import CustomImage
from labsite.news.models import ArticlePage, NewsListingPage
from labsite.utils.models import ArticleTopic, AuthorSnippet


SITE = "https://www.hecpharm.com"
LIST_URL = f"{SITE}/news_media/company_news"
OPEN_PROJECT_URL = f"{SITE}/news_media/company_news/1243.html"
OLD_LAB_NAME = "东阳光药抗感染新药研发全国重点实验室"
NEW_LAB_NAME = "抗感染新药研发全国重点实验室"


class Command(BaseCommand):
    help = "Import HEC Pharm company news links and the open project article."

    def handle(self, *args, **options):
        news_index = NewsListingPage.objects.first()
        if not news_index:
            raise CommandError("No NewsListingPage found.")

        author = AuthorSnippet.objects.first() or AuthorSnippet.objects.create(title="实验室办公室")

        with transaction.atomic():
            pharmacy_topic = self.ensure_topic("药学院新闻", "pharmacy-news")
            hec_topic = self.ensure_topic("东阳光新闻", "hec-news")
            open_topic = self.ensure_topic("开放课题", "open-projects")
            self.move_pharmacy_news(pharmacy_topic)

            records = self.collect_company_news()
            created = updated = skipped = 0
            for record in records:
                if record["url"] == OPEN_PROJECT_URL:
                    skipped += 1
                    continue
                image = self.import_image(record["image_url"], "HEC")
                _page, was_created = self.upsert_link_article(
                    news_index,
                    author,
                    hec_topic,
                    record,
                    image,
                )
                if was_created:
                    created += 1
                else:
                    updated += 1

            detail = self.fetch_open_project_detail()
            _open_page, open_created = self.upsert_open_project(
                news_index,
                author,
                open_topic,
                detail,
                None,
            )

        self.stdout.write(
            self.style.SUCCESS(
                "Imported HEC news: "
                f"company created={created}, updated={updated}, skipped={skipped}; "
                f"open project {'created' if open_created else 'updated'}."
            )
        )

    def collect_company_news(self):
        records = []
        seen = set()
        for page_number in range(1, 50):
            url = LIST_URL if page_number == 1 else f"{LIST_URL}?page={page_number}"
            soup = self.fetch_soup(url)
            items = soup.select(".news-list a.item")
            if not items:
                break

            for item in items:
                title_el = item.select_one(".title")
                date_el = item.select_one(".date")
                intro_el = item.select_one(".intro")
                if not title_el or not date_el:
                    continue

                source_url = urljoin(SITE, item.get("href", ""))
                if source_url in seen:
                    continue
                seen.add(source_url)

                image_el = item.select_one("img")
                records.append(
                    {
                        "title": self.normalize(title_el.get_text(" ", strip=True)),
                        "date": datetime.strptime(date_el.get_text(strip=True), "%Y-%m-%d").date(),
                        "url": source_url,
                        "introduction": self.normalize(intro_el.get_text(" ", strip=True)) if intro_el else "",
                        "image_url": urljoin(SITE, image_el["src"]) if image_el and image_el.get("src") else "",
                    }
                )
        return records

    def fetch_open_project_detail(self):
        soup = self.fetch_soup(OPEN_PROJECT_URL)
        article = soup.select_one(".art-news-detail .article")
        if not article:
            raise CommandError("No open project article content found.")

        title_el = article.select_one(".title")
        title = self.normalize(title_el.get_text(" ", strip=True)) if title_el else "抗感染新药研发全国重点实验室2025年度开放课题申请指南"
        title = title.replace(OLD_LAB_NAME, NEW_LAB_NAME)
        date = self.extract_date(article.get_text(" ", strip=True))

        for selector in (".title", ".subtitle"):
            el = article.select_one(selector)
            if el:
                el.decompose()

        for image in article.find_all("img"):
            image.decompose()

        for tag in article.find_all(True):
            for attr in list(tag.attrs):
                if attr.startswith("data-") or attr in {"class", "style"}:
                    del tag.attrs[attr]

        body_html = "".join(str(child) for child in article.contents).strip()
        body_html = body_html.replace(OLD_LAB_NAME, NEW_LAB_NAME)
        plain_text = self.normalize(article.get_text(" ", strip=True)).replace(OLD_LAB_NAME, NEW_LAB_NAME)
        return {
            "title": title,
            "date": date,
            "url": OPEN_PROJECT_URL,
            "introduction": Truncator(plain_text).chars(180, truncate="..."),
            "body_html": body_html,
            "image_url": "",
        }

    def upsert_link_article(self, parent, author, topic, record, image):
        page = (
            ArticlePage.objects.child_of(parent)
            .filter(source_url=record["url"])
            .specific()
            .first()
            or ArticlePage.objects.child_of(parent).filter(title=record["title"]).specific().first()
        )
        intro = record["introduction"] or f"来源：东阳光药官网。原文链接：{record['url']}"
        body = self.link_body(record["url"])

        if page:
            page.title = record["title"]
            page.publication_date = self.as_datetime(record["date"])
            page.introduction = intro
            page.source_url = record["url"]
            page.open_source_directly = True
            page.body = body
            page.author = author
            page.topic = topic
            page.listing_image = image
            page.listing_summary = intro[:255]
            page.search_description = intro[:255]
            page.save_revision().publish()
            return page, False

        page = ArticlePage(
            title=record["title"],
            slug=self.unique_slug(parent, record["title"]),
            author=author,
            topic=topic,
            publication_date=self.as_datetime(record["date"]),
            introduction=intro,
            source_url=record["url"],
            open_source_directly=True,
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

    def upsert_open_project(self, parent, author, topic, detail, image):
        page = (
            ArticlePage.objects.child_of(parent)
            .filter(source_url=detail["url"])
            .specific()
            .first()
            or ArticlePage.objects.child_of(parent).filter(title=detail["title"]).specific().first()
        )
        body = [("section", {"heading": "正文", "content": [("paragraph", detail["body_html"])]})]
        if page:
            page.title = detail["title"]
            page.publication_date = self.as_datetime(detail["date"])
            page.introduction = detail["introduction"]
            page.source_url = detail["url"]
            page.open_source_directly = False
            page.body = body
            page.author = author
            page.topic = topic
            page.listing_image = image
            page.listing_summary = detail["introduction"][:255]
            page.search_description = detail["introduction"][:255]
            page.save_revision().publish()
            return page, False

        page = ArticlePage(
            title=detail["title"],
            slug=self.unique_slug(parent, detail["title"]),
            author=author,
            topic=topic,
            publication_date=self.as_datetime(detail["date"]),
            introduction=detail["introduction"],
            source_url=detail["url"],
            open_source_directly=False,
            body=body,
            listing_image=image,
            listing_summary=detail["introduction"][:255],
            search_description=detail["introduction"][:255],
            live=True,
            has_unpublished_changes=False,
            show_in_menus=False,
        )
        parent.add_child(instance=page)
        page.save_revision().publish()
        return page, True

    def move_pharmacy_news(self, topic):
        pages = ArticlePage.objects.filter(source_url__contains="sps.sysu.edu.cn").specific()
        pages = list(pages) + list(ArticlePage.objects.filter(source_url__contains="mp.weixin.qq.com").specific())
        for page in pages:
            if page.topic_id != topic.id:
                page.topic = topic
                page.save_revision().publish()

    def ensure_topic(self, title, slug):
        topic, _created = ArticleTopic.objects.get_or_create(slug=slug, defaults={"title": title})
        if topic.title != title:
            topic.title = title
            topic.save(update_fields=["title"])
        return topic

    def fetch_soup(self, url):
        response = requests.get(url, timeout=25, headers={"User-Agent": "Mozilla/5.0"})
        response.raise_for_status()
        response.encoding = "utf-8"
        return BeautifulSoup(response.text, "html.parser")

    def import_image(self, url, prefix):
        if not url:
            return None
        digest = hashlib.sha1(url.encode("utf-8")).hexdigest()[:16]
        existing = CustomImage.objects.filter(title=f"{prefix} {digest}").first()
        if existing:
            return existing

        try:
            response = requests.get(url, timeout=25, headers={"User-Agent": "Mozilla/5.0"})
            response.raise_for_status()
            content = response.content
            content_type = response.headers.get("Content-Type", "").split(";")[0]
            with PILImage.open(BytesIO(content)) as pil_image:
                width, height = pil_image.size
        except Exception as exc:
            self.stderr.write(f"Image download failed: {url} ({exc})")
            return None

        suffix = Path(unquote(urlparse(url).path)).suffix.lower()
        if not suffix:
            suffix = mimetypes.guess_extension(content_type) or ".jpg"
        image = CustomImage(title=f"{prefix} {digest}")
        image.file.save(f"{prefix.lower()}-{digest}{suffix}", ContentFile(content), save=False)
        image.width = width
        image.height = height
        image.save()
        return image

    def link_body(self, url):
        html = f'<p>原文链接：<a href="{url}">{url}</a></p>'
        return [("section", {"heading": "正文", "content": [("paragraph", html)]})]

    def extract_date(self, text):
        match = re.search(r"20\d{2}-\d{2}-\d{2}", text)
        if not match:
            return timezone.localdate()
        return datetime.strptime(match.group(0), "%Y-%m-%d").date()

    def as_datetime(self, value):
        return timezone.make_aware(datetime.combine(value, time(hour=12)))

    def normalize(self, text):
        return re.sub(r"\s+", " ", text).strip()

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
