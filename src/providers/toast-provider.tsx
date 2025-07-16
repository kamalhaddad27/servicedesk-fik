"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      className="bg-white border shadow rounded-xl"
      position="top-right"
    />
  );
}
