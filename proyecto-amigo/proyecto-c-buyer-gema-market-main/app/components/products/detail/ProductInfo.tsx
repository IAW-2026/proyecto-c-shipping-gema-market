import { Pill } from "@/app/components/ui";
import { fmtARS } from "@/app/lib/utils/format";
import type { ProductCondition } from "@/app/lib/types/product";

interface ProductInfoProps {
  title: string;
  price: number;
  stock: number;
  condition: ProductCondition;
}

export default function ProductInfo({
  title,
  price,
  stock,
  condition,
}: ProductInfoProps) {
  const conditionLabel = condition === "nuevo" ? "Nuevo" : "Usado";

  return (
    <div className="w-full">
      <div className="flex items-center gap-1.5 mb-2">
        <Pill tone="sage" size="sm">
          {conditionLabel}
        </Pill>
      </div>
      <h1 className="text-2xl tracking-[-0.02em] font-semibold m-0 mb-2">
        {title}
      </h1>
      <div className="flex items-center gap-3 mb-4 text-[13px] text-ink-2">
        <span className="text-ink-3">{stock} disponibles</span>
      </div>
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-[32px] font-bold tracking-[-0.02em]">
          {fmtARS(price)}
        </span>
      </div>
    </div>
  );
}
