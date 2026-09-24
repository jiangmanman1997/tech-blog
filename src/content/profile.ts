/**
 * 你的个人资料 —— 只改这个文件，首页和关于页会跟着变。
 *
 * 头像两种用法：
 *   1) 自己的图片放进 public/ 目录，然后写 avatar: '/avatar.jpg'
 *   2) 不想放图片就留空字符串，页面会退化成「名字首字」的色块头像
 */

export interface SocialLink {
  /** 展示名，如 GitHub */
  label: string;
  /** 完整链接 */
  url: string;
}

export interface Profile {
  /** 姓名 / 昵称，会出现在导航栏、首页、关于页和浏览器标题 */
  name: string;
  /** 一句话头衔，如「前端工程师」 */
  title: string;
  /** 首页大标题下面的一段自我介绍，1~3 句就够 */
  bio: string;
  /** 关于页的详细介绍，每段一条，按纯文本展示 */
  aboutParagraphs: string[];
  /** 头像地址，见文件顶部说明，可留空 */
  avatar: string;
  /** 联系邮箱，关于页支持一键复制 */
  email: string;
  /** 所在城市，不想写就留空 */
  location: string;
  /** 正在做的事 / 关注方向，首页和关于页都会展示，不想写就留空数组 */
  focus: string[];
  /** 社交链接，不想写就留空数组 */
  socials: SocialLink[];
}

export const profile: Profile = {
  name: '姜漫漫',
  title: '前端工程师',
  bio: '简介：毕业于浙江海洋大学在杭州工作6年的开发者\n爱好：阅读、写作、旅行',
  aboutParagraphs: [
    '在dataphin蚂蚁数据中台做前端开发，主要负责数据中台的开发与维护。',
    '技术栈是: React + TypeScript + Ant Design + Webpack，熟悉前端工程化、性能优化、前端架构等方向。',
    '喜欢阅读技术书籍和文章，关注前端技术的发展趋势，热衷于分享自己的经验和知识。',
  ],
  avatar: '/imgs/avatar.jpg',
  email: '2226534058@qq.com',
  location: '中国 · 杭州',
  focus: ['React', 'TypeScript', '前端工程化', '性能优化'],
  socials: [
    { label: 'GitHub', url: 'https://github.com/jiangmanman1997' },
    { label: '掘金', url: 'https://juejin.cn/' },
  ],
};
