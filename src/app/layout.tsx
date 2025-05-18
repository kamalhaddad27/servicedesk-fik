// src/app/layout.tsx
import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ToastProvider } from "@/providers/toast-providder";
import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Service Desk FIK",
  description: "Fakultas Ilmu Komputer - UPNVJ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <QueryProvider>
            <ToastProvider />
            {children}
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}