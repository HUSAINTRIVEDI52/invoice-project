"use client";

import { useTransition } from "react";

type ConfirmButtonProps = {
  action: () => Promise<void>;
  label?: string;
  message?: string;
};

export function ConfirmButton({ action, label = "Delete", message = "Are you sure?" }: ConfirmButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="inline-flex items-center justify-center rounded-full border border-red-200 bg-white/90 px-3.5 py-1.5 text-sm font-semibold text-red-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-red-100 disabled:opacity-60"
      disabled={pending}
      onClick={() => {
        if (window.confirm(message)) {
          startTransition(() => void action());
        }
      }}
    >
      {pending ? "Deleting..." : label}
    </button>
  );
}
