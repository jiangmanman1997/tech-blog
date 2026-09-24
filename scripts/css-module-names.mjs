/**
 * 让 CSS Modules 的类名带上「组件名/页面名」。
 *
 * 组件样式统一叫 index.module.scss，css-loader 的 [name] 占位符只能得到 "index"，
 * 排查样式时分不出是哪个组件，所以这里用 css-loader 的 getLocalIdent 钩子，
 * 从文件所在文件夹取名字：
 *
 *   src/components/PostCard/index.module.scss   -> PostCard-card
 *   src/pages/blog/PostList/index.module.scss   -> PostList-page
 *   src/pages/home/index.module.scss            -> home-hero
 *
 * 个别不放在组件文件夹里的样式（例如 src/styles）返回 undefined，交回 css-loader 默认命名。
 */

import path from 'node:path';

/** 只有位于组件/页面文件夹里的样式才加前缀；这里显式排除公共样式目录 */
const SHARED_STYLE_DIRS = new Set(['styles']);

export const getLocalIdent = (context, localIdentName, localName) => {
  const resourcePath = context.resourcePath ?? '';
  const folder = path.basename(path.dirname(resourcePath));

  if (!folder || SHARED_STYLE_DIRS.has(folder)) return undefined;

  // 开发环境只用「组件名-类名」，DevTools 里一眼认出来；生产环境再加短哈希避免重名
  const hash = isProd(context) ? `__${shortHash(`${folder}/${localName}`)}` : '';
  return `${folder}-${localName}${hash}`;
};

/** webpack 的 mode 会通过 loader 的 context 传进来，取不到就退化成不带哈希 */
const isProd = (context) => context.mode === 'production' || process.env.NODE_ENV === 'production';

/** 与 css-loader 默认一致的短哈希，避免不同组件里同名类名互相覆盖 */
const shortHash = (input) => {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0;
  return (hash >>> 0).toString(36).slice(0, 5);
};
