import React from "react";
import { Icon, IconName } from "./Icon";

interface PillProps {
  children: React.ReactNode;
  tone?:
    | "neutral"
    | "sand"
    | "sage"
    | "forest"
    | "success"
    | "warn"
    | "danger"
    | "outline";
  size?: "sm" | "md" | "lg";
  icon?: IconName;
  onClick?: () => void;
  active?: boolean;
}

export const Pill = ({
  children,
  tone = "neutral",
  size = "md",
  icon,
  onClick,
  active,
}: PillProps) => {
  const toneMap = {
    neutral: "bg-bone text-olive",
    sand: "bg-sand/20 text-cocoa",
    sage: "bg-sage/20 text-forest",
    forest: "bg-forest text-paper",
    success: "bg-success/20 text-success",
    warn: "bg-warn/20 text-warn",
    danger: "bg-danger/15 text-danger",
    outline: "bg-transparent text-ink-2 border border-line-2",
  };
  const sizeMap = {
    sm: "px-[9px] py-[3px] text-[11px] gap-1",
    md: "px-3 py-[5px] text-xs gap-1.5",
    lg: "px-3.5 py-[7px] text-[13px] gap-1.5",
  };
  const iconSize = size === "sm" ? 13 : size === "md" ? 14 : 15;
  const activeCls = active ? "bg-forest text-paper" : toneMap[tone];

  return (
    <span
      onClick={onClick}
      className={`inline-flex shrink-0 items-center font-medium rounded-full whitespace-nowrap tracking-[-0.005em] ${
        sizeMap[size]
      } ${activeCls} ${onClick ? "cursor-pointer" : "cursor-default"}`}
    >
      {icon && <Icon name={icon} size={iconSize} />}
      {children}
    </span>
  );
};
