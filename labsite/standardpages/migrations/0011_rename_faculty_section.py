import json

from django.db import migrations


def _replace_title(value, old, new):
    if isinstance(value, dict):
        return {
            key: (new if key == "title" and child == old else _replace_title(child, old, new))
            for key, child in value.items()
        }
    if isinstance(value, list):
        return [_replace_title(child, old, new) for child in value]
    return value


def _replace_json_text(value, old, new):
    if not value:
        return value
    data = json.loads(value)
    data = _replace_title(data, old, new)
    return json.dumps(data, ensure_ascii=False)


def forwards(apps, schema_editor):
    db_alias = schema_editor.connection.alias
    FacultyIndexPage = apps.get_model("standardpages", "FacultyIndexPage")
    HomePage = apps.get_model("home", "HomePage")

    FacultyIndexPage.objects.using(db_alias).filter(slug="faculty").update(
        title="实验室成员",
        draft_title="实验室成员",
    )
    _replace_home_introduction(HomePage, db_alias, "师资力量", "实验室成员")

    _replace_navigation_titles(schema_editor, "师资力量", "实验室成员")


def backwards(apps, schema_editor):
    db_alias = schema_editor.connection.alias
    FacultyIndexPage = apps.get_model("standardpages", "FacultyIndexPage")
    HomePage = apps.get_model("home", "HomePage")

    FacultyIndexPage.objects.using(db_alias).filter(slug="faculty").update(
        title="师资力量",
        draft_title="师资力量",
    )
    _replace_home_introduction(HomePage, db_alias, "实验室成员", "师资力量")

    _replace_navigation_titles(schema_editor, "实验室成员", "师资力量")


def _replace_navigation_titles(schema_editor, old, new):
    table = "navigation_navigationsettings"
    with schema_editor.connection.cursor() as cursor:
        cursor.execute(f"SELECT id, primary_navigation, footer_navigation FROM {table}")
        rows = cursor.fetchall()
        for nav_id, primary_navigation, footer_navigation in rows:
            cursor.execute(
                f"UPDATE {table} SET primary_navigation = %s, footer_navigation = %s WHERE id = %s",
                [
                    _replace_json_text(primary_navigation, old, new),
                    _replace_json_text(footer_navigation, old, new),
                    nav_id,
                ],
            )


def _replace_home_introduction(HomePage, db_alias, old, new):
    for page in HomePage.objects.using(db_alias).filter(introduction__contains=old):
        page.introduction = page.introduction.replace(old, new)
        page.save(using=db_alias, update_fields=["introduction"])


class Migration(migrations.Migration):

    dependencies = [
        ("home", "0007_homepage_hero_quick_links"),
        ("navigation", "0005_navigationsettings_partner_links"),
        ("standardpages", "0010_add_academic_lectures_page_remove_platform"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
