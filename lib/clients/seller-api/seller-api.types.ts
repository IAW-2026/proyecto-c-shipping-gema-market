export interface SellerOrderDetails {
    order_id: string;
    product_name: string;
    quantity: number;
    pickup_address: string;
}

export interface SellerNotificationResponse {
    success: boolean;
}

export interface OriginAddress {
    street: string;
    number: string;
    zip: string;
}

export interface OriginAddressResponse {
    origin_address: OriginAddress;
}
