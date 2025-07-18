import type React from "react";
import { ToastProvider } from "@/providers/toast-provider";
import type { Metadata } from "next";
import "@/app/globals.css";
import { SessionProvider } from "@/context/SessionContext";

export const metadata: Metadata = {
  title: "Service Desk FIK",
  description: "Sistem Layanan Terpadu Fakultas Ilmu Komputer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <SessionProvider>
          {children}
          <ToastProvider />
        </SessionProvider>
      </body>
    </html>
  );
}
