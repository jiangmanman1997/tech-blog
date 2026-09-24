/**
 * 入口文件：只做一件事 —— 把 App 挂到 #root 上。
 *
 * 注意：这里必须有 createRoot(...).render(...)。
 * 如果这个文件只 export 组件、不调用 render，webpack 一样能编译成功，
 * 但页面上什么都不会渲染（#root 一直是空的），浏览器控制台也没有任何报错。
 *
 * BrowserRouter 放在这里（而不是 App 里），方便测试单独渲染 App。
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App';

const container = document.getElementById('root');
if (!container) throw new Error('找不到 #root 节点，检查 public/index.html');

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
