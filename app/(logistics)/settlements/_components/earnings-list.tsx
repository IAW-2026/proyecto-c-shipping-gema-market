"use client";

import { useState, useCallback, Fragment } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/shared/utils";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import type { SettlementPeriod, DailyEarnings, DayOrder } from "@/lib/definitions/shipments";

interface EarningsListProps {
    settlements: SettlementPeriod[];
    dailyByWeek: Record<string, DailyEarnings[]>;
    ordersByDay: Record<string, DayOrder[]>;
}

function getWeekKey(weekStart: Date): string {
    return new Date(weekStart).toISOString().split("T")[0];
}

function getDayKey(date: Date): string {
    return new Date(date).toISOString().split("T")[0];
}

function formatDate(date: Date | null): string {
    if (!date) return "-";
    return date.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function EarningsList({ settlements, dailyByWeek, ordersByDay }: EarningsListProps) {
    const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());
    const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

    const toggleWeek = useCallback((weekKey: string) => {
        setExpandedWeeks((prev) => {
            const next = new Set(prev);
            if (next.has(weekKey)) next.delete(weekKey);
            else next.add(weekKey);
            return next;
        });
    }, []);

    const toggleDay = useCallback((dayKey: string) => {
        setExpandedDays((prev) => {
            const next = new Set(prev);
            if (next.has(dayKey)) next.delete(dayKey);
            else next.add(dayKey);
            return next;
        });
    }, []);

    return (
        <>
            {/* Desktop */}
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
                            const weekKey = getWeekKey(s.weekStart);
                            const isWeekExpanded = expandedWeeks.has(weekKey);
                            const days = dailyByWeek[weekKey] ?? [];

                            return (
                                <TableRow key={weekKey}>
                                    <TableCell className="p-0" colSpan={3}>
                                        <div
                                            className="flex items-center gap-3 px-6 py-3.5 cursor-pointer hover:bg-cream/30 transition-colors"
                                            onClick={() => toggleWeek(weekKey)}
                                        >
                                            <ChevronRight
                                                size={16}
                                                className={cn(
                                                    "text-ink-3 transition-transform shrink-0",
                                                    isWeekExpanded && "rotate-90"
                                                )}
                                            />
                                            <span className="font-medium text-ink flex-1">{s.period}</span>
                                            <span className="text-center text-ink-2 text-sm w-16">{s.trips}</span>
                                            <span className="text-right font-bold text-ink w-28">
                                                ${s.amount.toLocaleString("es-AR")}
                                            </span>
                                        </div>

                                        {isWeekExpanded && days.length > 0 && (
                                            <div className="border-t border-line bg-cream/20">
                                                {days.map((day) => {
                                                    const dayKey = getDayKey(day.date);
                                                    const isDayExpanded = expandedDays.has(dayKey);
                                                    const orders = ordersByDay[dayKey] ?? [];

                                                    return (
                                                        <div key={dayKey}>
                                                            <div
                                                                className="flex items-center gap-3 px-6 py-2.5 pl-14 cursor-pointer hover:bg-cream/40 transition-colors text-sm"
                                                                onClick={() => toggleDay(dayKey)}
                                                            >
                                                                <ChevronRight
                                                                    size={14}
                                                                    className={cn(
                                                                        "text-ink-3 transition-transform shrink-0",
                                                                        isDayExpanded && "rotate-90"
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

                                                            {isDayExpanded && orders.length > 0 && (
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
                                                                            <span className="font-mono text-xs truncate">
                                                                                {order.orderId}
                                                                            </span>
                                                                            <span className="text-right font-medium">
                                                                                ${order.price.toLocaleString("es-AR")}
                                                                            </span>
                                                                            <span className="text-right text-ink-2 text-xs">
                                                                                {formatDate(order.pickedUpAt)}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Card>

            {/* Mobile */}
            <div className="grid gap-3 lgx:hidden">
                {settlements.map((s) => {
                    const weekKey = getWeekKey(s.weekStart);
                    const isWeekExpanded = expandedWeeks.has(weekKey);
                    const days = dailyByWeek[weekKey] ?? [];

                    return (
                        <Card key={weekKey} padding="none">
                            <div
                                className="flex items-center gap-2 p-4 cursor-pointer"
                                onClick={() => toggleWeek(weekKey)}
                            >
                                <ChevronRight
                                    size={16}
                                    className={cn(
                                        "text-ink-3 transition-transform shrink-0",
                                        isWeekExpanded && "rotate-90"
                                    )}
                                />
                                <div className="min-w-0 flex-1">
                                    <div className="text-sm font-semibold text-ink">{s.period}</div>
                                    <div className="text-xs text-ink-3">{s.trips} viajes realizados</div>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="text-[10px] uppercase font-mono text-ink-3 mb-0.5">Ganancia</div>
                                    <div className="text-base font-bold text-ink">
                                        ${s.amount.toLocaleString("es-AR")}
                                    </div>
                                </div>
                            </div>

                            {isWeekExpanded && days.length > 0 && (
                                <div className="border-t border-line bg-cream/20 px-4 py-2 space-y-1">
                                    {days.map((day) => {
                                        const dayKey = getDayKey(day.date);
                                        const isDayExpanded = expandedDays.has(dayKey);
                                        const orders = ordersByDay[dayKey] ?? [];

                                        return (
                                            <div key={dayKey}>
                                                <div
                                                    className="flex items-center gap-2 py-2 cursor-pointer"
                                                    onClick={() => toggleDay(dayKey)}
                                                >
                                                    <ChevronRight
                                                        size={14}
                                                        className={cn(
                                                            "text-ink-3 transition-transform shrink-0",
                                                            isDayExpanded && "rotate-90"
                                                        )}
                                                    />
                                                    <span className="text-sm text-ink flex-1 capitalize">
                                                        {day.dayLabel}
                                                    </span>
                                                    <span className="text-xs text-ink-2">{day.trips} viajes</span>
                                                    <span className="text-sm font-medium text-ink">
                                                        ${day.amount.toLocaleString("es-AR")}
                                                    </span>
                                                </div>

                                                {isDayExpanded && orders.length > 0 && (
                                                    <div className="ml-6 border-l-2 border-line pl-3 mt-1 mb-2 space-y-2">
                                                        {orders.map((order) => (
                                                            <div key={order.orderId} className="text-xs">
                                                                <div className="font-mono text-ink font-medium truncate">
                                                                    {order.orderId}
                                                                </div>
                                                                <div className="flex justify-between text-ink-2 mt-0.5">
                                                                    <span>${order.price.toLocaleString("es-AR")}</span>
                                                                    <span>Retiro: {formatDate(order.pickedUpAt)}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </>
    );
}
