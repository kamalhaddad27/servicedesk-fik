"use client";

import { Suspense, use } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useSession } from "@/context/SessionContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useSession();

  const userRole = user?.role;

  return (
    <MainLayout>
      {/* Tambahkan class khusus berdasarkan role pengguna */}
      <div
        className={`dashboard-content ${
          userRole ? `dashboard-${userRole}` : ""
        }`}
      >
        <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
      </div>
    </MainLayout>
  );
}
