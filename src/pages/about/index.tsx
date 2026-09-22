import { CopyOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { App as AntdApp, Avatar, Button, Card, Flex, Space, Tag, Typography } from 'antd';
import { useState } from 'react';
import { profile } from '../../content/profile';
import { copyText } from '../../utils/clipboard';
import { initialOf } from '../../utils/format';

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
    <Flex vertical gap={16} style={{ maxWidth: 760 }}>
      <Card variant="outlined">
        <Flex gap={20} align="center" wrap>
          <Avatar size={72} src={profile.avatar || undefined}>
            {initialOf(profile.name)}
          </Avatar>
          <div>
            <Typography.Title level={3} style={{ margin: 0 }}>
              {profile.name}
            </Typography.Title>
            <Typography.Text type="secondary">
              {profile.title}
              {profile.location ? ` · ${profile.location}` : ''}
            </Typography.Text>
          </div>
        </Flex>
      </Card>

      <Card variant="outlined" title={<Typography.Text strong>关于我</Typography.Text>}>
        {profile.aboutParagraphs.map((paragraph) => (
          <Typography.Paragraph key={paragraph} type="secondary" style={{ marginBottom: 12 }}>
            {paragraph}
          </Typography.Paragraph>
        ))}
      </Card>

      {profile.focus.length > 0 ? (
        <Card
          variant="outlined"
          title={
            <Space size={8}>
              <UserOutlined />
              <Typography.Text strong>关注方向</Typography.Text>
            </Space>
          }
        >
          <Space size={[0, 8]} wrap>
            {profile.focus.map((item) => (
              <Tag key={item} color="blue">
                {item}
              </Tag>
            ))}
          </Space>
        </Card>
      ) : null}

      <Card
        variant="outlined"
        title={
          <Space size={8}>
            <MailOutlined />
            <Typography.Text strong>邮箱</Typography.Text>
          </Space>
        }
      >
        <Space size={12} wrap>
          <Typography.Text code copyable={false}>
            {profile.email}
          </Typography.Text>
          <Button type="primary" icon={<CopyOutlined />} onClick={handleCopy}>
            {copied ? '已复制' : '复制邮箱'}
          </Button>
        </Space>
      </Card>

      {profile.socials.length > 0 ? (
        <Card variant="outlined" title={<Typography.Text strong>在这些地方也能找到我</Typography.Text>}>
          <Space size={12} wrap>
            {profile.socials.map((social) => (
              <Button key={social.label} href={social.url} target="_blank" rel="noreferrer noopener">
                {social.label}
              </Button>
            ))}
          </Space>
        </Card>
      ) : null}

      <Typography.Text type="secondary" style={{ fontSize: 13 }}>
        这一页的文字来自 src/content/profile.ts，改完刷新即可生效
      </Typography.Text>
    </Flex>
  );
}
