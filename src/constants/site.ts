/**
 * 站点级常量：改这里不用碰组件。
 * 个人资料请改 src/content/profile.ts，文章请改 src/content/posts.ts。
 */

/**
 * 主色：ConfigProvider 拿它生成整套 antd 主题色（按钮、链接、选中态、焦点框都跟着变），
 * 自绘的 Markdown 正文用的是 antd 暴露的 CSS 变量，所以换这一个值就够了。
 */
export const BRAND_COLOR = '#4f46e5';

export const SITE = {
  /** 首页最近文章条数（PRD：最近 5 篇） */
  recentPostCount: 5,
  /** 内容区最大宽度 */
  contentWidth: 1080,
  /** 内容区距顶部的距离 */
  contentPadding: 32,
  /** 标签颜色，未列出的标签用 fallback */
  tagColors: {
    前端: 'geekblue',
    React: 'blue',
    TypeScript: 'cyan',
    Webpack: 'purple',
    CSS: 'magenta',
    性能优化: 'orange',
    工程化: 'volcano',
    随笔: 'green',
  } as Record<string, string>,
  tagFallbackColor: 'default',
} as const;

export const ROUTES = {
  home: '/',
  blog: '/blog',
  post: (id: string) => `/blog/${id}`,
  about: '/about',
} as const;

export const NAV_ITEMS = [
  { key: ROUTES.home, label: '首页' },
  { key: ROUTES.blog, label: '博客' },
  { key: ROUTES.about, label: '关于' },
] as const;

/** localStorage 的 key，改版本号可让老数据失效 */
export const STORAGE_KEYS = {
  posts: 'self-web:posts',
  theme: 'self-web:theme',
} as const;
