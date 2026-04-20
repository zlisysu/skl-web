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
        help_text="Header logo image. If empty, the built-in SKL logo is used.",
    )
    brand_title = models.CharField(
        "Chinese brand title, first line",
        max_length=120,
        blank=True,
        help_text="First Chinese line shown next to the header logo.",
    )
    brand_title_second_line = models.CharField(
        "Chinese brand title, second line",
        max_length=120,
        blank=True,
        help_text="Second Chinese line shown next to the header logo.",
    )
    brand_subtitle = models.CharField(
        "English brand line",
        max_length=160,
        blank=True,
        help_text="English line shown below the header logo and Chinese title.",
    )
    primary_navigation = StreamField(
        [("link", InternalLinkBlock())],
        blank=True,
        help_text="Main site navigation",
        
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
    )

    panels = [
        MultiFieldPanel(
            [
                FieldPanel("brand_logo"),
                FieldPanel("brand_title"),
                FieldPanel("brand_title_second_line"),
                FieldPanel("brand_subtitle"),
            ],
            heading="Header brand",
        ),
        FieldPanel("primary_navigation"),
        FieldPanel("footer_navigation"),
    ]
