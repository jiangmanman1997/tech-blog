import assert from 'node:assert/strict';
import { test } from 'node:test';
import { excerpt, formatDate, initialOf, readingMinutes, sortByDateDesc } from './format.ts';

test('formatDate 规范化日期，无法解析时原样返回', () => {
  assert.equal(formatDate('2024-05-01'), '2024-05-01');
  assert.equal(formatDate('2024-05-01T10:00:00.000Z'), '2024-05-01');
  assert.equal(formatDate('不是日期'), '不是日期');
});

test('sortByDateDesc 新文章在前，同日期按标题稳定排序', () => {
  const sorted = sortByDateDesc([
    { title: 'B', createdAt: '2024-01-02' },
    { title: 'A', createdAt: '2024-01-02' },
    { title: 'C', createdAt: '2024-03-01' },
  ]);
  assert.deepEqual(
    sorted.map((item) => item.title),
    ['C', 'A', 'B'],
  );
});

test('sortByDateDesc 不改动原数组', () => {
  const input = [
    { title: 'A', createdAt: '2024-01-01' },
    { title: 'B', createdAt: '2024-02-01' },
  ];
  sortByDateDesc(input);
  assert.equal(input[0].title, 'A');
});

test('readingMinutes 最少 1 分钟', () => {
  assert.equal(readingMinutes('短'), 1);
  assert.ok(readingMinutes('中'.repeat(1200)) >= 3);
});

test('excerpt 去掉 Markdown 标记并截断', () => {
  assert.equal(excerpt('## 标题\n\n**正文**内容'), '标题 正文内容');
  assert.equal(excerpt('一二三四五', 3), '一二三…');
  assert.ok(!excerpt('```ts\nconst a = 1;\n```').includes('const'));
});

test('initialOf 中文取首字，英文取首字母大写，空值兜底', () => {
  assert.equal(initialOf('张三'), '张');
  assert.equal(initialOf('alice'), 'A');
  assert.equal(initialOf('   '), '?');
});
