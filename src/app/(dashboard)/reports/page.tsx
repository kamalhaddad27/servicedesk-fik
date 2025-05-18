"use client"

import { Suspense } from "react"
import { motion } from "framer-motion"
import { ReportsDashboard } from "@/components/reports/reports-dashboard"
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

export default function ReportsPage() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <Suspense fallback={<LoadingSpinner />}>
        <ReportsDashboard />
      </Suspense>
    </motion.div>
  )
}