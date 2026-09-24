import { Layout } from 'antd';
import type { ReactNode } from 'react';
import React from 'react';
import { profile } from '../../content/profile';
import { NavBar } from '../NavBar';
import styles from './index.module.scss';

/**
 * 页面外壳：antd Layout 撑满视口，导航用 Layout.Header，内容区居中限宽。
 * 背景色、页脚分割线都用 antd 自己的样式，不额外覆盖。
 */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <Layout className={styles['layout']}>
      <NavBar />
      <Layout.Content>
        <div className={styles['content']}>{children}</div>
      </Layout.Content>
      <Layout.Footer className={styles['footer']}>
        © {new Date().getFullYear()} {profile.name} · React + TypeScript + Ant Design + Webpack
      </Layout.Footer>
    </Layout>
  );
}
