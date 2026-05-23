import { Card } from "@/app/components/ui";

export default function CartSkeleton() {
  return (
    <div className="p-4 flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} padding={14}>
          <div className="flex gap-3.5 animate-pulse">
            <div className="w-[84px] h-[84px] rounded-r2 bg-bone shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="h-3 w-20 bg-bone rounded mb-2" />
              <div className="h-4 w-40 bg-bone rounded mb-4" />
              <div className="flex justify-between items-center">
                <div className="h-8 w-24 bg-bone rounded-full" />
                <div className="h-6 w-20 bg-bone rounded" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
