/**
 * 冒烟测试用：把整个应用（含 antd/路由/store）打成一份能在 jsdom 里跑的包，
 * 目的是抓「类型检查过、单元测试过，但一渲染就报错」的问题（组件 API 用错、store 初始化炸掉、
 * 样式类名取不到等）。
 *
 * 与正式构建的差别只在「样式」：
 *   - 不加载真实 CSS（jsdom 里没意义），但会跑 css-loader 拿到「原类名 -> 生成的类名」映射，
 *     由 scripts/css-module-stub-loader.cjs 导出给组件，所以 className 依然有值、能断言。
 *   - 不压缩、不分包，跑得快也容易定位。
 *
 * sass-loader 的设计变量注入直接从正式配置里取，避免两边配置漂移。
 */

import path from 'node:path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import realConfig from '../webpack.config.js';

const outDir = path.resolve(import.meta.dirname, '..', '.smoke-build');

/** 从正式配置里挑出 sass-loader 的 options（additionalData 等） */
const findSassLoaderOptions = () => {
  const config = realConfig({}, { mode: 'development' });
  for (const rule of config.module.rules) {
    if (!(rule.test instanceof RegExp) || !rule.test.test('index.module.scss')) continue;
    for (const entry of rule.use) {
      if (typeof entry === 'object' && entry.loader === 'sass-loader') return entry.options;
    }
  }
  throw new Error('正式配置里找不到 sass-loader 的 options');
};

export default {
  mode: 'development',
  target: 'web',
  entry: './test/harness.tsx',
  devtool: false,
  output: {
    path: outDir,
    filename: 'app.js',
    clean: true,
    publicPath: '/',
    // 动态 import 的 chunk 全部内联进 app.js：jsdom 里没有真的网络请求
    chunkLoading: false,
    chunkFormat: false,
    // 输出成全局变量，测试脚本 import 之后直接读这个对象
    library: { name: 'SmokeHarness', type: 'var' },
  },
  resolve: { extensions: ['.tsx', '.ts', '.js'] },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader', options: { transpileOnly: true }, exclude: /node_modules/ },
      {
        test: /\.module\.scss$/,
        use: [
          { loader: path.resolve(import.meta.dirname, 'css-module-stub-loader.cjs') },
          { loader: 'sass-loader', options: findSassLoaderOptions() },
        ],
      },
      // 全局样式（不带 .module）直接丢掉
      { test: /\.s?css$/, exclude: /\.module\.scss$/, use: ['null-loader'] },
    ],
  },
  plugins: [new HtmlWebpackPlugin({ template: 'public/index.html' })],
  optimization: { minimize: false, splitChunks: false, runtimeChunk: false },
  performance: { hints: false },
  stats: 'errors-warnings',
};
