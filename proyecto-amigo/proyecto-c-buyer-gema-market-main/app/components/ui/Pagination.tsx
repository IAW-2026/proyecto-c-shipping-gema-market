"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { generatePagination } from "@/app/lib/utils/pagination";
import { Icon } from "./Icon";

export function Pagination({ totalPages }: { totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  if (totalPages <= 1) return null;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const allPages = generatePagination(currentPage, totalPages);

  return (
    <nav aria-label="Paginación" className="flex items-center gap-2">
      <PaginationArrow
        direction="left"
        href={createPageURL(currentPage - 1)}
        isDisabled={currentPage <= 1}
      />

      <div className="flex items-center gap-1.5">
        {allPages.map((page, index) => {
          let position: "first" | "last" | "single" | "middle" | undefined;

          if (index === 0) position = "first";
          if (index === allPages.length - 1) position = "last";
          if (allPages.length === 1) position = "single";
          if (page === "...") position = "middle";

          return (
            <PaginationNumber
              key={`${page}-${index}`}
              href={createPageURL(page)}
              page={page}
              position={position}
              isActive={currentPage === page}
            />
          );
        })}
      </div>

      <PaginationArrow
        direction="right"
        href={createPageURL(currentPage + 1)}
        isDisabled={currentPage >= totalPages}
      />
    </nav>
  );
}

function PaginationNumber({
  page,
  href,
  isActive,
  position,
}: {
  page: number | string;
  href: string;
  position?: "first" | "last" | "middle" | "single";
  isActive: boolean;
}) {
  const className = clsx(
    "flex h-9 w-9 items-center justify-center text-[13px] font-semibold transition-all border rounded-r2",
    {
      "bg-forest text-paper border-forest shadow-sm z-10": isActive,
      "bg-paper border-line-2 text-ink hover:bg-bone hover:border-ink":
        !isActive && position !== "middle",
      "text-ink-3 border-transparent cursor-default": position === "middle",
    },
  );

  return isActive || position === "middle" ? (
    <div className={className} aria-current={isActive ? "page" : undefined}>
      {page}
    </div>
  ) : (
    <Link
      href={href}
      className={className}
      aria-label={`Ir a la página ${page}`}
    >
      {page}
    </Link>
  );
}

function PaginationArrow({
  href,
  direction,
  isDisabled,
}: {
  href: string;
  direction: "left" | "right";
  isDisabled?: boolean;
}) {
  const className = clsx(
    "flex h-9 w-9 items-center justify-center rounded-r2 border transition-all",
    {
      "bg-bone border-line text-ink-3 pointer-events-none opacity-50":
        isDisabled,
      "bg-paper border-line-2 text-ink hover:bg-bone hover:border-ink":
        !isDisabled,
    },
  );

  const icon =
    direction === "left" ? (
      <Icon name="arrowLeft" size={16} />
    ) : (
      <Icon name="arrowRight" size={16} />
    );

  return isDisabled ? (
    <div className={className} aria-disabled="true">
      {icon}
    </div>
  ) : (
    <Link
      className={className}
      href={href}
      aria-label={
        direction === "left" ? "Página anterior" : "Página siguiente"
      }
    >
      {icon}
    </Link>
  );
}
