"use client"

import { Suspense } from "react"
import { motion } from "framer-motion"
import { UserList } from "@/components/users/user-list"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

// Stagger animation for list elements
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

export default function UsersPage() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
        <p className="text-muted-foreground">Kelola pengguna dalam sistem Service Desk FIK</p>
      </div>
      
      <Suspense fallback={<LoadingSpinner />}>
        <UserList />
      </Suspense>
    </motion.div>
  )
}