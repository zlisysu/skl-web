from io import BytesIO
from bs4 import BeautifulSoup
from django.core.exceptions import FieldDoesNotExist, ValidationError
from django.core.files.images import ImageFile
from django.contrib.staticfiles.finders import find
from django.db import models
from django.db.models import QuerySet
from django.utils.decorators import method_decorator
from django.utils.functional import cached_property
from modelcluster.fields import ParentalKey
from willow.image import Image as WillowImage

from wagtail.admin.panels import FieldPanel, MultiFieldPanel
from wagtail.contrib.settings.models import BaseSiteSetting, register_setting
from wagtail.fields import RichTextField
from wagtail.models import Orderable, Page
from wagtail.rich_text import expand_db_html
from wagtail.snippets.models import register_snippet

from labsite.images.models import CustomImage
from labsite.utils.cache import get_default_cache_control_decorator
from labsite.utils.query import order_by_pk_position


# Related pages
class PageRelatedPage(Orderable):
    parent = ParentalKey(Page, related_name="page_related_pages")
    page_id: int
    page = models.ForeignKey(
        "wagtailcore.Page",
        on_delete=models.CASCADE,
        related_name="+",
    )

    panels = [FieldPanel("page")]


# Generic social fields abstract class to add social image/text to any new content type easily.
class SocialFields(models.Model):
    social_image = models.ForeignKey(
        "images.CustomImage",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
        verbose_name="社交分享图片",
    )
    social_text = models.CharField("社交分享文案", max_length=255, blank=True)

    class Meta:
        abstract = True

    promote_panels = [
        MultiFieldPanel(
            [FieldPanel("social_image"), FieldPanel("social_text")],
            "社交分享",
        )
    ]


# Generic listing fields abstract class to add listing image/text to any new content type easily.
class ListingFields(models.Model):
    listing_image = models.ForeignKey(
        "images.CustomImage",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
        verbose_name="列表图片",
        help_text="该页面出现在列表中时使用的展示图片。",
    )
    listing_title = models.CharField(
        "列表标题",
        max_length=255,
        blank=True,
        help_text="用于覆盖列表中显示的页面标题。",
    )
    listing_summary = models.CharField(
        "列表摘要",
        max_length=255,
        blank=True,
        help_text="该页面出现在列表中时使用的摘要；如果上方未填写 Meta 描述，也会作为搜索引擎描述使用。",
    )

    class Meta:
        abstract = True

    promote_panels = [
        MultiFieldPanel(
            [
                FieldPanel("listing_image"),
                FieldPanel("listing_title"),
                FieldPanel("listing_summary"),
            ],
            "列表展示信息",
        )
    ]


@register_snippet
class AuthorSnippet(models.Model):
    title = models.CharField(blank=False, max_length=255)
    image = models.ForeignKey(
        "images.CustomImage",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
    )

    def __str__(self):
        return self.title


@register_snippet
class ArticleTopic(models.Model):
    title = models.CharField(blank=False, max_length=255)
    slug = models.SlugField(blank=False, max_length=255)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self._state.adding and not self.slug:
            self.slug = self.slugify(self.title)
            using = kwargs.get("using") or router.db_for_write(
                type(self), instance=self
            )
            # Make sure we write to the same db for all attempted writes,
            # with a multi-master setup, theoretically we could try to
            # write and rollback on different DBs
            kwargs["using"] = using
            # Be opportunistic and try to save the tag, this should work for
            # most cases ;)
            try:
                with transaction.atomic(using=using):
                    res = super().save(*args, **kwargs)
                return res
            except IntegrityError:
                pass
            # Now try to find existing slugs with similar titles
            slugs = set(
                type(self)
                ._default_manager.filter(slug__startswith=self.slug)
                .values_list("slug", flat=True)
            )
            i = 1
            while True:
                slug = self.slugify(self.title, i)
                if slug not in slugs:
                    self.slug = slug
                    # We purposely ignore concurrency issues here for now.
                    # (That is, till we found a nice solution...)
                    return super().save(*args, **kwargs)
                i += 1
        else:
            return super().save(*args, **kwargs)

    def slugify(self, title, i=None):
        title = slugify(title, allow_unicode=True)

        if i is not None:
            title += "_%d" % i
        return title


@register_snippet
class Statistic(models.Model):
    statistic = models.CharField(blank=False, max_length=12)
    description = models.CharField(blank=False, max_length=225)

    panels = [
        FieldPanel("statistic"),
        FieldPanel("description"),
    ]

    def __str__(self):
        return self.statistic


@register_setting
class SocialMediaSettings(BaseSiteSetting):
    twitter_handle = models.CharField(
        "Twitter 用户名",
        max_length=255,
        blank=True,
        help_text="填写不含 @ 的 Twitter 用户名。",
    )
    linkedin_handle = models.CharField(
        "LinkedIn 账号",
        max_length=255,
        blank=True,
        help_text="填写 LinkedIn 账号名称。",
    )
    facebook_app_id = models.CharField(
        "Facebook 应用 ID",
        max_length=255,
        blank=True,
        help_text="填写 Facebook 应用 ID。",
    )
    instagram_handle = models.CharField(
        "Instagram 用户名",
        max_length=255,
        blank=True,
        help_text="填写 Instagram 用户名。",
    )
    tiktok_handle = models.CharField(
        "TikTok 用户名",
        max_length=255,
        blank=True,
        help_text="填写 TikTok 用户名。",
    )
    default_sharing_text = models.CharField(
        "默认分享文案",
        max_length=255,
        blank=True,
        help_text="当页面未单独设置分享文案时使用此默认值。",
    )


@register_setting
class SystemMessagesSettings(BaseSiteSetting):
    class Meta:
        verbose_name = "系统提示"

    title_404 = models.CharField("404 标题", max_length=255, default="页面未找到")
    body_404 = RichTextField(
        "404 文本",
        default="<p>你访问的页面可能不存在，或已经被移动。</p>",
    )

    placeholder_image = models.ForeignKey(
        "images.CustomImage",
        null=True,
        blank=False,
        on_delete=models.SET_NULL,
        related_name="+",
        verbose_name="默认占位图",
        help_text="默认展示的占位图片。",
    )

    footer_newsletter_signup_title = models.CharField(
        "页脚按钮标题",
        blank=False,
        null=False,
        default="订阅通讯",
        max_length=120,
    )
    footer_newsletter_signup_description = models.CharField(
        "页脚说明文字",
        blank=True,
        max_length=255,
    )
    footer_newsletter_signup_link = models.URLField(
        "页脚跳转链接",
        blank=True,
        null=True,
        help_text="页脚按钮跳转链接；留空则不显示该按钮。",
    )

    panels = [
        MultiFieldPanel(
            [
                FieldPanel("title_404"),
                FieldPanel("body_404"),
            ],
            heading="404 页面",
        ),
        FieldPanel("placeholder_image",),
        MultiFieldPanel(
            [
                FieldPanel("footer_newsletter_signup_title",),
                FieldPanel("footer_newsletter_signup_description",),
                FieldPanel("footer_newsletter_signup_link",),
            ],
            heading="页脚",
        ),
    ]

    def get_placeholder_image(self):
        """
        """
        if self.placeholder_image:
            return self.placeholder_image

        # Get the absolute path to the image file
        absolute_path = find('images/placeholder-image.webp')
        if absolute_path:
            with open(absolute_path, 'rb') as f:
                image_bytes = f.read()

            img_file = ImageFile(BytesIO(image_bytes), name="Placeholder Image")
            im = WillowImage.open(img_file)
            width, height = im.get_size()

            new_default_image = CustomImage(title="Placeholder Image", file=img_file, width=width, height=height)
            new_default_image.save()
            new_default_image.tags.add("placeholder")

            self.placeholder_image = new_default_image
            self.save()  # Save to persist new image as placeholder
            return self.placeholder_image
        raise ValidationError("No placeholder image found. Please upload a placeholder image.")


# Apply default cache headers on this page model's serve method.
@method_decorator(get_default_cache_control_decorator(), name="serve")
class BasePage(SocialFields, ListingFields, Page):
    show_in_menus_default = True

    appear_in_search_results = models.BooleanField(
        default=True,
        verbose_name="允许搜索引擎收录",
        help_text="勾选后允许搜索引擎收录该页面；取消勾选后将不再建议搜索引擎索引。",
    )

    class Meta:
        abstract = True

    promote_panels = (
        Page.promote_panels
        + SocialFields.promote_panels
        + ListingFields.promote_panels
        + [
            FieldPanel("appear_in_search_results"),
        ]
    )

    @cached_property
    def related_pages(self) -> QuerySet:
        """
        Return a `PageQuerySet` of items related to this page via the
        `PageRelatedPage` through model, and are suitable for display.
        The result is ordered to match that specified by editors using
        the 'page_related_pages' `InlinePanel`.
        """

        # NOTE: avoiding values_list() here for compatibility with preview
        # See: https://github.com/wagtail/django-modelcluster/issues/30
        ordered_page_pks = tuple(item.page_id for item in self.page_related_pages.all())
        return order_by_pk_position(
            Page.objects.live().public().specific(),
            pks=ordered_page_pks,
            exclude_non_matches=True,
        )

    @property
    def plain_introduction(self):
        """
        This property returns a plain text representation of a model's 'introduction' field.

        If 'introduction' is a RichTextField, the method uses BeautifulSoup to filter and parse
        the rich text content, returning the plain text. If 'introduction' is a standard TextField
        or if it doesn't exist, the method returns the original text or an empty string.

        Returns:
            str: Plain text representation of the 'introduction' field or none if the field
            doesn't exist or is blank.
        """
        try:
            introduction_field = self._meta.get_field("introduction")
        except FieldDoesNotExist:
            pass
        else:
            introduction_value = getattr(self, "introduction", None)
            if introduction_value:
                if isinstance(introduction_field, RichTextField):
                    soup = BeautifulSoup(expand_db_html(introduction_value), "html.parser")
                    return soup.text
                else:
                    return introduction_value


BasePage._meta.get_field("seo_title").verbose_name = "SEO 标题"
BasePage._meta.get_field("search_description").verbose_name = "Meta 描述"
