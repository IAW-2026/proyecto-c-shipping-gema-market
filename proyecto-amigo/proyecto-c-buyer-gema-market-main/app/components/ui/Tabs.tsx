import React from "react";

interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: (string | TabItem)[];
  active: string;
  onChange: (id: string) => void;
}

export const Tabs = ({ tabs, active, onChange }: TabsProps) => (
  <div role="tablist" className="flex gap-1 border-b border-line overflow-x-auto max-w-full no-scrollbar [-webkit-overflow-scrolling:touch] flex-wrap-mobile">
    {tabs.map((t) => {
      const id = typeof t === "string" ? t : t.id;
      const label = typeof t === "string" ? t : t.label;
      const count = typeof t === "string" ? null : t.count;
      const isActive = active === id;
      
      return (
        <button
          key={id}
          role="tab"
          aria-selected={isActive}
          aria-controls={`tab-panel-${id}`}
          id={`tab-${id}`}
          onClick={() => onChange(id)}
          className={`px-4 py-3 text-sm font-medium -mb-px flex items-center gap-2 whitespace-nowrap shrink-0 max-[520px]:px-2.5 max-[520px]:text-[13px] max-[520px]:gap-1.5 transition-colors ${
            isActive
              ? "text-ink border-b-2 border-forest"
              : "text-ink-3 border-b-2 border-transparent hover:text-ink-2"
          }`}
        >
          {label}
          {count != null && (
            <span
              className={`text-[11px] px-[7px] py-0.5 rounded-full font-semibold ${
                isActive ? "bg-forest text-paper" : "bg-bone text-ink-3"
              }`}
            >
              {count}
            </span>
          )}
        </button>
      );
    })}
  </div>
);
