import { PlusOutlined } from '@ant-design/icons';
import { App, Button, Empty, Switch, Typography } from 'antd';
import { useMemo, useState } from 'react';
import BlogEditor from '../../../components/BlogEditor';
import PostCard from '../../../components/PostCard';
import { usePostStore } from '../../../store/postStore';
import type { Post } from '../../../types';
import styles from './index.module.scss';

/** 博客页：全部文章列表，每个 item 一张带边框的卡片；作者可在这里新增/编辑/删除 */
export default function PostList() {
  const { message } = App.useApp();
  const isAuth = false; // TODO: 这里先写死，后续加登录后再改
  const posts = usePostStore((state) => state.posts);
  const showDrafts = usePostStore((state) => state.showDrafts);
  const setShowDrafts = usePostStore((state) => state.setShowDrafts);
  const removePost = usePostStore((state) => state.removePost);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Post | undefined>(undefined);

  const visible = useMemo(
    () => (showDrafts ? posts : posts.filter((post) => !post.draft)),
    [posts, showDrafts],
  );
  const draftCount = posts.filter((post) => post.draft).length;

  const openCreate = () => {
    setEditing(undefined);
    setEditorOpen(true);
  };

  const openEdit = (post: Post) => {
    setEditing(post);
    setEditorOpen(true);
  };

  const handleDelete = (post: Post) => {
    removePost(post.id);
    message.success(`已删除《${post.title}》`);
  };

  return (
    <div className={styles['page']}>
      <div className={styles['head']}>
        <div className={styles['title-group']}>
          <Typography.Title className={styles['title']} level={3}>
            博客
          </Typography.Title>
          <Typography.Text type="secondary">
            共 {posts.length} 篇{showDrafts ? `（含 ${draftCount} 篇草稿）` : ''}
          </Typography.Text>
        </div>

        <div className={styles['actions']}>
          {isAuth && draftCount > 0 ? (
            <div className={styles['draft-switch']}>
              <Switch size="small" checked={showDrafts} onChange={setShowDrafts} />
              <Typography.Text type="secondary">显示草稿</Typography.Text>
            </div>
          ) : null}
          {isAuth && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              写文章
            </Button>
          )}
        </div>
      </div>

      {visible.length === 0 ? (
        <Empty description="还没有文章">
          {isAuth && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              写第一篇
            </Button>
          )}
        </Empty>
      ) : (
        <div className={styles['grid']}>
          {visible.map((post) => (
            <PostCard key={post.id} post={post} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <BlogEditor
        open={editorOpen}
        post={editing}
        onClose={() => {
          setEditorOpen(false);
          setEditing(undefined);
        }}
      />
    </div>
  );
}
