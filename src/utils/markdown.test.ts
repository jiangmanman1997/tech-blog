import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderMarkdown } from './markdown.ts';

test('二级/三级标题按层级渲染', () => {
  assert.equal(renderMarkdown('## 小标题'), '<h2>小标题</h2>');
  assert.equal(renderMarkdown('### 更小'), '<h3>更小</h3>');
  // 一级标题降级成 h2，正文标题层级从导航栏之下开始
  assert.equal(renderMarkdown('# 一级'), '<h2>一级</h2>');
});

test('正文里的 HTML 被转义，不会变成标签', () => {
  const html = renderMarkdown('<script>alert(1)</script>');
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;script&gt;'));
});

test('代码块原样保留且被转义', () => {
  const html = renderMarkdown(['```ts', 'const a = 1 < 2;', '```'].join('\n'));
  assert.equal(html, '<pre data-lang="ts"><code>const a = 1 &lt; 2;</code></pre>');
});

test('未闭合的代码块按代码处理到最后一行，不会丢掉内容', () => {
  const html = renderMarkdown(['```', 'a', '', '段落'].join('\n'));
  assert.equal(html, '<pre><code>a\n\n段落</code></pre>');
});

test('行内代码里的星号不被当成加粗', () => {
  const html = renderMarkdown('用 `a * b` 乘一下，**重点**在这');
  assert.ok(html.includes('<code>a * b</code>'));
  assert.ok(html.includes('<strong>重点</strong>'));
});

test('无序列表与有序列表分别包 ul / ol', () => {
  assert.equal(renderMarkdown('- 一\n- 二'), '<ul><li>一</li><li>二</li></ul>');
  assert.equal(renderMarkdown('1. 一\n2. 二'), '<ol><li>一</li><li>二</li></ol>');
  // 类型切换时必须断开成两个列表
  assert.equal(renderMarkdown('- 一\n1. 二'), '<ul><li>一</li></ul>\n<ol><li>二</li></ol>');
});

test('引用块:连续引用行合成一段，空行分段', () => {
  const html = renderMarkdown('> 第一行\n> 第二行\n>\n> 另一段');
  assert.ok(html.startsWith('<blockquote>'));
  assert.ok(html.includes('<p>第一行 第二行</p>'));
  assert.ok(html.includes('<p>另一段</p>'));
});

test('链接只放行 http/https/相对路径', () => {
  const ok = renderMarkdown('[站点](https://example.com)');
  assert.ok(ok.includes('href="https://example.com"'));
  assert.ok(ok.includes('target="_blank"'));

  const relative = renderMarkdown('[博客](/blog)');
  assert.ok(relative.includes('href="/blog"'));
  assert.ok(!relative.includes('target="_blank"'));

  // javascript: 链接退化成纯文本，不会渲染成 a 标签
  const bad = renderMarkdown('[点我](javascript:alert(1))');
  assert.ok(!bad.includes('<a '));
  assert.ok(bad.includes('javascript:alert(1)'));
});

test('相邻的加粗与斜体各自成对，不互相吞并', () => {
  assert.equal(renderMarkdown('**a**b**c***d*'), '<p><strong>a</strong>b<strong>c</strong><em>d</em></p>');
});

test('连续非空行合并成同一段，空行分段', () => {
  assert.equal(renderMarkdown('第一行\n第二行\n\n第三行'), '<p>第一行 第二行</p>\n<p>第三行</p>');
});

test('分隔线渲染成 hr', () => {
  assert.equal(renderMarkdown('---'), '<hr />');
});
