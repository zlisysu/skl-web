from django.db import migrations


def _get_or_create_child(parent, model, title, slug, **extra_fields):
    from wagtail.actions.publish_page_revision import PublishPageRevisionAction

    existing = model.objects.filter(
        path__startswith=parent.path,
        depth=parent.depth + 1,
        slug=slug,
    ).first()
    if existing:
        if existing.live and existing.live_revision_id is None:
            revision = existing.latest_revision or existing.save_revision(log_action=False)
            PublishPageRevisionAction(
                revision, changed=False, log_action=False
            ).execute(skip_permission_checks=True)
        return existing

    page = model(
        title=title,
        draft_title=title,
        slug=slug,
        live=False,
        has_unpublished_changes=True,
        **extra_fields,
    )
    parent.add_child(instance=page)
    revision = page.save_revision(log_action=False)
    PublishPageRevisionAction(revision, changed=False, log_action=False).execute(
        skip_permission_checks=True
    )
    return page


def bootstrap_lab_site(apps, schema_editor):
    from wagtail.actions.publish_page_revision import PublishPageRevisionAction
    from wagtail.models import Page, Site

    from labsite.home.models import HomePage
    from labsite.navigation.models import NavigationSettings
    from labsite.news.models import NewsListingPage
    from labsite.standardpages.models import (
        AchievementIndexPage,
        ContactPage,
        FacultyIndexPage,
        StandardPage,
    )
    from labsite.utils.models import ArticleTopic, AuthorSnippet

    root = Page.objects.get(depth=1)
    homepage = HomePage.objects.filter(depth=2).first()
    if homepage is None:
        homepage = HomePage(
            title="首页",
            draft_title="首页",
            slug="home",
            introduction="全国重点实验室官方网站，集中展示实验室概况、党建工作、师资力量、新闻动态、学术科研与联系方式。",
            featured_section_title="重点栏目",
            live=False,
            has_unpublished_changes=True,
        )
        root.add_child(instance=homepage)
    else:
        homepage.title = "首页"
        homepage.draft_title = "首页"
        homepage.introduction = (
            "全国重点实验室官方网站，集中展示实验室概况、党建工作、师资力量、新闻动态、学术科研与联系方式。"
        )
        homepage.featured_section_title = "重点栏目"
        homepage.live = homepage.live
        homepage.save()

    if homepage.live_revision_id is None:
        revision = homepage.latest_revision or homepage.save_revision(log_action=False)
        PublishPageRevisionAction(revision, changed=False, log_action=False).execute(
            skip_permission_checks=True
        )

    site = Site.objects.order_by("id").first()
    if site:
        site.root_page = homepage
        site.site_name = "全国重点实验室"
        site.hostname = site.hostname or "localhost"
        site.is_default_site = True
        site.save()
    else:
        site = Site.objects.create(
            hostname="localhost",
            site_name="全国重点实验室",
            root_page=homepage,
            is_default_site=True,
        )

    about = _get_or_create_child(
        homepage,
        StandardPage,
        "实验室概况",
        "about",
        introduction="介绍实验室定位、建设目标、发展历程与组织架构。",
    )
    party = _get_or_create_child(
        homepage,
        StandardPage,
        "党建工作",
        "party-building",
        introduction="展示党建工作动态、理论学习和组织建设情况。",
    )
    faculty = _get_or_create_child(
        homepage,
        FacultyIndexPage,
        "师资力量",
        "faculty",
        introduction="<p>展示实验室主要师资、研究人员与人才队伍建设情况。</p>",
    )
    news = _get_or_create_child(
        homepage,
        NewsListingPage,
        "新闻",
        "news",
        introduction="<p>发布实验室新闻动态、通知公告、学术报告和媒体报道。</p>",
    )
    research = _get_or_create_child(
        homepage,
        StandardPage,
        "学术科研",
        "research",
        introduction="展示研究方向、科研成果、平台建设与项目进展。",
    )
    contact = _get_or_create_child(
        homepage,
        ContactPage,
        "联系我们",
        "contact",
        introduction="<p>欢迎通过电话、邮箱或来访方式与实验室联系。</p>",
        lab_name="全国重点实验室",
        address="请在后台补充实验室地址",
        phone="请在后台补充联系电话",
        email="lab@example.com",
        contact_person="实验室办公室",
    )

    _get_or_create_child(about, StandardPage, "实验室简介", "intro", introduction="实验室总体介绍。")
    _get_or_create_child(about, StandardPage, "建设目标", "mission", introduction="实验室建设目标与总体定位。")
    _get_or_create_child(about, StandardPage, "发展历程", "history", introduction="实验室发展历程与重要节点。")
    _get_or_create_child(about, StandardPage, "组织架构", "organization", introduction="实验室组织架构与管理体系。")
    _get_or_create_child(about, StandardPage, "管理制度", "policy", introduction="实验室管理制度与运行机制。")

    _get_or_create_child(party, StandardPage, "工作动态", "updates", introduction="党建工作动态。")
    _get_or_create_child(party, StandardPage, "理论学习", "study", introduction="理论学习与主题教育。")
    _get_or_create_child(party, StandardPage, "组织生活", "life", introduction="组织生活与支部活动。")
    _get_or_create_child(party, StandardPage, "规章制度", "rules", introduction="党建工作制度文件。")

    _get_or_create_child(research, StandardPage, "研究方向", "directions", introduction="实验室主要研究方向介绍。")
    achievements = _get_or_create_child(
        research,
        AchievementIndexPage,
        "科研成果",
        "achievements",
        introduction="<p>汇总实验室代表性论文、项目、奖励与平台建设成果。</p>",
    )
    _get_or_create_child(research, StandardPage, "平台建设", "platform", introduction="实验平台与公共支撑条件。")

    AuthorSnippet.objects.get_or_create(title="实验室办公室")
    for title, slug in [
        ("实验室新闻", "lab-news"),
        ("通知公告", "notice"),
        ("学术报告", "seminar"),
        ("媒体报道", "media"),
    ]:
        ArticleTopic.objects.get_or_create(title=title, slug=slug)

    NavigationSettings.objects.update_or_create(
        site_id=site.id,
        defaults={
            "primary_navigation": [
                {"type": "link", "value": {"page": homepage.id, "title": "首页"}},
                {"type": "link", "value": {"page": about.id, "title": "实验室概况"}},
                {"type": "link", "value": {"page": party.id, "title": "党建工作"}},
                {"type": "link", "value": {"page": faculty.id, "title": "师资力量"}},
                {"type": "link", "value": {"page": news.id, "title": "新闻"}},
                {"type": "link", "value": {"page": research.id, "title": "学术科研"}},
                {"type": "link", "value": {"page": contact.id, "title": "联系我们"}},
            ],
            "footer_navigation": [
                {
                    "type": "link_section",
                    "value": {
                        "section_heading": "网站栏目",
                        "links": [
                            {"type": "internal", "value": {"page": about.id, "title": "实验室概况"}},
                            {"type": "internal", "value": {"page": faculty.id, "title": "师资力量"}},
                            {"type": "internal", "value": {"page": research.id, "title": "学术科研"}},
                        ],
                    },
                },
                {
                    "type": "link_section",
                    "value": {
                        "section_heading": "信息发布",
                        "links": [
                            {"type": "internal", "value": {"page": news.id, "title": "新闻"}},
                            {"type": "internal", "value": {"page": achievements.id, "title": "科研成果"}},
                            {"type": "internal", "value": {"page": contact.id, "title": "联系我们"}},
                        ],
                    },
                },
            ],
        },
    )


class Migration(migrations.Migration):
    dependencies = [
        ("home", "0002_create_homepage"),
        ("navigation", "0001_initial"),
        ("news", "0001_initial"),
        ("standardpages", "0002_achievementindexpage_contactpage_facultyindexpage_and_more"),
        ("utils", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(bootstrap_lab_site, migrations.RunPython.noop),
    ]
