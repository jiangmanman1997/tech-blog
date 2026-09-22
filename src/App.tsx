import { App as AntdApp, ConfigProvider, Spin, theme as antdTheme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router';
import { PageShell } from './components/PageShell';
import { BRAND_COLOR, ROUTES } from './constants/site';
import { useScrollToTop } from './hooks/useScrollToTop';
import { useTheme } from './hooks/useTheme';

// 每个 import() 就是一个 webpack chunk：页面代码只在首次访问时下载（PRD/DESIGN 的代码分割）
const Home = lazy(() => import(/* webpackChunkName: "page-home" */ './pages/home'));
const Blog = lazy(() => import(/* webpackChunkName: "page-blog" */ './pages/blog'));
const About = lazy(() => import(/* webpackChunkName: "page-about" */ './pages/about'));
const NotFound = lazy(() => import(/* webpackChunkName: "page-not-found" */ './pages/not-found'));

const Fallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
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
          colorPrimary: BRAND_COLOR,
          borderRadius: 10,
          fontSize: 15,
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
