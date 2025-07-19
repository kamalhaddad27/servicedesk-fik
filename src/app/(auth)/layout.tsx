import AuthLayout from "@/components/layout/auth-layout";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <AuthLayout>{children}</AuthLayout>;
}
