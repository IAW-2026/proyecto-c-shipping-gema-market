"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";

export function SearchBar({ placeholder }: { placeholder?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [value, setValue] = useState(searchParams.get("search") ?? "");

  const navigate = useDebouncedCallback((newValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newValue) {
      params.set("search", newValue);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }, 400);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    navigate(e.target.value);
  }

  return (
    <div className="mb-4">
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder ?? "Buscar..."}
        className="w-full sm:w-72 rounded-r2 border border-line-2 bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:border-ink"
      />
    </div>
  );
}
