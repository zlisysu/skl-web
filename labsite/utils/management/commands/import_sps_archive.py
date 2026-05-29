import hashlib
import mimetypes
import re
import urllib.request
from io import BytesIO
from datetime import datetime, time
from pathlib import Path
from urllib.parse import unquote, urljoin, urlparse

from bs4 import BeautifulSoup
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone
from django.utils.text import Truncator, slugify
from PIL import Image as PILImage

from labsite.images.models import CustomImage
from labsite.news.models import ArticlePage, NewsListingPage
from labsite.standardpages.models import AchievementIndexPage, AchievementPage
from labsite.utils.models import ArticleTopic, AuthorSnippet


ARCHIVE_SITE = "https://sps.sysu.edu.cn"
NEWS_BREADCRUMB = "首页  学院动态  学院新闻 "
RESEARCH_BREADCRUMB = "首页  学术科研  科研成果 "
RESEARCH_TITLE_PATTERNS = (
    "课题组",
    "团队",
    "科研新进展",
    "研究成果",
    "研究中取得",
    "取得新",
    "揭示",
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
    "Mol Cell",
)


class Command(BaseCommand):
    help = "Import SPS archive news and research result pages into Wagtail."

    def add_arguments(self, parser):
        parser.add_argument(
            "--archive",
            default="../sps_sysu_archive",
            help="Path to the full SPS archive directory.",
        )
        parser.add_argument(
            "--keep-existing",
            action="store_true",
            help="Keep existing imported pages instead of replacing children of /news/ and /research/.",
        )

    def handle(self, *args, **options):
        archive = Path(options["archive"])
        pages_dir = archive / "pages"
        if not pages_dir.exists():
            raise CommandError(f"Archive pages directory not found: {pages_dir}")

        news_index = NewsListingPage.objects.first()
        research_index = AchievementIndexPage.objects.first()
        if not news_index:
            raise CommandError("No NewsListingPage found.")
        if not research_index:
            raise CommandError("No AchievementIndexPage found.")

        author = self.get_author()
        news_topic = self.get_topic("实验室新闻", "lab-news")

        records = self.collect_records(pages_dir)
        news_records = [record for record in records if record["target"] == "news"]
        research_records = [record for record in records if record["target"] == "research"]

        with transaction.atomic():
            deleted_news = deleted_research = 0
            if not options["keep_existing"]:
                deleted_news = ArticlePage.objects.child_of(news_index).count()
                for page in ArticlePage.objects.child_of(news_index).specific():
                    page.delete()
                news_index.refresh_from_db()

                deleted_research = AchievementPage.objects.child_of(research_index).count()
                for page in AchievementPage.objects.child_of(research_index).specific():
                    page.delete()
                research_index.refresh_from_db()

            created_news = 0
            created_research = 0
            image_stats = {"used": 0, "failed": 0, "missing": 0}

            for record in sorted(news_records, key=lambda item: item["date"] or datetime.min.date()):
                image = self.import_image(record)
                self.update_image_stats(record, image, image_stats)
                article = ArticlePage(
                    title=record["title"],
                    slug=self.unique_slug(news_index, record["title"]),
                    author=author,
                    topic=news_topic,
                    publication_date=self.as_datetime(record["date"]),
                    introduction=record["summary"],
                    body=self.story_body(record["body_html"]),
                    image=self.captioned_image_stream(image),
                    listing_image=image,
                    listing_summary=record["summary"][:255],
                    search_description=record["summary"][:255],
                    live=True,
                    has_unpublished_changes=False,
                    show_in_menus=False,
                )
                news_index.add_child(instance=article)
                article.save_revision().publish()
                created_news += 1

            for record in sorted(research_records, key=lambda item: item["date"] or datetime.min.date()):
                image = self.import_image(record)
                self.update_image_stats(record, image, image_stats)
                page = AchievementPage(
                    title=record["title"],
                    slug=self.unique_slug(research_index, record["title"]),
                    achievement_type="paper" if self.is_paper_like(record["title"]) else "project",
                    achievement_date=record["date"],
                    responsible_team=record["department"],
                    summary=record["summary"],
                    body=self.story_body(record["body_html"]),
                    listing_image=image,
                    listing_summary=record["summary"][:255],
                    search_description=record["summary"][:255],
                    live=True,
                    has_unpublished_changes=False,
                    show_in_menus=False,
                )
                research_index.add_child(instance=page)
                page.save_revision().publish()
                created_research += 1

        self.stdout.write(
            self.style.SUCCESS(
                "Imported SPS archive: "
                f"deleted {deleted_news} news / {deleted_research} research pages; "
                f"created {created_news} news / {created_research} research pages; "
                f"images used={image_stats['used']}, missing={image_stats['missing']}, failed={image_stats['failed']}."
            )
        )

    def collect_records(self, pages_dir):
        records_by_title = {}
        for meta_path in pages_dir.glob("*/meta.json"):
            record = self.parse_record(meta_path)
            if not record:
                continue
            current = records_by_title.get(record["title"])
            if not current or self.prefer_record(record, current):
                records_by_title[record["title"]] = record
        return list(records_by_title.values())

    def parse_record(self, meta_path):
        import json

        meta = json.loads(meta_path.read_text(encoding="utf-8"))
        url = meta.get("url", "")
        if "/en/" in url or "page=" in url:
            return None
        if "/node/" not in url and "/article/" not in url:
            return None

        preview = self.normalize(meta.get("text_preview", ""))
        title = self.clean_title(meta.get("title", ""))
        if NEWS_BREADCRUMB in preview:
            target = "research" if self.is_research_title(title) else "news"
        elif RESEARCH_BREADCRUMB in preview:
            target = "research"
        else:
            return None

        soup = BeautifulSoup((meta_path.parent / "raw.html").read_text(encoding="utf-8", errors="ignore"), "html.parser")
        main = soup.select_one("article .col-sm-12.col-md-9") or soup.find("article")
        if not main:
            return None

        date = self.extract_date(main.get_text("\n", strip=True))
        department = self.extract_label(main, "article-department", "稿件来源：")
        owner = self.extract_label(main, "article-owner", "发布人：")
        body_container = main.select_one('[data-block-plugin-id="entity_field:node:body"] .field-body')
        body_html, image_url = self.extract_body(body_container or main)
        summary = self.build_summary(body_container or main)

        return {
            "target": target,
            "title": title,
            "url": url,
            "source_dir": meta_path.parent.name,
            "date": date,
            "department": department or owner,
            "body_html": body_html,
            "summary": summary,
            "image_url": image_url,
        }

    def extract_body(self, container):
        clone = BeautifulSoup(str(container), "html.parser")
        root = clone.find()
        image_url = None

        for tag in clone(["script", "style", "iframe", "form"]):
            tag.decompose()
        for tag in clone.select(".banner, .article-header, .article-submit"):
            tag.decompose()
        for img in clone.find_all("img"):
            src = img.get("src")
            if src and not image_url and self.is_content_image(src):
                image_url = urljoin(ARCHIVE_SITE, src)
            img.decompose()

        allowed = {"p", "br", "strong", "b", "em", "i", "a", "ul", "ol", "li", "h3", "h4", "table", "tbody", "thead", "tr", "th", "td"}
        for tag in list(clone.find_all(True)):
            if tag.name not in allowed:
                tag.unwrap()
                continue
            tag.attrs = {key: value for key, value in tag.attrs.items() if key in {"href", "colspan", "rowspan"}}
            if tag.name == "a" and tag.get("href"):
                tag["href"] = urljoin(ARCHIVE_SITE, tag["href"])

        html = "".join(str(child) for child in (root.contents if root else clone.contents)).strip()
        if not self.normalize(BeautifulSoup(html, "html.parser").get_text(" ", strip=True)):
            html = "<p>原网页正文为空。</p>"
        return html, image_url

    def build_summary(self, container):
        text = self.normalize(container.get_text(" ", strip=True))
        text = re.sub(r"^(banner\s*)+", "", text)
        return Truncator(text).chars(180, truncate="...")

    def extract_date(self, text):
        match = re.search(r"发布日期[:：]\s*(\d{4}-\d{1,2}-\d{1,2})", text)
        if not match:
            match = re.search(r"(\d{4}-\d{1,2}-\d{1,2})", text)
        if not match:
            return None
        return datetime.strptime(match.group(1), "%Y-%m-%d").date()

    def extract_label(self, main, class_name, prefix):
        el = main.select_one(f".{class_name}")
        text = el.get_text(" ", strip=True) if el else ""
        if not text:
            match = re.search(re.escape(prefix) + r"\s*([^\n]+)", main.get_text("\n", strip=True))
            text = match.group(1).strip() if match else ""
        return text.replace(prefix, "").strip()

    def import_image(self, record):
        url = record.get("image_url")
        if not url:
            return None
        digest = hashlib.sha1(url.encode("utf-8")).hexdigest()[:16]
        existing = CustomImage.objects.filter(title=f"SPS {digest}").first()
        if existing:
            return existing

        try:
            request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(request, timeout=20) as response:
                content = response.read()
                content_type = response.headers.get("Content-Type", "").split(";")[0]
        except Exception as exc:
            self.stderr.write(f"Image download failed: {url} ({exc})")
            return None

        try:
            with PILImage.open(BytesIO(content)) as pil_image:
                width, height = pil_image.size
        except Exception as exc:
            self.stderr.write(f"Downloaded file is not a readable image: {url} ({exc})")
            return None

        suffix = Path(unquote(urlparse(url).path)).suffix.lower()
        if not suffix:
            suffix = mimetypes.guess_extension(content_type) or ".jpg"
        filename = f"sps-{digest}{suffix}"
        image = CustomImage(title=f"SPS {digest}")
        image.file.save(filename, ContentFile(content), save=False)
        image.width = width
        image.height = height
        image.save()
        return image

    def update_image_stats(self, record, image, stats):
        if image:
            stats["used"] += 1
        elif record.get("image_url"):
            stats["failed"] += 1
        else:
            stats["missing"] += 1

    def captioned_image_stream(self, image):
        if not image:
            return []
        return [("image", {"image": image, "image_alt_text": "", "caption": ""})]

    def story_body(self, body_html):
        return [
            (
                "section",
                {
                    "heading": "正文",
                    "content": [("paragraph", body_html)],
                },
            )
        ]

    def get_author(self):
        author = AuthorSnippet.objects.first()
        if author:
            return author
        return AuthorSnippet.objects.create(title="实验室办公室")

    def get_topic(self, title, slug):
        topic, _ = ArticleTopic.objects.get_or_create(slug=slug, defaults={"title": title})
        return topic

    def clean_title(self, title):
        return title.replace(" | 中山大学药学院", "").strip()

    def normalize(self, text):
        return re.sub(r"\s+", " ", text).strip()

    def is_content_image(self, src):
        return "/inline-images/" in src and not any(skip in src.lower() for skip in ["ewm", "logo"])

    def is_research_title(self, title):
        return any(pattern in title for pattern in RESEARCH_TITLE_PATTERNS)

    def is_paper_like(self, title):
        return any(pattern in title for pattern in ("课题组", "团队", "论文", "发表", "期刊", "揭示", "PNAS", "NSR", "Cell", "Nature", "Science", "Gut", "Adv. Sci"))

    def as_datetime(self, value):
        if not value:
            return None
        return timezone.make_aware(datetime.combine(value, time.min))

    def prefer_record(self, new, old):
        if "/article/" in new["url"] and "/article/" not in old["url"]:
            return True
        if bool(new.get("image_url")) and not bool(old.get("image_url")):
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
