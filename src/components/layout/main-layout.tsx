"use client"

import { ReactNode, useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Sidebar } from "./app-sidebar"
import { Navbar } from "./navbar"
import { MobileNav } from "./mobile-nav"
import { useMobile } from "@/hooks/use-mobile"
import { ToastProvider } from "@/providers/toast-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { motion, AnimatePresence } from "framer-motion"

type MainLayoutProps = {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isMobile } = useMobile()
  const pathname = usePathname()
  const { userRole } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Load sidebar preference on mount and check for mobile
  useEffect(() => {
    const checkSidebarState = () => {
      const savedState = localStorage.getItem("sidebar-state")
      
      // Default to closed on mobile, use saved state or default to open on desktop
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
        setMobileSidebarOpen(false)
      } else {
        setSidebarOpen(savedState ? savedState === "open" : true)
      }
    }
    
    // Check on mount
    checkSidebarState()
    
    // Listen for window resize events
    window.addEventListener('resize', checkSidebarState)
    
    // Clean up
    return () => window.removeEventListener('resize', checkSidebarState)
  }, [])

  // Function to toggle sidebar on desktop
  const toggleSidebar = () => {
    if (isMobile) {
      // For mobile, toggle the mobile sidebar
      setMobileSidebarOpen(!mobileSidebarOpen)
    } else {
      // For desktop, toggle the regular sidebar and save state
      const newState = !sidebarOpen
      setSidebarOpen(newState)
      localStorage.setItem("sidebar-state", newState ? "open" : "closed")
    }
  }

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (mobileSidebarOpen) {
      setMobileSidebarOpen(false)
    }
  }, [pathname])

  // Page transition variants
  const pageVariants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  }

  return (
    <TooltipProvider>
      <div className="layout-container">
        <Navbar 
          className="navbar" 
          toggleSidebar={toggleSidebar}
          userRole={userRole}
          isMobile={isMobile}
        />
        
        <div className="layout-content">
          {/* Desktop Sidebar */}
          {!isMobile && (
            <Sidebar 
              isOpen={sidebarOpen} 
              userRole={userRole} 
            />
          )}
          
          {/* Mobile Sidebar - conditionally rendered with overlay */}
          {isMobile && (
            <>
              {/* Backdrop/overlay */}
              {mobileSidebarOpen && (
                <div 
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                  onClick={() => setMobileSidebarOpen(false)}
                  aria-hidden="true"
                />
              )}
              
              {/* Mobile sidebar with animation */}
              <AnimatePresence>
                {mobileSidebarOpen && (
                  <motion.div
                    initial={{ x: -300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    className="fixed inset-y-0 left-0 z-50"
                  >
                    <Sidebar 
                      isOpen={true} 
                      userRole={userRole} 
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
          
          <AnimatePresence mode="wait">
            <motion.main
              key={pathname}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className={`layout-main ${!isMobile && sidebarOpen ? 'md:ml-[var(--sidebar-width)]' : !isMobile ? 'md:ml-[var(--sidebar-collapsed-width)]' : ''}`}
              style={{
                transition: 'margin-left 0.2s ease',
              }}
            >
              {children}
            </motion.main>
          </AnimatePresence>
        </div>
        
        {isMobile && <MobileNav userRole={userRole} />}
        <ToastProvider />
      </div>
    </TooltipProvider>
  )
}