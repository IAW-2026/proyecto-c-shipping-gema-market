export function Input({
    label,
    value,
    onChange,
    type = "text",
    className,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    className?: string;
}) {
    return (
        <div className={className}>
            <label className="block text-[10px] text-ink-3 font-medium mb-0.5">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-paper border border-line rounded-xl px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus:border-clay focus:outline-none transition-colors"
            />
        </div>
    );
}
