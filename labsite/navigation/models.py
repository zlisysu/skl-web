from django.db import models
from modelcluster.models import ClusterableModel
from wagtail import blocks
from wagtail.admin.panels import FieldPanel, MultiFieldPanel
from wagtail.contrib.settings.models import BaseSiteSetting, register_setting
from wagtail.fields import StreamField
from wagtail.snippets.blocks import SnippetChooserBlock

from labsite.utils.blocks import LinkStreamBlock, InternalLinkBlock


@register_setting(icon="list-ul")
class NavigationSettings(BaseSiteSetting, ClusterableModel):
    brand_logo = models.ForeignKey(
        "images.CustomImage",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
        verbose_name="页眉 Logo",
        help_text="页眉 Logo 图片；留空时使用内置 SKL 标识。",
    )
    brand_title = models.CharField(
        "页眉中文标题第一行",
        max_length=120,
        blank=True,
        help_text="显示在页眉 Logo 右侧的中文第一行。",
    )
    brand_title_second_line = models.CharField(
        "页眉中文标题第二行",
        max_length=120,
        blank=True,
        help_text="显示在页眉 Logo 右侧的中文第二行。",
    )
    brand_subtitle = models.CharField(
        "页眉英文标题",
        max_length=160,
        blank=True,
        help_text="显示在 Logo 与中文标题下方的英文标题。",
    )
    primary_navigation = StreamField(
        [("link", InternalLinkBlock())],
        blank=True,
        verbose_name="主导航",
        help_text="网站顶部主导航。",
        
    )
    footer_navigation = StreamField(
        [("link_section", blocks.StructBlock([
                ("section_heading", blocks.CharBlock()),
                ("links", LinkStreamBlock(
                    label = "Links", 
                    max_num = None
                )),
            ])) 
        ],
        blank=True,
        verbose_name="页脚导航",
    )

    panels = [
        MultiFieldPanel(
            [
                FieldPanel("brand_logo"),
                FieldPanel("brand_title"),
                FieldPanel("brand_title_second_line"),
                FieldPanel("brand_subtitle"),
            ],
            heading="页眉品牌区",
        ),
        FieldPanel("primary_navigation"),
        FieldPanel("footer_navigation"),
    ]
