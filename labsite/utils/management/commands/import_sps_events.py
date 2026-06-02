import re
from datetime import datetime
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils.text import slugify

from labsite.standardpages.models import StandardPage


SITE = "https://sps.sysu.edu.cn"


class Command(BaseCommand):
    help = "Import SPS academic lecture events into /research/academic-lectures/."

    def add_arguments(self, parser):
        parser.add_argument(
            "--max-pages",
            type=int,
            default=80,
            help="Maximum event list pages to scan.",
        )
        parser.add_argument(
            "--min-lecture-number",
            type=int,
            default=400,
            help="Only import lecture/event pages at or newer than this lecture number.",
        )

    def handle(self, *args, **options):
        parent = StandardPage.objects.filter(slug="academic-lectures").first()
        if not parent:
            raise CommandError("No /research/academic-lectures/ page found.")

        items = self.collect_event_links(options["max_pages"], options["min_lecture_number"])
        created = updated = 0
        for item in items:
            with transaction.atomic():
                detail = self.fetch_event_detail(item["url"])
                if not detail:
                    continue
                page, was_created = self.upsert_event(parent, detail)
                if was_created:
                    created += 1
                else:
                    updated += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Imported SPS events: created={created}, updated={updated}, scanned={len(items)}."
            )
        )

    def collect_event_links(self, max_pages, min_lecture_number):
        items = []
        seen = set()
        for page_num in range(max_pages):
            url = urljoin(SITE, "/event")
            if page_num:
                url = f"{url}?page={page_num}"
            soup = self.get_soup(url)
            page_items = []
            candidates = []
            for anchor in soup.find_all("a", href=True):
                href = anchor["href"]
                if not re.search(r"/event/\d+", href):
                    continue
                title = self.normalize(anchor.get_text(" ", strip=True))
                if not title or href in seen:
                    continue
                seen.add(href)
                candidates.append(
                    {
                        "title": title,
                        "url": urljoin(SITE, href),
                        "lecture_number": self.extract_lecture_number(title),
                    }
                )
            if not candidates:
                break

            if min_lecture_number:
                known_numbers = [
                    item["lecture_number"]
                    for item in candidates
                    if item["lecture_number"] is not None
                ]
                has_current_items = any(number >= min_lecture_number for number in known_numbers)
                if known_numbers and not has_current_items:
                    break
                candidates = [
                    item
                    for item in candidates
                    if item["lecture_number"] is None
                    or item["lecture_number"] >= min_lecture_number
                ]

            page_items = [{"title": item["title"], "url": item["url"]} for item in candidates]
            items.extend(page_items)
        return items

    def fetch_event_detail(self, url):
        soup = self.get_soup(url)
        main = soup.select_one("article .region-right") or soup.find("article")
        if not main:
            return None

        title = self.text(main.select_one(".article-title h1")) or self.clean_title(soup.title.get_text(" ", strip=True))
        subtitle = self.text(main.select_one(".article-title h2"))
        publication_date = self.parse_date(self.text(main.select_one(".article-date")))
        fields = self.extract_fields(main)
        body_html = self.extract_body(main)
        summary_parts = [
            fields.get("主题") or subtitle,
            fields.get("主讲人"),
            fields.get("活动时间"),
            fields.get("活动地址"),
        ]
        summary = "；".join(part for part in summary_parts if part)

        return {
            "title": title,
            "subtitle": subtitle,
            "date": publication_date,
            "fields": fields,
            "body_html": body_html,
            "summary": summary,
            "url": url,
        }

    def upsert_event(self, parent, detail):
        existing = StandardPage.objects.child_of(parent).filter(title=detail["title"]).specific().first()
        introduction = detail["summary"]
        body = self.story_body(detail)
        if existing:
            existing.introduction = introduction
            existing.body = body
            existing.listing_summary = introduction[:255]
            existing.search_description = introduction[:255]
            existing.live = True
            existing.show_in_menus = False
            existing.save_revision().publish()
            return existing, False

        page = StandardPage(
            title=detail["title"],
            slug=self.unique_slug(parent, detail["title"]),
            introduction=introduction,
            body=body,
            listing_summary=introduction[:255],
            search_description=introduction[:255],
            live=True,
            has_unpublished_changes=False,
            show_in_menus=False,
        )
        parent.add_child(instance=page)
        page.save_revision().publish()
        return page, True

    def story_body(self, detail):
        field_lines = []
        if detail["subtitle"]:
            field_lines.append(f"<p><strong>主题：</strong>{detail['subtitle']}</p>")
        for label in ["活动时间", "活动地址", "主讲人", "主持人"]:
            value = detail["fields"].get(label)
            if value:
                field_lines.append(f"<p><strong>{label}：</strong>{value}</p>")
        if detail["date"]:
            field_lines.append(f"<p><strong>发布日期：</strong>{detail['date'].isoformat()}</p>")
        field_lines.append(f'<p><strong>原文链接：</strong><a href="{detail["url"]}">{detail["url"]}</a></p>')
        html = "\n".join(field_lines)
        if detail["body_html"]:
            html = f"{html}\n{detail['body_html']}"
        return [("section", {"heading": "讲座信息", "content": [("paragraph", html)]})]

    def extract_fields(self, main):
        fields = {}
        for field in main.select(".field-label-inline"):
            label = self.text(field.select_one(".field-label")).rstrip("：:")
            value = self.text(field.select_one(".field-item"))
            if label and value:
                fields[label] = value
        return fields

    def extract_body(self, main):
        body = main.select_one(".field-body")
        if not body:
            return ""
        clone = BeautifulSoup(str(body), "html.parser")
        for tag in clone(["script", "style", "iframe", "form", "img"]):
            tag.decompose()
        for tag in list(clone.find_all(True)):
            tag.attrs = {key: value for key, value in tag.attrs.items() if key in {"href", "colspan", "rowspan"}}
            if tag.name == "a" and tag.get("href"):
                tag["href"] = urljoin(SITE, tag["href"])
        root = clone.find()
        return "".join(str(child) for child in (root.contents if root else clone.contents)).strip()

    def get_soup(self, url):
        response = requests.get(url, timeout=20, headers={"User-Agent": "Mozilla/5.0"})
        response.raise_for_status()
        response.encoding = "utf-8"
        return BeautifulSoup(response.text, "html.parser")

    def parse_date(self, value):
        match = re.search(r"(\d{4}-\d{2}-\d{2})", value or "")
        if not match:
            return None
        return datetime.strptime(match.group(1), "%Y-%m-%d").date()

    def clean_title(self, value):
        return value.replace(" | 中山大学药学院", "").strip()

    def extract_lecture_number(self, title):
        numbers = [int(value) for value in re.findall(r"(?:第|No\.?\s*)(\d+)", title, flags=re.IGNORECASE)]
        numbers.extend(int(value) for value in re.findall(r"讲堂\s*(\d+)", title))
        if not numbers:
            return None
        return max(numbers)

    def text(self, node):
        return self.normalize(node.get_text(" ", strip=True)) if node else ""

    def normalize(self, value):
        return re.sub(r"\s+", " ", value or "").strip()

    def unique_slug(self, parent, title):
        base = slugify(title, allow_unicode=True) or "event"
        slug = base[:240]
        candidate = slug
        counter = 2
        while parent.get_children().filter(slug=candidate).exists():
            suffix = f"-{counter}"
            candidate = f"{slug[: 255 - len(suffix)]}{suffix}"
            counter += 1
        return candidate
