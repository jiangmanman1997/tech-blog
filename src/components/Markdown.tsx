import { renderMarkdown } from '../utils/markdown';

/**
 * 渲染 Markdown 正文。
 * renderMarkdown 已经做了转义（正文里的 HTML 只会当文字显示），所以这里用 innerHTML 是安全的。
 * 版式见 styles/global.css 的 .markdown-body：颜色引用 antd 的 CSS 变量，跟着主题走。
 */
export function Markdown({ content }: { content: string }) {
  return <div className="markdown-body" dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />;
}

export default Markdown;
