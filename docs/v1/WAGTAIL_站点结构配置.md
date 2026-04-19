# 全国重点实验室网站配置方案

## 1. 适用范围

本配置面向实验室官网建设，默认用于 `Wagtail` 项目初始化与内容建模。目标是先支撑以下一级栏目：

- 首页
- 实验室概况
- 党建工作
- 师资力量
- 新闻
- 学术科研
- 联系我们

本文件可作为后续页面模型、导航配置、后台录入规范和模板开发的基础说明。

## 2. 顶部导航配置

建议一级导航按以下顺序配置：

| 排序 | 导航名称 | URL Slug | 页面类型 | 是否显示在主导航 |
| --- | --- | --- | --- | --- |
| 1 | 首页 | `/` | `HomePage` | 是 |
| 2 | 实验室概况 | `/about/` | `SectionPage` | 是 |
| 3 | 党建工作 | `/party-building/` | `SectionPage` | 是 |
| 4 | 师资力量 | `/faculty/` | `FacultyIndexPage` | 是 |
| 5 | 新闻 | `/news/` | `NewsIndexPage` | 是 |
| 6 | 学术科研 | `/research/` | `SectionPage` | 是 |
| 7 | 联系我们 | `/contact/` | `ContactPage` | 是 |

## 3. 站点栏目树

建议 Wagtail 页面树如下：

```text
HomePage (/)
├── 实验室概况 SectionPage (/about/)
│   ├── 实验室简介 BasicPage (/about/intro/)
│   ├── 建设目标 BasicPage (/about/mission/)
│   ├── 发展历程 BasicPage (/about/history/)
│   ├── 组织架构 BasicPage (/about/organization/)
│   └── 管理制度 BasicPage (/about/policy/)
├── 党建工作 SectionPage (/party-building/)
│   ├── 工作动态 ArticlePage (/party-building/updates/)
│   ├── 理论学习 ArticlePage (/party-building/study/)
│   ├── 组织生活 ArticlePage (/party-building/life/)
│   └── 规章制度 BasicPage (/party-building/rules/)
├── 师资力量 FacultyIndexPage (/faculty/)
│   ├── 杰出人才 FacultyPage
│   ├── 骨干教师 FacultyPage
│   ├── 青年教师 FacultyPage
│   └── 博后/研究人员 FacultyPage
├── 新闻 NewsIndexPage (/news/)
│   ├── 实验室新闻 NewsPage
│   ├── 通知公告 NewsPage
│   ├── 学术报告 NewsPage
│   └── 媒体报道 NewsPage
├── 学术科研 SectionPage (/research/)
│   ├── 研究方向 BasicPage (/research/directions/)
│   ├── 科研成果 AchievementIndexPage (/research/achievements/)
│   ├── 代表论文 AchievementPage
│   ├── 科研项目 AchievementPage
│   ├── 奖励荣誉 AchievementPage
│   └── 平台建设 BasicPage (/research/platform/)
└── 联系我们 ContactPage (/contact/)
```

## 4. 页面类型配置

建议最少定义以下页面模型：

### 4.1 HomePage

用于首页。

建议字段：

- `hero_title`：首页主标题
- `hero_subtitle`：首页副标题
- `hero_image`：首页主视觉
- `quick_links`：快捷入口
- `homepage_body`：模块化内容区，建议使用 `StreamField`
- `featured_news_count`：首页新闻显示条数
- `featured_faculty_count`：首页师资显示条数
- `featured_achievements_count`：首页成果显示条数

### 4.2 SectionPage

用于一级栏目承载页，如“实验室概况”“党建工作”“学术科研”。

建议字段：

- `summary`：栏目简介
- `banner_image`：栏目横幅
- `body`：正文
- `sidebar_nav_title`：侧边导航标题
- `show_children_in_sidebar`：是否显示子页面目录

### 4.3 BasicPage

用于静态内容页，如“实验室简介”“组织架构”“管理制度”“研究方向”等。

建议字段：

- `summary`
- `body`
- `attachments`

### 4.4 FacultyIndexPage

用于“师资力量”列表页。

建议字段：

- `intro_text`
- `filter_enabled`
- `show_groups`

### 4.5 FacultyPage

用于教师详情页。

建议字段：

- `name_cn`：中文姓名
- `name_en`：英文姓名
- `title`：职称
- `position`：职务
- `photo`
- `research_areas`
- `email`
- `phone`
- `office`
- `education`
- `biography`
- `representative_works`
- `awards`
- `sort_order`
- `is_featured`

### 4.6 NewsIndexPage

用于新闻栏目页。

建议字段：

- `intro_text`
- `news_categories`
- `page_size`

### 4.7 NewsPage

用于新闻详情页，也可承载通知公告、学术报告、媒体报道。

建议字段：

- `news_type`：新闻类型
- `publish_date`
- `source`
- `author`
- `cover_image`
- `summary`
- `body`
- `attachments`
- `is_top`
- `is_featured`

建议 `news_type` 枚举值：

- `lab_news`：实验室新闻
- `notice`：通知公告
- `seminar`：学术报告
- `media`：媒体报道

### 4.8 AchievementIndexPage

用于成果列表页。

建议字段：

- `intro_text`
- `achievement_categories`
- `page_size`

### 4.9 AchievementPage

用于成果详情页。

建议字段：

- `achievement_type`
- `publish_date`
- `responsible_team`
- `cover_image`
- `summary`
- `body`
- `attachments`
- `related_faculty`
- `is_featured`

建议 `achievement_type` 枚举值：

- `paper`：论文
- `project`：项目
- `award`：奖励
- `patent`：专利
- `platform`：平台建设

### 4.10 ContactPage

用于联系我们页面。

建议字段：

- `lab_name`
- `address`
- `postcode`
- `phone`
- `email`
- `website`
- `contact_person`
- `map_embed_code`
- `traffic_info`

## 5. 首页模块建议

首页建议使用 `StreamField`，模块按以下优先级配置：

1. 顶部主视觉
2. 实验室简介
3. 新闻动态
4. 通知公告
5. 师资力量精选
6. 学术科研成果
7. 党建工作速览
8. 联系方式与地图

建议定义以下区块类型：

- `HeroBlock`
- `RichTextBlock`
- `ImageTextBlock`
- `NewsListBlock`
- `FacultyListBlock`
- `AchievementListBlock`
- `NoticeListBlock`
- `StatsBlock`
- `ContactBlock`
- `ButtonGroupBlock`

## 6. 后台内容管理建议

建议后台菜单按照以下逻辑组织：

- 页面管理：所有页面树统一管理
- 新闻管理：集中录入 `NewsPage`
- 师资管理：集中录入 `FacultyPage`
- 成果管理：集中录入 `AchievementPage`
- 媒体资源：统一上传图片和附件
- 站点设置：页脚、导航、SEO、联系方式

建议角色最少分两类：

- `Admin`：拥有全部配置、发布、结构调整权限
- `Editor`：可录入和编辑新闻、师资、成果，但不能改站点结构和系统设置

## 7. Snippet 配置建议

建议配置以下全局复用内容：

- `SiteNavigationSnippet`：主导航和底部导航
- `SiteFooterSnippet`：页脚版权、备案、友情链接
- `ContactInfoSnippet`：实验室基础联系信息
- `HomepageSettingsSnippet`：首页固定展示项

## 8. URL 规范

建议统一使用英文 slug，便于部署和维护：

| 中文栏目 | URL |
| --- | --- |
| 首页 | `/` |
| 实验室概况 | `/about/` |
| 党建工作 | `/party-building/` |
| 师资力量 | `/faculty/` |
| 新闻 | `/news/` |
| 学术科研 | `/research/` |
| 联系我们 | `/contact/` |

详情页建议使用自动 slug：

- 新闻详情：`/news/<slug>/`
- 教师详情：`/faculty/<slug>/`
- 成果详情：`/research/achievements/<slug>/`

## 9. SEO 与展示规则

建议所有页面统一配置以下字段：

- `seo_title`
- `search_description`
- `og_image`

建议列表页支持以下规则：

- 新闻按发布时间倒序
- 置顶新闻优先显示
- 师资按 `sort_order` 排序
- 成果支持分类筛选

## 10. 第一阶段开发范围

建议第一阶段只做以下内容，确保尽快上线：

- 一级导航全部可访问
- 首页展示实验室简介、新闻、通知、师资、成果摘要
- 新闻列表与详情
- 师资列表与详情
- 学术科研栏目页与成果列表
- 联系我们页面

可延期到第二阶段的功能：

- 全站搜索
- 多语言
- 投稿表单
- 下载中心
- 用户细粒度权限
- 复杂专题页模板

## 11. 建议文件命名与模板映射

建议页面模型与模板命名如下：

| 页面模型 | 模板文件 |
| --- | --- |
| `HomePage` | `templates/home_page.html` |
| `SectionPage` | `templates/section_page.html` |
| `BasicPage` | `templates/basic_page.html` |
| `FacultyIndexPage` | `templates/faculty_index_page.html` |
| `FacultyPage` | `templates/faculty_page.html` |
| `NewsIndexPage` | `templates/news_index_page.html` |
| `NewsPage` | `templates/news_page.html` |
| `AchievementIndexPage` | `templates/achievement_index_page.html` |
| `AchievementPage` | `templates/achievement_page.html` |
| `ContactPage` | `templates/contact_page.html` |

## 12. 实施结论

本方案适合先搭建一个结构清晰、后台可维护的实验室官网。后续若正式采用 `Wagtail`，可以直接按本文件拆分模型、模板与后台录入流程，优先完成首页、新闻、师资、科研成果四个核心模块。
