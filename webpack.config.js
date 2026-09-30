import path from 'node:path';
import { pathToFileURL } from 'node:url';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ImageMinimizerPlugin from 'image-minimizer-webpack-plugin';
import { getLocalIdent } from './scripts/css-module-names.mjs';

// node_modules/lodash-es/debounce.js -> lodash-es；如果以后引了第三方 UI 库，也要改这里
const packageOf = (context) => context.match(/[\\/]node_modules[\\/]((?:@[^\\/]+[\\/])?[^\\/]+)/)[1].replace(/[\\/]/g, '_');

export default (_env, argv) => {
  const isProd = argv.mode === 'production';

  return {
    entry: './src/index.tsx',
    output: {
      path: path.resolve(import.meta.dirname, 'dist'),
      filename: isProd ? 'js/[name].[contenthash:8].js' : 'js/[name].js',
      chunkFilename: isProd ? 'js/[name].[contenthash:8].chunk.js' : 'js/[name].chunk.js',
      assetModuleFilename: 'assets/[name].[contenthash:8][ext][query]',
      publicPath: '/',
      clean: true,
    },
    resolve: { extensions: ['.tsx', '.ts', '.js'] },
    module: {
      rules: [
        { test: /\.md$/, type: 'asset/source' },
        // transpileOnly: 类型检查交给 `npm run typecheck`，构建只做转译，快很多
        { test: /\.tsx?$/, loader: 'ts-loader', options: { transpileOnly: true }, exclude: /node_modules/ },
        // 样式：style-loader 把 CSS 注入 <style>，开发时有 HMR，生产也能用（天然跟着代码分割走）。
        //
        // 组件样式统一用 CSS Modules（*.module.scss）：类名会被哈希，不会互相污染，
        // 组件里这样取：import styles from './index.module.scss'; className={styles['post-card']}
        {
          test: /\.module\.scss$/,
          sideEffects: true,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                // 关键两条：必须让 css-loader 用 CommonJS 形态导出 locals。
                // 用默认的 ESM 形态（esModule/namedExport 都是 true）时，
                // webpack 解析 `import styles from './index.module.scss'` 会得到 undefined，
                // 于是 styles['layout'] 抛错、样式全丢（生产构建尤其容易踩，见文件末尾的说明）。
                esModule: false,
                modules: {
                  // 类名统一是 index.module.scss，css-loader 的 [name] 只能得到 "index"，
                  // 所以用 getLocalIdent 把「组件名」拼进类名，见 scripts/css-module-names.mjs
                  localIdentName: isProd ? '[local]__[hash:base64:5]' : '[local]',
                  getLocalIdent,
                  // 键名就是样式文件里写的类名（.hero-body -> styles['hero-body']），不做驼峰转换
                  namedExport: false,
                  exportLocalsConvention: 'as-is',
                },
              },
            },
            // 每个 module.scss 自动带上设计变量，省得每个文件都写 @use
            // 用 file:// URL 拼绝对路径：sass 的加载器按 URL 解析，相对路径在不同深度的文件里会算错
            {
              loader: 'sass-loader',
              options: {
                additionalData: `@use "${pathToFileURL(path.resolve(import.meta.dirname, 'src/assets/tokens')).href}" as *;`,
              },
            },
          ],
        },
        // 全局样式（如 Markdown 正文排版）不带 .module，类名不哈希，保持原样
        {
          test: /\.s?css$/,
          exclude: /\.module\.scss$/,
          sideEffects: true,
          use: ['style-loader', 'css-loader', 'sass-loader'],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({ template: 'public/index.html' }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(import.meta.dirname, 'public'),
            // 直接复制到 dist 根目录，保持 public 内的目录结构
            // 这样代码里写 /iconfont/iconfont.js、/imgs/cover.jpg 就能对上
            to: path.resolve(import.meta.dirname, 'dist'),
            globOptions: { ignore: ['**/index.html'] },
            noErrorOnMissing: true,
          },
        ],
      }),
      ...(isProd
        ? [
            new ImageMinimizerPlugin({
              minimizer: {
                implementation: ImageMinimizerPlugin.sharpMinify,
                options: {
                  encodeOptions: {
                    jpeg: { quality: 82 },
                    png: { quality: 82 },
                    webp: { quality: 82 },
                  },
                },
              },
            }),
          ]
        : []),
    ],
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
            name: 'vendor/react-vendor',
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
            name: (module) => `vendor/npm.${packageOf(module.context)}`,
          },
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            chunks: 'initial',
            name: 'vendor/vendors',
            priority: -10,
            enforce: true,
            reuseExistingChunk: true,
          },
        },
      },
      // usedExports 暂时关掉：开着它时，生产构建会把 CSS Modules 的导出
      // （layout / content / footer 这些类名）当未使用代码删掉，
      // 于是 import styles from './index.module.scss' 变成 undefined，
      // className={styles['layout']} 直接抛错、页面白屏。开发模式不删，所以只在 build 暴露。
      // 实测：关掉后 main.js 里能重新看到 PageShell-layout 这类类名，页面正常。
      // 反正生产还有 Terser 做删死代码，这里不是唯一手段。
      usedExports: false,
      sideEffects: true, // 尊重 package.json 的 "sideEffects"（只声明了 css）
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