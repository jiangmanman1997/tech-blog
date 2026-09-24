import { CopyOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { App as AntdApp, Avatar, Button, Card, Space, Tag, Typography } from 'antd';
import { useState } from 'react';
import { profile } from '../../content/profile';
import { copyText } from '../../utils/clipboard';
import { initialOf } from '../../utils/format';
import styles from './index.module.scss';

/** 关于页：邮箱一键复制（PRD）。排版走 antd 组件，卡片自带边框 */
export default function About() {
  const { message } = AntdApp.useApp();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyText(profile.email);
    if (!ok) {
      message.error('复制失败，请手动选中邮箱地址');
      return;
    }
    setCopied(true);
    message.success('邮箱已复制');
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles['page']}>
      <Card variant="outlined">
        <div className={styles['profile']}>
          <Avatar size={72} src={profile.avatar || undefined}>
            {initialOf(profile.name)}
          </Avatar>
          <div>
            <Typography.Title className={styles['profile-name']} level={3}>
              {profile.name}
            </Typography.Title>
            <Typography.Text className={styles['profile-subtitle']} type="secondary">
              {profile.title}
              {profile.location ? ` · ${profile.location}` : ''}
            </Typography.Text>
          </div>
        </div>
      </Card>

      <Card variant="outlined" title={<Typography.Text strong>关于我</Typography.Text>}>
        {profile.aboutParagraphs.map((paragraph) => (
          <Typography.Paragraph
            key={paragraph}
            className={styles['paragraph']}
            type="secondary"
          >
            {paragraph}
          </Typography.Paragraph>
        ))}
      </Card>

      {profile.focus.length > 0 ? (
        <Card
          variant="outlined"
          title={
            <span className={styles['section-title']}>
              <UserOutlined />
              <Typography.Text strong>关注方向</Typography.Text>
            </span>
          }
        >
          <div className={styles['tags']}>
            {profile.focus.map((item) => (
              <Tag key={item} color="blue">
                {item}
              </Tag>
            ))}
          </div>
        </Card>
      ) : null}

      <Card
        variant="outlined"
        title={
          <span className={styles['section-title']}>
            <MailOutlined />
            <Typography.Text strong>邮箱</Typography.Text>
          </span>
        }
      >
        <div className={styles['email']}>
          <Typography.Text code>{profile.email}</Typography.Text>
          <Button type="primary" icon={<CopyOutlined />} onClick={handleCopy}>
            {copied ? '已复制' : '复制邮箱'}
          </Button>
        </div>
      </Card>

      {profile.socials.length > 0 ? (
        <Card
          variant="outlined"
          title={<Typography.Text strong>在这些地方也能找到我</Typography.Text>}
        >
          <div className={styles['socials']}>
            {profile.socials.map((social) => (
              <Button key={social.label} href={social.url} target="_blank" rel="noreferrer noopener">
                {social.label}
              </Button>
            ))}
          </div>
        </Card>
      ) : null}

      <Typography.Text className={styles['hint']} type="secondary">
        这一页的文字来自 src/content/profile.ts，改完刷新即可生效
      </Typography.Text>
    </div>
  );
}
