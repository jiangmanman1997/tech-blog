/** 跨模块共用的类型放这里，避免组件从 store 或 content 里反向引类型 */

export interface Post {
  id: string;
  title: string;
  /** 列表页展示的摘要，一句话 */
  summary: string;
  /** 正文，Markdown */
  content: string;
  tags: string[];
  /** ISO 日期，如 '2024-05-01'，用于排序和展示 */
  createdAt: string;
  /** true = 草稿，博客页默认不展示 */
  draft?: boolean;
}

/** 编辑弹窗提交的表单值（其余字段由 store 补齐） */
export type PostDraft = Pick<Post, 'title' | 'summary' | 'content' | 'tags' | 'draft'>;
