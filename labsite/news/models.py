from django.conf import settings
from django.db import models
from django.db.models import Case, IntegerField, When
from django.db.models.functions import Coalesce
from django.core.paginator import Paginator
from wagtail.admin.panels import FieldPanel, HelpPanel, InlinePanel, MultiFieldPanel
from wagtail.fields import RichTextField
from wagtail.search import index

from wagtail.fields import StreamField
from labsite.utils.models import BasePage, ArticleTopic
from labsite.utils.blocks import CaptionedImageBlock, StoryBlock, FeaturedArticleBlock


NEWS_TOPIC_ORDER = {
    "open-projects": 0,
    "pharmacy-news": 1,
    "hec-news": 2,
    "lab-news": 10,
}
NEWS_TOPIC_DEFAULTS = [
    ("开放课题", "open-projects"),
    ("药学院新闻", "pharmacy-news"),
    ("东阳光新闻", "hec-news"),
]


def ordered_news_topics(queryset=None, include_defaults=False):
    topics = list(queryset if queryset is not None else ArticleTopic.objects.all())
    if include_defaults:
        existing_slugs = {topic.slug for topic in topics}
        for title, slug in NEWS_TOPIC_DEFAULTS:
            if slug not in existing_slugs:
                topics.append(ArticleTopic(title=title, slug=slug))
    return sorted(
        topics,
        key=lambda topic: (NEWS_TOPIC_ORDER.get(topic.slug, 100), topic.title),
    )


class ArticlePage(BasePage):
    template = "pages/article_page.html"
    parent_page_types = ["news.NewsListingPage"]

    author = models.ForeignKey(
        "utils.AuthorSnippet",
        blank=False,
        null=False,
        on_delete=models.deletion.PROTECT,
        related_name="+",
    )
    topic = models.ForeignKey(
        "utils.ArticleTopic",
        blank=False,
        null=False,
        on_delete=models.deletion.PROTECT,
        related_name="article_pages",
    )
    publication_date = models.DateTimeField(
        "显示日期",
        null=True,
        blank=True,
        help_text="用于覆盖新闻默认显示日期。",
    )
    introduction = models.TextField(blank=True)
    source_url = models.URLField(
        "原文链接",
        blank=True,
        help_text="外部来源地址，例如中山大学药学院官网或微信公众号原文。",
    )
    open_source_directly = models.BooleanField(
        "列表中直接跳转原文",
        default=False,
        help_text="勾选后，新闻列表和首页新闻入口点击标题时直接打开原文链接。",
    )
    image = StreamField(
        [("image", CaptionedImageBlock())],
        blank=True,
        max_num=1,
    )
    body = StreamField(StoryBlock())
    featured_section_title = models.TextField(blank=True)

    search_fields = BasePage.search_fields + [
        index.SearchField("introduction"),
        index.FilterField("topic"),
    ]

    content_panels = BasePage.content_panels + [
        FieldPanel("author"),
        FieldPanel("publication_date"),
        FieldPanel("topic"),
        FieldPanel("introduction"),
        MultiFieldPanel(
            [
                FieldPanel("source_url"),
                FieldPanel("open_source_directly"),
            ],
            heading="原文链接",
        ),
        FieldPanel("image"),
        FieldPanel("body"),
        MultiFieldPanel(
            [
                FieldPanel("featured_section_title", heading="标题"),
                InlinePanel(
                    "page_related_pages",
                    label="页面",
                    max_num=3,
                ),
            ],
            heading="推荐内容",
        ),
    ]

    @property
    def display_date(self):
        if self.publication_date:
            return self.publication_date.strftime("%d %b %Y")
        elif self.first_published_at:
            return self.first_published_at.strftime("%d %b %Y")


class NewsListingPage(BasePage):
    template = "pages/news_listing_page.html"
    subpage_types = ["news.ArticlePage"]
    max_count = 1  # Allow only one news listing page to keep article pages in one place

    introduction = RichTextField(
        blank=True, features=["bold", "italic", "link"]
    )

    search_fields = BasePage.search_fields + [index.SearchField("introduction")]

    content_panels = (
        BasePage.content_panels
        + [
            FieldPanel("introduction"),
            # FieldPanel("featured_card"),
            HelpPanel("该页面会自动展示其下的新闻文章。"),
        ]
    )

    def paginate_queryset(self, queryset, request):
        """Paginate the queryset."""
        page_number = request.GET.get("page", 1)
        paginator = Paginator(queryset, settings.DEFAULT_PER_PAGE)
        try:
            page = paginator.page(page_number)
        except PageNotAnInteger:
            page = paginator.page(1)
        except EmptyPage:
            page = paginator.page(paginator.num_pages)
        return (paginator, page, page.object_list, page.has_other_pages())


    def get_context(self, request, *args, **kwargs):
        context = super().get_context(request, *args, **kwargs)
        queryset = (
            ArticlePage.objects.live()
            .public()
            .annotate(
                date=Coalesce("publication_date", "first_published_at"),
                topic_priority=Case(
                    When(topic__slug="open-projects", then=0),
                    default=1,
                    output_field=IntegerField(),
                ),
            )
            .select_related("listing_image", "author", "topic")
            .order_by("topic_priority", "-date")
        )

        article_topics = ordered_news_topics(
            ArticleTopic.objects.filter(article_pages__isnull=False).distinct(),
            include_defaults=True,
        )
        matching_topic = False

        topic_query_param = request.GET.get("topic")
        valid_topic_slugs = {topic.slug for topic in article_topics}
        if topic_query_param and topic_query_param in valid_topic_slugs:
            matching_topic = topic_query_param
            queryset = queryset.filter(topic__slug=topic_query_param)


        # Paginate article pages
        paginator, page, _object_list, is_paginated = self.paginate_queryset(
            queryset, request
        )
        context["paginator"] = paginator
        context["paginator_page"] = page
        context["is_paginated"] = is_paginated

        # Topics
        context["topics"] = article_topics
        context["matching_topic"] = matching_topic

        return context
