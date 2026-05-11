export interface PaymentReleaseRequest {
    order_id: string;
    shipping_id: string;
    amount: number;
    logistics_id: string;
}

export interface PaymentReleaseResponse {
    transaction_id: string;
    status: "released" | "pending";
}
