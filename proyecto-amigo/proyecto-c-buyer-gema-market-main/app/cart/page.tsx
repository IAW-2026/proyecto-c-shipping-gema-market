import { Suspense } from "react";
import { TopBar } from "@/app/components/ui";
import CartGridClient from "@/app/components/features/cart/CartGridClient";
import { getCartWithProducts } from "@/app/lib/helpers/cart";
import CartSkeleton from "@/app/components/features/cart/CartSkeleton";

async function CartContent() {
  const items = await getCartWithProducts();
  return <CartGridClient initialItems={items} />;
}

export default function CartPage() {
  return (
    <div className="pb-[140px]">
      <TopBar back title="Tu carrito" />
      <Suspense fallback={<CartSkeleton />}>
        <CartContent />
      </Suspense>
    </div>
  );
}
