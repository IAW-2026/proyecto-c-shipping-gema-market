export function CompactAppCard({
    step,
    meta,
    children,
}: {
    step: number;
    meta: { label: string; color: string };
    children: React.ReactNode;
}) {
    const stepColors = ["bg-bark", "bg-clay", "bg-sand"];
    return (
        <div className={`bg-paper border ${meta.color} rounded-r3 overflow-hidden`}>
            <div className="bg-bone/40 px-4 py-2.5 flex items-center gap-3 border-b border-line">
                <span className={`${stepColors[step - 1]} text-paper text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center`}>
                    {step}
                </span>
                <span className="text-sm font-semibold text-ink">{meta.label}</span>
            </div>
            <div className="p-3 space-y-2">{children}</div>
        </div>
    );
}
