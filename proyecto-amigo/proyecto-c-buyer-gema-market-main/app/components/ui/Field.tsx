import React from "react";

interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  optional?: boolean;
  inputId?: string;
}

export const Field = ({ label, hint, error, children, optional, inputId }: FieldProps) => {
  const errorId = inputId && error ? `${inputId}-error` : undefined;
  const hintId = inputId && hint && !error ? `${inputId}-hint` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  const child = React.isValidElement<{ id?: string; "aria-invalid"?: boolean; "aria-describedby"?: string }>(children)
    ? React.cloneElement(children, {
        ...(inputId ? { id: inputId } : {}),
        "aria-invalid": !!error || undefined,
        "aria-describedby": describedBy,
      })
    : children;

  return (
    <label className="block">
      {label && (
        <div className="flex justify-between items-baseline mb-1.5">
          <span className="text-[13px] text-ink-2 font-medium">{label}</span>
          {optional && <span className="text-[11px] text-ink-3">opcional</span>}
        </div>
      )}
      {child}
      {hint && !error && <div id={hintId} className="text-xs text-ink-3 mt-1.5">{hint}</div>}
      {error && <div id={errorId} role="alert" className="text-xs text-danger mt-1.5">{error}</div>}
    </label>
  );
};
