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
  name: '你的名字',
  title: '前端工程师',
  bio: '这里写一两句自我介绍：你做什么、擅长什么、最近在琢磨什么。改 src/content/profile.ts 就能换掉这段文字。',
  aboutParagraphs: [
    '这一段可以写你的经历：做过什么方向的项目、待过什么团队、对哪类问题最有兴趣。',
    '这一段可以写你的工作方式或者技术偏好，比如「喜欢把复杂交互拆成可复用的小组件」「写代码前先写清楚边界」。',
    '这一段可以写工作之外的事：在学什么、在读什么书、怎么联系你。',
  ],
  avatar: '',
  email: 'you@example.com',
  location: '中国 · 某城市',
  focus: ['React', 'TypeScript', '前端工程化', '性能优化'],
  socials: [
    { label: 'GitHub', url: 'https://github.com/' },
    { label: '掘金', url: 'https://juejin.cn/' },
  ],
};
