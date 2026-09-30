/** 头部导航栏 */

import {
  BulbOutlined,
  GithubOutlined,
  LinkOutlined,
  MailOutlined,
  MoonOutlined,
} from '@ant-design/icons';
import { Avatar, Tooltip } from 'antd';
import { Link, useLocation } from 'react-router';
import { NAV_ITEMS, ROUTES } from '../../../constants/site';
import { profile } from '../../../content/profile';
import { useTheme } from '../../../store/useTheme';
import styles from './index.module.scss';
import Icon from '../../Icon';

export function NavBar() {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();

  async function openMailAndCopy(email:string='') {
  // 1. 复制邮箱到剪贴板
  try {
    await navigator.clipboard.writeText(email);
    console.log('邮箱已复制');
  } catch (err) {
    console.error('复制失败', err);
  }

  // 2. 跳转到邮箱客户端
  window.location.href = `mailto:${email}`;
}

  // /blog/xxx 时也要让「博客」保持高亮
  const selectedKey =
    NAV_ITEMS.find((item) => item.key !== '/' && pathname.startsWith(item.key))?.key ?? '/';

    const navItemClass=(isActive:boolean)=>`${styles['home-nav-item']} ${isActive?styles['home-nav-active']:''}`
  return (
    <>
      <header className={styles['masthead']}>
        <div className={styles['masthead-inner']}>
          <Avatar src='/imgs/logo.png' size={60} />
          <nav className={`${styles['nav']} ${styles['home-nav']}`} aria-label="首页栏目">
            <Link className={navItemClass(selectedKey===ROUTES.home)} to={ROUTES.home}>
              首页
              </Link>
              <Link className={navItemClass(selectedKey===ROUTES.blog)} to={ROUTES.blog}>技术方向</Link>
            <Link className={navItemClass(selectedKey===ROUTES.about)} to={ROUTES.about}>关于我</Link>
          </nav>
          <nav className={styles['socials']} aria-label="社交链接">
            {profile.socials.map((social) => (
              <a key={social.label} href={social.url} target="_blank" rel="noreferrer" aria-label={social.label}>
                {social.label.toLowerCase().includes('github') ? <GithubOutlined /> : <Icon name='icon-juejin' colorful size={24}/>}
              </a>
            ))}
            <a onClick={()=>openMailAndCopy(profile?.email)}><Icon  name='icon-qq' colorful size={30}/></a>
            <Tooltip title={theme === 'dark' ? '切换到浅色' : '切换到深色'}>
              <a href="#" onClick={toggleTheme} aria-label="切换主题">
                {theme === 'dark' ? <BulbOutlined /> : <MoonOutlined />}
              </a>
            </Tooltip>
          </nav>
        </div>
      </header>
    </>
  );
}

export default NavBar;
