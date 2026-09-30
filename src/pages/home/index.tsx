import { ArrowRightOutlined } from '@ant-design/icons';
import { Empty, Tooltip, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import SearchFilter from './SearchFilter';
import { TagList } from '../../components/TagList';
import { ROUTES, SITE } from '../../constants/site';
import { profile } from '../../content/profile';
import { usePostStore } from '../../store/postStore';
import { PostTagLabelMap } from '../Blog/constant';
import styles from './index.module.scss';
import PostCard from '../../components/PostCard';
import { buildActivityDays } from './util';

export default function Home() {
  const posts = usePostStore((state) => state.posts);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const availableTags = useMemo(() => {
    const tagValues = [...new Set(posts.filter((post) => !post.draft).flatMap((post) => post.tags))];
    return tagValues.map((value) => ({ value, label: PostTagLabelMap[value]?.text ?? value }));
  }, [posts]);
  const matchingPosts = useMemo(
    () => posts.filter((post) => {
      if (post.draft) return false;
      if (selectedTags.length && !selectedTags.some((tag) => post.tags.includes(tag))) return false;
      return matchesFuzzy(`${post.title} ${post.summary} ${post.content}`, searchQuery);
    }),
    [posts, searchQuery, selectedTags],
  );
  const recent = useMemo(() => matchingPosts.slice(0, SITE.recentPostCount), [matchingPosts]);
  const activityDays = useMemo(() => buildActivityDays(recent), [recent]);

  return (
    <div className={styles['page']}>
             <SearchFilter
            tags={availableTags}
            selectedTags={selectedTags}
            query={searchQuery}
            onTagsChange={setSelectedTags}
            onQueryChange={setSearchQuery}
          />
          <div className={styles['section-divider']} />
      <div className={styles['content-grid']}>
        <section id="articles" className={styles['articles']}>
          {recent.length === 0 ? (
            <Empty description={selectedTags.length || searchQuery ? '没有匹配的文章' : '还没有文章，去博客页点「写文章」'} />
          ) : (
            <div>
              {recent.map((post) => <PostCard key={post.id} post={post} variant="row" />)}
            </div>
          )}
        </section>

        <aside className={styles['sidebar']}>
          <section className={styles['activity']} aria-labelledby="activity-title">
            <Typography.Title id="activity-title" className={styles['side-title']} level={5}>
              技术日志
            </Typography.Title>
            <div className={styles['calendar-caption']}>
              <span>近 18 周</span><span>{recent[0]?.createdAt.slice(0, 4) ?? '持续更新'}</span>
            </div>
            <div className={styles['activity-grid']} aria-label="文章发布日历">
              {activityDays.map((day) => (
                <Tooltip
                  key={day.key}
                  title={`${day.key}：${day.count} 篇文章`}
                  placement="top"
                  color='#fff'
                >
                  <span
                    className={styles[`activity-level-${day.level}`]}
                  />
                </Tooltip>
              ))}
            </div>
            <div id="focus" className={styles['focus']}>
              <span className={styles['focus-label']}>关注方向</span>
              <div className={styles['focus-tags']}><TagList tags={profile.focus} /></div>
            </div>
          </section>

          <section className={styles['updates']}>
            <Typography.Title className={styles['side-title']} level={5}>
              近期更新
            </Typography.Title>
            {recent.map((post) => (
              <Link className={styles['update-row']} key={post.id} to={ROUTES.post(post.id)}>
                <time dateTime={post.createdAt}>{post.createdAt}</time>
                <span>{post.title}</span>
              </Link>
            ))}
          </section>
        </aside>
      </div>
    </div>
  );
}

function matchesFuzzy(target: string, query: string) {
  const normalizedTarget = target.toLocaleLowerCase().replace(/\s+/g, '');
  const normalizedQuery = query.toLocaleLowerCase().replace(/\s+/g, '');
  let queryIndex = 0;

  for (const character of normalizedTarget) {
    if (character === normalizedQuery[queryIndex]) queryIndex += 1;
    if (queryIndex === normalizedQuery.length) return true;
  }

  return normalizedQuery.length === 0;
}
