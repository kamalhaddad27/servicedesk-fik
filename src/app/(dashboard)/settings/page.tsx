"use client"

import { Suspense } from "react"
import { motion } from "framer-motion"
import { SettingsForm } from "@/components/settings/settings-form"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

// Animation variants
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

export default function SettingsPage() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan Sistem</h1>
        <p className="text-muted-foreground">Konfigurasi Service Desk FIK sesuai kebutuhan Anda</p>
      </div>
      
      <Suspense fallback={<LoadingSpinner />}>
        <SettingsForm />
      </Suspense>
    </motion.div>
  )
}