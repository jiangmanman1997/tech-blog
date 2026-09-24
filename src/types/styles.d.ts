/**
 * *.module.scss 的模块声明。
 * webpack 的 css-loader 解析这些文件，类型层面只需要知道「默认导出是 类名 -> 哈希后类名 的映射」。
 */

declare module '*.module.scss' {
  const styles: Record<string, string>;
  export default styles;
}

declare module '*.module.css' {
  const styles: Record<string, string>;
  export default styles;
}
