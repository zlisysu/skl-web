from django.db import migrations


def _get_content_type(content_type_model, model_class, db_alias):
    content_type, _created = content_type_model.objects.using(db_alias).get_or_create(
        app_label=model_class._meta.app_label,
        model=model_class._meta.model_name,
    )
    return content_type


def _next_child_path(parent):
    return f"{parent.path}{parent.numchild + 1:04d}"


def forwards(apps, schema_editor):
    db_alias = schema_editor.connection.alias

    ContentType = apps.get_model("contenttypes", "ContentType")
    Locale = apps.get_model("wagtailcore", "Locale")
    StandardPage = apps.get_model("standardpages", "StandardPage")

    research = StandardPage.objects.using(db_alias).filter(slug="research", depth=3).first()
    if not research:
        return

    existing = StandardPage.objects.using(db_alias).filter(
        path__startswith=research.path,
        depth=research.depth + 1,
        slug="pipeline",
    ).first()
    if existing:
        existing.title = "在研管线"
        existing.draft_title = "在研管线"
        existing.live = True
        existing.show_in_menus = True
        existing.has_unpublished_changes = False
        if not existing.introduction:
            existing.introduction = "实验室在研项目与新药研发管线。"
        existing.save(using=db_alias)
        return

    locale = getattr(research, "locale", None) or Locale.objects.using(db_alias).order_by("id").first()
    page = StandardPage(
        title="在研管线",
        draft_title="在研管线",
        slug="pipeline",
        live=True,
        show_in_menus=True,
        has_unpublished_changes=False,
        path=_next_child_path(research),
        depth=research.depth + 1,
        numchild=0,
        url_path=f"{research.url_path}pipeline/",
        content_type=_get_content_type(ContentType, StandardPage, db_alias),
        locale=locale,
        introduction="实验室在研项目与新药研发管线。",
    )
    page.save(using=db_alias)
    research.numchild += 1
    research.save(using=db_alias, update_fields=["numchild"])


def backwards(apps, schema_editor):
    db_alias = schema_editor.connection.alias
    StandardPage = apps.get_model("standardpages", "StandardPage")

    research = StandardPage.objects.using(db_alias).filter(slug="research", depth=3).first()
    if not research:
        return

    StandardPage.objects.using(db_alias).filter(
        path__startswith=research.path,
        depth=research.depth + 1,
        slug="pipeline",
    ).update(live=False, show_in_menus=False)


class Migration(migrations.Migration):

    dependencies = [
        ("standardpages", "0008_restructure_about_pages"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
