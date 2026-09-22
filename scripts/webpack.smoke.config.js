/**
 * 冒烟测试用：把整个应用（含 antd/路由/store）打成 CommonJS，在 jsdom 里挂载一遍，
 * 目的是抓「类型检查过、单元测试过，但一渲染就报错」的问题（组件 API 用错、store 初始化炸掉等）。
 *
 * 只用 ts-loader 转译，不做分包、不压缩，跑得快也容易定位。
 */

import path from 'node:path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const outDir = path.resolve(import.meta.dirname, '..', '.smoke-build');

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
      // 冒烟测试不关心样式，把 CSS 丢掉，省得在 node 里处理 style-loader
      { test: /\.css$/, use: ['null-loader'] },
    ],
  },
  plugins: [new HtmlWebpackPlugin({ template: 'public/index.html' })],
  optimization: { minimize: false, splitChunks: false, runtimeChunk: false },
  performance: { hints: false },
  stats: 'errors-warnings',
};
