from django.db import models
from modelcluster.fields import ParentalKey
from wagtail.admin.panels import (
    FieldPanel, FieldRowPanel,
    InlinePanel, MultiFieldPanel
)
from wagtail.fields import RichTextField
from wagtail.contrib.forms.models import AbstractEmailForm, AbstractFormField
from wagtail.contrib.forms.panels import FormSubmissionsPanel

from labsite.utils.models import BasePage


class FormField(AbstractFormField):
    page = ParentalKey('FormPage', on_delete=models.CASCADE, related_name='form_fields')


class FormPage(AbstractEmailForm, BasePage):
    template = "pages/form_page.html"
    introduction = RichTextField(blank=True, features=["bold", "italic", "link"])
    action_text = models.CharField(
        "提交按钮文字",
        max_length=32,
        blank=True,
        help_text='表单按钮文字；留空时默认为“提交”。',
    )
    thank_you_text = RichTextField("提交成功提示", blank=True)

    content_panels = AbstractEmailForm.content_panels + [
        FormSubmissionsPanel(),
        FieldPanel('introduction'),
        InlinePanel('form_fields', label="表单字段"),
        FieldPanel('thank_you_text'),
        MultiFieldPanel([
            FieldRowPanel([
                FieldPanel('from_address', classname="col6"),
                FieldPanel('to_address', classname="col6"),
            ]),
            FieldPanel('subject'),
        ], "邮件通知"),
    ]
