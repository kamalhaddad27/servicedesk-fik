"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { AppSidebar } from "./app-sidebar"
import { Navbar } from "./navbar"
import { MobileNav } from "./mobile-nav"
import { useMobile } from "@/hooks/use-mobile"
import { ToastProvider } from "@/components/ui/toast"
import { SidebarProvider } from "@/components/ui/sidebar"
import { motion } from "framer-motion"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { isMobile } = useMobile()
  const pathname = usePathname()

  // Get sidebar state from cookie on client side
  const getSidebarState = () => {
    if (typeof window === "undefined") return true
    const sidebarCookie = document.cookie.split("; ").find((row) => row.startsWith("sidebar:state="))
    return sidebarCookie ? sidebarCookie.split("=")[1] === "true" : true
  }

  return (
    <SidebarProvider defaultOpen={getSidebarState()}>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 overflow-y-auto p-4 md:p-6 transition-all duration-300 bg-background"
          >
            {children}
          </motion.main>
        </div>
        {isMobile && <MobileNav className="fixed bottom-0 left-0 right-0 z-10" />}
        <ToastProvider />
      </div>
    </SidebarProvider>
  )
}
