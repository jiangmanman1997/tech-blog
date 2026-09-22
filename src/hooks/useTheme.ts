/** 把主题写到 <body data-theme>，让 global.css 的变量生效 */

import { useEffect } from 'react';
import { useUiStore, type ThemeMode } from '../store/uiStore';

export const useTheme = (): { theme: ThemeMode; toggleTheme: () => void } => {
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);

  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  return { theme, toggleTheme };
};
