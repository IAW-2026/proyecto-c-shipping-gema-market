import { notificationRegistry } from "@/lib/utils/notification-registry";
import type { NotificationTarget } from "@/lib/utils/notification-registry";

export async function getNotifications(target?: NotificationTarget) {
    if (target) {
        return notificationRegistry.getByTarget(target);
    }
    return notificationRegistry.getAll();
}

export async function clearNotifications() {
    notificationRegistry.clear();
}
