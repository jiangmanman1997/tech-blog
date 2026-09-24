import { ArrowLeftOutlined, EditOutlined, LockOutlined } from '@ant-design/icons';
import { Button, Empty, Typography } from 'antd';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import BlogEditor from '../../../components/BlogEditor';
import Markdown from '../../../components/Markdown';
import TagList from '../../../components/TagList';
import { ROUTES } from '../../../constants/site';
import { usePostStore } from '../../../store/postStore';
import { formatDate, readingMinutes } from '../../../utils/format';
import styles from './index.module.scss';

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
    <article className={styles['article']}>
      <Button
        className={styles['back']}
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(ROUTES.blog)}
      >
        返回列表
      </Button>

      <Typography.Title className={styles['title']} level={2}>
        {post.title}
      </Typography.Title>

      <div className={styles['meta']}>
        <Typography.Text type="secondary">{formatDate(post.createdAt)}</Typography.Text>
        <Typography.Text type="secondary">约 {readingMinutes(post.content)} 分钟</Typography.Text>
        {post.draft ? (
          <Typography.Text type="warning">
            <LockOutlined /> 草稿
          </Typography.Text>
        ) : null}
      </div>

      <div className={styles['head']}>
        <div className={styles['tags']}>
          <TagList tags={post.tags} />
        </div>
        <Button type="text" size="small" icon={<EditOutlined />} onClick={() => setEditorOpen(true)}>
          编辑
        </Button>
      </div>

      <div className={styles['divider']} />

      <Markdown content={post.content} />

      <BlogEditor open={editorOpen} post={post} onClose={() => setEditorOpen(false)} />
    </article>
  );
}
