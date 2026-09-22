import { Layout } from 'antd';
import type { ReactNode } from 'react';
import { profile } from '../content/profile';
import { SITE } from '../constants/site';
import { NavBar } from './NavBar';

/**
 * 页面外壳：antd Layout 撑满视口，导航用 Layout.Header，内容区居中限宽。
 * 背景色、页脚分割线都用 antd 自己的样式，不额外覆盖。
 */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <NavBar />
      <Layout.Content>
        <div
          style={{
            width: '100%',
            maxWidth: SITE.contentWidth,
            margin: '0 auto',
            padding: `${SITE.contentPadding}px 24px 56px`,
          }}
        >
          {children}
        </div>
      </Layout.Content>
      <Layout.Footer style={{ textAlign: 'center' }}>
        © {new Date().getFullYear()} {profile.name} · React + TypeScript + Ant Design + Webpack
      </Layout.Footer>
    </Layout>
  );
}
