import { getActiveShipments } from "@/lib/db/queries/dashboard";
import { ActiveShipmentsList } from "./active-shipments-list";

export async function ActiveShipmentsData({ userId }: { userId: string }) {
    const shipments = await getActiveShipments(userId);
    return <ActiveShipmentsList shipments={shipments} />;
}
