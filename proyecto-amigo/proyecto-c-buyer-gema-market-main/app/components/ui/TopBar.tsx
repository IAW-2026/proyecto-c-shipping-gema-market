"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";

interface TopBarProps {
  title?: string;
  back?: boolean;
  action?: React.ReactNode;
  transparent?: boolean;
}

export const TopBar = ({ 
  title, 
  back, 
  action, 
  transparent,
}: TopBarProps) => {
  const router = useRouter();

  const baseCls =
    "sticky top-0 z-30 px-4 py-3 flex items-center justify-between min-h-[56px]";
  const skinCls = transparent
    ? "bg-transparent"
    : "bg-paper/90 backdrop-blur-[12px] border-b border-line";

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className={`${baseCls} ${skinCls}`}>
      <div className="flex items-center gap-3">
        {back && (
          <button
            onClick={handleBack}
            aria-label="Volver"
            className="w-10 h-10 rounded-full bg-bone flex items-center justify-center transition-transform active:scale-95"
          >
            <Icon name="arrowLeft" size={18} />
          </button>
        )}
        {title && (
          <h1 className="m-0 text-base font-semibold tracking-[-0.01em]">
            {title}
          </h1>
        )}
      </div>
      {action}
    </div>
  );
};
