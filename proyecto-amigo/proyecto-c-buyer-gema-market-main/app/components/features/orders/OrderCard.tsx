import Link from "next/link";
import Image from "next/image";
import { Card, Pill, Icon } from "@/app/components/ui";
import { fmtARS } from "@/app/lib/utils/format";
import { ORDER_STATUS_LABEL } from "@/app/lib/constants/orders";
import type { OrderForUI } from "@/app/lib/types/orders";

export type { OrderForUI };

interface OrderCardProps {
  order: OrderForUI;
  href: string;
}

export function OrderCard({ order: o, href }: OrderCardProps) {
  const st = ORDER_STATUS_LABEL[o.status];

  return (
    <Link href={href} className="block">
    <Card padding={16} hover className="cursor-pointer">
      <div className="flex justify-between items-center mb-2.5">
        <div className="text-xs font-mono text-ink-3 truncate max-w-[55%]">
          {o.id}
        </div>
        <Pill tone={st.tone} size="sm">
          {st.label}
        </Pill>
      </div>

      <div className="flex items-center gap-3 mb-2">
        {o.productThumbnail ? (
          <div className="relative w-12 h-12 shrink-0 rounded-md overflow-hidden bg-surface-2">
            <Image
              src={o.productThumbnail}
              alt={o.productTitle}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
        ) : (
          <div className="w-12 h-12 shrink-0 rounded-md bg-surface-2" />
        )}
        <div className="text-sm font-medium truncate">
          {o.productTitle}
          {o.quantity > 1 && (
            <span className="text-ink-3 font-normal"> × {o.quantity}</span>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <div className="text-[13px] text-ink-3">{o.date}</div>
          <div className="text-base font-semibold">{fmtARS(o.total)}</div>
        </div>
        <Icon name="chevronRight" size={18} className="text-ink-3" />
      </div>
    </Card>
    </Link>
  );
}
