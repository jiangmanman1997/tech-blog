import { useParams } from 'react-router';
import PostDetail from './PostDetail';
import PostList from './PostList';

/**
 * 博客页路由组件：`/blog` 出列表，`/blog/:id` 出详情。
 * 两个视图放同一个 chunk（页面代码只为博客页下载一次），Markdown 渲染也不用重复打包。
 */
export default function Blog() {
  const { id } = useParams<{ id: string }>();

  return id ? <PostDetail /> : <PostList />;
}
