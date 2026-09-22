/**
 * 文章 store：多个页面共享的数据放这里（DESIGN.md：跨页面共享用 zustand）。
 * 持久化到 localStorage，刷新不丢；首次打开用 src/content/posts.ts 的种子数据。
 *
 * 这个文件的相对导入带 .ts 后缀：`npm test` 用 node 直接跑 TS，Node 的 ESM 解析不会补扩展名。
 */

import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { seedPosts } from '../content/posts.ts';
import { STORAGE_KEYS } from '../constants/site.ts';
import type { Post, PostDraft } from '../types/index.ts';
import { sortByDateDesc, timestampToDate } from '../utils/format.ts';

export type { PostDraft };

/** 浏览器用 localStorage；跑 node 测试时没有这个全局对象，退化成内存存储 */
const createStorage = (): StateStorage => {
  const memory = new Map<string, string>();
  return {
    getItem: (key) => (typeof localStorage === 'undefined' ? memory.get(key) ?? null : localStorage.getItem(key)),
    setItem: (key, value) => {
      if (typeof localStorage === 'undefined') memory.set(key, value);
      else localStorage.setItem(key, value);
    },
    removeItem: (key) => {
      if (typeof localStorage === 'undefined') memory.delete(key);
      else localStorage.removeItem(key);
    },
  };
};

interface PostState {
  posts: Post[];
  /** 博客页是否连草稿一起展示（只在内存里，不持久化） */
  showDrafts: boolean;
  setShowDrafts: (show: boolean) => void;
  /** 有 id 就更新，没有就新增 */
  upsertPost: (draft: PostDraft, id?: string) => Post;
  removePost: (id: string) => void;
}

const createId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const usePostStore = create<PostState>()(
  persist(
    (set, get) => ({
      posts: sortByDateDesc(seedPosts),
      showDrafts: false,

      setShowDrafts: (show) => set({ showDrafts: show }),

      upsertPost: (draft, id) => {
        const existing = id ? get().posts.find((post) => post.id === id) : undefined;
        const now = timestampToDate(Date.now());
        const post: Post = {
          id: existing?.id ?? id ?? createId(),
          title: draft.title.trim(),
          summary: draft.summary.trim(),
          content: draft.content,
          tags: draft.tags,
          draft: draft.draft,
          // 编辑不改变发布时间，只保证新增时有值
          createdAt: existing?.createdAt ?? now,
        };
        const rest = get().posts.filter((item) => item.id !== post.id);
        set({ posts: sortByDateDesc([...rest, post]) });
        return post;
      },

      removePost: (id) => set({ posts: get().posts.filter((post) => post.id !== id) }),
    }),
    {
      name: STORAGE_KEYS.posts,
      version: 1,
      storage: createJSONStorage(createStorage),
      // showDrafts 是临时的界面开关，不入库
      partialize: (state) => ({ posts: state.posts }),
    },
  ),
);

export const selectPostById = (id: string | undefined) => (state: PostState): Post | undefined =>
  state.posts.find((post) => post.id === id);
