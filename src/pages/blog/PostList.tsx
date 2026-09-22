import { PlusOutlined } from '@ant-design/icons';
import { App, Button, Col, Empty, Flex, Row, Space, Switch, Typography } from 'antd';
import { useMemo, useState } from 'react';
import BlogEditor from '../../components/BlogEditor';
import PostCard from '../../components/PostCard';
import { usePostStore } from '../../store/postStore';
import type { Post } from '../../types';

/** 博客页：全部文章列表，每个 item 一张带边框的卡片；作者可在这里新增/编辑/删除 */
export default function PostList() {
  const { message } = App.useApp();
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
    <Flex vertical gap={16}>
      <Flex align="center" justify="space-between" gap={16} wrap>
        <Space align="baseline" size={8}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            博客
          </Typography.Title>
          <Typography.Text type="secondary">
            共 {posts.length} 篇{showDrafts ? `（含 ${draftCount} 篇草稿）` : ''}
          </Typography.Text>
        </Space>

        <Space size={16} wrap>
          {draftCount > 0 ? (
            <Space size={8}>
              <Switch size="small" checked={showDrafts} onChange={setShowDrafts} />
              <Typography.Text type="secondary">显示草稿</Typography.Text>
            </Space>
          ) : null}
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            写文章
          </Button>
        </Space>
      </Flex>

      {visible.length === 0 ? (
        <Empty description="还没有文章">
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            写第一篇
          </Button>
        </Empty>
      ) : (
        <Row gutter={[16, 16]}>
          {visible.map((post) => (
            <Col key={post.id} xs={24} md={12}>
              <PostCard post={post} onEdit={openEdit} onDelete={handleDelete} />
            </Col>
          ))}
        </Row>
      )}

      <BlogEditor
        open={editorOpen}
        post={editing}
        onClose={() => {
          setEditorOpen(false);
          setEditing(undefined);
        }}
      />
    </Flex>
  );
}
