"use client";

import { useState, useCallback } from "react";
import { EarningsDesktop } from "./earnings-desktop";
import { EarningsMobile } from "./earnings-mobile";
import type { SettlementPeriod, DailyEarnings, DayOrder } from "@/lib/definitions/shipments";

export interface EarningsViewProps {
    settlements: SettlementPeriod[];
    dailyByWeek: Record<string, DailyEarnings[]>;
    ordersByDay: Record<string, DayOrder[]>;
    expandedWeeks: Set<string>;
    expandedDays: Set<string>;
    toggleWeek: (weekKey: string) => void;
    toggleDay: (dayKey: string) => void;
}

interface EarningsListProps {
    settlements: SettlementPeriod[];
    dailyByWeek: Record<string, DailyEarnings[]>;
    ordersByDay: Record<string, DayOrder[]>;
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

    const viewProps: EarningsViewProps = {
        settlements,
        dailyByWeek,
        ordersByDay,
        expandedWeeks,
        expandedDays,
        toggleWeek,
        toggleDay,
    };

    return (
        <>
            <EarningsDesktop {...viewProps} />
            <EarningsMobile {...viewProps} />
        </>
    );
}
