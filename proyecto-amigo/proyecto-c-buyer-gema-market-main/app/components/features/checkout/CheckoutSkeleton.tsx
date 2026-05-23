import { TopBar, Card, Skeleton } from "@/app/components/ui";

export default function CheckoutSkeleton() {
  return (
    <div className="pb-32">
      <TopBar back title="Checkout" />

      <div className="pt-4 px-4 pb-2 max-w-[600px] mx-auto">
        {/* Stepper */}
        <div className="flex gap-1.5 mb-6">
          {[1, 2].map((i) => (
            <div key={i} className="flex-1">
              <Skeleton w="100%" h={4} r={9999} />
              <div className="mt-1.5">
                <Skeleton w={90} h={11} r={4} />
              </div>
            </div>
          ))}
        </div>

        {/* Section title (eyebrow + título) */}
        <div className="mb-4 flex flex-col gap-2">
          <Skeleton w={56} h={11} r={4} />
          <Skeleton w={220} h={20} r={6} />
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="col-span-2 flex flex-col gap-1.5">
            <Skeleton w={50} h={12} r={4} />
            <Skeleton w="100%" h={44} r={12} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Skeleton w={70} h={12} r={4} />
            <Skeleton w="100%" h={44} r={12} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Skeleton w={110} h={12} r={4} />
            <Skeleton w="100%" h={44} r={12} />
          </div>
        </div>

        {/* Info card */}
        <Card padding={14} className="flex gap-2.5 items-center mt-2">
          <Skeleton w={15} h={15} r={4} />
          <div className="flex-1">
            <Skeleton w="80%" h={13} r={4} />
          </div>
        </Card>
      </div>

      {/* Barra inferior fija */}
      <div className="fixed bottom-0 left-0 right-0 bg-paper/95 backdrop-blur-md border-t border-line">
        <div className="max-w-[600px] mx-auto px-4 py-3">
          <Skeleton w="100%" h={48} r={12} />
        </div>
      </div>
    </div>
  );
}
