import React from "react";

interface LogoProps {
  size?: number;
  label?: boolean;
  color?: string;
}

export const Logo = ({
  size = 28,
  label = true,
  color = "currentColor",
}: LogoProps) => (
  <div className="inline-flex items-center gap-2.5">
    <svg width={size} height={size} viewBox="0 0 32 32" className="shrink-0">
      <path
        d="M6 26 V14 C6 9, 10 5, 16 5 C22 5, 26 9, 26 14 V26"
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M11 26 V18 C11 15, 13 13, 16 13 C19 13, 21 15, 21 18 V26"
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="16" cy="14" r="1.5" fill={color} />
    </svg>
    {label && (
      <span
        className="font-semibold tracking-[-0.02em]"
        style={{ fontSize: size * 0.6, color }}
      >
        UniHousing
      </span>
    )}
  </div>
);
