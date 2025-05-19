"use client"

import { Suspense } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/hooks/use-auth"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { userRole } = useAuth()

  return (
    <MainLayout>
      {/* Tambahkan class khusus berdasarkan role pengguna */}
      <div className={`dashboard-content ${userRole ? `dashboard-${userRole}` : ''}`}>
        <Suspense fallback={<LoadingSpinner />}>
          {children}
        </Suspense>
      </div>
    </MainLayout>
  )
}