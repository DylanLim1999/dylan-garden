# Dylan的博客 使用手册

这是一个基于 [Quartz 4](https://quartz.jzhao.xyz/) 搭建的个人博客 / 数字花园项目。内容使用 Markdown 编写，适合直接用 Obsidian 或 VS Code 编辑，再通过 GitHub 和 Cloudflare Pages 发布成网站。

当前站点名称：`Dylan的博客`

当前线上地址：`https://piio.me`

当前仓库：`https://github.com/DylanLim1999/dylan-garden.git`

## 1. 项目现在是什么状态

这个项目已经完成了第一版基础搭建：

- 使用 Quartz 4 作为网站生成工具。
- 站点语言设为中文。
- 内容放在 `content/` 目录。
- 首页、写作、笔记、关于本站四个基础页面已经建好。
- 侧边栏已保留搜索、暗色模式、阅读模式和可展开目录。
- 顶部面包屑已移除。
- Graph View 暂时关闭。
- 背景光影和白天 / 黑夜切换效果参考 `jzhao.xyz`。
- 中文阅读排版已调整为更适合中文长文的字号和行距。
- `node_modules/`、`public/`、截图、缓存等生成文件不会提交到 GitHub。

## 2. 常用命令

第一次拿到项目后，先安装依赖：

```bash
npm ci
```

本地预览网站：

```bash
npm run serve
```

如果上面命令启动成功，终端会显示本地地址，一般是：

```text
http://localhost:8080
```

只生成静态网站，不启动预览：

```bash
npx quartz build
```

检查项目有没有语法和格式问题：

```bash
npm run check
```

自动格式化代码和配置文件：

```bash
npm run format
```

## 3. 重要目录说明

```text
content/                 写文章和页面的地方
quartz.config.ts          站点名称、语言、主题颜色、插件配置
quartz.layout.ts          页面布局、侧边栏、右侧目录、页面组件
quartz/styles/custom.scss 自定义字体、字号、光影背景、细节样式
quartz/static/            静态资源，例如图标、背景叶影图片
public/                  构建生成的网站文件，不需要提交
node_modules/             npm 安装出来的依赖，不需要提交
```

日常写作时，大多数时间只需要动 `content/`。

只有要改网站外观、侧边栏、主题色、部署信息时，才需要动 `quartz.config.ts`、`quartz.layout.ts` 或 `quartz/styles/custom.scss`。

## 4. 内容怎么写

所有公开内容都放在 `content/` 目录。

现在已有这些文件：

```text
content/index.md            首页
content/writing.md          写作栏目首页
content/notes.md            笔记栏目首页
content/about-this-site.md  关于本站
```

每篇 Markdown 文件开头建议写一段 frontmatter。frontmatter 就是文件最开头两条 `---` 中间的资料区，用来告诉网站这篇文章的标题、日期、标签、是否公开等信息。

日常写文章时，推荐先用这个模板：

```markdown
---
title: 文章标题
date: 2026-05-09
tags:
  - 示例标签
description: 一句话说明这篇文章
---

# 文章标题

正文内容写在这里。
```

这个项目不强制每个字段都写，但建议把下面几项当作日常标准：

| 字段          | 是否建议写 | 原因                                       |
| ------------- | ---------- | ------------------------------------------ |
| `title`       | 推荐必写   | 控制页面标题、侧边栏名称、搜索结果名称     |
| `date`        | 推荐必写   | 控制文章日期，也会影响当前侧边栏排序       |
| `tags`        | 常用可选   | 用来分类和建立标签页                       |
| `description` | 常用可选   | 用来生成页面简介、搜索摘要和社交分享说明   |
| `draft`       | 常用可选   | 文章暂时不公开时写 `draft: true`           |
| `aliases`     | 常用可选   | 给旧链接或别名做跳转，改标题时很有用       |
| `enableToc`   | 常用可选   | 单独控制某篇文章右侧目录是否显示           |
| `socialImage` | 常用可选   | 单独设置某篇文章分享到社交平台时显示的图片 |

当前项目可识别的完整 frontmatter 字段如下：

| 字段                | 推荐程度 | 写法示例                          | 作用                                                                          |
| ------------------- | -------- | --------------------------------- | ----------------------------------------------------------------------------- |
| `title`             | 推荐必写 | `title: 我的文章`                 | 页面标题。没有写时会用文件名代替，但不建议依赖文件名                          |
| `date`              | 推荐必写 | `date: 2026-05-09`                | 日期简写。Quartz 会把它当作创建日期和发布日期使用；当前侧边栏也用它做新旧排序 |
| `created`           | 少用     | `created: 2026-05-09`             | 创建日期。只有当你想把创建日期和发布日期分开时才需要写                        |
| `published`         | 少用     | `published: 2026-05-10`           | 发布日期。用于更精细地区分“写作时间”和“发布时间”                              |
| `publishDate`       | 少用     | `publishDate: 2026-05-10`         | `published` 的别名                                                            |
| `modified`          | 少用     | `modified: 2026-05-12`            | 修改日期。通常可以不写，Quartz 会从 Git 或文件系统读取                        |
| `lastmod`           | 少用     | `lastmod: 2026-05-12`             | `modified` 的别名                                                             |
| `updated`           | 少用     | `updated: 2026-05-12`             | `modified` 的别名                                                             |
| `last-modified`     | 少用     | `last-modified: 2026-05-12`       | `modified` 的别名                                                             |
| `tags`              | 常用可选 | `tags: [写作, Quartz]`            | 标签。会生成标签页，也会显示在文章页                                          |
| `tag`               | 少用     | `tag: 写作`                       | `tags` 的别名                                                                 |
| `aliases`           | 常用可选 | `aliases: [old-title]`            | 别名和旧地址。访问旧地址时会跳转到当前文章                                    |
| `alias`             | 少用     | `alias: old-title`                | `aliases` 的别名                                                              |
| `permalink`         | 谨慎使用 | `permalink: my-fixed-url`         | 固定网址。适合确定永久不改的页面；普通文章不建议经常用                        |
| `description`       | 常用可选 | `description: 一句话摘要`         | 页面简介。会用于搜索、页面摘要和分享说明                                      |
| `socialDescription` | 少用     | `socialDescription: 分享时的摘要` | 社交分享专用简介。没有写时会使用 `description`                                |
| `socialImage`       | 常用可选 | `socialImage: my-cover.png`       | 社交分享图片。图片一般放在 `quartz/static/` 里                                |
| `image`             | 少用     | `image: my-cover.png`             | `socialImage` 的别名                                                          |
| `cover`             | 少用     | `cover: my-cover.png`             | `socialImage` 的别名                                                          |
| `draft`             | 常用可选 | `draft: true`                     | 草稿。当前项目启用了草稿过滤，写 `draft: true` 后不会发布                     |
| `publish`           | 暂不使用 | `publish: true`                   | 只在启用“只发布明确标记文章”的过滤方式时使用；当前项目没有启用这套逻辑        |
| `lang`              | 少用     | `lang: zh`                        | 单页语言。中文文章一般不用写，项目默认已经是中文                              |
| `enableToc`         | 常用可选 | `enableToc: false`                | 是否显示右侧目录。长文通常保留，短页可以写 `false` 关闭                       |
| `cssclasses`        | 少用     | `cssclasses: [wide-page]`         | 给单篇文章加自定义样式类。只有需要单页特殊样式时才用                          |
| `cssclass`          | 少用     | `cssclass: wide-page`             | `cssclasses` 的别名                                                           |
| `comments`          | 暂不使用 | `comments: false`                 | 单页评论开关。当前项目还没有开启评论组件，所以暂时不会生效                    |
| 其他自定义字段      | 可写     | `status: evergreen`               | Quartz 会保留这些资料，但当前网站默认不会显示；适合以后自己扩展用             |

如果你想写得比较完整，可以这样写：

```markdown
---
title: 一篇完整示例文章
date: 2026-05-09
tags:
  - 写作
  - Quartz
description: 这是一篇用来示范 frontmatter 的文章。
aliases:
  - old-example-title
enableToc: true
draft: false
---
```

不建议每篇文章都把所有字段写满。日常写作优先保证 `title` 和 `date`，需要分类时加 `tags`，需要摘要时加 `description`。

如果一篇文章暂时不想公开，可以这样写：

```markdown
---
title: 暂时不公开的文章
draft: true
---
```

## 5. 写作、笔记、文件夹的规则

本项目采用类似 Jeff Tay 网站的内容组织逻辑：

| 结构                             | 点击后的效果                                      | 适合用途                     |
| -------------------------------- | ------------------------------------------------- | ---------------------------- |
| `notes.md`                       | 显示普通文章页                                    | 栏目介绍、长期维护的索引页   |
| `notes/xxx.md`                   | 作为 `notes` 下面的子页面                         | 具体笔记                     |
| 只有 `movies/`，没有 `movies.md` | 显示文件夹列表页                                  | 自动列出这个文件夹下所有页面 |
| 同时有 `music.md` 和 `music/`    | 点击 `music` 显示普通文章页，侧边栏仍可展开子页面 | 栏目首页 + 子页面            |

当前 `写作` 和 `笔记` 都是普通文章页：

```text
content/writing.md
content/notes.md
```

以后如果要给 `写作` 加子页面，就在下面新建文件：

```text
content/writing/第一篇文章.md
content/writing/第二篇文章.md
```

这样侧边栏会显示可展开的 `写作`，但点击 `写作` 本身仍然进入 `writing.md` 这篇普通页面。

如果你想做一个只负责自动列出子页面的栏目，就只建资料夹，不建同名 `.md` 文件。

## 6. 链接怎么写

推荐使用 Obsidian 风格链接：

```markdown
[[notes|笔记]]
[[writing/第一篇文章|第一篇文章]]
```

也可以使用普通 Markdown 链接：

```markdown
[Quartz 官方文档](https://quartz.jzhao.xyz/)
```

链接到站内页面时，优先使用 `[[...]]`，以后改文件名时比较好维护。

## 7. 图片和附件怎么放

简单做法：把图片放在文章同一个文件夹里，然后用 Markdown 引用。

例如：

```text
content/writing/my-post.md
content/writing/my-image.png
```

文章中写：

```markdown
![图片说明](my-image.png)
```

也可以使用 Obsidian 的图片引用：

```markdown
![[my-image.png]]
```

如果是全站通用资源，例如图标、背景图，可以放在：

```text
quartz/static/
```

当前 `quartz/static/leaves.png` 是背景光影效果用到的叶影图片，不建议删除。

## 8. 侧边栏排序规则

当前侧边栏排序规则：

1. 有子页面的资料夹排在普通页面前面。
2. 同一类型下，按 `date` 新到旧排序。
3. 日期相同，再按中文名称排序。

也就是说，新建内容时，如果希望它排在更上面，给它写较新的 `date`。

示例：

```markdown
---
title: 新文章
date: 2026-05-10
---
```

侧边栏相关设置在：

```text
quartz.layout.ts
```

## 9. 当前外观设置

当前主题方向：

- 白天背景偏暖白。
- 夜晚背景偏深蓝黑。
- 背景光影和明暗切换参考 `jzhao.xyz`。
- 中文正文使用较舒展的行距。
- 标题使用中文衬线字体。
- Graph View 暂时关闭。
- 右侧保留页面目录和反向链接。

外观主要改这几个文件：

```text
quartz.config.ts
quartz.layout.ts
quartz/styles/custom.scss
quartz/components/renderPage.tsx
quartz/components/scripts/darkmode.inline.ts
```

一般只改 `quartz.config.ts` 和 `quartz/styles/custom.scss` 就够了。

## 10. 修改站点名称

站点名称在：

```text
quartz.config.ts
```

找到：

```ts
pageTitle: "Dylan的博客"
```

改成想要的名称即可。

如果首页大标题也要同步改，修改：

```text
content/index.md
```

里面的：

```markdown
# Dylan的博客
```

## 11. 修改域名和部署地址

站点正式部署前，需要修改：

```text
quartz.config.ts
```

找到：

```ts
baseUrl: "example.com"
```

如果最终域名是：

```text
blog.example.com
```

就改成：

```ts
baseUrl: "blog.example.com"
```

不要写 `https://`，只写域名。

## 12. GitHub 日常保存流程

查看当前改了什么：

```bash
git status
```

查看具体差异：

```bash
git diff
```

保存所有改动：

```bash
git add .
git commit -m "你的提交说明"
git push
```

常见提交说明例子：

```bash
git commit -m "add first notes"
git commit -m "update homepage"
git commit -m "adjust theme styles"
```

## 13. 不要提交哪些东西

这些文件或目录是生成物、缓存或私人内容，不应该提交：

```text
node_modules/
public/
screenshots/
.quartz-cache/
.obsidian/
private/
quartz-serve*.log
.chrome-headless-profile/
```

它们已经写进 `.gitignore`。

如果想确认有没有误提交，可以运行：

```bash
git status --ignored
```

## 14. Cloudflare Pages 部署设置

以后要部署到 Cloudflare Pages，可以这样设置：

| 项目                   | 填写               |
| ---------------------- | ------------------ |
| Framework preset       | `None` 或不选      |
| Build command          | `npx quartz build` |
| Build output directory | `public`           |
| Node version           | `22`               |

如果 Cloudflare 需要环境变量，可以加：

```text
NODE_VERSION=22
```

部署前记得先把 `quartz.config.ts` 里的 `baseUrl` 改成正式域名。

## 15. 本地预览常见问题

### 页面没有变化

先强制刷新浏览器：

```text
Ctrl + F5
```

如果还是旧页面，停止本地服务后重新运行：

```bash
npm run serve
```

### 依赖报错

重新安装：

```bash
npm ci
```

### 构建失败

先跑检查：

```bash
npm run check
```

如果只是格式问题，运行：

```bash
npm run format
```

再重新构建：

```bash
npx quartz build
```

### 新文章没有出现在侧边栏

检查三件事：

- 文件是否放在 `content/` 里面。
- 文件名是否是 `.md`。
- frontmatter 里是否写了 `draft: true`。

如果写了 `draft: true`，它不会发布。

## 16. 后续可以做什么

建议下一步按这个顺序来：

1. 确定正式域名。
2. 修改 `baseUrl`。
3. 整理第一批真正要公开的内容。
4. 决定是否使用 Cloudflare Pages 自动部署。
5. 内容多起来以后，再决定要不要打开 Graph View。

## 17. 官方文档

Quartz 官方文档：

```text
https://quartz.jzhao.xyz/
```

常查页面：

- Configuration
- Layout
- Components
- Hosting
- Obsidian compatibility

这个项目已经做过一层个人化配置。以后查官方文档时，可以把它当作参考，不需要完全照搬官方默认设置。
