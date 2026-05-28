import { cn } from "@/lib/shared/classnames";

interface TabItem {
    id: string;
    label: string;
    count?: number;
}

interface TabsProps {
    tabs: TabItem[];
    activeTab: string;
    onTabChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
    return (
        <div className="flex gap-1 border-b border-line overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                        "px-4 py-3 text-sm font-medium transition-all relative whitespace-nowrap",
                        activeTab === tab.id ? "text-cocoa" : "text-ink-3 hover:text-ink"
                    )}
                >
                    <span className="flex items-center gap-2">
                        {tab.label}
                        {tab.count !== undefined && (
                            <span className="bg-bone px-1.5 py-0.5 rounded-md text-[10px]">
                                {tab.count}
                            </span>
                        )}
                    </span>
                    {activeTab === tab.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cocoa rounded-t-full" />
                    )}
                </button>
            ))}
        </div>
    );
}