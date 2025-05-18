"use client"

import { Suspense } from "react"
import { motion } from "framer-motion"
import { CategoriesForm } from "@/components/settings/categories-form"
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

export default function CategoriesPage() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Kategori Tiket</h1>
        <p className="text-muted-foreground">Kelola kategori dan subkategori tiket</p>
      </div>
      
      <Suspense fallback={<LoadingSpinner />}>
        <CategoriesForm />
      </Suspense>
    </motion.div>
  )
}