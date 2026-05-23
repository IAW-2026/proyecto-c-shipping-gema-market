"use client";

import React from "react";
import { Icon, Button } from "@/app/components/ui";
import { useRouter } from "next/navigation";

export interface ToastProps {
  show: boolean;
  type: "success" | "error";
  message: string;
  action?: {
    label: string;
    href?: string;
  };
}

export function Toast({ show, type, message, action }: ToastProps) {
  const router = useRouter();

  return (
    <div
      className={`fixed top-6 left-4 right-4 lgx:left-1/2 lgx:right-auto lgx:w-max lgx:-translate-x-1/2 z-100 transition-all duration-500 ease-out transform ${
        show
          ? "translate-y-0 opacity-100"
          : "-translate-y-8 opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl shadow-sh-2 border backdrop-blur-md transition-colors ${
          type === "success"
            ? "bg-moss/90 border-moss/20 text-paper"
            : "bg-red-600/90 border-red-500/20 text-paper"
        }`}
      >
        <Icon name={type === "success" ? "check" : "alertCircle"} size={20} />
        <span className="font-medium text-sm tracking-tight">{message}</span>

        {action && (
          <Button
            size="sm"
            variant="secondary"
            className="ml-2 bg-paper/20 hover:bg-paper/30 border-transparent text-paper h-8 px-3"
            onClick={() => action.href && router.push(action.href)}
          >
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
