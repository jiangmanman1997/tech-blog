类型体操能解决的问题，大多可以用更朴素的方式解决：**给数据一个能判别的字段**。

## 判别联合

```ts
type Result =
  | { status: "ok"; data: string }
  | { status: "error"; message: string };

const render = (r: Result) => (r.status === "ok" ? r.data : r.message);
```

`status` 一判断，另一个分支的字段就能直接访问，不需要断言。

## 用 never 兜底

在 `switch` 的 default 里把值赋给 `never`，以后新增分支忘了处理，编译期就会报错——比线上出问题便宜得多。