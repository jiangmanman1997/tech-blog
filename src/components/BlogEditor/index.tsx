/** 文章编辑弹窗：新增和编辑共用一个表单，内容存进 store（localStorage） */

import { App, Form, Input, Modal, Select, Switch } from 'antd';
import { useEffect, useMemo } from 'react';
import { usePostStore } from '../../store/postStore';
import type { Post, PostDraft } from '../../types';
import styles from './index.module.scss';

interface BlogEditorProps {
  open: boolean;
  /** 有值 = 编辑，无值 = 新增 */
  post?: Post;
  onClose: () => void;
}

type FormValues = Omit<PostDraft, 'tags'> & { tags?: string[] };

export function BlogEditor({ open, post, onClose }: BlogEditorProps) {
  const [form] = Form.useForm<FormValues>();
  const { message } = App.useApp();
  const upsertPost = usePostStore((state) => state.upsertPost);
  const posts = usePostStore((state) => state.posts);
  // 已用过的标签作为候选项，省得每次手打
  const knownTags = useMemo(() => [...new Set(posts.flatMap((item) => item.tags))], [posts]);

  // 每次打开都重置：编辑时回填，新增时清空
  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      title: post?.title ?? '',
      summary: post?.summary ?? '',
      content: post?.content ?? '',
      tags: post?.tags ?? [],
      draft: post?.draft ?? false,
    });
  }, [open, post, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const saved = upsertPost({ ...values, tags: values.tags ?? [] }, post?.id);
    message.success(post ? '已保存修改' : values.draft ? '草稿已保存' : '文章已发布');
    onClose();
    return saved;
  };

  return (
    <Modal
      open={open}
      title={post ? '编辑文章' : '写文章'}
      onCancel={onClose}
      onOk={handleSubmit}
      okText={post ? '保存' : '发布'}
      cancelText="取消"
      width={760}
      destroyOnHidden
      mask={{ closable: false }}
      classNames={{ body: styles['body'] }}
    >
      <Form form={form} layout="vertical" requiredMark={false} preserve={false}>
        <Form.Item
          name="title"
          label="标题"
          rules={[{ required: true, message: '写个标题' }, { max: 80, message: '标题别超过 80 字' }]}
        >
          <Input placeholder="例如：我如何组织一个 React 项目的目录" maxLength={80} showCount />
        </Form.Item>

        <Form.Item
          name="summary"
          label="摘要"
          extra="列表页展示这一句，正文第一段不会自动当摘要"
          rules={[{ max: 120, message: '摘要别超过 120 字' }]}
        >
          <Input.TextArea
            placeholder="一句话说清这篇讲了什么"
            autoSize={{ minRows: 2, maxRows: 3 }}
            maxLength={120}
            showCount
          />
        </Form.Item>

        <Form.Item name="tags" label="标签" extra="回车新增，颜色表在 src/constants/site.ts">
          <Select
            mode="tags"
            placeholder="例如：React、TypeScript"
            options={knownTags.map((tag) => ({ value: tag, label: tag }))}
            tokenSeparators={[',', '，', ' ']}
            maxTagCount={6}
          />
        </Form.Item>

        <Form.Item
          name="content"
          label="正文（Markdown）"
          extra="支持 ## 标题、**加粗**、`代码`、- 列表、> 引用、``` 代码块"
          rules={[{ required: true, message: '正文不能为空' }]}
        >
          <Input.TextArea
            className={styles['content-input']}
            placeholder={'## 小标题\n\n正文……\n\n```ts\nconst a = 1;\n```'}
            autoSize={{ minRows: 12, maxRows: 22 }}
          />
        </Form.Item>

        <Form.Item
          className={styles['row']}
          name="draft"
          label="存为草稿"
          valuePropName="checked"
          extra="草稿只有打开「显示草稿」时才出现在博客页"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default BlogEditor;
