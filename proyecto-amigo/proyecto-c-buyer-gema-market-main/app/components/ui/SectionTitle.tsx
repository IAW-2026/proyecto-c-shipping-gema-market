import React from "react";

interface SectionTitleProps {
  eyebrow?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export const SectionTitle = ({ eyebrow, children, action }: SectionTitleProps) => (
  <div className="flex justify-between items-end mb-4">
    <div>
      {eyebrow && (
        <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3 mb-1.5">
          {eyebrow}
        </div>
      )}
      <h2 className="m-0 text-2xl font-semibold tracking-[-0.02em] text-ink">
        {children}
      </h2>
    </div>
    {action}
  </div>
);
