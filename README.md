# 个人网站

按 `PRD.md` / `DESIGN.md` 初始化的个人技术网站：首页自我介绍 + 最近文章、博客列表与文章详情、关于页邮箱一键复制。内容全部集中在 `src/content/` 里，改数据不用碰组件。

技术栈：React 19 + TypeScript + Ant Design 6 + Webpack 5 + react-router 8 + zustand 5。

## 快速开始

```bash
npm install
npm run dev        # http://localhost:3000
```

## 你要填的内容（只改这几个文件）

| 想改什么 | 改哪里 |
| --- | --- |
| 名字、头衔、自我介绍、头像、邮箱、城市、关注方向、社交链接 | `src/content/profile.ts` |
| 初始文章（标题、摘要、正文、标签、日期） | `src/content/posts.ts` |
| 站点常量：主色、首页最近文章条数、标签颜色、导航项、localStorage key | `src/constants/site.ts` |
| 颜色、间距、圆角、正文字号等设计 token | 主色改 `src/constants/site.ts` 的 `BRAND_COLOR`；Markdown 正文版式在 `src/styles/global.css` |
| 页面标题、站点描述 | `public/index.html` |
| 头像图片文件 | 放到 `public/` 下，然后在 profile.ts 里写 `avatar: '/avatar.jpg'` |

**文章怎么加**：两种方式，随便挑。

1. 页面上写：博客页右上角「写文章」→ 填标题 / 摘要 / 标签 / 正文 → 发布。想先存着就把「存为草稿」打开，草稿只在打开「显示草稿」时才出现。
2. 文件里写：往 `src/content/posts.ts` 的 `seedPosts` 数组里加一条。

> 页面上写的文章存在浏览器 localStorage（key：`self-web:posts`）。也就是说：**它只对你这个浏览器可见，换台电脑/清缓存就没了**，也不会进入 `npm run build` 的产物。
> 想让文章对所有访客可见、并且进版本库，就把它写进 `src/content/posts.ts`。想清空本地数据重来：DevTools → Application → Local Storage 删掉 `self-web:posts`。

正文用 Markdown，支持：`##` `###` 标题、`**加粗**`、`*斜体*`、`` `行内代码` ``、`[链接](url)`、`-` / `1.` 列表、`>` 引用、``` 代码块、`---` 分隔线。
（自己实现的一个小渲染器 `src/utils/markdown.ts`，不引第三方依赖；正文里的 HTML 会被转义，链接只放行 http/https/相对路径。）

## 命令

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 开发服务器，端口 3000，带 HMR；深链刷新会回落到 index.html |
| `npm run build` | 生产构建，输出到 `dist/` |
| `npm run typecheck` | TypeScript 类型检查（构建只转译，类型检查靠这条） |
| `npm test` | Node 原生 test runner，跑 `src/**/*.test.ts`（Markdown 渲染、日期工具、文章 store） |
| `npm run smoke` | 冒烟测试：webpack 打包整个应用后在 jsdom 里挂载，检查三个页面能渲染、写文章/复制邮箱/主题切换不报错 |

## 目录结构

```
src
├── components      复用组件：NavBar、PageShell、PostCard、TagList、Markdown、BlogEditor
├── constants       站点常量（颜色表、路由、导航项、storage key）
├── content         你要填的内容：profile.ts / posts.ts
├── hooks           useTheme（主题写进 body[data-theme]）、useScrollToTop
├── pages
│   ├── home        首页：自我介绍 + 最近 5 篇文章
│   ├── blog        index 按路由分发，PostList 列表 / PostDetail 详情
│   ├── about       关于页：邮箱一键复制
│   └── not-found   404
├── store           zustand：postStore（文章，持久化）、uiStore（主题）
├── styles          global.css（只有 Markdown 正文版式，颜色走 antd CSS 变量）
├── types           共用类型
├── utils           format（日期/阅读时长/摘要）、clipboard（复制）、markdown（渲染）
├── App.tsx         路由 + antd 主题（浅色/深色）
└── index.tsx       入口
```

## 实现要点

- **设计语言**：界面就是 antd 本身的样子——按钮、卡片、头像、标签、弹窗、下拉都不覆盖 antd 的配色和阴影，只保留图标本身带颜色；文章 item 是 `Card variant="outlined"`（带边框）。换主色只改 `src/constants/site.ts` 的 `BRAND_COLOR`，ConfigProvider 会推出整套主题色。
- **唯一需要自己写样式的地方**是 Markdown 正文（不在 antd 组件体系里），见 `src/styles/global.css` 的 `.markdown-body`，其中颜色引用 antd 暴露的 CSS 变量（`--ant-color-*`），所以深色模式和换主色都不用改它。
- **代码分割**：每个页面一个 `import()`，首次访问才下载对应 chunk；框架核心单独一个可长期缓存的 chunk，其余第三方按包拆（配置在 `webpack.config.js`，注释里写了为什么不能并成一个 vendors）。
- **状态管理**：组件内部状态用 `useState`，跨页面共享（文章、主题）用 zustand，见 `src/store/`。
- **主题**：导航栏右侧按钮切换浅色/深色，antd 走 `darkAlgorithm`，同时把主题写到 `body[data-theme]`。首次访问跟随系统 `prefers-color-scheme`，之后记住你的选择。
- **样式注入**：`global.css` 由 `style-loader` 注入；想改成独立 `.css` 文件 + link 预加载，引 `mini-css-extract-plugin` 加一条 rule 即可，业务代码不用动。
- **文章用 Markdown 而不是富文本**：渲染器在 `src/utils/markdown.ts`，行为有单测覆盖（转义、链接白名单、列表、引用、代码块）。

## 已知边界

- 没有后端：文章只存在浏览器本地，多设备不同步。
- 没有登录：任何人打开站点都能编辑/删除文章（这只是本地对自己生效）。要真正公开发布，需要接后端或改用静态生成的 Markdown 文件。
- 文章详情页的 Markdown 不支持表格、图片、嵌套列表；需要时引 `markdown-it` 替换 `renderMarkdown` 即可。
