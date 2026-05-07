export interface SellerOrderDetails {
    order_id: string;
    product_name: string;
    quantity: number;
    pickup_address: string;
}

export interface SellerNotificationResponse {
    success: boolean;
}
