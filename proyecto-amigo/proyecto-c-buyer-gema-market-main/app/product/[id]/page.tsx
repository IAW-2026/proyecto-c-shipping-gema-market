import { Suspense } from "react";
import { ProductDetailFetcher } from "@/app/components/products/detail/ProductDetailFetcher";
import { ProductDetailSkeleton } from "@/app/components/products/detail/ProductDetailSkeleton";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  return (
    <div className="pb-24 lgx:pt-8 lgx:px-7 lgx:pb-14 lgx:bg-cream lgx:min-h-screen">
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetailFetcher params={params} />
      </Suspense>
    </div>
  );
}
