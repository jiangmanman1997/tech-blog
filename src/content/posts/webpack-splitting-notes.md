很多配置里能看到 `splitChunks` 写成 `test: /node_modules/` + 固定 `name: "vendors"`。它确实能把第三方打成一个包，但代价是**路由之间的依赖会互相牵连**：A 页面用到的库，B 页面也会一起下载。

## 更省流量的做法

- 框架核心（react 等）单独一个长期可缓存的 chunk
- 其余第三方按包拆，`chunks: "async"`，让只有懒加载图里的库才参与拆分
- 每个路由 `import()` 一次，页面代码只在首次访问时下载

```js
const Home = lazy(() => import(/* webpackChunkName: "page-home" */ "./pages/Home"));
```

验证方式很直接：`npm run build` 之后打开 Network，切页面看实际下载了哪些 chunk。