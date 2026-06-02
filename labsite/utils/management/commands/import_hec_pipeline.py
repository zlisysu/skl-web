from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand, CommandError

from labsite.standardpages.models import StandardPage


SOURCE_URL = "https://www.hecpharm.com/innovating/R_D_result"


class Command(BaseCommand):
    help = "Import the HEC Pharm R&D pipeline block into /research/pipeline/."

    def handle(self, *args, **options):
        page = StandardPage.objects.filter(slug="pipeline").first()
        if not page:
            raise CommandError("No /research/pipeline/ StandardPage found.")

        pipeline_html = self.fetch_pipeline_html()
        if not pipeline_html:
            raise CommandError("No pipeline section found from source page.")

        page.introduction = ""
        page.body = [
            ("html", pipeline_html),
        ]
        page.save_revision().publish()
        self.stdout.write(self.style.SUCCESS("Imported HEC pipeline HTML block."))

    def fetch_pipeline_html(self):
        response = requests.get(SOURCE_URL, timeout=25, headers={"User-Agent": "Mozilla/5.0"})
        response.raise_for_status()
        response.encoding = "utf-8"
        soup = BeautifulSoup(response.text, "html.parser")
        section = soup.select_one(".art-dev-pipeline .section-1")
        if not section:
            return ""

        self.normalize_pipeline_table(soup, section)

        for tag in section.find_all(True):
            for attr in list(tag.attrs):
                if attr.startswith("data-aos"):
                    del tag.attrs[attr]
            if tag.name in {"script", "style"}:
                tag.decompose()
                continue
            for attr in ("src", "href"):
                value = tag.get(attr)
                if value:
                    tag[attr] = urljoin(SOURCE_URL, value)

        return f'<div class="hec-pipeline-embed">{section}</div>'

    def normalize_pipeline_table(self, soup, section):
        table = section.select_one("table.list")
        if not table:
            return

        for group_class in ("sec-1", "sec-2", "sec-3"):
            rows = table.select(f"tr.{group_class}")
            if not rows:
                continue

            first_cells = rows[0].find_all("td", recursive=False)
            if len(first_cells) >= 6:
                first_cells[0]["rowspan"] = str(len(rows))

        for stage_cell in table.select("td[data-stage][colspan='7']"):
            stage_cell["colspan"] = "6"

        for stage_cell in table.select("td[data-stage]"):
            existing_tags = stage_cell.select_one(".tags")
            if existing_tags:
                existing_tags.decompose()

            tag_classes = []
            if "tag-1" in stage_cell.get("class", []):
                tag_classes.append("tag-1")
            if "tag-2" in stage_cell.get("class", []):
                tag_classes.append("tag-2")
            if not tag_classes:
                continue

            tags = soup.new_tag("div", attrs={"class": "tags"})
            for class_name in tag_classes:
                tags.append(soup.new_tag("i", attrs={"class": class_name}))
            stage_cell.append(tags)
