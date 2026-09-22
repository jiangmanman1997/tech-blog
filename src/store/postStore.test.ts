import assert from 'node:assert/strict';
import { test } from 'node:test';

// store 的持久化在 node 环境会自动退化成内存存储（见 postStore 里的 createStorage）
const { usePostStore } = await import('./postStore.ts');

const draft = (title: string) => ({
  title,
  summary: `${title} 的摘要`,
  content: '## 正文',
  tags: ['React'],
  draft: false,
});

test('新增文章后进入列表，并按日期倒序排在前面', () => {
  const before = usePostStore.getState().posts.length;
  const created = usePostStore.getState().upsertPost(draft('新写的文章'));

  const { posts } = usePostStore.getState();
  assert.equal(posts.length, before + 1);
  assert.equal(posts[0].id, created.id);
  assert.equal(posts[0].title, '新写的文章');
  assert.match(posts[0].createdAt, /^\d{4}-\d{2}-\d{2}$/);
});

test('带 id 的提交是更新：不新增条目，标题被改掉，发布时间保持不变', () => {
  const created = usePostStore.getState().upsertPost(draft('待修改'));
  const count = usePostStore.getState().posts.length;

  usePostStore.getState().upsertPost(draft('改好了'), created.id);

  const { posts } = usePostStore.getState();
  assert.equal(posts.length, count);
  const updated = posts.find((post) => post.id === created.id);
  assert.equal(updated?.title, '改好了');
  assert.equal(updated?.createdAt, created.createdAt);
});

test('草稿标记能存下来，删除后从列表消失', () => {
  const created = usePostStore.getState().upsertPost({ ...draft('草稿'), draft: true });
  assert.equal(usePostStore.getState().posts.find((post) => post.id === created.id)?.draft, true);

  usePostStore.getState().removePost(created.id);
  assert.equal(
    usePostStore.getState().posts.some((post) => post.id === created.id),
    false,
  );
});

test('标题首尾空格被清理（表单里手滑多打的空格不该进数据）', () => {
  const created = usePostStore.getState().upsertPost(draft('  两端有空格  '));
  assert.equal(created.title, '两端有空格');
});
