from django.db import models
from wagtail.admin.panels import FieldPanel, InlinePanel, MultiFieldPanel
from wagtail.fields import RichTextField
from wagtail.search import index

from wagtail.fields import StreamField
from labsite.utils.blocks import StoryBlock
from labsite.utils.models import BasePage


class StandardPage(BasePage):
    template = "pages/standard_page.html"
    parent_page_types = ["home.HomePage", "standardpages.StandardPage"]
    subpage_types = [
        "standardpages.StandardPage",
        "standardpages.FacultyIndexPage",
        "news.NewsListingPage",
        "standardpages.AchievementIndexPage",
        "standardpages.ContactPage",
    ]

    introduction = models.TextField(blank=True)
    display_table_of_contents = models.BooleanField(default=True)
    body = StreamField(StoryBlock())
    featured_section_title = models.TextField(blank=True)

    search_fields = BasePage.search_fields + [index.SearchField("introduction")]

    content_panels = BasePage.content_panels + [
        FieldPanel("introduction"),
        FieldPanel("display_table_of_contents"),
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

    def get_context(self, request, *args, **kwargs):
        context = super().get_context(request, *args, **kwargs)
        child_pages = list(self.get_children().live().public().specific())
        is_top_level_section = self.get_parent().specific_class.__name__ == "HomePage"
        section_pages = child_pages if is_top_level_section else []
        selected_slug = request.GET.get("section")
        valid_slugs = {section.slug for section in section_pages}
        matching_section = selected_slug if selected_slug in valid_slugs else None

        def get_section_items(section):
            child_pages = section.get_children().live().public()
            if child_pages.exists():
                return list(section.get_descendants().live().public().specific())
            return [section]

        if matching_section:
            selected_section = next(
                section for section in section_pages if section.slug == matching_section
            )
            listing_pages = get_section_items(selected_section)
        else:
            listing_pages = []
            if section_pages:
                for section in section_pages:
                    listing_pages.extend(get_section_items(section))
            else:
                listing_pages = child_pages

        context["section_filters"] = section_pages
        context["matching_section"] = matching_section
        context["section_listing_pages"] = listing_pages
        context["is_standard_detail_page"] = (
            not child_pages and self.get_parent().specific_class.__name__ != "HomePage"
        )
        return context


class IndexPage(BasePage):
    template = "pages/index_page.html"
    parent_page_types = ["home.HomePage", "standardpages.StandardPage"]
    subpage_types = ["standardpages.StandardPage"]

    introduction = RichTextField(blank=True)
    body = StreamField(StoryBlock(), blank=True)

    search_fields = BasePage.search_fields + [index.SearchField("introduction")]

    content_panels = BasePage.content_panels + [
        FieldPanel("introduction"),
        InlinePanel(
            "page_related_pages",
            label="推荐页面",
            min_num=3,
            max_num=12,
        ),
        FieldPanel("body")
    ]


class FacultyIndexPage(BasePage):
    template = "pages/faculty_index_page.html"
    parent_page_types = ["home.HomePage", "standardpages.StandardPage"]
    subpage_types = ["standardpages.FacultyPage"]

    introduction = RichTextField(blank=True)
    default_photo = models.ForeignKey(
        "images.CustomImage",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
        help_text="成员未上传头像时使用的默认占位图。",
    )

    search_fields = BasePage.search_fields + [index.SearchField("introduction")]

    content_panels = BasePage.content_panels + [
        FieldPanel("introduction"),
        FieldPanel("default_photo"),
    ]

    def get_context(self, request, *args, **kwargs):
        context = super().get_context(request, *args, **kwargs)
        faculty_groups = [
            {"slug": value, "title": label}
            for value, label in FacultyPage.FACULTY_GROUP_CHOICES
        ]
        selected_group = request.GET.get("group")
        valid_groups = {group["slug"] for group in faculty_groups}
        matching_group = selected_group if selected_group in valid_groups else None
        faculty_members = (
            FacultyPage.objects.child_of(self)
            .live()
            .public()
            .specific()
            .select_related("photo")
            .order_by("-is_featured", "faculty_group", "sort_order", "title")
        )
        if matching_group:
            faculty_members = faculty_members.filter(faculty_group=matching_group)
        context["faculty_groups"] = faculty_groups
        context["matching_group"] = matching_group
        context["faculty_members"] = faculty_members
        return context


class FacultyPage(BasePage):
    template = "pages/faculty_page.html"
    parent_page_types = ["standardpages.FacultyIndexPage"]
    subpage_types = []

    FACULTY_GROUP_CHOICES = [
        ("distinguished", "杰出人才"),
        ("core", "骨干教师"),
        ("young", "青年教师"),
        ("researcher", "博后/研究人员"),
    ]

    faculty_group = models.CharField(
        "人员分类",
        max_length=32,
        choices=FACULTY_GROUP_CHOICES,
        default="core",
    )
    name_en = models.CharField("英文姓名", max_length=255, blank=True)
    academic_title = models.CharField("职称", max_length=255, blank=True)
    position = models.CharField("职务", max_length=255, blank=True)
    photo = models.ForeignKey(
        "images.CustomImage",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
    )
    research_areas = models.CharField("研究方向", max_length=255, blank=True)
    email = models.EmailField("邮箱", blank=True)
    phone = models.CharField("电话", max_length=64, blank=True)
    office = models.CharField("办公地点", max_length=255, blank=True)
    education = RichTextField("教育经历", blank=True)
    biography = RichTextField("个人简介", blank=True)
    representative_works = RichTextField("代表成果", blank=True)
    awards = RichTextField("奖励荣誉", blank=True)
    sort_order = models.PositiveIntegerField("排序", default=100)
    is_featured = models.BooleanField("首页推荐", default=False)

    search_fields = BasePage.search_fields + [
        index.SearchField("research_areas"),
        index.SearchField("biography"),
    ]

    content_panels = BasePage.content_panels + [
        FieldPanel("faculty_group"),
        FieldPanel("name_en"),
        FieldPanel("academic_title"),
        FieldPanel("position"),
        FieldPanel("photo"),
        FieldPanel("research_areas"),
        FieldPanel("email"),
        FieldPanel("phone"),
        FieldPanel("office"),
        FieldPanel("education"),
        FieldPanel("biography"),
        FieldPanel("representative_works"),
        FieldPanel("awards"),
        FieldPanel("sort_order"),
        FieldPanel("is_featured"),
    ]


class AchievementIndexPage(BasePage):
    template = "pages/achievement_index_page.html"
    parent_page_types = ["home.HomePage", "standardpages.StandardPage"]
    subpage_types = ["standardpages.AchievementPage"]

    introduction = RichTextField(blank=True)

    search_fields = BasePage.search_fields + [index.SearchField("introduction")]

    content_panels = BasePage.content_panels + [
        FieldPanel("introduction"),
    ]

    def get_context(self, request, *args, **kwargs):
        context = super().get_context(request, *args, **kwargs)
        context["achievements"] = (
            AchievementPage.objects.child_of(self)
            .live()
            .public()
            .specific()
            .select_related("listing_image")
            .prefetch_related("related_faculty")
            .order_by("-is_featured", "-achievement_date", "title")
        )
        return context


class AchievementPage(BasePage):
    template = "pages/achievement_page.html"
    parent_page_types = ["standardpages.AchievementIndexPage"]
    subpage_types = []

    ACHIEVEMENT_TYPE_CHOICES = [
        ("paper", "论文"),
        ("project", "项目"),
        ("award", "奖励"),
        ("patent", "专利"),
        ("platform", "平台建设"),
    ]

    achievement_type = models.CharField(
        "成果类型",
        max_length=32,
        choices=ACHIEVEMENT_TYPE_CHOICES,
        default="paper",
    )
    achievement_date = models.DateField("成果日期", null=True, blank=True)
    responsible_team = models.CharField("责任团队", max_length=255, blank=True)
    summary = models.TextField("摘要", blank=True)
    body = StreamField(StoryBlock(), blank=True)
    related_faculty = models.ManyToManyField(
        "standardpages.FacultyPage",
        verbose_name="相关教师",
        blank=True,
        related_name="achievement_pages",
    )
    is_featured = models.BooleanField("首页推荐", default=False)

    search_fields = BasePage.search_fields + [
        index.SearchField("summary"),
        index.SearchField("responsible_team"),
    ]

    content_panels = BasePage.content_panels + [
        FieldPanel("achievement_type"),
        FieldPanel("achievement_date"),
        FieldPanel("responsible_team"),
        FieldPanel("summary"),
        FieldPanel("body"),
        FieldPanel("related_faculty"),
        FieldPanel("is_featured"),
    ]


class ContactPage(BasePage):
    template = "pages/contact_page.html"
    parent_page_types = ["home.HomePage", "standardpages.StandardPage"]
    subpage_types = []

    introduction = RichTextField(blank=True)
    lab_name = models.CharField("实验室名称", max_length=255, blank=True)
    address = models.CharField("地址", max_length=255, blank=True)
    postcode = models.CharField("邮编", max_length=32, blank=True)
    phone = models.CharField("电话", max_length=64, blank=True)
    email = models.EmailField("邮箱", blank=True)
    website = models.URLField("网站", blank=True)
    contact_person = models.CharField("联系人", max_length=255, blank=True)
    map_embed_code = models.TextField("地图嵌入代码", blank=True)
    traffic_info = RichTextField("交通信息", blank=True)
    body = StreamField(StoryBlock(), blank=True)

    search_fields = BasePage.search_fields + [
        index.SearchField("lab_name"),
        index.SearchField("address"),
    ]

    content_panels = BasePage.content_panels + [
        FieldPanel("introduction"),
        FieldPanel("lab_name"),
        FieldPanel("address"),
        FieldPanel("postcode"),
        FieldPanel("phone"),
        FieldPanel("email"),
        FieldPanel("website"),
        FieldPanel("contact_person"),
        FieldPanel("map_embed_code"),
        FieldPanel("traffic_info"),
        FieldPanel("body"),
    ]
