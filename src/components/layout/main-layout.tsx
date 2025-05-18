"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sidebar } from "./sidebar"
import { Navbar } from "./navbar"
import { MobileNav } from "./mobile-nav"
import { useMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

// Sidebar animation variants
const sidebarVariants = {
  open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
  closed: { x: "-100%", transition: { type: "spring", stiffness: 300, damping: 30 } },
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { isMobile, isTablet, isDesktop } = useMobile()
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)
  const { userRole } = useAuth()

  // Update sidebar state when screen size changes
  useEffect(() => {
    setSidebarOpen(!isMobile)
  }, [isMobile])

  // Dynamic content class based on sidebar state and screen size
  const contentClassName = cn("flex-1 overflow-y-auto p-4 transition-all duration-300", {
    "md:p-6": !isMobile,
    "md:ml-64": sidebarOpen && (isTablet || isDesktop),
    "md:ml-16": !sidebarOpen && (isTablet || isDesktop) && userRole !== "mahasiswa",
  })

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar toggleSidebar={() => setSidebarOpen((prev) => !prev)} sidebarOpen={sidebarOpen} />

      <div className="flex flex-1 overflow-hidden">
        <AnimatePresence>
          {(sidebarOpen || (!isMobile && userRole !== "mahasiswa")) && (
            <motion.div
              initial={isMobile ? "closed" : "open"}
              animate="open"
              exit="closed"
              variants={sidebarVariants}
              className={cn(
                "fixed inset-y-0 left-0 z-20 bg-background border-r shadow-sm",
                isMobile ? "w-64 top-16" : "md:w-64 md:relative md:top-0",
                !sidebarOpen && !isMobile ? "md:w-16" : "",
              )}
            >
              <Sidebar collapsed={!sidebarOpen && !isMobile} onToggle={() => setSidebarOpen((prev) => !prev)} />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.main
          className={contentClassName}
          animate={{
            marginLeft: isMobile
              ? 0
              : sidebarOpen
                ? "var(--sidebar-width, 16rem)"
                : userRole !== "mahasiswa"
                  ? "4rem"
                  : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {children}
        </motion.main>
      </div>

      {isMobile && <MobileNav className="fixed bottom-0 left-0 right-0 z-10" />}
    </div>
  )
}
