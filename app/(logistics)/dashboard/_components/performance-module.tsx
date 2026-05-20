"use client";

import { TrendingUp, TrendingDown, DollarSign, Truck } from "lucide-react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { PerformanceData } from "@/lib/definitions/dashboard-metrics";

interface Props {
    data: PerformanceData;
}

function ChangeBadge({ value, suffix }: { value: number; suffix: string }) {
    const isUp = value > 0;
    const isNeutral = value === 0;
    const Icon = isUp ? TrendingUp : isNeutral ? () => null : TrendingDown;

    return (
        <span
            className={`inline-flex items-center gap-1 text-xs font-semibold ${isUp ? "text-success" : isNeutral ? "text-ink-3" : "text-danger"}`}
        >
            {!isNeutral && <Icon size={14} />}
            {isNeutral ? "—" : `${isUp ? "+" : ""}${value}%`}
            <span className="text-ink-3 font-normal">{suffix}</span>
        </span>
    );
}

export function PerformanceModule({ data }: Props) {
    const { weeklyEarnings, weeklyTrips, avgPerTrip, earningsChange, tripsChange, weeklyHistory } = data;

    const hasData = weeklyHistory.length > 0;

    return (
        <div className="bg-paper border border-line rounded-r3 p-5 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-ink m-0">Rendimiento</h3>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-ink-2">
                        <DollarSign size={16} className="text-clay" />
                        Ganancias
                    </span>
                    <span className="font-semibold text-ink">
                        ${hasData ? weeklyEarnings.toLocaleString("es-AR") : "0"}
                    </span>
                </div>
                <ChangeBadge value={earningsChange} suffix="vs semana pasada" />

                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-ink-2">
                        <Truck size={16} className="text-clay" />
                        Viajes
                    </span>
                    <span className="font-semibold text-ink">
                        {hasData ? weeklyTrips : "0"}
                    </span>
                </div>
                <ChangeBadge value={tripsChange} suffix="vs semana pasada" />

                <div className="flex items-center justify-between pt-1 border-t border-line">
                    <span className="text-sm text-ink-2">Promedio por viaje</span>
                    <span className="font-semibold text-ink">
                        ${hasData && avgPerTrip > 0 ? avgPerTrip.toLocaleString("es-AR") : "0"}
                    </span>
                </div>
            </div>

            {hasData && (
                <div className="pt-1">
                    <span className="text-[11px] font-semibold text-ink-3 uppercase tracking-wide">
                        Ganancias semanales
                    </span>
                    <div className="mt-2">
                        <ResponsiveContainer width="100%" height={110}>
                            <BarChart data={weeklyHistory} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 10, fill: "#6b6e60" }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: "#ede7d8" }}
                                    contentStyle={{
                                        backgroundColor: "#faf8f3",
                                        border: "1px solid #e2dccc",
                                        borderRadius: 12,
                                        fontSize: 12,
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                    }}
                                    formatter={(value) => [
                                        `$${Number(value).toLocaleString("es-AR")}` as React.ReactNode,
                                        "Ganancia",
                                    ]}
                                    labelFormatter={(label) => `Semana del ${label}`}
                                />
                                <Bar
                                    dataKey="earnings"
                                    fill="#936639"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={32}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}
