/**
 * 界面偏好 store：主题这种跨页面的状态放这里。
 * 首次访问跟随系统 prefers-color-scheme，之后以用户手动选择为准。
 */

import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { STORAGE_KEYS } from '../constants/site';

export type ThemeMode = 'light' | 'dark';

interface UiState {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const systemTheme = (): ThemeMode =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

/** 浏览器用 localStorage；非浏览器环境（跑测试）退化成内存存储 */
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

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      theme: systemTheme(),
      toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: STORAGE_KEYS.theme,
      version: 1,
      storage: createJSONStorage(createStorage),
    },
  ),
);
