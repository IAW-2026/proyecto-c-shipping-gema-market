export type RequestState = "idle" | "loading" | "success" | "error";

export type EndpointDef = {
    id: string;
    label: string;
    app: "buyer" | "payments" | "seller";
    step: number;
    method: string;
    url: string;
};

export type PlaygroundConfig = {
    origin_street: string;
    origin_number: string;
    origin_zip: string;
    dest_street: string;
    dest_number: string;
    dest_zip: string;
    buyer_name: string;
    buyer_phone: string;
    weight_kg: number;
    height_cm: number;
    width_cm: number;
    depth_cm: number;
};

export type FlowStatus = {
    quote_id: string | null;
    order_id: string | null;
    shipping_id: string | null;
    tracking_code: string | null;
    status: string | null;
};

export type InternalCallDef = {
    target: string;
    method: string;
    url: string;
};

export interface LogInternalCall {
    target: string;
    method: string;
    url: string;
    status: number;
    responseBody?: string;
}

export interface LogEntry {
    id: string;
    timestamp: string;
    method: string;
    url: string;
    endpointLabel: string;
    requestBody?: string;
    responseStatus: number;
    responseBody: string;
    internalCalls?: LogInternalCall[];
}
