/**
 * 冒烟测试专用的样式替身 loader（正式构建不会用到）。
 *
 * 为什么需要它：冒烟测试不加载真实 CSS，但组件里是
 *   import styles from './index.module.scss'; className={styles['post-card']}
 * 如果样式模块返回 undefined，styles['post-card'] 会直接抛错；如果只返回空对象，
 * 类名会静默变成 undefined —— 样式丢了却测不出来（这正是之前踩过的坑）。
 *
 * 做法：不依赖 css-loader 的输出格式，直接按和正式构建同一套规则
 * （scripts/css-module-names.mjs）从 SCSS 源码里解析类名，算出映射再导出。
 * 这样冒烟测试既能断言类名真的落到 DOM 上，也能抓到「代码里的键名和样式文件对不上」。
 *
 * 已知取舍：只认顶层 `.class-name {` 这种写法（本项目样式都是这种），
 * 嵌套规则、`:global()` 内部的选择器不参与映射——正式构建不受影响。
 */

const path = require('node:path');
const { pathToFileURL } = require('node:url');

/** 类选择器：只取顶层、且后面跟 { 或 , 的 */
const CLASS_PATTERN = /^\.([A-Za-z_][\w-]*)\s*(?=[{,]|$)/gm;

/** 与正式配置的 exportLocalsConvention: 'as-is' 一致：键就是类名本身，不做驼峰转换 */

let getLocalIdentPromise = null;

const loadNamer = () => {
  getLocalIdentPromise ??= import(
    pathToFileURL(path.resolve(__dirname, 'css-module-names.mjs')).href
  ).then((mod) => mod.getLocalIdent);
  return getLocalIdentPromise;
};

// 异步 loader 用 Promise 返回，别混用 this.callback（两者同时用会报 callback already called）
module.exports = async function cssModuleStub(source) {
  this.cacheable?.(true);
  const getLocalIdent = await loadNamer();
  const resourcePath = this.resourcePath ?? '';
  const mode = this.mode ?? process.env.NODE_ENV ?? 'development';
  const context = { resourcePath, mode, context: this.rootContext };

  const map = {};
  for (const match of String(source).matchAll(CLASS_PATTERN)) {
    const localName = match[1];
    if (localName in map) continue;
    const ident = getLocalIdent(context, '', localName);
    // getLocalIdent 返回 undefined 表示「不接管」，退回原类名
    map[localName] = ident ?? localName;
  }

  return `export default ${JSON.stringify(map)};`;
};
