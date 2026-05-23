import { Card } from "@/app/components/ui";
import { ORDER_STATUS_LABEL } from "@/app/lib/constants/orders";
import type { OrderStatus } from "@/app/lib/types/orders";

function statusCardColor(status: OrderStatus) {
  if (status === "delivered") return "bg-success text-paper border-0";
  if (status === "cancelled") return "bg-danger text-paper border-0";
  return "bg-forest text-paper border-0";
}

interface OrderStatusCardProps {
  status: OrderStatus;
  date: string;
}

export function OrderStatusCard({ status, date }: OrderStatusCardProps) {
  const st = ORDER_STATUS_LABEL[status];

  return (
    <Card padding={20} className={`${statusCardColor(status)} mb-4`}>
      <div className="text-[11px] font-mono uppercase tracking-[0.1em] opacity-70 mb-1.5">
        Estado actual
      </div>
      <div className="text-[22px] font-semibold mb-1">{st.label}</div>
      <div className="text-[13px] opacity-80">{date}</div>
    </Card>
  );
}
