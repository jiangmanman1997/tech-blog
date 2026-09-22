import { ArrowRightOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Col, Divider, Empty, Flex, Row, Space, Tag, Typography } from 'antd';
import { useMemo } from 'react';
import { Link } from 'react-router';
import PostCard from '../../components/PostCard';
import { ROUTES, SITE } from '../../constants/site';
import { profile } from '../../content/profile';
import { usePostStore } from '../../store/postStore';
import { initialOf } from '../../utils/format';

export default function Home() {
  const posts = usePostStore((state) => state.posts);
  // 筛选/切片在这里做：selector 里返回新数组会让 zustand 每次都判定为变化
  const recent = useMemo(
    () => posts.filter((post) => !post.draft).slice(0, SITE.recentPostCount),
    [posts],
  );

  return (
    <Flex vertical gap={40}>
      {/* 自我介绍：一张带边框的 Card，内容排布用 antd 的 Space / Typography */}
      <Card variant="outlined">
        <Flex gap={24} wrap align="center">
          <Avatar size={88} src={profile.avatar || undefined}>
            {initialOf(profile.name)}
          </Avatar>

          <Flex vertical gap={8} flex="1 1 320px" style={{ minWidth: 0 }}>
            <div>
              <Typography.Title level={2} style={{ margin: 0 }}>
                {profile.name}
              </Typography.Title>
              <Typography.Text type="secondary">
                {profile.title}
                {profile.location ? ` · ${profile.location}` : ''}
              </Typography.Text>
            </div>

            <Typography.Paragraph type="secondary" style={{ margin: 0, whiteSpace: 'pre-line' }}>
              {profile.bio}
            </Typography.Paragraph>

            {profile.focus.length > 0 ? (
              <Space size={[0, 8]} wrap>
                {profile.focus.map((item) => (
                  <Tag key={item} color="blue">
                    {item}
                  </Tag>
                ))}
              </Space>
            ) : null}

            <Space wrap>
              <Link to={ROUTES.blog}>
                <Button type="primary">看博客</Button>
              </Link>
              <Link to={ROUTES.about}>
                <Button>联系我</Button>
              </Link>
            </Space>
          </Flex>
        </Flex>
      </Card>

      {/* 最近文章 */}
      <div>
        <Flex align="baseline" justify="space-between" gap={16} wrap>
          <Typography.Title level={4} style={{ margin: 0 }}>
            最近文章
          </Typography.Title>
          <Link to={ROUTES.blog}>
            全部文章 <ArrowRightOutlined />
          </Link>
        </Flex>
        <Divider style={{ marginBlock: 16 }} />

        {recent.length === 0 ? (
          <Empty description="还没有文章，去博客页点「写文章」" />
        ) : (
          <Row gutter={[16, 16]}>
            {recent.map((post) => (
              <Col key={post.id} xs={24} md={12}>
                <PostCard post={post} />
              </Col>
            ))}
          </Row>
        )}
      </div>
    </Flex>
  );
}
