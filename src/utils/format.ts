/** 日期与文本的公共方法，页面里不要各写一份 */

/** '2024-05-01' 或 ISO 串 -> '2024-05-01'；无法解析时原样返回 */
export const formatDate = (value: string): string => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString().slice(0, 10);
};

/** 毫秒时间戳 -> '2024-05-01' */
export const timestampToDate = (timestamp: number): string =>
  new Date(timestamp).toISOString().slice(0, 10);

/** 按发布时间倒序，新的在前；同日期按标题稳定排序，避免每次渲染顺序抖动 */
export const sortByDateDesc = <T extends { createdAt: string; title: string }>(items: T[]): T[] =>
  [...items].sort(
    (a, b) => b.createdAt.localeCompare(a.createdAt) || a.title.localeCompare(b.title),
  );

/** 中文按字数、英文按词数粗算阅读时长，最少 1 分钟 */
export const readingMinutes = (content: string): number => {
  const cjk = content.match(/[\u4e00-\u9fa5]/g)?.length ?? 0;
  const words = content.replace(/[\u4e00-\u9fa5]/g, ' ').match(/[A-Za-z0-9]+/g)?.length ?? 0;
  return Math.max(1, Math.round(cjk / 400 + words / 200));
};

/** 从正文里截一段纯文本摘要，用于用户没填 summary 时兜底 */
export const excerpt = (content: string, max = 80): string => {
  const text = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*`\-[\]()!]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
};

/** 取名字首字做兜底头像，中文取第一个字，英文取首字母 */
export const initialOf = (name: string): string => name.trim().charAt(0).toUpperCase() || '?';
