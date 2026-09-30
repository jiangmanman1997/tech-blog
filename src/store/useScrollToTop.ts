/** 路由切换后回到页面顶部，否则从长文章里点进新页面还停在半空中 */

import { useEffect } from 'react';
import { useLocation } from 'react-router';

export const useScrollToTop = (): void => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
};
