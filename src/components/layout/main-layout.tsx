"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { AppSidebar } from "./app-sidebar"
import { Navbar } from "./navbar"
import { MobileNav } from "./mobile-nav"
import { useMobile } from "@/hooks/use-mobile"
import { ToastProvider } from "@/components/ui/toast"
import { SidebarProvider } from "@/components/ui/sidebar"
import { motion, AnimatePresence } from "framer-motion"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { isMobile } = useMobile()
  const pathname = usePathname()

  // Get sidebar state from cookie on client side
  const getSidebarState = () => {
    if (typeof window === "undefined") return true
    const sidebarCookie = document.cookie.split("; ").find((row) => row.startsWith("sidebar:state="))
    return sidebarCookie ? sidebarCookie.split("=")[1] === "true" : true
  }

  // Page transition variants
  const pageVariants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  }

  return (
    <SidebarProvider defaultOpen={getSidebarState()}>
      <div className="layout-container">
        <Navbar className="navbar glass-navbar" />
        <div className="layout-content">
          <AppSidebar />
          <AnimatePresence mode="wait">
            <motion.main
              key={pathname}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="layout-main"
            >
              {children}
            </motion.main>
          </AnimatePresence>
        </div>
        {isMobile && <MobileNav className="fixed bottom-0 left-0 right-0 z-10" />}
        <ToastProvider />
      </div>
    </SidebarProvider>
  )
}
