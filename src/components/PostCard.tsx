import { EditOutlined, LockOutlined, ReadOutlined } from '@ant-design/icons';
import { Button, Card, Popconfirm, Space, Typography } from 'antd';
import { Link } from 'react-router';
import { ROUTES } from '../constants/site';
import type { Post } from '../types';
import { formatDate, readingMinutes } from '../utils/format';
import { TagList } from './TagList';

interface PostCardProps {
  post: Post;
  /** 传了才显示「编辑」，用于博客页的作者操作 */
  onEdit?: (post: Post) => void;
  /** 传了才显示「删除」 */
  onDelete?: (post: Post) => void;
}

/**
 * 文章卡片：一个 item 一张带边框的 antd Card（variant="outlined"），
 * 卡片背景、边框、内边距、按钮样式全部用 antd 默认值，不覆盖颜色。
 */
export function PostCard({ post, onEdit, onDelete }: PostCardProps) {
  return (
    <Card variant="outlined" style={{ height: '100%' }}>
      <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 8 }}>
        <Link to={ROUTES.post(post.id)}>{post.title}</Link>
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

      {post.summary ? (
        <Typography.Paragraph type="secondary" style={{ marginTop: 12, marginBottom: 0 }}>
          {post.summary}
        </Typography.Paragraph>
      ) : null}

      <Space size={0} wrap style={{ marginTop: 16 }}>
        <TagList tags={post.tags} />
      </Space>

      <Space size={4} wrap style={{ marginTop: 16 }}>
        <Link to={ROUTES.post(post.id)}>
          <Button type="link" size="small" icon={<ReadOutlined />} style={{ paddingInline: 0 }}>
            阅读全文
          </Button>
        </Link>
        {onEdit ? (
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => onEdit(post)}>
            编辑
          </Button>
        ) : null}
        {onDelete ? (
          <Popconfirm
            title="删除这篇文章？"
            description="删除后无法恢复（内容存在浏览器本地）。"
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={() => onDelete(post)}
          >
            <Button type="text" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        ) : null}
      </Space>
    </Card>
  );
}

export default PostCard;
