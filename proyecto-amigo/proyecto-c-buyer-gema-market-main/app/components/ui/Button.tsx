import React from "react";
import { Icon, IconName } from "./Icon";

interface ButtonProps {
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "accent" | "soft";
  size?: "sm" | "md" | "lg";
  icon?: IconName;
  iconRight?: IconName;
  full?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  ariaLabel?: string;
  loading?: boolean;
}

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  full,
  onClick,
  disabled,
  type = "button",
  className = "",
  ariaLabel,
  loading,
}: ButtonProps) => {
  const sizeMap = {
    sm: "h-[34px] px-3.5 text-[13px] gap-1.5",
    md: "h-[42px] px-[18px] text-sm gap-2",
    lg: "h-[52px] px-6 text-[15px] gap-2.5",
  };
  const iconSizes = { sm: 16, md: 18, lg: 20 };
  const variantMap = {
    primary: "bg-forest text-paper border border-forest",
    secondary: "bg-paper text-ink border border-line-2",
    ghost: "bg-transparent text-ink border border-transparent",
    danger: "bg-danger text-paper border border-danger",
    accent: "bg-clay text-paper border border-clay",
    soft: "bg-bone text-olive border border-transparent",
  };
  const widthCls = full ? "w-full" : "w-auto";
  const stateCls =
    disabled || loading
      ? "opacity-50 cursor-not-allowed"
      : "cursor-pointer active:scale-[0.98]";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center rounded-full font-medium tracking-[-0.01em] max-w-full min-w-0 whitespace-nowrap transition-[transform,opacity] duration-100 ${
        sizeMap[size]
      } ${variantMap[variant]} ${widthCls} ${stateCls} ${className}`}
    >
      {loading ? (
        <div
          className={`w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin`}
        />
      ) : (
        <>
          {icon && <Icon name={icon} size={iconSizes[size]} />}
          {children}
          {iconRight && <Icon name={iconRight} size={iconSizes[size]} />}
        </>
      )}
    </button>
  );
};
