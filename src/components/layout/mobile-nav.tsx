"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Ticket, FileText, User, BarChart3 } from "lucide-react"

interface MobileNavProps {
  className?: string
}

export function MobileNav({ className }: MobileNavProps) {
  const pathname = usePathname()
  const { userRole } = useAuth()

  // Define navigation items based on user role
  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      roles: ["mahasiswa", "dosen", "admin", "executive"],
    },
    {
      name: "Tiket",
      href: "/tickets",
      icon: <Ticket className="h-5 w-5" />,
      roles: ["mahasiswa", "dosen", "admin", "executive"],
    },
    {
      name: "Ditugaskan",
      href: "/tickets/assigned",
      icon: <FileText className="h-5 w-5" />,
      roles: ["dosen", "admin"],
    },
    {
      name: "Laporan",
      href: "/reports",
      icon: <BarChart3 className="h-5 w-5" />,
      roles: ["admin", "executive"],
    },
    {
      name: "Profil",
      href: "/profile",
      icon: <User className="h-5 w-5" />,
      roles: ["mahasiswa", "dosen", "admin", "executive"],
    },
  ]

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter((item) => userRole && item.roles.includes(userRole))

  // Only show the most important 4-5 nav items on mobile
  const mobileNavItems = filteredNavItems.slice(0, 5)

  return (
    <motion.nav
      className={cn("py-2 px-4 bg-background border-t flex items-center justify-around", className)}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {mobileNavItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

        return (
          <Link key={item.href} href={item.href} className="block w-16 text-center">
            <motion.div
              className="flex flex-col items-center"
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className={cn("p-1 rounded-full mb-1", isActive ? "text-primary" : "text-muted-foreground")}>
                {item.icon}
              </div>
              <span className={cn("text-xs", isActive ? "text-foreground font-medium" : "text-muted-foreground")}>
                {item.name}
              </span>
            </motion.div>
          </Link>
        )
      })}
    </motion.nav>
  )
}
