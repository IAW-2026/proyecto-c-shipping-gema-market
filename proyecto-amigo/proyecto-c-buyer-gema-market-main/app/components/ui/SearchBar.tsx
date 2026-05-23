import React, { FormEvent } from "react";
import { Icon } from "./Icon";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  label?: string;
  submitLabel?: string;
  className?: string;
}

export const SearchBar = ({
  value,
  onChange,
  onSubmit,
  placeholder,
  label = "Buscar",
  submitLabel = "Buscar",
  className = "",
}: SearchBarProps) => {
  const inputId = React.useId();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form
      role="search"
      aria-label={label}
      onSubmit={handleSubmit}
      className={className}
    >
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <div className="flex items-center gap-2 w-full bg-paper border border-line-2 rounded-r2 px-3.5 h-[46px] transition-[border-color,box-shadow] duration-150 focus-within:border-olive">
        <button
          type="submit"
          aria-label={submitLabel}
          className="text-ink-3 hover:text-ink focus:outline-none focus-visible:text-ink rounded-sm shrink-0"
        >
          <Icon name="search" size={18} />
        </button>
        <input
          id={inputId}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 min-w-0 border-0 outline-none bg-transparent text-sm text-ink h-full"
        />
      </div>
    </form>
  );
};
