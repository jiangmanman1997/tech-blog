import path from 'node:path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

// node_modules/lodash-es/debounce.js -> lodash-es；@scope/pkg 也算一个包
const packageOf = (context) => context.match(/[\\/]node_modules[\\/]((?:@[^\\/]+[\\/])?[^\\/]+)/)[1].replace(/[\\/]/g, '_');

export default (_env, argv) => {
  const isProd = argv.mode === 'production';

  return {
    entry: './src/index.tsx',
    output: {
      path: path.resolve(import.meta.dirname, 'dist'),
      filename: isProd ? '[name].[contenthash:8].js' : '[name].js',
      chunkFilename: isProd ? '[name].[contenthash:8].chunk.js' : '[name].chunk.js',
      publicPath: '/',
      clean: true,
    },
    resolve: { extensions: ['.tsx', '.ts', '.js'] },
    module: {
      rules: [
        // transpileOnly: 类型检查交给 `npm run typecheck`，构建只做转译，快很多
        { test: /\.tsx?$/, loader: 'ts-loader', options: { transpileOnly: true }, exclude: /node_modules/ },
        // 样式：style-loader 把 CSS 注入 <style>，开发时有 HMR。
        // 生产环境它也能用（按 chunk 注入，天然跟着代码分割走），只是首屏会多一次 JS 注入。
        // 想换成独立 .css 文件 + link 预加载，再引 mini-css-extract-plugin 即可，无需改别的代码。
        { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      ],
    },
    plugins: [new HtmlWebpackPlugin({ template: 'public/index.html' })],
    optimization: {
      runtimeChunk: 'single',
      splitChunks: {
        chunks: 'all',
        minSize: 20 * 1024, // 拆出来比多发一个请求还不划算的小库，就留在路由 chunk 里
        maxInitialRequests: 12,
        cacheGroups: {
          // 1) 框架核心：首屏就要、随业务几乎不变 -> 一个长期可缓存的 chunk
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|@remix-run)[\\/]/,
            name: 'react-vendor',
            priority: 40,
            enforce: true,
          },
          // 2) 其余第三方：只在懒加载图里拆，一个包一个 chunk（不用维护库清单）
          //    同一包被多个路由用到 -> 只下一次；某路由用不到的库不会跟着它下发
          npmPackage: {
            test: /[\\/]node_modules[\\/]/,
            chunks: 'async',
            priority: 20,
            reuseExistingChunk: true,
            name: (module) => `npm.${packageOf(module.context)}`,
          },
          // 3) 首屏里非 react 的第三方交给 webpack 自带的 defaultVendors。
          //    千万别写 test: /node_modules/ + 固定 name: 'vendors'：
          //    它会把所有路由用到的库并成一个 blob，A 页面会连带下载 B 页面的库。
        },
      },
      usedExports: true, // tree-shaking：标记未使用的导出，压缩阶段真正删掉
      sideEffects: true, // 尊重 package.json 的 "sideEffects": false
      concatenateModules: isProd,
    },
    devtool: isProd ? 'source-map' : 'eval-cheap-module-source-map',
    devServer: {
      port: 3000,
      hot: true,
      historyApiFallback: true, // BrowserRouter 深链 /list 刷新要回 index.html
    },
    performance: { hints: false },
  };
};
