import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/shared/classnames";
import { Card } from "@/components/ui/card";
import { formatDateKey, formatDateTime } from "./earnings-list-utils";
import type { EarningsViewProps } from "./earnings-list";
import type { DailyEarnings, DayOrder } from "@/lib/definitions/shipments";

function DayOrdersMobile({ orders }: { orders: DayOrder[] }) {
    return (
        <div className="ml-6 border-l-2 border-line pl-3 mt-1 mb-2 space-y-2">
            {orders.map((order) => (
                <div key={order.orderId} className="text-xs">
                    <div className="font-mono text-ink font-medium truncate">
                        {order.orderId}
                    </div>
                    <div className="flex justify-between text-ink-2 mt-0.5">
                        <span>${order.price.toLocaleString("es-AR")}</span>
                        <span>Retiro: {formatDateTime(order.pickedUpAt)}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

function DayRowMobile({
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
                className="flex items-center gap-2 py-2 cursor-pointer"
                onClick={onToggle}
            >
                <ChevronRight
                    size={14}
                    className={cn(
                        "text-ink-3 transition-transform shrink-0",
                        isExpanded && "rotate-90"
                    )}
                />
                <span className="text-sm text-ink flex-1 capitalize">{day.dayLabel}</span>
                <span className="text-xs text-ink-2">{day.trips} viajes</span>
                <span className="text-sm font-medium text-ink">
                    ${day.amount.toLocaleString("es-AR")}
                </span>
            </div>
            {isExpanded && orders.length > 0 && <DayOrdersMobile orders={orders} />}
        </div>
    );
}

function WeekRowMobile({
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
        <Card padding="none">
            <div
                className="flex items-center gap-2 p-4 cursor-pointer"
                onClick={onToggle}
            >
                <ChevronRight
                    size={16}
                    className={cn(
                        "text-ink-3 transition-transform shrink-0",
                        isExpanded && "rotate-90"
                    )}
                />
                <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-ink">{settlement.period}</div>
                    <div className="text-xs text-ink-3">{settlement.trips} viajes realizados</div>
                </div>
                <div className="text-right shrink-0">
                    <div className="text-[10px] uppercase font-mono text-ink-3 mb-0.5">Ganancia</div>
                    <div className="text-base font-bold text-ink">
                        ${settlement.amount.toLocaleString("es-AR")}
                    </div>
                </div>
            </div>
            {isExpanded && days.length > 0 && (
                <div className="border-t border-line bg-cream/20 px-4 py-2 space-y-1">
                    {days.map((day) => {
                        const dayKey = formatDateKey(day.date);
                        return (
                            <DayRowMobile
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
        </Card>
    );
}

export function EarningsMobile({
    settlements,
    dailyByWeek,
    ordersByDay,
    expandedWeeks,
    expandedDays,
    toggleWeek,
    toggleDay,
}: EarningsViewProps) {
    return (
        <div className="grid gap-3 lgx:hidden">
            {settlements.map((s) => {
                const weekKey = formatDateKey(s.weekStart);
                return (
                    <WeekRowMobile
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
        </div>
    );
}
