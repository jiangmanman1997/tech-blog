/**
 * 冒烟测试的挂载入口（只在 `npm run smoke` 时被 webpack 打包，不参与正式构建）。
 * 把 React 挂载到 jsdom 的 document 上，并暴露一个 open(path) 用于逐页渲染。
 */

import { createRoot, type Root } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from '../src/App';

let root: Root | null = null;

export const open = (path: string) => {
  window.history.pushState({}, '', path);
  const container = document.createElement('div');
  container.id = 'root';
  document.body.appendChild(container);
  root?.unmount();
  root = createRoot(container);
  root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );
  return container;
};

// webpack 用 library 形式输出，这里显式挂到全局，测试里直接取用
(globalThis as { __smokeOpen?: typeof open }).__smokeOpen = open;
