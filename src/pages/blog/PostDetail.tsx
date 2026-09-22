import { ArrowLeftOutlined, EditOutlined, LockOutlined } from '@ant-design/icons';
import { Button, Divider, Empty, Flex, Space, Typography } from 'antd';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import BlogEditor from '../../components/BlogEditor';
import Markdown from '../../components/Markdown';
import TagList from '../../components/TagList';
import { ROUTES } from '../../constants/site';
import { usePostStore } from '../../store/postStore';
import { formatDate, readingMinutes } from '../../utils/format';

/** 文章详情：正文用轻量 Markdown 渲染 */
export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const post = usePostStore((state) => state.posts.find((item) => item.id === id));
  const [editorOpen, setEditorOpen] = useState(false);

  if (!post) {
    return (
      <Empty description="文章不存在，可能已经被删除">
        <Button type="primary" onClick={() => navigate(ROUTES.blog)}>
          回博客列表
        </Button>
      </Empty>
    );
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(ROUTES.blog)}
        style={{ paddingInline: 0, marginBottom: 8 }}
      >
        返回列表
      </Button>

      <Typography.Title level={2} style={{ marginTop: 0, marginBottom: 8 }}>
        {post.title}
      </Typography.Title>

      <Space size={8} wrap>
        <Typography.Text type="secondary">{formatDate(post.createdAt)}</Typography.Text>
        <Typography.Text type="secondary">约 {readingMinutes(post.content)} 分钟</Typography.Text>
        {post.draft ? (
          <Typography.Text type="warning">
            <LockOutlined /> 草稿
          </Typography.Text>
        ) : null}
      </Space>

      <Flex align="center" justify="space-between" gap={16} wrap style={{ marginTop: 12 }}>
        <Space size={0} wrap>
          <TagList tags={post.tags} />
        </Space>
        <Button type="text" size="small" icon={<EditOutlined />} onClick={() => setEditorOpen(true)}>
          编辑
        </Button>
      </Flex>

      <Divider style={{ marginBlock: 20 }} />

      <Markdown content={post.content} />

      <BlogEditor open={editorOpen} post={post} onClose={() => setEditorOpen(false)} />
    </div>
  );
}
