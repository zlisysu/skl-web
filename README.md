# lab-web

这是一个基于 Django + Wagtail 的实验室网站项目。项目最初来自 Wagtail starter，但当前已经按实验室网站做了定制，不再是通用模板仓库。

当前主要栏目包括：

- 首页
- 实验室概况
- 党建工作
- 师资力量
- 新闻
- 学术科研
- 技术转化
- 联系我们

## 技术栈

- Python / Django 6.0
- Wagtail 7.3.1
- SQLite（开发环境默认使用 `db.sqlite3`）
- Tailwind CSS + Sass + Webpack

后端依赖见 `requirements.txt`，前端依赖见 `package.json`。

## 本地启动

项目根目录下已有虚拟环境 `.venv/`。常用命令：

```bash
.venv/bin/python manage.py migrate
.venv/bin/python manage.py runserver
```

前端源码在 `static_src/`，Django 实际加载的编译产物在 `static_compiled/`。修改 Sass、JavaScript 或模板中新增大量 Tailwind class 后，需要重新构建：

```bash
npm run build
```

持续监听：

```bash
npm run start
```

## 验证命令

提交前建议至少运行：

```bash
.venv/bin/python manage.py check
.venv/bin/python manage.py makemigrations --check --dry-run
.venv/bin/python manage.py test
npm run build
```

如果 `makemigrations --check --dry-run` 提示有待生成迁移，先运行：

```bash
.venv/bin/python manage.py makemigrations
```

再检查生成的迁移内容并运行验证。

## 主要目录

- `labsite/home/`：首页模型与上下文逻辑
- `labsite/standardpages/`：普通栏目页、师资、科研成果、技术转化、联系页等
- `labsite/news/`：新闻列表页和新闻详情页
- `labsite/navigation/`：导航配置
- `labsite/utils/`：基础页面模型、公共 block、导入脚本和通用逻辑
- `labsite/settings/`：Django settings
- `templates/pages/`：页面模板
- `templates/components/`：复用组件
- `static_src/`：前端源码
- `static_compiled/`：编译后的前端产物
- `docs/`：部署、内容维护和历史开发说明

## 页面模型与模板

- 首页：`labsite/home/models.py::HomePage`，模板 `templates/pages/home_page.html`
- 普通栏目：`labsite/standardpages/models.py::StandardPage`，模板 `templates/pages/standard_page.html`
- 师资列表：`FacultyIndexPage`，模板 `templates/pages/faculty_index_page.html`
- 师资详情：`FacultyPage`，模板 `templates/pages/faculty_page.html`
- 新闻列表：`labsite/news/models.py::NewsListingPage`，模板 `templates/pages/news_listing_page.html`
- 新闻详情：`ArticlePage`，模板 `templates/pages/article_page.html`
- 科研成果列表：`AchievementIndexPage`，模板 `templates/pages/achievement_index_page.html`
- 科研成果详情：`AchievementPage`，模板 `templates/pages/achievement_page.html`
- 联系我们：`ContactPage`，模板 `templates/pages/contact_page.html`

## 开发注意事项

- 改 `models.py` 后要检查并提交迁移。
- 改 `static_src/sass/main.scss` 或前端入口后要运行 `npm run build`，并提交 `static_compiled/` 中对应产物。
- 首页是模板和 `HomePage.get_context()` 拼装出来的，不是完全由后台字段自由搭建。
- 普通栏目大量复用 `StandardPage`，新增栏目时优先复用现有页面类型。
- `labsite/standardpages/migrations/0003_bootstrap_lab_site.py` 是早期站点初始化迁移，日常开发通常不要再改它。
- 开发数据库是 `db.sqlite3`，上传文件在 `media/`；迁移到服务器时需要同时处理数据库、媒体文件和环境变量。

更详细的交接说明见 `AGENTS.md`。
