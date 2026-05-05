import * as React from "react"
import { cn } from "@/lib/shared/utils"

export function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
    return (
        <div className="w-full overflow-auto">
            <table className={cn("w-full border-collapse text-sm", className)} {...props} />
        </div>
    )
}

export function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
    return <thead className={cn("bg-cream border-b border-line", className)} {...props} />
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
    return <tbody className={cn("divide-y divide-line", className)} {...props} />
}

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
    return <tr className={cn("hover:bg-cream/30 transition-colors group", className)} {...props} />
}

export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
    return (
        <th
            className={cn(
                "py-4 px-6 text-left text-ink-3 font-mono text-[11px] uppercase tracking-wider",
                className
            )}
            {...props}
        />
    )
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
    return <td className={cn("py-4 px-6 align-middle", className)} {...props} />
}