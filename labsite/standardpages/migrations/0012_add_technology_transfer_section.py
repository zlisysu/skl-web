import uuid

from django.db import migrations


def _get_content_type(content_type_model, model_class, db_alias):
    content_type, _created = content_type_model.objects.using(db_alias).get_or_create(
        app_label=model_class._meta.app_label,
        model=model_class._meta.model_name,
    )
    return content_type


def _next_child_path(parent):
    return f"{parent.path}{parent.numchild + 1:04d}"


def _get_or_create_child(
    parent,
    model,
    title,
    slug,
    db_alias,
    content_type_model,
    locale,
    **extra_fields,
):
    existing = model.objects.using(db_alias).filter(
        path__startswith=parent.path,
        depth=parent.depth + 1,
        slug=slug,
    ).first()
    if existing:
        existing.title = title
        existing.draft_title = title
        existing.live = True
        existing.show_in_menus = True
        existing.has_unpublished_changes = False
        for field_name, value in extra_fields.items():
            setattr(existing, field_name, value)
        existing.save(using=db_alias)
        return existing

    page = model(
        title=title,
        draft_title=title,
        slug=slug,
        live=True,
        show_in_menus=True,
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


def _nav_link(page_id, title):
    return {
        "type": "link",
        "value": {"page": page_id, "title": title},
        "id": str(uuid.uuid4()),
    }


def _footer_internal(page_id, title):
    return {
        "type": "internal",
        "value": {"page": page_id, "title": title},
    }


def _ensure_primary_link(nav, transfer):
    items = list(nav.primary_navigation.raw_data or [])
    transfer_id = transfer.id
    items = [
        item
        for item in items
        if not (
            item.get("type") == "link"
            and item.get("value", {}).get("page") == transfer_id
        )
    ]

    insert_at = len(items)
    for index, item in enumerate(items):
        value = item.get("value", {})
        if value.get("title") == "联系我们":
            insert_at = index
            break

    items.insert(insert_at, _nav_link(transfer_id, "技术转化"))
    nav.primary_navigation = items


def _ensure_footer_link(nav, transfer):
    sections = list(nav.footer_navigation.raw_data or [])
    if not sections:
        nav.footer_navigation = [
            {
                "type": "link_section",
                "value": {
                    "section_heading": "网站栏目",
                    "links": [_footer_internal(transfer.id, "技术转化")],
                },
                "id": str(uuid.uuid4()),
            }
        ]
        return

    target = sections[0]
    links = list(target.get("value", {}).get("links") or [])
    links = [
        link
        for link in links
        if not (
            link.get("type") == "internal"
            and link.get("value", {}).get("page") == transfer.id
        )
    ]
    links.append(_footer_internal(transfer.id, "技术转化"))
    target.setdefault("value", {})["links"] = links
    sections[0] = target
    nav.footer_navigation = sections


def forwards(apps, schema_editor):
    db_alias = schema_editor.connection.alias

    ContentType = apps.get_model("contenttypes", "ContentType")
    Locale = apps.get_model("wagtailcore", "Locale")
    HomePage = apps.get_model("home", "HomePage")
    NavigationSettings = apps.get_model("navigation", "NavigationSettings")
    StandardPage = apps.get_model("standardpages", "StandardPage")

    homepage = HomePage.objects.using(db_alias).filter(depth=2).first()
    if not homepage:
        return

    locale = getattr(homepage, "locale", None) or Locale.objects.using(db_alias).order_by("id").first()
    transfer = _get_or_create_child(
        homepage,
        StandardPage,
        "技术转化",
        "technology-transfer",
        db_alias,
        ContentType,
        locale,
        introduction="展示实验室技术转化支撑队伍、设备平台、服务能力、转化案例与通知公告。",
    )

    for title, slug, introduction in [
        ("行政/技术人员", "admin-technical-staff", "行政管理与技术支撑人员介绍。"),
        ("支撑设备", "equipment", "实验室支撑设备、仪器平台与公共条件。"),
        ("提供服务", "services", "实验室可对外提供的技术服务与支撑能力。"),
        ("转化案例", "cases", "实验室技术转移、成果转化与合作案例。"),
        ("通知公告", "notices", "技术转化相关通知、公告与申报信息。"),
    ]:
        _get_or_create_child(
            transfer,
            StandardPage,
            title,
            slug,
            db_alias,
            ContentType,
            locale,
            introduction=introduction,
        )

    for nav in NavigationSettings.objects.using(db_alias).all():
        _ensure_primary_link(nav, transfer)
        _ensure_footer_link(nav, transfer)
        nav.save(using=db_alias, update_fields=["primary_navigation", "footer_navigation"])


def backwards(apps, schema_editor):
    db_alias = schema_editor.connection.alias
    NavigationSettings = apps.get_model("navigation", "NavigationSettings")
    StandardPage = apps.get_model("standardpages", "StandardPage")

    transfer = StandardPage.objects.using(db_alias).filter(
        slug="technology-transfer",
        depth=3,
    ).first()
    if not transfer:
        return

    for nav in NavigationSettings.objects.using(db_alias).all():
        primary = [
            item
            for item in list(nav.primary_navigation.raw_data or [])
            if not (
                item.get("type") == "link"
                and item.get("value", {}).get("page") == transfer.id
            )
        ]
        footer = list(nav.footer_navigation.raw_data or [])
        for section in footer:
            links = section.get("value", {}).get("links")
            if links is not None:
                section["value"]["links"] = [
                    link
                    for link in links
                    if not (
                        link.get("type") == "internal"
                        and link.get("value", {}).get("page") == transfer.id
                    )
                ]
        nav.primary_navigation = primary
        nav.footer_navigation = footer
        nav.save(using=db_alias, update_fields=["primary_navigation", "footer_navigation"])

    StandardPage.objects.using(db_alias).filter(
        path__startswith=transfer.path,
        depth__gt=transfer.depth,
    ).update(live=False, show_in_menus=False)
    transfer.live = False
    transfer.show_in_menus = False
    transfer.save(using=db_alias, update_fields=["live", "show_in_menus"])


class Migration(migrations.Migration):

    dependencies = [
        ("home", "0007_homepage_hero_quick_links"),
        ("navigation", "0005_navigationsettings_partner_links"),
        ("standardpages", "0011_rename_faculty_section"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
