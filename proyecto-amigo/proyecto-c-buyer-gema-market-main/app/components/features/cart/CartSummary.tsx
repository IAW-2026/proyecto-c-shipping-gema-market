import { Button } from "@/app/components/ui";
import { fmtARS } from "@/app/lib/utils/format";

interface CartSummaryProps {
  subtotal: number;
  onCheckout: () => void;
  isPending?: boolean;
}

export function CartSummary({
  subtotal,
  onCheckout,
  isPending,
}: CartSummaryProps) {
  return (
    <div className="fixed bottom-[calc(64px+env(safe-area-inset-bottom))] lgx:bottom-0 left-0 right-0 bg-paper/95 backdrop-blur-[12px] border-t border-line px-4 py-3 z-50 lgx:left-[240px]">
      <div className="w-full max-w-[760px] mx-auto">
        <div className="grid gap-1.5 text-[13px] mb-3">
          <div className="flex justify-between">
            <span className="text-ink-3">Subtotal</span>
            <span>{fmtARS(subtotal)}</span>
          </div>
          {/* El costo de envío se calcula en el checkout al ingresar la dirección */}
          <div className="flex justify-between text-ink-3">
            <span>Envío</span>
            <span>Se calcula en el checkout</span>
          </div>
        </div>
        <Button
          full
          size="lg"
          variant="accent"
          iconRight="arrowRight"
          onClick={onCheckout}
          disabled={isPending}
        >
          Continuar al checkout
        </Button>
      </div>
    </div>
  );
}
