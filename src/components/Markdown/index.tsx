import { useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import styles from './index.module.scss';

// 从 hast 节点里提取原始代码文本
// 结构：pre > code > text（rehype-highlight 处理后 code 下是 span 数组）
function getCodeFromNode(node: unknown): string {
  const pre = node as
    | { children?: Array<{ children?: Array<{ value?: string } | { children?: Array<{ value?: string }> }> }> }
    | undefined;

  const codeNode = pre?.children?.[0];
  if (!codeNode?.children) return '';

  const parts: string[] = [];
  for (const child of codeNode.children) {
    // 情况 1：未被高亮，直接是文本节点 { value }
    if ('value' in child && typeof child.value === 'string') {
      parts.push(child.value);
    }
    // 情况 2：被高亮拆成 span，{ children: [{ value }] }
    else if ('children' in child && Array.isArray(child.children)) {
      for (const grandChild of child.children) {
        if ('value' in grandChild && typeof grandChild.value === 'string') {
          parts.push(grandChild.value);
        }
      }
    }
  }
  return parts.join('');
}

const components: Components = {
  pre({ node, children, ...props }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
      // 优先从 node 取原始文本，取不到再兜底
      const raw = getCodeFromNode(node);
      const codeText = (raw || extractTextFallback(children)).replace(/\n$/, '');

      try {
        await navigator.clipboard.writeText(codeText);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch (err) {
        console.error('复制失败:', err);
      }
    };

    return (
      <div className={styles['code-block-wrapper']}>
        <a  className={styles['copy-button']} onClick={handleCopy}>
           {copied ? (
            <i className="iconfont icon-hei" style={{ fontSize: 16 }} aria-hidden="true" />
          ) : (
            <i className="iconfont icon-fuzhi" style={{ fontSize: 16 }} aria-hidden="true" />
          )}
          复制
        </a>
        <pre {...props}>{children}</pre>
      </div>
    );
  },
};

// 兜底：万一 node 结构变了，从 React children 递归提取
function extractTextFallback(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractTextFallback).join('');
  if (typeof node === 'object' && 'props' in node) {
    return extractTextFallback(
      (node as { props: { children?: React.ReactNode } }).props.children
    );
  }
  return '';
}

export default function Markdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
}