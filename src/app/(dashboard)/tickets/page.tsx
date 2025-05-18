"use client"

import { Suspense } from "react"
import { motion } from "framer-motion"
import { TicketList } from "@/components/tickets/ticket-list"
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

export default function TicketsPage() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tiket</h1>
        <p className="text-muted-foreground">Kelola dan pantau semua tiket dalam sistem</p>
      </div>
      
      <Suspense fallback={<LoadingSpinner />}>
        <TicketList />
      </Suspense>
    </motion.div>
  )
}