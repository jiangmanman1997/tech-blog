/**
 * 轻量 Markdown 渲染：不引第三方依赖，够个人博客用。
 *
 * 支持：##/### 标题、**加粗**、*斜体*、`行内代码`、[链接](url)、
 *       - / 1. 列表、> 引用、``` 代码块、--- 分隔线。
 *
 * 安全：所有文本先做 HTML 转义，再把受控的标签拼回去，
 *      因此正文里写 <script> 只会被当成普通文字显示；链接只放行 http/https/相对路径。
 * 不支持：表格、图片、嵌套列表。需要时再引 markdown-it 之类。
 */

const TOKEN_PREFIX = '\u0000code';

const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const escapeAttr = (text: string): string => escapeHtml(text).replace(/`/g, '&#96;');

/** 只允许 http/https/mailto/页内相对链接，挡掉 javascript: data: 之类 */
const safeHref = (href: string): string | null => {
  const url = href.trim();
  if (/^(https?:\/\/|mailto:|\/|#)/i.test(url)) return url;
  return null;
};

/** 行内语法：先抽出代码片段占位，避免里面的 * 和 _ 被当成标记 */
const renderInline = (raw: string): string => {
  const codes: string[] = [];
  let text = raw.replace(/`([^`]+)`/g, (_match, code: string) => {
    codes.push(`<code>${escapeHtml(code)}</code>`);
    return `${TOKEN_PREFIX}${codes.length - 1}\u0000`;
  });

  text = escapeHtml(text);

  // 链接：文本和地址都来自同一段用户输入，地址不合法就退化成纯文本
  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label: string, href: string) => {
    const url = safeHref(href.replace(/&amp;/g, '&'));
    if (!url) return match;
    const external = /^https?:/i.test(url);
    const attrs = external ? ' target="_blank" rel="noreferrer noopener"' : '';
    return `<a href="${escapeAttr(url)}"${attrs}>${label}</a>`;
  });

  // **加粗** 必须在 *斜体* 之前处理
  text = text.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/(^|[^*\w])\*([^*\n]+)\*(?=[^*\w]|$)/g, '$1<em>$2</em>');

  return text.replace(
    new RegExp(`${TOKEN_PREFIX}(\\d+)\\u0000`, 'g'),
    (_match, index: string) => codes[Number(index)] ?? '',
  );
};

/** 把正文按空行分段，逐个块渲染成 HTML */
export const renderMarkdown = (markdown: string): string => {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const html: string[] = [];
  // list: 连续的同类列表行先收集起来，最后一次性包 <ul>/<ol>
  let list: { ordered: boolean; items: string[] } | null = null;
  // quote: 连续引用行合并成一个 <blockquote>，内部按段落渲染
  let quote: string[] = [];

  const flushList = () => {
    if (!list) return;
    const tag = list.ordered ? 'ol' : 'ul';
    html.push(`<${tag}>${list.items.map((item) => `<li>${item}</li>`).join('')}</${tag}>`);
    list = null;
  };

  const flushQuote = () => {
    if (!quote.length) return;
    // 引用行之间用空格连接（源文件换行只是排版），空行另起一段
    const paragraphs: string[][] = [[]];
    for (const line of quote) {
      if (line.trim()) paragraphs[paragraphs.length - 1].push(line.trim());
      else if (paragraphs[paragraphs.length - 1].length) paragraphs.push([]);
    }
    const inner = paragraphs
      .filter((lines) => lines.length)
      .map((lines) => `<p>${renderInline(lines.join(' '))}</p>`)
      .join('');
    html.push(`<blockquote>${inner}</blockquote>`);
    quote = [];
  };

  const flushAll = () => {
    flushList();
    flushQuote();
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();

    // 代码块：找配对的 ``` 结束行，内容原样保留（只转义）
    const fence = trimmed.match(/^```(\w*)\s*$/);
    if (fence) {
      flushAll();
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !/^```\s*$/.test(lines[i].trim())) {
        body.push(lines[i]);
        i += 1;
      }
      if (i >= lines.length) i -= 1; // 没写结束的 ``` 时不要把最后一行吃掉
      const lang = fence[1] ? ` data-lang="${escapeAttr(fence[1])}"` : '';
      html.push(`<pre${lang}><code>${escapeHtml(body.join('\n'))}</code></pre>`);
      continue;
    }

    if (!trimmed) {
      flushAll();
      continue;
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      flushAll();
      const level = Math.min(4, Math.max(2, heading[1].length));
      html.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushAll();
      html.push('<hr />');
      continue;
    }

    const quoteLine = trimmed.match(/^>\s?(.*)$/);
    if (quoteLine) {
      flushList();
      quote.push(quoteLine[1]);
      continue;
    }

    const unordered = trimmed.match(/^[-*+]\s+(.*)$/);
    const ordered = trimmed.match(/^\d+[.)]\s+(.*)$/);
    if (unordered || ordered) {
      flushQuote();
      const isOrdered = Boolean(ordered);
      if (list && list.ordered !== isOrdered) flushList();
      list ??= { ordered: isOrdered, items: [] };
      list.items.push(renderInline((unordered?.[1] ?? ordered?.[1] ?? '').trim()));
      continue;
    }

    // 普通段落：连续的非空行合并成一行，方便在源文件里手动折行
    flushAll();
    const paragraph: string[] = [trimmed];
    while (i + 1 < lines.length) {
      const next = lines[i + 1].trim();
      if (!next || /^(#{1,4}\s|>|[-*+]\s|\d+[.)]\s|```)/.test(next)) break;
      paragraph.push(next);
      i += 1;
    }
    html.push(`<p>${renderInline(paragraph.join(' '))}</p>`);
  }

  flushAll();
  return html.join('\n');
};
