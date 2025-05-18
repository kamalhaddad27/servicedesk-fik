import type React from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { AuthGuard } from "@/components/auth/auth-guard"
import { NotificationProvider } from "@/providers/notification-provider" // pastikan ini path ke provider yg SONNER

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NotificationProvider>
      <AuthGuard>
        <MainLayout>{children}</MainLayout>
      </AuthGuard>
    </NotificationProvider>
  )
}
