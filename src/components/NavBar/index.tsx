/** 头部导航栏：antd Layout.Header / Menu 默认样式基本够用，只补布局；配色不覆盖 */

import { BulbOutlined, MoonOutlined } from '@ant-design/icons';
import { Button, Layout, Menu, Tooltip } from 'antd';
import { useLocation, useNavigate } from 'react-router';
import { NAV_ITEMS } from '../../constants/site';
import { useTheme } from '../../hooks/useTheme';
import styles from './index.module.scss';

export function NavBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();

  // /blog/xxx 时也要让「博客」保持高亮
  const selectedKey =
    NAV_ITEMS.find((item) => item.key !== '/' && pathname.startsWith(item.key))?.key ?? '/';

  return (
    <Layout.Header className={styles['header']}>
      <div className={styles['inner']}>
        <div className={styles['nav']}>
          <Menu
            mode="horizontal"
            selectedKeys={[selectedKey]}
            items={NAV_ITEMS.map((item) => ({ key: item.key, label: item.label }))}
            onClick={({ key }) => navigate(key)}
          />
        </div>

        <Tooltip title={theme === 'dark' ? '切换到浅色' : '切换到深色'}>
          <Button
            type="text"
            aria-label="切换主题"
            icon={theme === 'dark' ? <BulbOutlined /> : <MoonOutlined />}
            onClick={toggleTheme}
          />
        </Tooltip>
      </div>
    </Layout.Header>
  );
}

export default NavBar;
