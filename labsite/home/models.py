from django.db import models
from wagtail.admin.panels import FieldPanel, InlinePanel, MultiFieldPanel
from wagtail.search import index

from wagtail.fields import StreamField
from labsite.utils.blocks import StoryBlock, InternalLinkBlock
from labsite.utils.models import BasePage


class HomePage(BasePage):
    template = "pages/home_page.html"
    max_count = 1
    subpage_types = [
        "standardpages.StandardPage",
        "standardpages.FacultyIndexPage",
        "news.NewsListingPage",
        "standardpages.AchievementIndexPage",
        "standardpages.ContactPage",
    ]

    introduction = models.TextField(blank=True)
    hero_image = models.ForeignKey(
        "images.CustomImage",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
    )
    background_image = models.ForeignKey(
        "images.CustomImage",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
        help_text="首页首屏背景图，建议使用浅色或留白较多的横向图片。",
    )
    hero_cta = StreamField(
        [("link", InternalLinkBlock())],
        blank=True,
        min_num=0,
        max_num=1,
    )
    body = StreamField(StoryBlock(), blank=True)
    featured_section_title = models.TextField(blank=True)

    search_fields = BasePage.search_fields + [index.SearchField("introduction")]

    content_panels = BasePage.content_panels + [
        FieldPanel("introduction"),
        FieldPanel("hero_image"),
        FieldPanel("background_image"),
        FieldPanel("hero_cta"),
        FieldPanel("body"),
        MultiFieldPanel(
            [
                FieldPanel("featured_section_title", heading="Title"),
                InlinePanel(
                    "page_related_pages",
                    label="Pages",
                    max_num=12,
                ),
            ],
            heading="Featured section",
        ),
    ]

    def get_context(self, request, *args, **kwargs):
        context = super().get_context(request, *args, **kwargs)

        from labsite.news.models import ArticlePage
        from labsite.standardpages.models import AchievementPage, FacultyPage

        context["latest_news"] = (
            ArticlePage.objects.live()
            .public()
            .specific()
            .select_related("listing_image", "author", "topic")
            .order_by("-first_published_at")[:5]
        )
        context["featured_faculty"] = (
            FacultyPage.objects.live()
            .public()
            .specific()
            .select_related("photo")
            .order_by("-is_featured", "sort_order", "title")[:6]
        )
        context["featured_achievements"] = (
            AchievementPage.objects.live()
            .public()
            .specific()
            .select_related("listing_image")
            .order_by("-is_featured", "-achievement_date", "title")[:4]
        )
        return context
