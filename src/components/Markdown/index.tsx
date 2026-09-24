import { renderMarkdown } from '../../utils/markdown';
import styles from './index.module.scss';

/**
 * 渲染 Markdown 正文。
 * renderMarkdown 已经做了转义（正文里的 HTML 只会当文字显示），所以这里用 innerHTML 是安全的。
 * 版式在 index.module.scss：颜色引用 antd 的 CSS 变量，跟着主题走。
 */
export function Markdown({ content }: { content: string }) {
  return (
    <div
      className={styles['markdown-body']}
      data-testid="markdown-body"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
}

export default Markdown;
