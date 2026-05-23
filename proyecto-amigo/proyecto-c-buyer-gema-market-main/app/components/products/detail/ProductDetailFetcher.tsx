import { notFound } from "next/navigation";
import { getProductById } from "@/app/lib/api/seller";
import { isFavorited } from "@/app/lib/db/favorito";
import { getCurrentUserId } from "@/app/lib/auth/mapClerkId-UserId";
import ProductImageGallery from "./ProductImageGallery";
import ProductInfo from "./ProductInfo";
import ProductCartActions from "./ProductCartActions";
import ProductTabsSection from "./ProductTabsSection";

interface ProductDetailFetcherProps {
  params: Promise<{ id: string }>;
}

export async function ProductDetailFetcher({ params }: ProductDetailFetcherProps) {
  const { id } = await params;

  // Paralelo: producto + check de favorito.
  // isFavorited usa findUnique por clave primaria compuesta (buyerId, productId) — O(1).
  const [product, initialFavorite] = await Promise.all([
    getProductById(id),
    getCurrentUserId().then((userId) =>
      userId ? isFavorited(userId, id) : false,
    ),
  ]);

  if (!product) notFound();

  return (
    <div className="flex flex-col lgx:grid lgx:grid-cols-[minmax(360px,500px)_minmax(0,1fr)] lgx:gap-8 lgx:items-start lgx:max-w-[1180px] lgx:mx-auto">
      <ProductImageGallery
        images={product.images}
        title={product.title}
        productId={product.product_id}
        initialFavorite={initialFavorite}
      />

      <div className="px-4 py-5 min-[600px]:max-w-[680px] min-[600px]:mx-auto lgx:max-w-none lgx:p-0 w-full min-w-0">
        <ProductInfo
          title={product.title}
          price={product.price}
          stock={product.stock}
          condition={product.condition}
        />

        <ProductCartActions
          productId={product.product_id}
          stock={product.stock}
        />

        <ProductTabsSection
          description={product.description}
          width={product.width}
          height={product.height}
          depth={product.depth}
          weight={product.weight}
        />
      </div>
    </div>
  );
}
