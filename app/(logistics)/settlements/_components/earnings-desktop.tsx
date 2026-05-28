import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/shared/classnames";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatDateKey, formatDateTime } from "./earnings-list-utils";
import type { EarningsViewProps } from "./earnings-list";
import type { DailyEarnings, DayOrder } from "@/lib/definitions/shipments";

function DayOrdersDesktop({ orders }: { orders: DayOrder[] }) {
    return (
        <div className="border-t border-line bg-white">
            <div className="grid grid-cols-3 gap-4 px-6 py-1.5 pl-20 text-[11px] font-mono font-medium text-ink-3 uppercase tracking-wider">
                <span>ID Pedido</span>
                <span className="text-right">Precio</span>
                <span className="text-right">Fecha de Retiro</span>
            </div>
            {orders.map((order) => (
                <div
                    key={order.orderId}
                    className="grid grid-cols-3 gap-4 px-6 py-2 pl-20 text-sm text-ink border-t border-line/30"
                >
                    <span className="font-mono text-xs truncate">{order.orderId}</span>
                    <span className="text-right font-medium">
                        ${order.price.toLocaleString("es-AR")}
                    </span>
                    <span className="text-right text-ink-2 text-xs">
                        {formatDateTime(order.pickedUpAt)}
                    </span>
                </div>
            ))}
        </div>
    );
}

function DayRowDesktop({
    day,
    isExpanded,
    orders,
    onToggle,
}: {
    day: DailyEarnings;
    isExpanded: boolean;
    orders: DayOrder[];
    onToggle: () => void;
}) {
    return (
        <div>
            <div
                className="flex items-center gap-3 px-6 py-2.5 pl-14 cursor-pointer hover:bg-cream/40 transition-colors text-sm"
                onClick={onToggle}
            >
                <ChevronRight
                    size={14}
                    className={cn(
                        "text-ink-3 transition-transform shrink-0",
                        isExpanded && "rotate-90"
                    )}
                />
                <span className="text-ink flex-1 capitalize">{day.dayLabel}</span>
                <span className="text-ink-2 text-center text-xs w-16">
                    {day.trips} {day.trips === 1 ? "viaje" : "viajes"}
                </span>
                <span className="text-ink font-medium text-right text-sm w-28">
                    ${day.amount.toLocaleString("es-AR")}
                </span>
            </div>
            {isExpanded && orders.length > 0 && <DayOrdersDesktop orders={orders} />}
        </div>
    );
}

function WeekRowDesktop({
    settlement,
    days,
    ordersByDay,
    isExpanded,
    onToggle,
    expandedDays,
    onToggleDay,
}: {
    settlement: { weekStart: Date; period: string; trips: number; amount: number };
    days: DailyEarnings[];
    ordersByDay: Record<string, DayOrder[]>;
    isExpanded: boolean;
    onToggle: () => void;
    expandedDays: Set<string>;
    onToggleDay: (dayKey: string) => void;
}) {
    return (
        <TableRow>
            <TableCell className="p-0" colSpan={3}>
                <div
                    className="flex items-center gap-3 px-6 py-3.5 cursor-pointer hover:bg-cream/30 transition-colors"
                    onClick={onToggle}
                >
                    <ChevronRight
                        size={16}
                        className={cn(
                            "text-ink-3 transition-transform shrink-0",
                            isExpanded && "rotate-90"
                        )}
                    />
                    <span className="font-medium text-ink flex-1">{settlement.period}</span>
                    <span className="text-center text-ink-2 text-sm w-16">{settlement.trips}</span>
                    <span className="text-right font-bold text-ink w-28">
                        ${settlement.amount.toLocaleString("es-AR")}
                    </span>
                </div>
                {isExpanded && days.length > 0 && (
                    <div className="border-t border-line bg-cream/20">
                        {days.map((day) => {
                            const dayKey = formatDateKey(day.date);
                            return (
                                <DayRowDesktop
                                    key={dayKey}
                                    day={day}
                                    isExpanded={expandedDays.has(dayKey)}
                                    orders={ordersByDay[dayKey] ?? []}
                                    onToggle={() => onToggleDay(dayKey)}
                                />
                            );
                        })}
                    </div>
                )}
            </TableCell>
        </TableRow>
    );
}

export function EarningsDesktop({
    settlements,
    dailyByWeek,
    ordersByDay,
    expandedWeeks,
    expandedDays,
    toggleWeek,
    toggleDay,
}: EarningsViewProps) {
    return (
        <Card padding="none" className="hidden lgx:block">
            <div className="p-5 border-b border-line">
                <h3 className="m-0 text-base font-semibold text-ink">Historial de Pagos</h3>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Período</TableHead>
                        <TableHead className="text-center">Viajes</TableHead>
                        <TableHead className="text-right">Total Ganancia</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {settlements.map((s) => {
                        const weekKey = formatDateKey(s.weekStart);
                        return (
                            <WeekRowDesktop
                                key={weekKey}
                                settlement={s}
                                days={dailyByWeek[weekKey] ?? []}
                                ordersByDay={ordersByDay}
                                isExpanded={expandedWeeks.has(weekKey)}
                                onToggle={() => toggleWeek(weekKey)}
                                expandedDays={expandedDays}
                                onToggleDay={toggleDay}
                            />
                        );
                    })}
                </TableBody>
            </Table>
        </Card>
    );
}
