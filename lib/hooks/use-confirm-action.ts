"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback, useRef } from "react";

type ConfirmActionResult = Promise<{ success: boolean; error?: string }>;

interface UseConfirmActionOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useConfirmAction(
  action: () => ConfirmActionResult,
  options?: UseConfirmActionOptions
) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const handleConfirm = useCallback(async () => {
    setIsPending(true);
    try {
      const result = await action();
      if (!result.success) {
        optionsRef.current?.onError?.(result.error ?? "Error desconocido");
        return;
      }
      router.refresh();
      optionsRef.current?.onSuccess?.();
    } catch (error) {
      console.error(error);
      optionsRef.current?.onError?.(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsPending(false);
      setIsOpen(false);
    }
  }, [action, router]);

  return { isOpen, isPending, open, close, handleConfirm } as const;
}
