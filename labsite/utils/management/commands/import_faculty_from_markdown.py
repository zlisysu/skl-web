import re
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils.text import slugify

from labsite.standardpages.models import FacultyIndexPage, FacultyPage


GROUP_SLUGS = {
    "感染性疾病并发症机制及新药研发": "infectious-complications",
    "细菌耐药机制及新药研发": "antimicrobial-resistance",
    "新冠病毒等突发性病毒致病机制": "emerging-viral-pathogenesis",
    "持续性病毒致病机制及新药研发": "persistent-viral-pathogenesis",
}


class Command(BaseCommand):
    help = "Replace existing faculty pages with the merged faculty migration table in a Markdown file."

    def add_arguments(self, parser):
        parser.add_argument(
            "markdown_path",
            nargs="?",
            default="docs/faculty-real-data-draft.md",
            help="Markdown file containing the '按姓名合并后的迁移视图' table.",
        )

    def handle(self, *args, **options):
        markdown_path = Path(options["markdown_path"])
        if not markdown_path.exists():
            raise CommandError(f"Markdown file does not exist: {markdown_path}")

        rows = self.parse_migration_rows(markdown_path.read_text(encoding="utf-8"))
        if not rows:
            raise CommandError("No rows found in the '按姓名合并后的迁移视图' section.")

        index_page = FacultyIndexPage.objects.first()
        if not index_page:
            raise CommandError("No FacultyIndexPage exists.")

        with transaction.atomic():
            old_count = FacultyPage.objects.child_of(index_page).count()
            for page in FacultyPage.objects.child_of(index_page).specific():
                page.delete()
            index_page.refresh_from_db()

            created = 0
            for sort_order, row in enumerate(rows, 1):
                page = FacultyPage(
                    title=row["name"],
                    slug=self.unique_slug(index_page, row["name"]),
                    email=row["email"],
                    affiliation=row["unit"],
                    faculty_group=row["faculty_group"],
                    research_areas=row["research_areas"],
                    sort_order=sort_order,
                    live=True,
                    has_unpublished_changes=False,
                    show_in_menus=False,
                )
                index_page.add_child(instance=page)
                page.save_revision().publish()
                created += 1

        grouped_count = sum(1 for row in rows if row["faculty_group"])
        self.stdout.write(
            self.style.SUCCESS(
                f"Deleted {old_count} existing faculty pages and created {created} pages "
                f"({grouped_count} grouped, {created - grouped_count} ungrouped)."
            )
        )

    def parse_migration_rows(self, text):
        section = self.extract_section(text, "## 按姓名合并后的迁移视图")
        rows = []
        for line in section.splitlines():
            line = line.strip()
            if not line.startswith("|"):
                continue
            cells = [cell.strip() for cell in line.strip("|").split("|")]
            if not cells or cells[0] in {"序号", "---:"} or set(cells[0]) <= {"-", ":"}:
                continue
            if len(cells) < 6:
                continue

            name = cells[1]
            if not name:
                continue

            groups = self.split_cell(cells[4])
            primary_group = groups[0] if groups else ""
            rows.append(
                {
                    "name": name,
                    "email": self.split_cell(cells[2])[0] if self.split_cell(cells[2]) else "",
                    "unit": "；".join(self.split_cell(cells[3])),
                    "faculty_group": GROUP_SLUGS.get(primary_group, ""),
                    "research_areas": primary_group,
                }
            )
        return rows

    def extract_section(self, text, heading):
        start = text.find(heading)
        if start == -1:
            raise CommandError(f"Heading not found: {heading}")
        rest = text[start + len(heading) :]
        match = re.search(r"\n##\s+", rest)
        return rest[: match.start()] if match else rest

    def split_cell(self, value):
        return [item.strip() for item in value.split("<br>") if item.strip()]

    def unique_slug(self, parent, title):
        base = slugify(title, allow_unicode=True) or "faculty"
        slug = base[:240]
        candidate = slug
        counter = 2
        while parent.get_children().filter(slug=candidate).exists():
            suffix = f"-{counter}"
            candidate = f"{slug[: 255 - len(suffix)]}{suffix}"
            counter += 1
        return candidate
