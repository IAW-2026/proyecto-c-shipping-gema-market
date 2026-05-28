export function Fieldset({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="border border-line rounded-r2 p-3">
            <legend className="text-[11px] font-semibold text-ink-3 uppercase tracking-wide mb-2">{title}</legend>
            <div className="space-y-2">{children}</div>
        </div>
    );
}
