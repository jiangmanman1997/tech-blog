/** 头部导航栏：用 antd Layout.Header + Menu + Avatar 原生样式，不覆盖配色 */

import { BulbOutlined, MoonOutlined } from '@ant-design/icons';
import { Avatar, Button, Flex, Layout, Menu, Tooltip, Typography } from 'antd';
import { useLocation, useNavigate } from 'react-router';
import { NAV_ITEMS, SITE } from '../constants/site';
import { profile } from '../content/profile';
import { useTheme } from '../hooks/useTheme';
import { initialOf } from '../utils/format';

export function NavBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();

  // /blog/xxx 时也要让「博客」保持高亮
  const selectedKey =
    NAV_ITEMS.find((item) => item.key !== '/' && pathname.startsWith(item.key))?.key ?? '/';

  return (
    <Layout.Header
      style={{
        height: 'auto',
        lineHeight: 'normal',
        padding: 0,
        paddingInline: 24,
        borderBottom: '1px solid var(--ant-color-border-secondary)',
      }}
    >
      <Flex
        align="center"
        gap={16}
        style={{ width: '100%', maxWidth: SITE.contentWidth, height: 64, margin: '0 auto' }}
      >
        <Flex align="center" gap={8}>
          <Avatar size={32} src={profile.avatar || undefined}>
            {initialOf(profile.name)}
          </Avatar>
          <Typography.Text strong>{profile.name}</Typography.Text>
        </Flex>

        <div style={{ flex: 'auto', minWidth: 0 }}>
          <Menu
            mode="horizontal"
            selectedKeys={[selectedKey]}
            items={NAV_ITEMS.map((item) => ({ key: item.key, label: item.label }))}
            onClick={({ key }) => navigate(key)}
            style={{ borderBottom: 'none', background: 'transparent' }}
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
      </Flex>
    </Layout.Header>
  );
}

export default NavBar;
