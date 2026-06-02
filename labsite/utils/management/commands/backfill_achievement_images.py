import hashlib
import mimetypes
import re
from io import BytesIO
from pathlib import Path
from urllib.parse import unquote, urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from PIL import Image as PILImage

from labsite.images.models import CustomImage
from labsite.standardpages.models import AchievementPage


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


class Command(BaseCommand):
    help = "Backfill listing images for research achievement pages from source pages."

    def add_arguments(self, parser):
        parser.add_argument(
            "--overwrite",
            action="store_true",
            help="Replace existing listing images instead of only filling missing images.",
        )
        parser.add_argument(
            "--limit",
            type=int,
            default=0,
            help="Limit the number of achievements processed.",
        )

    def handle(self, *args, **options):
        queryset = AchievementPage.objects.specific()
        if not options["overwrite"]:
            queryset = queryset.filter(listing_image__isnull=True)
        queryset = queryset.order_by("-achievement_date", "title")
        if options["limit"]:
            queryset = queryset[: options["limit"]]

        stats = {
            "processed": 0,
            "updated": 0,
            "no_source": 0,
            "no_image": 0,
            "download_failed": 0,
        }
        for page in queryset:
            stats["processed"] += 1
            if not page.source_url:
                stats["no_source"] += 1
                continue

            image_url = self.extract_listing_image_url(page.source_url)
            if not image_url:
                stats["no_image"] += 1
                self.stderr.write(f"No image found: {page.source_url}")
                continue

            image = self.import_image(image_url)
            if not image:
                stats["download_failed"] += 1
                continue

            page.listing_image = image
            page.save_revision().publish()
            stats["updated"] += 1
            self.stdout.write(f"Updated {page.id}: {page.title}")

        self.stdout.write(
            self.style.SUCCESS(
                "Backfilled achievement images: "
                f"processed={stats['processed']}, updated={stats['updated']}, "
                f"no_source={stats['no_source']}, no_image={stats['no_image']}, "
                f"download_failed={stats['download_failed']}."
            )
        )

    def extract_listing_image_url(self, source_url):
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
        except Exception as exc:
            self.stderr.write(f"HTML fetch failed: {url} ({exc})")
            return None, ""
        return BeautifulSoup(response.text, "html.parser"), response.text

    def import_image(self, url):
        digest = hashlib.sha1(url.encode("utf-8")).hexdigest()[:16]
        existing = CustomImage.objects.filter(title=f"Achievement {digest}").first()
        if existing:
            return existing

        try:
            response = requests.get(url, timeout=30, headers=WECHAT_HEADERS)
            response.raise_for_status()
            content = response.content
            content_type = response.headers.get("Content-Type", "").split(";")[0]
            with PILImage.open(BytesIO(content)) as pil_image:
                width, height = pil_image.size
        except Exception as exc:
            self.stderr.write(f"Image download failed: {url} ({exc})")
            return None

        suffix = Path(unquote(urlparse(url).path)).suffix.lower()
        if not suffix or len(suffix) > 8:
            suffix = mimetypes.guess_extension(content_type) or ".jpg"

        image = CustomImage(title=f"Achievement {digest}")
        image.file.save(f"achievement-{digest}{suffix}", ContentFile(content), save=False)
        image.width = width
        image.height = height
        image.save()
        return image

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
