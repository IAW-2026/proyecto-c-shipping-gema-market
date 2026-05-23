import { getCurrentUserId } from "@/app/lib/auth/mapClerkId-UserId";
import { countOrdenesByBuyerId, getOrdenesByBuyerId } from "@/app/lib/db/orden";
import { getProductsBatch } from "@/app/lib/api/seller";
import {
  ACTIVE_ORDER_STATUSES,
  HISTORIAL_ORDER_STATUSES,
} from "@/app/lib/constants/orders";
import { parsePage } from "@/app/lib/utils/pagination";
import { ORDERS_PAGE_SIZE } from "@/app/lib/constants/pagination";
import { mapOrdenesToUI } from "@/app/lib/helpers/orders";
import type { OrderForUI } from "@/app/lib/types/orders";
import OrdersClient from "./OrdersClient";

type OrderTab = "activos" | "historial";

function parseTab(raw: string | string[] | undefined): OrderTab {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === "historial" ? "historial" : "activos";
}

export async function OrdersFetcher({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[]; tab?: string | string[] }>;
}) {
  const { page: pageParam, tab: tabParam } = await searchParams;
  const page = parsePage(pageParam);
  const tab = parseTab(tabParam);

  const userId = await getCurrentUserId();
  if (!userId) {
    return (
      <OrdersClient
        orders={[]}
        activeCount={0}
        historialCount={0}
        currentTab={tab}
        totalPages={1}
      />
    );
  }

  const statuses =
    tab === "activos" ? ACTIVE_ORDER_STATUSES : HISTORIAL_ORDER_STATUSES;

  const [ordenes, activeCount, historialCount] = await Promise.all([
    getOrdenesByBuyerId(userId, { page, pageSize: ORDERS_PAGE_SIZE, statuses }),
    countOrdenesByBuyerId(userId, ACTIVE_ORDER_STATUSES),
    countOrdenesByBuyerId(userId, HISTORIAL_ORDER_STATUSES),
  ]);

  const tabTotal = tab === "activos" ? activeCount : historialCount;
  const totalPages = Math.max(1, Math.ceil(tabTotal / ORDERS_PAGE_SIZE));

  let orders: OrderForUI[] = [];
  if (ordenes.length > 0) {
    const productIds = [...new Set(ordenes.map((o) => o.productId))];
    const { products } = await getProductsBatch(productIds);
    const productMap = new Map(products.map((p) => [p.product_id, p]));
    orders = mapOrdenesToUI(ordenes, productMap);
  }

  return (
    <OrdersClient
      orders={orders}
      activeCount={activeCount}
      historialCount={historialCount}
      currentTab={tab}
      totalPages={totalPages}
    />
  );
}
