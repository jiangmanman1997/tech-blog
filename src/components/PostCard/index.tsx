import { EditOutlined, LockOutlined, ReadOutlined } from '@ant-design/icons';
import { Button, Card, Popconfirm, Space, Typography } from 'antd';
import { Link, useNavigate } from 'react-router';
import { ROUTES } from '../../constants/site';
import type { Post } from '../../types';
import { formatDate } from '../../utils/format';
import { TagList } from '../TagList';
import styles from './index.module.scss';
import { PostTagLabelMap } from '../../pages/Blog/constant';
import { getExcerpt } from '../../pages/Home/util';

interface PostCardProps {
  post: Post;
  variant?: 'card' | 'row';
  isAuth?: boolean;
  /** 传了才显示「编辑」，用于博客页的作者操作 */
  onEdit?: (post: Post) => void;
  /** 传了才显示「删除」 */
  onDelete?: (post: Post) => void;
}

/**
 * 文章卡片：一个 item 一张带边框的 antd Card（variant="outlined"），
 * 卡片背景、边框、内边距、按钮样式全部用 antd 默认值，这里只管等高和间距。
 */
export function PostCard({ post, isAuth = false, onEdit, onDelete }: PostCardProps) {

  return (
    <article className={styles['row']}>
      <div className={styles['row-container']}>
        <div className={styles['row-left-text']}>
          <Link className={styles['row-title']} to={ROUTES.post(post.id)}>
            {post.title}
          </Link>
          <div className={styles['row-meta']}>
            <time className={styles['row-date']} dateTime={post.createdAt}>
              {post.createdAt}
            </time>
            {isAuth && post.draft ? (
              <Typography.Text type="warning">
                <LockOutlined /> 草稿
              </Typography.Text>
            ) : null}
          </div>
          {post?.content ? <p className={styles['row-summary']}>{getExcerpt(post.content)}</p> : null}
        </div>
{post?.coverImg?<div className={styles['row-cover']} style={{backgroundImage:`url(${post.coverImg})`}}/>:null}
      </div>
      <div className={styles['row-tags']}>
        <TagList tags={post.tags?.map((tag) => PostTagLabelMap?.[tag])} />
      </div>
      {isAuth && (onEdit || onDelete) ? (
        <div className={styles['actions']}>
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
        </div>
      ) : null}
    </article>
  );
}

export default PostCard;
