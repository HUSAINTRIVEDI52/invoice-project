"use client";

import { useEffect, useState } from "react";

export function ToastFromUrl() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const url = new URL(window.location.href);
    const toast = url.searchParams.get("toast");
    if (!toast) return;

    setMessage(toast);
    url.searchParams.delete("toast");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);

    const timer = window.setTimeout(() => setMessage(""), 3500);
    return () => window.clearTimeout(timer);
  }, []);

  if (!message) return null;

  return (
    <div className="no-print fixed right-4 top-4 z-50 max-w-sm rounded-3xl border border-emerald-200 bg-white/95 p-4 text-sm font-semibold text-emerald-900 shadow-float backdrop-blur">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-xs text-emerald-700">✓</span>
        <span>{message}</span>
      </div>
    </div>
  );
}
