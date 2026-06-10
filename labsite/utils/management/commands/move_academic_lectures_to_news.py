import re
from datetime import datetime, time

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify

from labsite.news.models import ArticlePage, NewsListingPage
from labsite.standardpages.models import StandardPage
from labsite.utils.models import ArticleTopic, AuthorSnippet


class Command(BaseCommand):
    help = "Move /research/academic-lectures/ child pages into /news/ as ArticlePage records."

    def add_arguments(self, parser):
        parser.add_argument(
            "--keep-source-pages",
            action="store_true",
            help="Keep source lecture child pages and leave the source index live.",
        )

    def handle(self, *args, **options):
        source_index = StandardPage.objects.filter(slug="academic-lectures").specific().first()
        if not source_index:
            raise CommandError("No /research/academic-lectures/ page found.")

        news_index = NewsListingPage.objects.first()
        if not news_index:
            raise CommandError("No NewsListingPage found.")

        source_pages = list(source_index.get_children().live().specific().order_by("path"))
        if not source_pages:
            self.stdout.write(self.style.WARNING("No live academic lecture child pages found."))
            return

        author = AuthorSnippet.objects.first() or AuthorSnippet.objects.create(title="实验室办公室")
        topic, _created = ArticleTopic.objects.get_or_create(
            slug="academic-exchange",
            defaults={"title": "学术交流"},
        )
        if topic.title != "学术交流":
            topic.title = "学术交流"
            topic.save(update_fields=["title"])

        created = updated = deleted = 0
        with transaction.atomic():
            for source_page in source_pages:
                _article, was_created = self.upsert_article(
                    news_index=news_index,
                    author=author,
                    topic=topic,
                    source_page=source_page,
                )
                if was_created:
                    created += 1
                else:
                    updated += 1

            if not options["keep_source_pages"]:
                for source_page in source_pages:
                    source_page.delete()
                    deleted += 1

                source_index.live = False
                source_index.show_in_menus = False
                source_index.has_unpublished_changes = False
                source_index.save()
                source_index.unpublish()

        self.stdout.write(
            self.style.SUCCESS(
                "Moved academic lectures to news: "
                f"created={created}, updated={updated}, deleted_source_pages={deleted}, "
                f"topic={topic.title}."
            )
        )

    def upsert_article(self, news_index, author, topic, source_page):
        publication_date = self.extract_publication_datetime(source_page)
        source_url = self.extract_source_url(source_page)
        body = self.copy_body(source_page)
        introduction = getattr(source_page, "introduction", "") or source_page.plain_introduction or ""
        summary = (
            source_page.listing_summary
            or introduction
            or f"从“{source_page.get_parent().specific.title}”栏目迁移至新闻和通知。"
        )

        existing = ArticlePage.objects.child_of(news_index).filter(title=source_page.title).specific().first()
        if existing:
            existing.slug = existing.slug or self.unique_slug(news_index, source_page.slug or source_page.title)
            existing.author = author
            existing.topic = topic
            existing.publication_date = publication_date
            existing.introduction = introduction
            existing.source_url = source_url
            existing.open_source_directly = False
            existing.body = body
            existing.listing_title = source_page.listing_title
            existing.listing_summary = summary[:255]
            existing.search_description = (source_page.search_description or summary)[:255]
            existing.listing_image = source_page.listing_image
            existing.social_image = source_page.social_image
            existing.social_text = source_page.social_text
            existing.appear_in_search_results = source_page.appear_in_search_results
            existing.live = source_page.live
            existing.show_in_menus = False
            existing.save_revision().publish()
            return existing, False

        article = ArticlePage(
            title=source_page.title,
            slug=self.unique_slug(news_index, source_page.slug or source_page.title),
            author=author,
            topic=topic,
            publication_date=publication_date,
            introduction=introduction,
            source_url=source_url,
            open_source_directly=False,
            image=[],
            body=body,
            listing_title=source_page.listing_title,
            listing_summary=summary[:255],
            listing_image=source_page.listing_image,
            social_image=source_page.social_image,
            social_text=source_page.social_text,
            search_description=(source_page.search_description or summary)[:255],
            appear_in_search_results=source_page.appear_in_search_results,
            live=source_page.live,
            has_unpublished_changes=False,
            show_in_menus=False,
        )
        news_index.add_child(instance=article)
        article.save_revision().publish()
        return article, True

    def copy_body(self, source_page):
        return source_page.body.raw_data if hasattr(source_page, "body") else []

    def extract_publication_datetime(self, source_page):
        text = self.body_text(source_page)
        match = re.search(r"发布日期.*?(\d{4}-\d{2}-\d{2})", text, flags=re.DOTALL)
        if match:
            date_value = datetime.strptime(match.group(1), "%Y-%m-%d").date()
            return timezone.make_aware(datetime.combine(date_value, time.min))
        if source_page.first_published_at:
            return source_page.first_published_at
        return timezone.now()

    def extract_source_url(self, source_page):
        match = re.search(r"https?://[^\s<\"']+", self.body_text(source_page))
        if match:
            return match.group(0)
        return ""

    def body_text(self, page):
        body = getattr(page, "body", None)
        if not body:
            return ""
        raw_data = getattr(body, "raw_data", None)
        return str(raw_data if raw_data is not None else body)

    def unique_slug(self, parent, title):
        base = slugify(title, allow_unicode=True) or "lecture"
        slug = base[:240]
        candidate = slug
        counter = 2
        while parent.get_children().filter(slug=candidate).exists():
            suffix = f"-{counter}"
            candidate = f"{slug[: 255 - len(suffix)]}{suffix}"
            counter += 1
        return candidate
