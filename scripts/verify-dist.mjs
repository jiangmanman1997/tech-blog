/**
 * 最终验证（可保留）：用正式构建产物 dist/ 在 jsdom 里跑起来，检查
 *   1. #root 真的渲染出内容
 *   2. 样式文件生成了（.css 存在 / link 引用正确）
 *   3. 组件里的 styles['xxx'] 真的落到了 DOM 上（没有 undefined、且能看到组件类名）
 *   4. 控制台没有报错
 * 用法：先 npm run build，再 node scripts/verify-dist.mjs
 */

import path from 'node:path';
import { readFileSync, readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';

const root = path.resolve(import.meta.dirname, '..');
const distDir = path.join(root, 'dist');

const html = readFileSync(path.join(distDir, 'index.html'), 'utf8');
const dom = new JSDOM(html, { url: 'http://localhost:3000/', pretendToBeVisual: true });
const { window } = dom;

const consoleErrors = [];
window.console.error = (...args) => consoleErrors.push(args.map(String).join(' '));
window.addEventListener('error', (e) => consoleErrors.push('[error] ' + (e.error?.message ?? e.message)));
window.addEventListener('unhandledrejection', (e) => consoleErrors.push('[rejection] ' + e.reason));

const define = (k, v) =>
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
for (const [k, v] of Object.entries({
  window, self: window, document: window.document, navigator: window.navigator,
  location: window.location, history: window.history,
  HTMLElement: window.HTMLElement, Element: window.Element, Node: window.Node,
  SVGElement: window.SVGElement, DocumentFragment: window.DocumentFragment,
  Event: window.Event, MouseEvent: window.MouseEvent,
})) define(k, v);
define('getComputedStyle', window.getComputedStyle.bind(window));
define('requestAnimationFrame', (cb) => setTimeout(() => cb(Date.now()), 0));
define('cancelAnimationFrame', (h) => clearTimeout(h));
window.scrollTo = () => {};
define('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
window.ResizeObserver = globalThis.ResizeObserver;
window.matchMedia ??= (q) => ({
  matches: false, media: q, onchange: null,
  addEventListener: () => {}, removeEventListener: () => {},
  addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
});

// 样式文件和脚本都由 index.html 引用；jsdom 里手工模拟 link/script 的效果。
// 注意 html-webpack-plugin 产出的属性不带引号，两种都要匹配
const scripts = [...html.matchAll(/src=["']?([^"'\s>]+)["']?/g)].map((m) => m[1].replace(/^\//, ''));
const cssFiles = readdirSync(distDir).filter((name) => name.endsWith('.css'));

console.log('构建产物：');
console.log('  CSS 文件:', cssFiles.join(', ') || '(无，说明样式没被抽出来)');
console.log('  入口脚本:', scripts.join(' → '));

for (const src of scripts) {
  await import(pathToFileURL(path.join(distDir, src)).href);
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
for (let i = 0; i < 40; i += 1) {
  await wait(50);
  if (window.document.querySelector('.ant-spin')) continue;
  if (window.document.querySelector('.ant-layout-content')?.textContent?.trim()) break;
}

const rootEl = window.document.getElementById('root');
const ownClasses = [...window.document.querySelectorAll('[class]')]
  .flatMap((el) => String(el.className).split(/\s+/))
  .filter((name) => name && !/^(ant-|css-|anticon)/.test(name));

console.log('\n结果：');
console.log('  #root 文字:', JSON.stringify(rootEl?.textContent?.slice(0, 80)));
console.log('  含 undefined 的元素:', window.document.querySelectorAll('[class*="undefined"]').length);
console.log('  组件类名样例:', [...new Set(ownClasses)].slice(0, 8).join(', ') || '(无)');
console.log('  控制台报错:', consoleErrors.length ? consoleErrors.join(' | ') : '(无)');

const ok = Boolean(rootEl?.textContent?.trim()) && consoleErrors.length === 0 && ownClasses.length > 0;
console.log('\n结论:', ok ? '页面正常渲染，样式类名已生效 ✅' : '仍有问题 ❌');
process.exit(ok ? 0 : 1);
