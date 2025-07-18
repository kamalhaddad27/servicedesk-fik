"use client";

import { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./app-sidebar";
import { Navbar } from "./navbar";
import { MobileNav } from "./mobile-nav";
import { useMobile } from "@/hooks/use-mobile";
import { ToastProvider } from "@/providers/toast-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/context/SessionContext";
import { LoadingSpinner } from "../ui/loading-spinner";

type MainLayoutProps = {
  children: ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, isLoading } = useSession();

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileSidebarOpen(false);
      }
    };

    checkScreenSize();

    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      const savedState = localStorage.getItem("sidebar-state");
      setSidebarOpen(savedState ? savedState === "open" : true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileSidebarOpen((prev) => !prev);
    } else {
      const newState = !sidebarOpen;
      setSidebarOpen(newState);
      localStorage.setItem("sidebar-state", newState ? "open" : "closed");
    }
  };

  useEffect(() => {
    if (mobileSidebarOpen) {
      setMobileSidebarOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const userRole = user?.role;

  if (isLoading) {
    return <LoadingSpinner />;
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
          {!isMobile && <Sidebar isOpen={sidebarOpen} userRole={userRole} />}

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
                    <Sidebar isOpen={true} userRole={userRole} />
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
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className={`layout-main`}
              style={{
                transition: "margin-left 0.2s ease",
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
  );
}
