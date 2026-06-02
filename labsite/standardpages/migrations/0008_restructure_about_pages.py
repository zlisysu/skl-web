from django.db import migrations


def _get_content_type(content_type_model, model_class, db_alias):
    content_type, _created = content_type_model.objects.using(db_alias).get_or_create(
        app_label=model_class._meta.app_label,
        model=model_class._meta.model_name,
    )
    return content_type


def _next_child_path(parent):
    return f"{parent.path}{parent.numchild + 1:04d}"


def _get_or_create_child(parent, model, title, slug, db_alias, content_type_model, locale, **extra_fields):
    existing = model.objects.using(db_alias).filter(
        path__startswith=parent.path,
        depth=parent.depth + 1,
        slug=slug,
    ).first()
    if existing:
        existing.title = title
        existing.draft_title = title
        existing.live = True
        existing.has_unpublished_changes = False
        existing.url_path = f"{parent.url_path}{slug}/"
        for field_name, value in extra_fields.items():
            if not getattr(existing, field_name, None):
                setattr(existing, field_name, value)
        existing.save(using=db_alias)
        return existing

    page = model(
        title=title,
        draft_title=title,
        slug=slug,
        live=True,
        has_unpublished_changes=False,
        path=_next_child_path(parent),
        depth=parent.depth + 1,
        numchild=0,
        url_path=f"{parent.url_path}{slug}/",
        content_type=_get_content_type(content_type_model, model, db_alias),
        locale=locale,
        **extra_fields,
    )
    page.save(using=db_alias)
    parent.numchild += 1
    parent.save(using=db_alias, update_fields=["numchild"])
    return page


def forwards(apps, schema_editor):
    db_alias = schema_editor.connection.alias

    ContentType = apps.get_model("contenttypes", "ContentType")
    Locale = apps.get_model("wagtailcore", "Locale")
    StandardPage = apps.get_model("standardpages", "StandardPage")

    about = StandardPage.objects.using(db_alias).filter(slug="about", depth=3).first()
    if not about:
        return

    about.introduction = "介绍实验室基本情况、领导团队和学术委员会成员。"
    about.save(using=db_alias)

    locale = getattr(about, "locale", None) or Locale.objects.using(db_alias).order_by("id").first()

    intro = StandardPage.objects.using(db_alias).filter(
        path__startswith=about.path,
        depth=about.depth + 1,
        slug__in=["intro", "introduction"],
    ).order_by("path").first()
    if intro:
        intro.title = "实验室介绍"
        intro.draft_title = "实验室介绍"
        intro.slug = "introduction"
        intro.url_path = f"{about.url_path}introduction/"
        intro.live = True
        intro.has_unpublished_changes = False
        if not intro.introduction:
            intro.introduction = "实验室总体介绍。"
        intro.save(using=db_alias)
    else:
        _get_or_create_child(
            about,
            StandardPage,
            "实验室介绍",
            "introduction",
            db_alias,
            ContentType,
            locale,
            introduction="实验室总体介绍。",
        )

    _get_or_create_child(
        about,
        StandardPage,
        "领导介绍",
        "leadership",
        db_alias,
        ContentType,
        locale,
        introduction="实验室领导团队介绍。",
    )
    _get_or_create_child(
        about,
        StandardPage,
        "学术委员会成员",
        "academic-committee",
        db_alias,
        ContentType,
        locale,
        introduction="实验室学术委员会成员介绍。",
    )

    old_slugs = ["mission", "history", "organization", "policy"]
    old_pages = StandardPage.objects.using(db_alias).filter(
        path__startswith=about.path,
        depth=about.depth + 1,
        slug__in=old_slugs,
    )
    for page in old_pages:
        page.live = False
        page.show_in_menus = False
        page.has_unpublished_changes = False
        page.save(using=db_alias)


def backwards(apps, schema_editor):
    db_alias = schema_editor.connection.alias
    StandardPage = apps.get_model("standardpages", "StandardPage")
    about = StandardPage.objects.using(db_alias).filter(slug="about", depth=3).first()
    if not about:
        return

    intro = StandardPage.objects.using(db_alias).filter(
        path__startswith=about.path,
        depth=about.depth + 1,
        slug="introduction",
    ).first()
    if intro:
        intro.title = "实验室简介"
        intro.draft_title = "实验室简介"
        intro.slug = "intro"
        intro.url_path = f"{about.url_path}intro/"
        intro.live = True
        intro.save(using=db_alias)

    StandardPage.objects.using(db_alias).filter(
        path__startswith=about.path,
        depth=about.depth + 1,
        slug__in=["mission", "history", "organization", "policy"],
    ).update(live=True)


class Migration(migrations.Migration):

    dependencies = [
        ("standardpages", "0007_achievementpage_open_source_directly_and_more"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
