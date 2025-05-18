"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"
import { MahasiswaDashboard } from "@/components/dashboard/mahasiswa-dashboard"
import { DosenDashboard } from "@/components/dashboard/dosen-dashboard"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { ExecutiveDashboard } from "@/components/dashboard/executive-dashboard"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

// Stagger animation for dashboard elements
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
}

export default function DashboardPage() {
  const router = useRouter()
  const { userRole, isLoading, isAuthenticated } = useAuth()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return <LoadingSpinner />
  }

  // Render dashboard based on user role
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {userRole === "mahasiswa" && <MahasiswaDashboard />}
      {userRole === "dosen" && <DosenDashboard />}
      {userRole === "admin" && <AdminDashboard />}
      {userRole === "executive" && <ExecutiveDashboard />}
    </motion.div>
  )
}
