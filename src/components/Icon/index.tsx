import type { CSSProperties } from "react";

interface IconProps {
  /** 图标名，对应 icon-xxx 里的 xxx */
  name: string;
  /** 是否彩色图标：true 用 SVG，false 用 <i> */
  colorful?: boolean;
  /** 尺寸 */
  size?: number;
  /** 单色颜色，colorful 为 false 时生效 */
  color?: string;
  className?: string;
  style?: CSSProperties;
}

export default function Icon({
  name,
  colorful = false,
  size = 16,
  color,
  className = '',
  style,
}: IconProps) {
  // 彩色：用 SVG Symbol，保留原色
  if (colorful) {
    return (
      <svg
        className={`iconfont ${className||name}`}
        style={{ width: size, height: size, ...style }}
        aria-hidden="true"
      >
        <use xlinkHref={`#${name}`} />
      </svg>
    );
  }

  // 单色：用字体图标，color 控制颜色
  return (
    <i
      className={`iconfont ${name} ${className}`}
      style={{ fontSize: size, color, ...style }}
    />
  );
}