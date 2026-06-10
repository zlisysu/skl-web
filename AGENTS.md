# AGENTS.md

本文件面向后续接手这个项目的人或 AI agent，说明 `lab-web` 当前是什么、怎么跑、主要代码在哪、改动时要注意什么。

## 1. 项目定位

这是一个基于 Django + Wagtail 的实验室网站项目，当前站点结构已经按以下栏目初始化：

- 首页
- 实验室概况
- 党建工作
- 师资力量
- 新闻
- 学术科研
- 技术转化
- 联系我们

目前这个项目已经不是原始的 Wagtail starter，而是在 starter 基础上做了实验室站点定制。

## 2. 技术栈

- Python / Django 6.0
- Wagtail 7.3.1
- SQLite（当前开发环境用 `db.sqlite3`）
- Tailwind CSS + Sass + Webpack

关键依赖见：

- `requirements.txt`
- `package.json`

## 3. 如何启动

### Python 环境

项目已经有虚拟环境：

- `.venv/`

常用命令：

```bash
cd lab-web
.venv/bin/python manage.py runserver
```

数据库迁移：

```bash
cd lab-web
.venv/bin/python manage.py migrate
```

### 前端编译

这个项目不是“改了 class 就一定立刻生效”。

前端源码在：

- `static_src/`

实际被 Django 提供的编译产物在：

- `static_compiled/`

开发时常用：

```bash
cd lab-web
npm run build
```

持续监听：

```bash
cd lab-web
npm run start
```

## 4. 目录结构

### 站点主代码

- `labsite/home/`
  - 首页模型
- `labsite/standardpages/`
  - 普通栏目页、师资、科研成果、联系页
- `labsite/news/`
  - 新闻列表页、新闻详情页
- `labsite/navigation/`
  - 导航相关
- `labsite/utils/`
  - 基础页面模型、公共 block、通用逻辑
- `labsite/settings/`
  - Django settings

### 模板

- `templates/base.html`
  - 全站 HTML 基础模板
- `templates/base_page.html`
  - 页面级基础模板，负责 header / footer
- `templates/pages/`
  - 各类页面模板
- `templates/components/`
  - 可复用组件

### 前端资源

- `static_src/sass/main.scss`
  - 主样式源码
- `static_src/javascript/main.js`
  - 前端入口
- `static_compiled/css/main.css`
  - 编译后的 CSS
- `static_compiled/js/main.js`
  - 编译后的 JS

### 数据与资源

- `db.sqlite3`
  - 当前开发数据库
- `media/`
  - Wagtail 上传的图片等媒体文件
- `docs/`
  - 本项目说明文档

## 5. 页面模型与模板对应关系

### 首页

- 模型：`labsite/home/models.py` 中的 `HomePage`
- 模板：`templates/pages/home_page.html`

### 实验室概况 / 党建工作 / 学术科研 下的大部分普通栏目

- 模型：`labsite/standardpages/models.py` 中的 `StandardPage`
- 模板：`templates/pages/standard_page.html`

注意：

- `StandardPage` 既承担“栏目页”
- 也承担“普通详情页”
- 是否按列表页或详情页显示，由 `get_context()` 中的逻辑决定

### 师资力量

- 列表模型：`labsite/standardpages/models.py` 中的 `FacultyIndexPage`
- 列表模板：`templates/pages/faculty_index_page.html`
- 详情模型：`labsite/standardpages/models.py` 中的 `FacultyPage`
- 详情模板：`templates/pages/faculty_page.html`

### 新闻

- 列表模型：`labsite/news/models.py` 中的 `NewsListingPage`
- 列表模板：`templates/pages/news_listing_page.html`
- 详情模型：`labsite/news/models.py` 中的 `ArticlePage`
- 详情模板：`templates/pages/article_page.html`

### 科研成果

- 列表模型：`labsite/standardpages/models.py` 中的 `AchievementIndexPage`
- 列表模板：`templates/pages/achievement_index_page.html`
- 详情模型：`labsite/standardpages/models.py` 中的 `AchievementPage`
- 详情模板：`templates/pages/achievement_page.html`

### 联系我们

- 模型：`labsite/standardpages/models.py` 中的 `ContactPage`
- 模板：`templates/pages/contact_page.html`

## 6. 当前首页是怎么组成的

首页现在主要由：

- `HomePage` 自身字段
  - `introduction`
  - `hero_image`
  - `background_image`
  - `hero_cta`
  - `hero_quick_links`
  - `body`（现在已改成可选）
- `HomePage.get_context()`
  - 自动取最新新闻
  - 自动取推荐师资
  - 自动取推荐科研成果
- `templates/pages/home_page.html`
  - 负责首页结构拼装

也就是说：

- 首页很多内容不是后台一个字段直接对应一整块
- 而是模板 + `get_context()` 自动拼出来的

## 7. 当前数据保存在哪里

开发环境当前数据主要在：

- `lab-web/db.sqlite3`

媒体文件在：

- `lab-web/media/`

所以如果要迁移到别的服务器，最少要带走：

- 代码
- `db.sqlite3` 或导出的正式数据库
- `media/`
- 必要的环境变量 / settings 配置

## 8. 当前站点初始化逻辑

站点初始栏目不是手工一点点建的，而是通过 migration 初始化的：

- `labsite/standardpages/migrations/0003_bootstrap_lab_site.py`

这个 migration 主要做了：

- 创建首页
- 创建顶层栏目
- 创建实验室概况/党建工作/学术科研下的子栏目
- 初始化导航

后续又通过独立 migration 增补过部分栏目，例如：

- `labsite/standardpages/migrations/0010_add_academic_lectures_page_remove_platform.py`
- `labsite/standardpages/migrations/0012_add_technology_transfer_section.py`

注意：

- 这类 migration 是“一次性初始化脚本”
- 后续日常开发通常不需要再改它
- 如果只是改页面效果、模型、模板、后台字段，一般不碰这个文件

## 9. 开发规则

### 改模板和改模型是两回事

- 改 `models.py`
  - 影响后台字段、页面类型、页面上下文逻辑
- 改 `templates/*.html`
  - 影响页面最终显示结构
- 改 `main.scss`
  - 影响样式

### 改了 Sass / Tailwind 后要重新编译

如果改了这些文件：

- `static_src/sass/main.scss`
- `static_src/javascript/*`
- 模板里新增大量 Tailwind class

通常要重新执行：

```bash
cd lab-web
npm run build
```

否则浏览器看到的还是旧的 `static_compiled/css/main.css`。

### 改了 Django 模型后要迁移

如果改了字段定义，例如：

- `blank=True`
- 新增字段
- 删除字段
- StreamField block 结构变化

就需要：

```bash
cd lab-web
.venv/bin/python manage.py makemigrations
.venv/bin/python manage.py migrate
```

提交前建议额外跑：

```bash
cd lab-web
.venv/bin/python manage.py makemigrations --check --dry-run
```

如果这个命令提示还有待生成迁移，说明当前模型和迁移文件不同步。

### 优先保持当前站点结构一致

当前项目已经形成了这几个事实：

- 首页是拼装式首页，不是纯后台自由搭积木
- 普通栏目大量复用 `StandardPage`
- 新闻页的视觉样式是多个列表页的参考基准

因此后续开发时，优先：

- 复用已有页面模型
- 复用已有卡片样式
- 少造新的页面类型

## 10. 哪些内容适合在后台改，哪些适合改代码

### 适合后台改

- 新闻内容
- 师资详情
- 科研成果详情
- 联系方式
- 首页 `introduction`
- 首页 `hero_image`
- 首页 `background_image`
- 首页 `hero_cta`
- 首页 `hero_quick_links`

### 适合改代码

- 页面整体布局
- 卡片结构
- 列表筛选逻辑
- 模板之间的统一样式
- 新增后台字段
- 页面模型关系

## 11. 目前已经踩过的坑

### 1. `lab-overrides.css` 不是正式编译产物

之前存在过一个额外覆盖文件引用问题，后来已经清掉。

当前应以：

- `static_src/sass/main.scss`
- `static_compiled/css/main.css`

作为正式样式链路。

### 2. 有些 Tailwind class 不能直接在 `@apply` 中使用

例如不存在于主题配置里的颜色类，写到 `@apply` 会导致编译失败。

如果出现这类错误，应：

- 改成合法的 Tailwind 类
- 或直接写普通 CSS

### 3. 首页 `body` 原本是必填

现在已经改成可选：

- `labsite/home/models.py`
- `labsite/home/migrations/0004_alter_homepage_body.py`

## 12. 后续建议

如果继续做这个站，建议优先做这些事：

1. 明确“国重版本”的正式首页文案，不要混用院级材料。
2. 统一首页、栏目页、详情页的视觉语言。
3. 清理首页后台里不再使用的字段或面板，减少误导。
4. 把真正要长期维护的首页内容，改成后台可配置，而不是硬编码在模板里。

## 13. 当前内容块补充说明

`StoryBlock` 现在包含受信任 HTML 内容块，主要用于导入历史内容或嵌入已确认来源的 HTML。普通正文仍建议优先使用章节和段落块，避免在后台长期维护大段 HTML。
