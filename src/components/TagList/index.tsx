import { SITE } from '../../constants/site';
import styles from './index.module.scss';

const tagIconColors: Record<string, string> = {
  geekblue: '#2f54eb',
  blue: '#1677ff',
  cyan: '#13c2c2',
  purple: '#722ed1',
  magenta: '#eb2f96',
  orange: '#fa8c16',
  volcano: '#fa541c',
  green: '#52c41a',
};

export interface TagItem {
  text: string;
  icon?: string;
  value?: string;
}

/** 标签统一走这里，颜色表在 constants/site.ts */
export function TagList({
  tags,
}: {
  tags: TagItem[];
}) {
  if (!tags.length) return null;

  return (
    <>
      {tags.map((tag) => (
        <span className={styles['tag']} key={tag.value ?? tag.text}>
          {tag.icon ? (
            <i
              className={`iconfont ${tag.icon}`}
              style={{ color: tagIconColors[SITE.tagColors[tag.text] ?? SITE.tagFallbackColor] ?? 'currentColor' }}
            />
          ) : null}
          <span className={styles['text']}>{tag.text}</span>
        </span>
      ))}
    </>
  );
}

export default TagList;
