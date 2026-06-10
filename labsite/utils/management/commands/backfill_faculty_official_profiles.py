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
from labsite.standardpages.models import FacultyPage


SPS_SITE = "https://sps.sysu.edu.cn"
SPS_INDEX_URLS = [
    f"{SPS_SITE}/faculty/Professor",
    f"{SPS_SITE}/faculty/Lecturer",
    f"{SPS_SITE}/department/Medicinal-chemistry",
    f"{SPS_SITE}/department/pharmacology",
    f"{SPS_SITE}/department/pharmaceutics",
    f"{SPS_SITE}/department/Raw-and-Natural-Medicinal-Chemistry",
    f"{SPS_SITE}/department/Microbiology-and-Biochemical-Pharmacy",
    f"{SPS_SITE}/department/Pharmaceutical-analysis",
]
MANUAL_OFFICIAL_PROFILES = {
    "钱军": "http://zssom.sysu.edu.cn/teacher/QianJun",
    "邓文斌": "https://yxysz.sysu.edu.cn/zh-hans/teacher/956",
    "毛宗万": "https://ce.sysu.edu.cn/zh-hans/teacher/809",
    "肖非": "https://www.sysu5.cn/medical-service/department-expert/doctor/836",
    "陈壮桂": "https://www.zssy.com.cn/node/11175",
    "彭亮": "https://www.zssy.com.cn/node/11095",
    "何欢欢": "https://mic-zdwy.sysu5.cn/research/expert/professional-researchers/626",
    "巢晖": "https://ce.sysu.edu.cn/zh-hans/teacher/3684",
    "彭晓谋": "https://szmed.sysu.edu.cn/zh-hans/teacher/2132",
    "孙彩军": "https://phs.sysu.edu.cn/zh-hans/teacher/173",
    "谭彩萍": "https://ce.sysu.edu.cn/zh-hans/teacher/854",
    "徐亮": "https://ce.sysu.edu.cn/zh-hans/teacher/836",
    "夏炜": "https://ce.sysu.edu.cn/zh-hans/teacher/812",
    "姚美村": "https://yxysz.sysu.edu.cn/zh-hans/teacher/1003",
    "谢智勇": "https://yxysz.sysu.edu.cn/zh-hans/teacher/1002",
    "王巧平": "https://yxysz.sysu.edu.cn/zh-hans/teacher/958",
    "高艳锋": "https://yxysz.sysu.edu.cn/zh-hans/teacher/968",
    "蔡辉": "https://yxysz.sysu.edu.cn/zh-hans/teacher/985",
    "谢婵": "https://www.zssy.com.cn/node/11081",
    "曹乾": "https://ce.sysu.edu.cn/zh-hans/teacher/694",
    "陈禹": "https://ce.sysu.edu.cn/zh-hans/teacher/737",
    "黄怀义": "https://yxysz.sysu.edu.cn/zh-hans/teacher/972",
    "曾小伟": "https://yxysz.sysu.edu.cn/zh-hans/teacher/987",
    "陈红波": "https://yxysz.sysu.edu.cn/zh-hans/teacher/959",
    "程芳": "https://yxysz.sysu.edu.cn/zh-hans/teacher/961",
    "丁鑫": "https://szmed.sysu.edu.cn/zh-hans/teacher/2505",
    "王雷锋": "https://yxysz.sysu.edu.cn/zh-hans/teacher/1013",
    "吴忠道": "http://zssom.sysu.edu.cn/teacher/wuzhongdao",
    "陈耀庆": "https://phs.sysu.edu.cn/zh-hans/teacher/177",
    "吴玫颖": "https://yxysz.sysu.edu.cn/zh-hans/teacher/989",
    "郭德银": "https://www.gzlab.ac.cn/team/index_156.html",
}
MANUAL_PROFILE_IMAGES = {
    "毛宗万": "https://ce.sysu.edu.cn/bisclab/sites/default/files/styles/image_style_2/public/%E6%AF%9B%E5%AE%97%E4%B8%87_0_0.jpg?itok=cb1aUR6i",
    "陈壮桂": "https://www.zssy.com.cn/sites/zssy.prod.sysucloud1.sysu.edu.cn/files/%E5%9B%BE%E7%89%87%206.png",
    "彭亮": "https://www.zssy.com.cn/sites/zssy.prod.sysucloud1.sysu.edu.cn/files/2014021909390192001128.jpg",
    "何欢欢": "https://mic-zdwy.sysu5.cn/sites/default/files/2024-07/20240530152327535.jpg",
    "谢婵": "https://www.zssy.com.cn/sites/zssy.prod.sysucloud1.sysu.edu.cn/files/2017030916435709193059.jpg",
}
DESKTOP_HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
}


class Command(BaseCommand):
    help = "Backfill faculty official profile URLs and photos from official school pages."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show matches without writing pages or importing images.",
        )
        parser.add_argument(
            "--overwrite",
            action="store_true",
            help="Replace existing official profile URLs and photos.",
        )
        parser.add_argument(
            "--limit",
            type=int,
            default=0,
            help="Limit the number of matched faculty pages processed.",
        )

    def handle(self, *args, **options):
        profiles = self.collect_sps_profiles()
        pages = FacultyPage.objects.live().specific().select_related("photo").order_by(
            "sort_order", "title"
        )

        stats = {
            "matched": 0,
            "updated": 0,
            "skipped_existing": 0,
            "no_match": 0,
            "download_failed": 0,
        }
        processed_matches = 0
        for page in pages:
            profile = profiles.get(page.title)
            if not profile:
                stats["no_match"] += 1
                continue

            if options["limit"] and processed_matches >= options["limit"]:
                break
            processed_matches += 1
            stats["matched"] += 1

            has_url = bool(page.official_profile_url)
            has_photo = bool(page.photo_id)
            if (has_url and has_photo) and not options["overwrite"]:
                stats["skipped_existing"] += 1
                continue

            self.stdout.write(f"Match {page.title}: {profile['url']}")
            if options["dry_run"]:
                continue

            page.official_profile_url = profile["url"]
            if profile["image_url"] and (options["overwrite"] or not page.photo_id):
                image = self.import_image(
                    profile["image_url"], page.title, referer=profile["url"]
                )
                if image:
                    page.photo = image
                else:
                    stats["download_failed"] += 1

            page.save_revision().publish()
            stats["updated"] += 1

        self.stdout.write(
            self.style.SUCCESS(
                "Backfilled faculty profiles: "
                f"matched={stats['matched']}, updated={stats['updated']}, "
                f"skipped_existing={stats['skipped_existing']}, "
                f"no_match={stats['no_match']}, "
                f"download_failed={stats['download_failed']}."
            )
        )

    def collect_sps_profiles(self):
        candidates = {}
        for index_url in SPS_INDEX_URLS:
            soup, _html = self.fetch_soup(index_url)
            if not soup:
                continue
            for href in self.extract_teacher_hrefs(soup):
                url = urljoin(SPS_SITE, href)
                profile = self.extract_sps_profile(url)
                if not profile:
                    continue
                existing = candidates.get(profile["name"])
                if not existing or profile["score"] > existing["score"]:
                    candidates[profile["name"]] = profile
        for name, url in MANUAL_OFFICIAL_PROFILES.items():
            profile = self.extract_manual_profile(name, url)
            if profile:
                candidates[name] = profile
        return candidates

    def extract_manual_profile(self, name, url):
        soup, html = self.fetch_soup(url)
        if not soup or "页面未找到" in html:
            return None
        text = soup.get_text("\n", strip=True)
        if name not in text:
            self.stderr.write(f"Manual profile name not found: {name} ({url})")
            return None
        return {
            "name": name,
            "url": url,
            "email": self.extract_email(text),
            "image_url": MANUAL_PROFILE_IMAGES.get(
                name, self.extract_profile_image_url(soup, url, name)
            ),
            "score": 20,
        }

    def extract_teacher_hrefs(self, soup):
        hrefs = []
        seen = set()
        for link in soup.select('a[href^="/teacher/"]'):
            href = link.get("href")
            if href and href not in seen:
                hrefs.append(href)
                seen.add(href)
        return hrefs

    def extract_sps_profile(self, url):
        soup, html = self.fetch_soup(url)
        if not soup or "页面未找到" in html:
            return None

        name = self.extract_profile_name(soup)
        if not name:
            return None

        image_url = self.extract_profile_image_url(soup, url, name)
        email = self.extract_email(soup.get_text("\n", strip=True))
        score = 10
        if email:
            score += 5
        if image_url:
            score += 3

        return {
            "name": name,
            "url": url,
            "email": email,
            "image_url": image_url,
            "score": score,
        }

    def extract_profile_name(self, soup):
        for selector in (".teacherinfo h1", "h1", ".page-title", ".field--name-title"):
            element = soup.select_one(selector)
            if not element:
                continue
            name = self.clean_name(element.get_text(" ", strip=True))
            if name:
                return name

        title = soup.find("title")
        if title:
            name = self.clean_name(title.get_text(" ", strip=True).split("|")[0])
            if name:
                return name
        return ""

    def clean_name(self, value):
        value = re.sub(r"\s+", "", value)
        value = value.replace("-", "").replace("中山大学药学院", "")
        match = re.search(r"[\u4e00-\u9fff]{2,4}", value)
        return match.group(0) if match else ""

    def extract_profile_image_url(self, soup, page_url, name):
        candidates = []
        for index, image in enumerate(soup.find_all("img")):
            src = self.image_src(image)
            if not src or not self.is_usable_image(src):
                continue
            alt = image.get("alt", "")
            score = 0
            class_text = self.element_class_text(image)
            parent_class_text = self.element_class_text(image.parent)
            ancestor_class_text = self.ancestor_class_text(image)
            if name and name in alt:
                score += 10
            if any(
                marker in f"{class_text} {parent_class_text} {ancestor_class_text}"
                for marker in (
                    "teacher-img",
                    "teacher-info",
                    "teacherinfo",
                    "portrait",
                    "views-field-image",
                    "featured-media",
                    "imgdiv",
                )
            ):
                score += 8
            if "/styles/image_style_2/" in src:
                score += 5
            if "/styles/watermark/" in src:
                score += 4
            if "/public/" in src:
                score += 2
            if name and name in unquote(src):
                score += 6
            score += max(0, 5 - index)
            width = self.int_attr(image.get("width"))
            height = self.int_attr(image.get("height"))
            if width and height:
                aspect = width / height
                if 0.45 <= aspect <= 0.9 and height >= 180:
                    score += 5
                elif aspect > 2.2 or height < 120:
                    score -= 8
            candidates.append((score, src))

        if not candidates:
            return ""
        candidates.sort(reverse=True)
        return urljoin(page_url, candidates[0][1])

    def fetch_soup(self, url):
        try:
            response = requests.get(
                url, timeout=25, headers=DESKTOP_HEADERS, allow_redirects=True
            )
            response.raise_for_status()
            if not response.encoding or response.encoding.lower() == "iso-8859-1":
                response.encoding = response.apparent_encoding or "utf-8"
        except Exception as exc:
            self.stderr.write(f"HTML fetch failed: {url} ({exc})")
            return None, ""
        return BeautifulSoup(response.text, "html.parser"), response.text

    def import_image(self, url, faculty_name, referer=""):
        digest = hashlib.sha1(url.encode("utf-8")).hexdigest()[:16]
        title = f"Faculty {faculty_name} {digest}"
        existing = CustomImage.objects.filter(title=title).first()
        if existing:
            return existing

        content = None
        content_type = ""
        last_error = None
        for candidate_url in self.image_download_urls(url):
            try:
                headers = {**DESKTOP_HEADERS}
                if referer:
                    headers["Referer"] = referer
                response = requests.get(candidate_url, timeout=30, headers=headers)
                response.raise_for_status()
                content = response.content
                content_type = response.headers.get("Content-Type", "").split(";")[0]
                with PILImage.open(BytesIO(content)) as pil_image:
                    width, height = pil_image.size
                url = candidate_url
                break
            except Exception as exc:
                last_error = exc
        if content is None:
            self.stderr.write(f"Image download failed: {url} ({last_error})")
            return None

        suffix = Path(unquote(urlparse(url).path)).suffix.lower()
        if not suffix or len(suffix) > 8:
            suffix = mimetypes.guess_extension(content_type) or ".jpg"

        image = CustomImage(title=title)
        image.file.save(f"faculty-{digest}{suffix}", ContentFile(content), save=False)
        image.width = width
        image.height = height
        image.save()
        return image

    def image_download_urls(self, url):
        urls = [url]
        match = re.search(r"(.*/files)/styles/[^/]+/public/(.+)", url)
        if match:
            original_url = f"{match.group(1)}/{match.group(2)}"
            if original_url not in urls:
                urls.append(original_url)
        return urls

    def image_src(self, image):
        for attr in ("data-src", "data-original", "data-backsrc", "src"):
            value = image.get(attr)
            if value:
                return value
        return ""

    def is_usable_image(self, src):
        lower = src.lower()
        path_lower = urlparse(lower).path
        if not any(
            marker in lower
            for marker in (
                "/sites/default/files/",
                "/vancheerfile/images/",
                "/styles/image_style_2/",
                "/styles/watermark/",
            )
        ):
            return False
        return not any(
            marker in path_lower
            for marker in (
                "logo",
                "wechat",
                "favicon",
                "qrcode",
                "qr",
                "ewm",
                "bottom",
                "icon",
                "banner",
                "beian",
                "app.",
                "site-code",
                "dyh",
                "fwh",
                "footer",
            )
        )

    def int_attr(self, value):
        try:
            return int(value)
        except (TypeError, ValueError):
            return 0

    def element_class_text(self, element):
        if not element:
            return ""
        classes = element.get("class") or []
        if isinstance(classes, str):
            classes = [classes]
        return " ".join(classes).lower()

    def ancestor_class_text(self, element):
        classes = []
        parent = element.parent
        for _depth in range(4):
            if not parent:
                break
            classes.append(self.element_class_text(parent))
            parent = parent.parent
        return " ".join(classes)

    def extract_email(self, text):
        match = re.search(r"[\w.+-]+@[\w.-]+\.\w+", text)
        return match.group(0) if match else ""
