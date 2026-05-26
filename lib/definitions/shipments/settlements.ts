export interface SettlementPeriod {
    period: string;
    weekStart: Date;
    weekEnd: Date;
    trips: number;
    amount: number;
}

export interface DailyEarnings {
    date: Date;
    dayLabel: string;
    trips: number;
    amount: number;
}

export interface DayOrder {
    orderId: string;
    price: number;
    pickedUpAt: Date | null;
    deliveredAt: Date | null;
}
