import { ArrowRightOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Empty, Space, Tag, Typography } from 'antd';
import { useMemo } from 'react';
import { Link } from 'react-router';
import PostCard from '../../components/PostCard';
import { ROUTES, SITE } from '../../constants/site';
import { profile } from '../../content/profile';
import { usePostStore } from '../../store/postStore';
import { initialOf } from '../../utils/format';
import styles from './index.module.scss';

export default function Home() {
  const posts = usePostStore((state) => state.posts);
  // 筛选/切片在这里做：selector 里返回新数组会让 zustand 每次都判定为变化
  const recent = useMemo(
    () => posts.filter((post) => !post.draft).slice(0, SITE.recentPostCount),
    [posts],
  );

  return (
    <div className={styles['page']}>
      {/* 自我介绍：一张带边框的 Card，卡片样式全部来自 antd */}
      <Card variant="outlined">
        <div className={styles['hero']}>
          <Avatar size={88} src={profile.avatar || undefined}>
            {initialOf(profile.name)}
          </Avatar>

          <div className={styles['hero-body']}>
            <div>
              <Typography.Title className={styles['hero-name']} level={2}>
                {profile.name}
              </Typography.Title>
              <Typography.Text className={styles['hero-subtitle']} type="secondary">
                {profile.title}
                {profile.location ? ` · ${profile.location}` : ''}
              </Typography.Text>
            </div>

            <Typography.Paragraph className={styles['hero-bio']} type="secondary">
              {profile.bio}
            </Typography.Paragraph>

            {profile.focus.length > 0 ? (
              <div className={styles['hero-focus']}>
                {profile.focus.map((item) => (
                  <Tag key={item} color="blue">
                    {item}
                  </Tag>
                ))}
              </div>
            ) : null}

            <div className={styles['hero-actions']}>
              <Link to={ROUTES.blog}>
                <Button type="primary">看博客</Button>
              </Link>
              <Link to={ROUTES.about}>
                <Button>联系我</Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* 最近文章 */}
      <section>
        <div className={styles['section-head']}>
          <Typography.Title className={styles['section-title']} level={4}>
            最近文章
          </Typography.Title>
          <Link to={ROUTES.blog}>
            全部文章 <ArrowRightOutlined />
          </Link>
        </div>
        <div className={styles['section-divider']} />

        {recent.length === 0 ? (
          <Empty description="还没有文章，去博客页点「写文章」" />
        ) : (
          <div className={styles['article-grid']}>
            {recent.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
