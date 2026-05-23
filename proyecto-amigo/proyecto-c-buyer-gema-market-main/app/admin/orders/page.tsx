import { Suspense } from "react";
import { SectionTitle, EmptyState, Pagination } from "@/app/components/ui";
import { requireAdmin } from "@/app/lib/auth/roles";
import {
  getOrdenesPaginatedAdmin,
  countOrdenesAdmin,
} from "@/app/lib/db/orden";
import { getProductsBatch } from "@/app/lib/api/seller";
import { parsePage } from "@/app/lib/utils/pagination";
import { ADMIN_ORDERS_PAGE_SIZE } from "@/app/lib/constants/pagination";
import { SearchBar } from "@/app/admin/_components/SearchBar";
import { OrdersTable } from "./_components/OrdersTable";
import { OrdersTableSkeleton } from "./_components/OrdersTableSkeleton";

type SearchParams = Promise<{
  page?: string | string[];
  search?: string | string[];
}>;

async function OrdersListContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const { page: pageParam, search: searchParam } = await searchParams;
  const page = parsePage(pageParam);
  const search = Array.isArray(searchParam) ? searchParam[0] : searchParam;

  const [ordenes, total] = await Promise.all([
    getOrdenesPaginatedAdmin({
      skip: (page - 1) * ADMIN_ORDERS_PAGE_SIZE,
      take: ADMIN_ORDERS_PAGE_SIZE,
      search,
    }),
    countOrdenesAdmin(search),
  ]);

  const productIds = ordenes.map((o) => o.productId);
  const { products } =
    productIds.length > 0
      ? await getProductsBatch(productIds)
      : { products: [] };

  const productMap = Object.fromEntries(
    products.map((p) => [p.product_id, p.title]),
  );

  const rows = ordenes.map((o) => ({
    id: o.id,
    buyer: { fullName: o.buyer.fullName, email: o.buyer.email },
    productTitle: productMap[o.productId] ?? o.productId,
    total: Number(o.totalAmount),
    status: o.status,
    createdAt: o.createdAt,
  }));

  return (
    <>
      <SectionTitle eyebrow={`${total} orden${total !== 1 ? "es" : ""}`}>
        Órdenes
      </SectionTitle>
      <SearchBar placeholder="Buscar por nombre o email…" />
      {total === 0 ? (
        <EmptyState
          icon="box"
          title="Sin órdenes"
          body={
            search
              ? "No se encontraron órdenes para ese comprador."
              : "Todavía no hay órdenes registradas."
          }
        />
      ) : (
        <>
          <OrdersTable rows={rows} />
          <div className="flex justify-center mt-6">
            <Pagination
              totalPages={Math.max(
                1,
                Math.ceil(total / ADMIN_ORDERS_PAGE_SIZE),
              )}
            />
          </div>
        </>
      )}
    </>
  );
}

export default function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense fallback={<OrdersPageSkeleton />}>
      <OrdersListContent searchParams={searchParams} />
    </Suspense>
  );
}

function OrdersPageSkeleton() {
  return (
    <>
      <SectionTitle eyebrow="…">Órdenes</SectionTitle>
      <OrdersTableSkeleton rows={ADMIN_ORDERS_PAGE_SIZE} />
    </>
  );
}
