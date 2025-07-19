import { Suspense } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <MainLayout>
      <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
    </MainLayout>
  );
}
