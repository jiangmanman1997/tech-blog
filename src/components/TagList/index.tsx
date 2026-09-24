import { Tag } from 'antd';
import { SITE } from '../../constants/site';
import styles from './index.module.scss';

/** 标签统一走这里，颜色表在 constants/site.ts */
export function TagList({ tags }: { tags: string[] }) {
  if (!tags.length) return null;

  return (
    <>
      {tags.map((tag) => (
        <Tag
          key={tag}
          className={styles['tag']}
          color={SITE.tagColors[tag] ?? SITE.tagFallbackColor}
        >
          {tag}
        </Tag>
      ))}
    </>
  );
}

export default TagList;
