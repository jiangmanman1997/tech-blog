/**
 * 运行时冒烟测试：`npm run smoke`
 *
 * 步骤：webpack（scripts/webpack.smoke.config.js）把 test/harness.tsx 打成 .smoke-build/app.js，
 * 然后在 jsdom 里逐页挂载，检查三个页面真的渲染出内容、复制邮箱和主题切换不抛异常。
 * 单元测试管逻辑，这里管「渲染起来不炸、页面有内容」。
 */

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';

const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, '.smoke-build');
const bundleUrl = pathToFileURL(path.join(outDir, 'app.js')).href;

const wait = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

const build = () => {
  execFileSync(
    process.execPath,
    [path.join(root, 'node_modules/webpack-cli/bin/cli.js'), '--config', 'scripts/webpack.smoke.config.js'],
    { cwd: root, stdio: 'inherit' },
  );
};

/** 用 jsdom 造一个浏览器环境，把必要的全局对象挂到 globalThis 上 */
const setupDom = () => {
  const dom = new JSDOM(readFileSync(path.join(outDir, 'index.html'), 'utf8'), {
    url: 'http://localhost:3000/',
    pretendToBeVisual: true,
  });
  const { window } = dom;

  // 把 jsdom 里的报错转到 node 控制台，不然渲染失败只会看到空白
  for (const level of ['error', 'warn', 'info', 'log']) {
    window.console[level] = (...args) => console[level === 'log' ? 'log' : 'error']('[jsdom]', ...args);
  }
  window.addEventListener('error', (event) => console.error('[jsdom error]', event.error ?? event.message));
  window.addEventListener('unhandledrejection', (event) => console.error('[jsdom rejection]', event.reason));

  // navigator / location 在 Node 里是只读 getter，必须用 defineProperty 覆盖
  const define = (key, value) =>
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });

  define('window', window);
  define('document', window.document);
  define('navigator', window.navigator);
  define('location', window.location);
  define('history', window.history);
  define('HTMLElement', window.HTMLElement);
  define('Element', window.Element);
  define('Node', window.Node);
  define('SVGElement', window.SVGElement);
  define('DocumentFragment', window.DocumentFragment);
  define('Event', window.Event);
  define('MouseEvent', window.MouseEvent);
  define('getComputedStyle', window.getComputedStyle.bind(window));
  define('requestAnimationFrame', (callback) => setTimeout(() => callback(Date.now()), 0));
  define('cancelAnimationFrame', (handle) => clearTimeout(handle));

  window.matchMedia ??= (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });

  // jsdom 没实现 scrollTo（App 里路由切换会调），补一个空实现
  window.scrollTo = () => {};

  // jsdom 没有 ResizeObserver，antd 的响应式栅格会用到
  define(
    'ResizeObserver',
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  window.ResizeObserver = globalThis.ResizeObserver;

  return window;
};

const click = (element) => element.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

/** 模拟输入：React 监听 input 事件，直接改 value 不会触发 onChange */
const type = (input, value) => {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
  const textareaSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
  if (input.tagName === 'TEXTAREA') textareaSetter?.call(input, value);
  else setter?.call(input, value);
  input.dispatchEvent(new window.Event('input', { bubbles: true }));
};

const byText = (root, selector, keyword) =>
  [...root.querySelectorAll(selector)].find((element) => element.textContent?.includes(keyword));

build();

const window = setupDom();
await import(bundleUrl);
const open = globalThis.__smokeOpen;
assert.ok(typeof open === 'function', '冒烟包应该暴露 __smokeOpen');

/**
 * 渲染一个路由并等 React 提交完成。
 * 注意：导航栏是同步渲染的，不能用「有文字」判断页面就绪，
 * 要等 Suspense 的 Spin 消失（懒加载的页面 chunk 已落地）。
 */
const render = async (pathname) => {
  const container = open(pathname);
  for (let i = 0; i < 60; i += 1) {
    await wait(25);
    if (container.querySelector('.ant-spin')) continue; // 还在加载页面 chunk
    if (container.querySelector('.ant-layout-content')?.textContent?.trim()) break;
  }
  return container;
};

const textOf = (container) => container.textContent ?? '';

/** 文章 item 是带边框的 antd Card，这里按卡片数量判断 */
const postCards = (container) => container.querySelectorAll('.ant-card');

/**
 * 组件里的 styles['xxx'] 必须真的落到 DOM 上。
 * 上一个坑就是样式模块的默认导出是 undefined，className 静默变成 undefined、样式全丢，
 * 而当时的冒烟测试只断言文字和 antd 类名，完全测不出来。
 */
const assertOwnClasses = (container, label) => {
  assert.equal(
    container.querySelectorAll('[class*="undefined"]').length,
    0,
    `${label}：className 里不应该出现 undefined（说明 styles['xxx'] 取不到值）`,
  );
  const ownClasses = [...container.querySelectorAll('[class]')]
    .flatMap((el) => String(el.className).split(/\s+/))
    .filter((name) => name && !/^(ant-|css-|anticon)/.test(name));
  assert.ok(ownClasses.length > 0, `${label}：应该有 CSS Modules 生成的类名`);
  return ownClasses;
};

// 1) 首页：自我介绍 + 最近 5 篇文章
{
  const container = await render('/');
  const content = textOf(container);
  assert.match(content, /前端工程师/, '首页应该渲染出头衔');
  assert.match(content, /最近文章/, '首页应该有「最近文章」区块');
  assert.match(content, /开始写第一篇博客/, '首页应该列出种子文章');
  // 1 张自我介绍卡 + 5 张文章卡
  assert.equal(postCards(container).length, 1 + 5, '首页最多展示 5 篇（PRD）');
  assert.equal(container.querySelectorAll('.ant-card-bordered').length, 6, '每张卡片都应该有边框');

  const own = assertOwnClasses(container, '首页');
  for (const expected of ['Home-page', 'Home-hero', 'PostCard-card', 'PageShell-layout']) {
    assert.ok(own.includes(expected), `首页应该用到样式类 ${expected}（当前：${own.join(', ')}）`);
  }
  console.log('✓ 首页：自我介绍 + 最近 5 篇文章（都带边框，样式类名已生效）');
}

// 2) 博客列表页：全部已发布文章 + 写文章入口
{
  const container = await render('/blog');
  const content = textOf(container);
  assert.match(content, /博客/, '博客页应该有标题');
  assert.ok(postCards(container).length >= 5, '博客页应该列出全部文章');
  assert.equal(
    container.querySelectorAll('.ant-card-bordered').length,
    postCards(container).length,
    '每个 article item 都应该带边框',
  );
  assert.ok(
    [...container.querySelectorAll('button')].some((button) => button.textContent?.includes('写文章')),
    '博客页应该有「写文章」按钮',
  );
  const own = assertOwnClasses(container, '博客列表页');
  for (const expected of ['PostList-grid', 'PostCard-card', 'PostCard-title']) {
    assert.ok(own.includes(expected), `博客列表页应该用到样式类 ${expected}`);
  }
  console.log('✓ 博客列表页：带边框的文章列表 + 写文章入口 + 样式类名');
}

// 3) 文章详情：Markdown 落到 DOM 上
{
  const container = await render('/blog/hello-world');
  const content = textOf(container);
  assert.match(content, /开始写第一篇博客/, '详情页应该渲染标题');
  // 正文容器用 data-testid 定位：class 名经过 CSS Modules 哈希，测试里不该依赖它
  const body = container.querySelector('[data-testid="markdown-body"]');
  assert.ok(body, '详情页应该有 Markdown 正文容器');
  assert.equal(body.querySelectorAll('h2').length, 1, '正文里的 ## 应该渲染成 h2');
  assert.equal(body.querySelectorAll('h3').length, 1, '正文里的 ### 应该渲染成 h3');
  const code = body.querySelector('pre code');
  assert.ok(code, '正文里的代码块应该渲染成 pre > code');
  assert.match(code?.textContent ?? '', /greet/, '代码块内容应该完整保留');
  const own = assertOwnClasses(container, '文章详情页');
  for (const expected of ['PostDetail-article', 'PostDetail-title', 'Markdown-markdown-body']) {
    assert.ok(own.includes(expected), `文章详情页应该用到样式类 ${expected}`);
  }
  console.log('✓ 文章详情页：标题 / h2 / h3 / 代码块 + 样式类名');
}

// 4) 关于页：邮箱展示 + 复制按钮可点（jsdom 没有 clipboard，走兜底分支也不该抛错）
{
  const container = await render('/about');
  const content = textOf(container);
  // 不写死具体邮箱：内容随时会换成你自己的
  assert.match(content, /[\w.+-]+@[\w-]+\.[\w.]+/, '关于页应该展示邮箱');
  const copyButton = [...container.querySelectorAll('button')].find((button) =>
    button.textContent?.includes('复制邮箱'),
  );
  assert.ok(copyButton, '关于页应该有复制邮箱按钮');
  click(copyButton);
  await wait(20);
  console.log('✓ 关于页：邮箱展示 + 复制按钮');
}

// 5) 主题切换：写回 body[data-theme]
{
  const container = await render('/');
  const toggle = container.querySelector('button[aria-label="切换主题"]');
  assert.ok(toggle, '导航栏应该有主题切换按钮');
  assert.equal(document.body.dataset.theme, 'light');
  click(toggle);
  await wait(20);
  assert.equal(document.body.dataset.theme, 'dark', '点击后应该切到深色');
  console.log('✓ 主题切换：light → dark');
}

// 6) 未知路由：落到 404 页而不是白屏
{
  const container = await render('/not-exist');
  assert.match(textOf(container), /404/, '未知路由应该显示 404');
  console.log('✓ 未知路由：显示 404');
}

// 7) 写文章：点「写文章」→ 填表单 → 发布，新文章出现在列表里（用户最常用的路径）
{
  const container = await render('/blog');
  click(byText(container, 'button', '写文章'));
  await wait(80);

  const modal = document.querySelector('.ant-modal');
  assert.ok(modal, '点「写文章」应该打开编辑弹窗');
  const inputs = modal.querySelectorAll('input, textarea');
  assert.ok(inputs.length >= 3, '弹窗里应该有标题 / 摘要 / 正文等输入框');

  type(modal.querySelector('#title'), '冒烟测试新增的文章');
  type(modal.querySelector('#summary'), '这是冒烟测试写入的摘要');
  type(modal.querySelector('#content'), '## 小标题\n\n正文内容，用来验证保存链路。');

  // antd 的中文按钮文字会被拆成「发 布」，这里按去掉空格后的文本找
  const okButton = [...modal.querySelectorAll('.ant-modal-footer button')].find(
    (button) => button.textContent?.replace(/\s/g, '') === '发布',
  );
  assert.ok(okButton, '弹窗底部应该有「发布」按钮');
  click(okButton);
  await wait(120);

  const content = textOf(container);
  assert.match(content, /冒烟测试新增的文章/, '新文章应该出现在博客列表里');
  assert.match(content, /共 6 篇/, '数量应该 +1');
  console.log('✓ 写文章：填写表单 → 发布 → 列表里出现新文章');
}

window.close();
console.log('\n冒烟测试通过：页面都能渲染，交互不报错。');
// jsdom / antd 会留下未清理的定时器，显式退出，别让 CI 里的 `npm run smoke` 挂住
process.exit(0);
