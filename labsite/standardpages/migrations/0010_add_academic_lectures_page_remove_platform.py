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
    research.introduction = "展示在研管线、学术讲座、研究方向与科研成果。"
    research.save(using=db_alias, update_fields=["introduction"])

    locale = getattr(research, "locale", None) or Locale.objects.using(db_alias).order_by("id").first()
    lecture = StandardPage.objects.using(db_alias).filter(
        path__startswith=research.path,
        depth=research.depth + 1,
        slug="academic-lectures",
    ).first()
    if lecture:
        lecture.title = "学术讲座"
        lecture.draft_title = "学术讲座"
        lecture.live = True
        lecture.show_in_menus = True
        lecture.has_unpublished_changes = False
        if not lecture.introduction:
            lecture.introduction = "学术讲座、学术报告与前沿论坛通知。"
        lecture.save(using=db_alias)
    else:
        lecture = StandardPage(
            title="学术讲座",
            draft_title="学术讲座",
            slug="academic-lectures",
            live=True,
            show_in_menus=True,
            has_unpublished_changes=False,
            path=_next_child_path(research),
            depth=research.depth + 1,
            numchild=0,
            url_path=f"{research.url_path}academic-lectures/",
            content_type=_get_content_type(ContentType, StandardPage, db_alias),
            locale=locale,
            introduction="学术讲座、学术报告与前沿论坛通知。",
        )
        lecture.save(using=db_alias)
        research.numchild += 1
        research.save(using=db_alias, update_fields=["numchild"])

    StandardPage.objects.using(db_alias).filter(
        path__startswith=research.path,
        depth=research.depth + 1,
        slug="platform",
    ).update(live=False, show_in_menus=False)


def backwards(apps, schema_editor):
    db_alias = schema_editor.connection.alias
    StandardPage = apps.get_model("standardpages", "StandardPage")

    research = StandardPage.objects.using(db_alias).filter(slug="research", depth=3).first()
    if not research:
        return

    StandardPage.objects.using(db_alias).filter(
        path__startswith=research.path,
        depth=research.depth + 1,
        slug="academic-lectures",
    ).update(live=False, show_in_menus=False)
    StandardPage.objects.using(db_alias).filter(
        path__startswith=research.path,
        depth=research.depth + 1,
        slug="platform",
    ).update(live=True, show_in_menus=True)


class Migration(migrations.Migration):

    dependencies = [
        ("standardpages", "0009_add_research_pipeline_page"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
