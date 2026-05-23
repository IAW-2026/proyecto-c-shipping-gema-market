import React from "react";
import { Icon, IconName } from "./Icon";

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  body: string;
  action?: React.ReactNode;
}

export const EmptyState = ({
  icon = "box",
  title,
  body,
  action,
}: EmptyStateProps) => (
  <div className="text-center px-6 py-12 max-w-[360px] mx-auto">
    <div className="w-[72px] h-[72px] rounded-full bg-bone text-olive flex items-center justify-center mx-auto mb-5">
      <Icon name={icon} size={32} />
    </div>
    <h3 className="m-0 mb-2 text-lg font-semibold">{title}</h3>
    <p className="m-0 mb-5 text-sm text-ink-3 leading-[1.5]">{body}</p>
    {action}
  </div>
);
