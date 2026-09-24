import { App as AntdApp, ConfigProvider, Spin, theme as antdTheme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router';
import { PageShell } from './components/PageShell';
import { ROUTES } from './constants/site';
import { useScrollToTop } from './hooks/useScrollToTop';
import { useTheme } from './hooks/useTheme';
import styles from './App.module.scss';

// 每个 import() 就是一个 webpack chunk：页面代码只在首次访问时下载（PRD/DESIGN 的代码分割）
const Home = lazy(() => import(/* webpackChunkName: "page-home" */ './pages/Home'));
const Blog = lazy(() => import(/* webpackChunkName: "page-blog" */ './pages/Blog'));
const About = lazy(() => import(/* webpackChunkName: "page-about" */ './pages/About'));
const NotFound = lazy(() => import(/* webpackChunkName: "page-not-found" */ './pages/NotFound'));

/** 懒加载页面时的加载态 */
const Fallback = () => (
  <div className={styles['fallback']}>
    <Spin />
  </div>
);

export default function App() {
  const { theme } = useTheme();
  useScrollToTop();

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          // 主色用 antd 默认值；想换就加 colorPrimary（例如 '#4f46e5'）
          borderRadius: 8,
          fontSize: 14,
        },
      }}
    >
      <AntdApp>
        <PageShell>
          <Suspense fallback={<Fallback />}>
            <Routes>
              <Route path={ROUTES.home} element={<Home />} />
              <Route path={ROUTES.blog} element={<Blog />} />
              <Route path={`${ROUTES.blog}/:id`} element={<Blog />} />
              <Route path={ROUTES.about} element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </PageShell>
      </AntdApp>
    </ConfigProvider>
  );
}
