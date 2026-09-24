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
| 颜色、间距、字号等设计 token | 主色在 `src/app/index.tsx` 的 ConfigProvider；公共尺寸在 `src/styles/tokens.scss`；颜色一律用 antd 的 CSS 变量 |
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
| `npm run smoke` | 冒烟测试：webpack 打包整个应用后在 jsdom 里挂载，检查三个页面能渲染、样式类名生效、写文章/复制邮箱/主题切换不报错 |
| `node scripts/verify-dist.mjs` | 用 `dist/` 的**生产产物**在 jsdom 里跑一遍（先 `npm run build`），确认生产构建下页面不白屏、类名没被优化掉 |

## 目录结构

一个组件/页面一个文件夹，组件文件叫 `index.tsx`，样式文件叫 `index.module.scss`，放在一起：

```
src
├── App.tsx         路由 + antd 主题（浅色/深色）
├── App.module.scss
├── index.tsx       入口：createRoot + BrowserRouter（只负责挂载）
├── components
│   ├── NavBar          index.tsx / index.module.scss
│   ├── PageShell       index.tsx / index.module.scss
│   ├── PostCard        index.tsx / index.module.scss
│   ├── TagList         index.tsx / index.module.scss
│   ├── Markdown        index.tsx / index.module.scss
│   └── BlogEditor      index.tsx / index.module.scss
├── constants       站点常量（标签颜色、路由、导航项、storage key）
├── content         你要填的内容：profile.ts / posts.ts
├── hooks           useTheme（主题写进 body[data-theme]）、useScrollToTop
├── pages
│   ├── Home            首页：自我介绍 + 最近 5 篇文章
│   ├── About           关于页：邮箱一键复制
│   ├── Blog            index.tsx 按路由分发
│   │   ├── PostList      列表（写文章 / 编辑 / 删除）
│   │   └── PostDetail    详情（Markdown 正文）
│   └── NotFound        404
├── store           zustand：postStore（文章，持久化）、uiStore（主题）
├── styles          global.scss（reset）、tokens.scss（SCSS 尺寸变量）
├── types           共用类型 + *.module.scss 的模块声明
└── utils           format（日期/阅读时长/摘要）、clipboard（复制）、markdown（渲染）
```

**入口必须有 `createRoot(...).render(...)`**：`src/index.tsx` 只做挂载，组件在 `src/App.tsx`。
如果入口只 `export` 组件而不调用 render，webpack 一样编译成功、浏览器控制台也不报错，
但 `#root` 永远是空的——页面全白。两件事分开写就是为了避免这种误改。

样式约定：**不要在组件里写 `style={{ ... }}`**，需要样式就在同目录的 `index.module.scss` 加类，然后 `styles['xxx']` 取用。
类名会被哈希，但都会带上组件名前缀（开发环境 `NavBar-header`，生产环境 `NavBar-header__8vayd`），方便在 DevTools 里认出来。

### 样式相关的三个坑（都已修好，别改回去）

1. **`css-loader` 必须用 CommonJS 形态导出** —— `webpack.config.js` 里显式写了 `esModule: false` + `modules.namedExport: false`。
   用 v7 的默认值（都是 true）时，`import styles from './index.module.scss'` 会拿到 `undefined`，
   `styles['layout']` 直接抛错、样式全丢。TypeScript 完全不会提示，只有跑起来才炸。
2. **键名不做转换** —— `exportLocalsConvention: 'as-is'`，所以 `.hero-body` 就用 `styles['hero-body']` 取。
   切成 `camel-case-only` 的话，键会变成 `heroBody`，代码里所有中划线键静默变 `undefined`。
3. **`optimization.usedExports` 保持 `false`** —— 开着它时生产构建会把 CSS Modules 的导出当死代码删掉，
   表现和上面第 1 条一样（开发模式不删，所以只在 `npm run build` 后白屏）。
   `npm run smoke` 现在会断言「页面上真的有 `Home-page`、`PostCard-card` 这些类名」，改错了会直接测挂。

## 实现要点

- **设计语言**：界面就是 antd 本身的样子——按钮、卡片、头像、标签、弹窗、下拉都不覆盖 antd 的配色和阴影，只保留图标本身带颜色；文章 item 是 `Card variant="outlined"`（带边框）。主色用 antd 默认值，想换就在 `src/App.tsx` 的 ConfigProvider 里加 `colorPrimary`。
- **样式**：布局、间距、栅格写在 `*.module.scss`（CSS Modules + SCSS，配 `sass-loader` / `css-loader` / `style-loader`）；颜色、圆角、间距刻度一律引用 antd 暴露的 CSS 变量（`--ant-color-*` / `--ant-margin*`），所以深色模式和换主色都不用改样式文件。公共尺寸变量在 `src/styles/tokens.scss`，每个 `*.module.scss` 会自动 `@use` 进来，不用手写。
- **唯一没有组件包裹的样式**是 Markdown 正文（渲染出的 HTML 不在 antd 组件体系里），放在 `src/components/Markdown/index.module.scss`，子元素用 `:global()` 选择。
- **代码分割**：每个页面一个 `import()`，首次访问才下载对应 chunk；框架核心单独一个可长期缓存的 chunk，其余第三方按包拆（配置在 `webpack.config.js`，注释里写了为什么不能并成一个 vendors）。
- **状态管理**：组件内部状态用 `useState`，跨页面共享（文章、主题）用 zustand，见 `src/store/`。
- **主题**：导航栏右侧按钮切换浅色/深色，antd 走 `darkAlgorithm`，同时把主题写到 `body[data-theme]`。首次访问跟随系统 `prefers-color-scheme`，之后记住你的选择。
- **样式注入**：目前由 `style-loader` 注入 `<style>`；想改成独立 `.css` 文件 + link 预加载，可以引 `mini-css-extract-plugin`，但**必须同时保留上面第 1 条那两条 css-loader 选项**，否则会踩同一个坑。
- **文章用 Markdown 而不是富文本**：渲染器在 `src/utils/markdown.ts`，行为有单测覆盖（转义、链接白名单、列表、引用、代码块）。

## 已知边界

- 没有后端：文章只存在浏览器本地，多设备不同步。
- 没有登录：任何人打开站点都能编辑/删除文章（这只是本地对自己生效）。要真正公开发布，需要接后端或改用静态生成的 Markdown 文件。
- 文章详情页的 Markdown 不支持表格、图片、嵌套列表；需要时引 `markdown-it` 替换 `renderMarkdown` 即可。
