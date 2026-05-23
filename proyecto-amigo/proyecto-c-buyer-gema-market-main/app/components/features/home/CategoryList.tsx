"use client";

import React from "react";
import { Pill } from "../../ui/Pill";
import { Category } from "@/app/lib/types/product";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface CategoryListProps {
  categories: Category[];
}

export function CategoryList({ categories }: CategoryListProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Get active category from URL
  const activeCat = searchParams.get("cat") || "all";

  const handleSelect = (catId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (catId === "all") {
      params.delete("cat");
    } else {
      params.set("cat", catId);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="overflow-x-auto -mx-4 no-scrollbar">
      <div className="flex w-max gap-1.5 px-4 pb-3 lgx:max-w-[1180px] lgx:mx-auto lgx:w-full">
        <Pill
          active={activeCat === "all"}
          onClick={() => handleSelect("all")}
          size="md"
        >
          Todo
        </Pill>
        {categories.map((c) => (
          <Pill
            key={c.category_id}
            active={activeCat === c.category_id}
            onClick={() => handleSelect(c.category_id)}
            size="md"
          >
            {c.name}
          </Pill>
        ))}
      </div>
    </div>
  );
}
