from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils.text import slugify

from labsite.news.models import ArticlePage
from labsite.standardpages.models import AchievementIndexPage, AchievementPage


SELECTED_HEC_ACHIEVEMENTS = {
    "https://www.hecpharm.com/news_media/company_news/1242.html": "platform",
    "https://www.hecpharm.com/news_media/company_news/1241.html": "project",
    "https://www.hecpharm.com/news_media/company_news/1240.html": "award",
    "https://www.hecpharm.com/news_media/company_news/1214.html": "platform",
    "https://www.hecpharm.com/news_media/company_news/1205.html": "platform",
    "https://www.hecpharm.com/news_media/company_news/1203.html": "project",
    "https://www.hecpharm.com/news_media/company_news/1169.html": "platform",
    "https://www.hecpharm.com/news_media/company_news/634.html": "platform",
    "https://www.hecpharm.com/news_media/company_news/627.html": "project",
    "https://www.hecpharm.com/news_media/company_news/622.html": "project",
    "https://www.hecpharm.com/news_media/company_news/621.html": "project",
    "https://www.hecpharm.com/news_media/company_news/309.html": "platform",
    "https://www.hecpharm.com/news_media/company_news/303.html": "award",
    "https://www.hecpharm.com/news_media/company_news/307.html": "platform",
    "https://www.hecpharm.com/news_media/company_news/138.html": "patent",
    "https://www.hecpharm.com/news_media/company_news/135.html": "project",
}


class Command(BaseCommand):
    help = "Promote selected HEC news records into /research/achievements/."

    def handle(self, *args, **options):
        achievement_index = AchievementIndexPage.objects.first()
        if not achievement_index:
            raise CommandError("No AchievementIndexPage found.")

        articles = list(
            ArticlePage.objects.filter(
                topic__slug="hec-news",
                source_url__in=SELECTED_HEC_ACHIEVEMENTS.keys(),
            )
            .specific()
            .order_by("-publication_date", "title")
        )
        found_urls = {article.source_url for article in articles}
        missing_urls = set(SELECTED_HEC_ACHIEVEMENTS) - found_urls
        if missing_urls:
            self.stderr.write(
                self.style.WARNING(
                    "Selected HEC news source URLs not found: " + ", ".join(sorted(missing_urls))
                )
            )

        created = updated = 0
        with transaction.atomic():
            for article in articles:
                _achievement, was_created = self.upsert_achievement(achievement_index, article)
                if was_created:
                    created += 1
                else:
                    updated += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Promoted HEC news to achievements: created={created}, updated={updated}."
            )
        )

    def upsert_achievement(self, parent, article):
        achievement_type = SELECTED_HEC_ACHIEVEMENTS[article.source_url]
        achievement_date = None
        if article.publication_date:
            achievement_date = article.publication_date.date()
        elif article.first_published_at:
            achievement_date = article.first_published_at.date()

        summary = article.introduction or article.listing_summary or article.plain_introduction or ""
        body = article.body.raw_data if article.body else self.link_body(article.source_url)

        achievement = (
            AchievementPage.objects.child_of(parent)
            .filter(source_url=article.source_url)
            .specific()
            .first()
        )
        if not achievement:
            achievement = (
                AchievementPage.objects.child_of(parent)
                .filter(title=article.title)
                .specific()
                .first()
            )

        if achievement:
            achievement.title = article.title
            achievement.achievement_type = achievement_type
            achievement.achievement_date = achievement_date
            achievement.responsible_team = "东阳光药"
            achievement.summary = summary
            achievement.source_url = article.source_url
            achievement.open_source_directly = True
            achievement.body = body
            achievement.listing_image = article.listing_image
            achievement.listing_summary = summary[:255]
            achievement.search_description = (article.search_description or summary)[:255]
            achievement.live = article.live
            achievement.show_in_menus = False
            achievement.save_revision().publish()
            return achievement, False

        achievement = AchievementPage(
            title=article.title,
            slug=self.unique_slug(parent, article.title),
            achievement_type=achievement_type,
            achievement_date=achievement_date,
            responsible_team="东阳光药",
            summary=summary,
            source_url=article.source_url,
            open_source_directly=True,
            body=body,
            listing_image=article.listing_image,
            listing_summary=summary[:255],
            search_description=(article.search_description or summary)[:255],
            live=article.live,
            has_unpublished_changes=False,
            show_in_menus=False,
        )
        parent.add_child(instance=achievement)
        achievement.save_revision().publish()
        return achievement, True

    def link_body(self, url):
        html = f'<p>原文链接：<a href="{url}">{url}</a></p>'
        return [("section", {"heading": "正文", "content": [("paragraph", html)]})]

    def unique_slug(self, parent, title):
        base = slugify(title, allow_unicode=True) or "achievement"
        slug = base[:240]
        candidate = slug
        counter = 2
        while parent.get_children().filter(slug=candidate).exists():
            suffix = f"-{counter}"
            candidate = f"{slug[: 255 - len(suffix)]}{suffix}"
            counter += 1
        return candidate
