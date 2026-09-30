/**
 * 文章数据：这里只是「首次打开时的种子数据」。
*/

import type { Post } from '../types';
import helloWorld from './posts/hello-world.md';
import reactHooksBoundary from './posts/react-hooks-boundary.md';
import webpackSplittingNotes from './posts/webpack-splitting-notes.md';
import typescriptNarrowing from './posts/typescript-narrowing.md';
import readingNotesUi from './posts/reading-notes-ui.md';

export type { Post };

export const seedPosts: Post[] = [
  {
    id: 'hello-world',
    title: '开始写第一篇博客',
    summary: '示例文章：说明这个站点的文章格式，可以直接删掉换成你自己的内容。',
    tags: ['Essay', 'Frontend'],
    createdAt: '2026-09-28',
    content: helloWorld,
  },
  {
    id: 'react-hooks-boundary',
    title: '把复杂交互拆成小组件的一次实践',
    summary: '示例文章：从一个真实需求出发，拆解状态边界应该划在哪里。',
    tags: ['React', 'Frontend'],
     createdAt: '2026-09-28',
    content: reactHooksBoundary,
  },
  {
    id: 'webpack-splitting-notes',
    title: 'Webpack 分包：别把所有依赖并成一个 vendors',
    summary: '示例文章：路由级懒加载 + 按包拆分的收益与注意事项。',
    tags: ['Webpack', 'Performance', 'Engineering'],
    createdAt: '2026-09-28',
    content: webpackSplittingNotes,
    coverImg:'https://tse2.mm.bing.net/th/id/OIP.wjgSV1c3SN4K-VfO7ZVvcwHaC4?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
  },
  {
    id: 'typescript-narrowing',
    title: '几个让类型收窄变简单的写法',
    summary: '示例文章：判别联合、字面量类型和 never 兜底。',
    tags: ['TypeScript', 'Frontend'],
     createdAt: '2026-09-28',
    content: typescriptNarrowing,
    coverImg:'https://miro.medium.com/v2/resize:fit:1358/format:webp/1*vJEf2fFlaV8aOkBxJB13Jg.png'
  },
  {
    id: 'reading-notes-ui',
    title: '读《界面设计心理学》的一点笔记',
    summary: '示例文章：为什么「看起来能用」不等于「用起来顺」。',
    tags: ['Essay', 'CSS'],
     createdAt: '2026-09-28',
    content: readingNotesUi,
    coverImg:'https://pic2.zhimg.com/v2-a22f162f00b6bb41042358fdb8a9b05a_720w.jpg?source=172ae18b',
  },
];
