/**
 * 文章数据：这里只是「首次打开时的种子数据」。
 *
 * 你在页面上新增/编辑/删除的文章会存进浏览器 localStorage（key 见 constants/site.ts），
 * 想改回这里的内容，清掉 localStorage 的 self-web:posts 再刷新即可。
 *
 * content 字段写 Markdown，支持：
 *   # 二级标题（##）  ### 三级标题
 *   **加粗**  `行内代码`  [链接](https://example.com)
 *   - 无序列表 / 1. 有序列表 / > 引用 / ``` 代码块
 */

import type { Post } from '../types';

export type { Post };

export const seedPosts: Post[] = [
  {
    id: 'hello-world',
    title: '开始写第一篇博客',
    summary: '示例文章：说明这个站点的文章格式，可以直接删掉换成你自己的内容。',
    tags: ['随笔'],
    createdAt: '2024-05-01',
    content: [
      '这是一篇示例文章，用来演示正文的排版能力。**点博客页右上角的「写文章」就能新增你自己的文章**，也可以用卡片上的「编辑」改这篇。',
      '',
      '## 支持的写法',
      '',
      '- **加粗**、`行内代码`、[外链](https://example.com)',
      '- 无序列表和下面的有序列表',
      '- 引用块和代码块',
      '',
      '1. 先在草稿里慢慢写',
      '2. 写完了在编辑弹窗里把「草稿」关掉',
      '3. 博客页默认只展示已发布的文章',
      '',
      '> 列表页的摘要来自 summary 字段，正文第一段不会自动当摘要，所以记得单独写一句。',
      '',
      '```ts',
      'export const greet = (name: string) => `Hello, ${name}!`;',
      '```',
      '',
      '### 一点建议',
      '',
      '把「为什么写」放在开头：解决什么问题、踩了哪个坑，比罗列 API 更有价值。',
    ].join('\n'),
  },
  {
    id: 'react-hooks-boundary',
    title: '把复杂交互拆成小组件的一次实践',
    summary: '示例文章：从一个真实需求出发，拆解状态边界应该划在哪里。',
    tags: ['React', '前端'],
    createdAt: '2024-05-12',
    content: [
      '需求本身不复杂，但几个人一起改之后组件变成了 500 行。复盘时发现问题不在「代码写得乱」，而在于**状态的归属没定清楚**。',
      '',
      '## 一条判断标准',
      '',
      '问自己：这个状态变了，哪些 UI 真的需要重渲染？',
      '',
      '- 只有自己用 → 留在组件内部，用 `useState`',
      '- 兄弟组件之间要同步 → 提到最近的公共父级',
      '- 跨页面共享（如当前用户、主题）→ 放进 store',
      '',
      '> 过早把状态提到全局，和过晚提取一样糟：前者让每次改动都牵动全站，后者让 props 层层透传。',
      '',
      '## 拆分之后',
      '',
      '拆分不是为了文件数好看，而是让每块的输入输出可以单独讲清楚。能讲清楚的组件，才测得了。',
    ].join('\n'),
  },
  {
    id: 'webpack-splitting-notes',
    title: 'Webpack 分包：别把所有依赖并成一个 vendors',
    summary: '示例文章：路由级懒加载 + 按包拆分的收益与注意事项。',
    tags: ['Webpack', '性能优化', '工程化'],
    createdAt: '2024-05-20',
    content: [
      '很多配置里能看到 `splitChunks` 写成 `test: /node_modules/` + 固定 `name: "vendors"`。它确实能把第三方打成一个包，但代价是**路由之间的依赖会互相牵连**：A 页面用到的库，B 页面也会一起下载。',
      '',
      '## 更省流量的做法',
      '',
      '- 框架核心（react 等）单独一个长期可缓存的 chunk',
      '- 其余第三方按包拆，`chunks: "async"`，让只有懒加载图里的库才参与拆分',
      '- 每个路由 `import()` 一次，页面代码只在首次访问时下载',
      '',
      '```js',
      'const Home = lazy(() => import(/* webpackChunkName: "page-home" */ "./pages/Home"));',
      '```',
      '',
      '验证方式很直接：`npm run build` 之后打开 Network，切页面看实际下载了哪些 chunk。',
    ].join('\n'),
  },
  {
    id: 'typescript-narrowing',
    title: '几个让类型收窄变简单的写法',
    summary: '示例文章：判别联合、字面量类型和 never 兜底。',
    tags: ['TypeScript', '前端'],
    createdAt: '2024-06-02',
    content: [
      '类型体操能解决的问题，大多可以用更朴素的方式解决：**给数据一个能判别的字段**。',
      '',
      '## 判别联合',
      '',
      '```ts',
      'type Result =',
      '  | { status: "ok"; data: string }',
      '  | { status: "error"; message: string };',
      '',
      'const render = (r: Result) => (r.status === "ok" ? r.data : r.message);',
      '```',
      '',
      '`status` 一判断，另一个分支的字段就能直接访问，不需要断言。',
      '',
      '## 用 never 兜底',
      '',
      '在 `switch` 的 default 里把值赋给 `never`，以后新增分支忘了处理，编译期就会报错——比线上出问题便宜得多。',
    ].join('\n'),
  },
  {
    id: 'reading-notes-ui',
    title: '读《界面设计心理学》的一点笔记',
    summary: '示例文章：为什么「看起来能用」不等于「用起来顺」。',
    tags: ['随笔', 'CSS'],
    createdAt: '2024-06-15',
    content: [
      '书里反复讲一件事：用户不会读界面，他们**扫**界面。所以层级、间距、对比度不是装饰，是信息结构本身。',
      '',
      '## 我落到的三条',
      '',
      '1. 重要的东西不需要更大，只需要周围更空',
      '2. 一致的间距比精确的间距更重要',
      '3. 动效要解释「从哪来、到哪去」，否则就是噪音',
      '',
      '写代码时这三条对应到设计 token：间距用一套刻度、颜色用一套变量、动效时长统一。',
    ].join('\n'),
  },
];
