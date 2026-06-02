from django.db import migrations


def _rename_navigation_value(value):
    if isinstance(value, dict):
        renamed = {
            key: _rename_navigation_value(child)
            for key, child in value.items()
        }
        if renamed.get("title") == "新闻":
            renamed["title"] = "新闻和通知"
        return renamed
    if isinstance(value, (list, tuple)):
        return [_rename_navigation_value(child) for child in value]
    return value

def forwards(apps, schema_editor):
    db_alias = schema_editor.connection.alias
    ArticleTopic = apps.get_model("utils", "ArticleTopic")
    NewsListingPage = apps.get_model("news", "NewsListingPage")
    NavigationSettings = apps.get_model("navigation", "NavigationSettings")

    ArticleTopic.objects.using(db_alias).get_or_create(
        slug="open-projects",
        defaults={"title": "开放课题"},
    )
    ArticleTopic.objects.using(db_alias).get_or_create(
        slug="lab-news",
        defaults={"title": "实验室新闻"},
    )

    NewsListingPage.objects.using(db_alias).filter(slug="news").update(
        title="新闻和通知",
        draft_title="新闻和通知",
    )

    for nav in NavigationSettings.objects.using(db_alias).all():
        primary_navigation = nav.primary_navigation.raw_data
        footer_navigation = nav.footer_navigation.raw_data
        nav.primary_navigation = _rename_navigation_value(primary_navigation)
        nav.footer_navigation = _rename_navigation_value(footer_navigation)
        nav.save(using=db_alias, update_fields=["primary_navigation", "footer_navigation"])


def backwards(apps, schema_editor):
    db_alias = schema_editor.connection.alias
    NewsListingPage = apps.get_model("news", "NewsListingPage")
    NavigationSettings = apps.get_model("navigation", "NavigationSettings")

    NewsListingPage.objects.using(db_alias).filter(slug="news").update(
        title="新闻",
        draft_title="新闻",
    )

    for nav in NavigationSettings.objects.using(db_alias).all():
        primary_navigation = nav.primary_navigation.raw_data
        footer_navigation = nav.footer_navigation.raw_data
        _rename_news_back(primary_navigation)
        _rename_news_back(footer_navigation)
        nav.primary_navigation = primary_navigation
        nav.footer_navigation = footer_navigation
        nav.save(using=db_alias, update_fields=["primary_navigation", "footer_navigation"])


def _rename_news_back(value):
    if isinstance(value, dict):
        renamed = {
            key: _rename_news_back(child)
            for key, child in value.items()
        }
        if renamed.get("title") == "新闻和通知":
            renamed["title"] = "新闻"
        return renamed
    if isinstance(value, (list, tuple)):
        return [_rename_news_back(child) for child in value]
    return value


class Migration(migrations.Migration):

    dependencies = [
        ("navigation", "0005_navigationsettings_partner_links"),
        ("news", "0003_articlepage_open_source_directly_and_more"),
        ("utils", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
