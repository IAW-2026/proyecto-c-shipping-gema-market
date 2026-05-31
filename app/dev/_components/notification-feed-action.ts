"use cache: false";
"use server";

import { getNotifications, clearNotifications } from "@/lib/db/queries/dev/notification-feed";
import type { NotificationTarget } from "@/lib/utils/notification-registry";

export async function getNotificationsAction(target?: NotificationTarget) {
    return await getNotifications(target);
}

export async function clearNotificationsAction() {
    clearNotifications();
    return { success: true };
}
