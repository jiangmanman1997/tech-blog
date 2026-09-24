import { EditOutlined, LockOutlined, ReadOutlined } from '@ant-design/icons';
import { Button, Card, Popconfirm, Space, Typography } from 'antd';
import { Link, useNavigate } from 'react-router';
import { ROUTES } from '../../constants/site';
import type { Post } from '../../types';
import { formatDate, readingMinutes } from '../../utils/format';
import { TagList } from '../TagList';
import styles from './index.module.scss';

interface PostCardProps {
  post: Post;
  isAuth?:boolean;
  /** 传了才显示「编辑」，用于博客页的作者操作 */
  onEdit?: (post: Post) => void;
  /** 传了才显示「删除」 */
  onDelete?: (post: Post) => void;
}

/**
 * 文章卡片：一个 item 一张带边框的 antd Card（variant="outlined"），
 * 卡片背景、边框、内边距、按钮样式全部用 antd 默认值，这里只管等高和间距。
 */
export function PostCard({ post,isAuth=false, onEdit, onDelete }: PostCardProps) {
  const navigate = useNavigate();

  return (
    <Card className={styles['card']} variant="outlined">
      <Typography.Title className={styles['title']} level={4}>
        <Link to={ROUTES.post(post.id)}>{post.title}</Link>
      </Typography.Title>

      <Space className={styles['meta']} size={8} wrap>
        <Typography.Text type="secondary">{formatDate(post.createdAt)}</Typography.Text>
        {isAuth && post.draft ? (
          <Typography.Text type="warning">
            <LockOutlined /> 草稿
          </Typography.Text>
        ) : null}
      </Space>

      {post.summary ? (
        <Typography.Paragraph className={styles['summary']} type="secondary">
          {post.summary}
        </Typography.Paragraph>
      ) : null}

      <div className={styles['tags']}>
        <TagList tags={post.tags} />
      </div>
      <div className={styles['actions']} onClick={()=>{
        // 跳转到detail页面
         navigate(ROUTES.post(post.id));
      }}>
      
        {isAuth && onEdit ? (
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => onEdit(post)}>
            编辑
          </Button>
        ) : null}
        {isAuth && onDelete ? (
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
      </div>
    </Card>
  );
}

export default PostCard;
