/**
 * 创建活动时间
 * @param posts 文章列表
 * @returns 
 */
export function buildActivityDays(posts: { createdAt: string }[]) {
  const counts = new Map<string, number>();
  const normalizeDate = (value: string) => {
    const [year, month, day] = value.split('-');
    if (!year || !month || !day) return value;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  posts.forEach(({ createdAt }) => {
    const key = normalizeDate(createdAt);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysSinceMonday = (today.getDay() + 6) % 7;
  const start = new Date(today);
  start.setDate(start.getDate() - 17 * 7 - daysSinceMonday);
  const dayCount = 17 * 7 + daysSinceMonday + 1;

  return Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const count = counts.get(key) ?? 0;
    return { key, count, level: count === 0 ? 0 : Math.min(count, 4) };
  });
  
}

/**
 * 获得简介
 * @param content md文本
 * @param length 长度
 * @returns 纯文本
 */
export function getExcerpt(content: string, length = 80) {
  const text = content
    .replace(/```[\s\S]*?```/g, '')      // 去代码块
    .replace(/!\[.*?\]\(.*?\)/g, '')      // 去图片
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')   // 链接保留文字
    .replace(/[#>*`_~-]/g, '')            // 去 markdown 符号
    .replace(/\s+/g, ' ')
    .trim();
  return text;
}