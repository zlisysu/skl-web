from collections import defaultdict

from django.core.exceptions import ValidationError
from django.forms.utils import ErrorList
from wagtail import blocks
from wagtail.blocks.struct_block import StructBlockValidationError
from wagtail.documents.blocks import DocumentChooserBlock
from wagtail.images.blocks import ImageBlock, ImageChooserBlock
from wagtail.snippets.blocks import SnippetChooserBlock

from labsite.utils.struct_values import CardStructValue, LinkStructValue


class AccordionBlock(blocks.StructBlock):
    title = blocks.CharBlock(max_length=255)
    content = blocks.RichTextBlock()

    class Meta:
        label = "Section"
        icon = "title"


class AccordionBlock(blocks.StructBlock):
    heading = blocks.ListBlock(AccordionBlock())
    list = blocks.ListBlock(AccordionBlock())

    class Meta:
        icon = "list-ol"
        template = "components/accordion/accordion.html"


class CaptionedImageBlock(blocks.StructBlock):
    image = ImageChooserBlock()
    image_alt_text = blocks.CharBlock(
        required=False,
        help_text="留空时将使用图片全局 alt 文本。",
    )
    caption = blocks.CharBlock(required=False)

    class Meta:
        icon = "image"
        template = "components/streamfield/blocks/image_block.html"


class InternalLinkBlock(blocks.StructBlock):
    page = blocks.PageChooserBlock()
    title = blocks.CharBlock(
        required=False,
        help_text="留空时使用页面的列表标题。",
    )

    class Meta:
        icon = "link"
        value_class = LinkStructValue


class ArticlePageLinkBlock(InternalLinkBlock):
    page = blocks.PageChooserBlock(
        page_type="news.ArticlePage",
    )


class ExternalLinkBlock(blocks.StructBlock):
    link = blocks.URLBlock()
    title = blocks.CharBlock()

    class Meta:
        icon = "link"
        value_class = LinkStructValue


class LinkStreamBlock(blocks.StreamBlock):
    """
    StreamBlock that allows editors to add a single link of type internal or external.
    """

    internal = InternalLinkBlock()
    external = ExternalLinkBlock()

    class Meta:
        icon = "link"
        label = "链接"
        min_num = 1
        max_num = 1


class QuoteBlock(blocks.StructBlock):
    quote = blocks.TextBlock(form_classname="title")
    attribution = blocks.CharBlock(required=False)

    class Meta:
        icon = "openquote"
        template = "components/streamfield/blocks/quote_block.html"


class CardBlock(blocks.StructBlock):
    heading = blocks.CharBlock(max_length=255)
    description = blocks.RichTextBlock(required=False, features=["bold", "italic"])
    link = LinkStreamBlock(required=False, min_num=0)

    class Meta:
        icon = "form"
        template = "components/streamfield/blocks/card_block.html"
        label = "卡片"
        value_class = CardStructValue


class FeaturedArticleBlock(blocks.StructBlock):
    link = ArticlePageLinkBlock()
    image = ImageBlock(
        required=False,
        help_text="用于覆盖所选文章默认展示图。",
    )
    description = blocks.TextBlock(
        max_length=255,
        required=False,
        help_text="用于覆盖页面默认的列表摘要或简介。",
    )
    cta_text = blocks.CharBlock(
        max_length=255,
        blank=False,
        help_text="按钮文字，点击后将跳转到对应文章页面。",
    )
    left_aligned = blocks.BooleanBlock(
        required=False,
        help_text="勾选后文本左对齐。",
    )

    class Meta:
        icon = "doc-full"
        template = "components/streamfield/blocks/feature_block.html"


class BaseSectionBlock(blocks.StructBlock):
    heading = blocks.CharBlock(
        form_classname="title",
        icon="title",
        required=True
    )  # Should use H2s only
    sr_only_label = blocks.BooleanBlock(
        required=False,
        label="仅屏幕阅读器显示",
        help_text="勾选后标题仅对屏幕阅读器可见。",
    )

    class Meta:
        abstract = True
        icon = "title"


class StatisticSectionBlock(BaseSectionBlock):
    statistics = blocks.ListBlock(
        SnippetChooserBlock(
            "utils.Statistic"
        ),
        max_num=3,
        min_num=3,
    )

    class Meta:
        icon = "snippet"
        template = "components/streamfield/blocks/stat_block.html"


class CTASectionBlock(blocks.StructBlock):
    heading = blocks.CharBlock(
        form_classname="title",
        icon="title",
        required=True
    )
    link = LinkStreamBlock()
    description = blocks.TextBlock(required=False)

    class Meta:
        icon = "link"
        label = "操作区"
        template = "components/streamfield/blocks/cta_block.html"


class BaseCardSectionBlock(BaseSectionBlock):
    cards = blocks.ListBlock(
        CardBlock(),
        max_num=6,
        min_num=3,
        label="卡片",
    )
    class Meta:
        abstract = True
        icon = "form"


class CardSectionBlock(BaseCardSectionBlock):
    class Meta:
        template = "components/streamfield/blocks/card_section_block.html"


class PlainCardSectionBlock(BaseCardSectionBlock):
    class Meta:
        icon = "doc-full"
        template = "components/streamfield/blocks/plain_cards_block.html"


class SectionBlocks(blocks.StreamBlock):
    paragraph = blocks.RichTextBlock(
        features=["bold", "italic", "link", "ol", "ul", "h3"],
        template="components/streamfield/blocks/paragraph_block.html",
    )


class SectionBlock(blocks.StructBlock):
    heading = blocks.CharBlock(
        form_classname="title",
        icon="title",
        template="components/streamfield/blocks/heading2_block.html",
    )
    content = SectionBlocks()

    class Meta:
        icon = "doc-full"
        template = "components/streamfield/blocks/section_block.html"


class StoryBlock(blocks.StreamBlock):
    section = SectionBlock()
    cta = CTASectionBlock()
    statistics = StatisticSectionBlock()

    class Meta:
        template = "components/streamfield/stream_block.html"
