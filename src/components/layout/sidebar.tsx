"use client"

import type React from "react"

import { useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Ticket,
  Users,
  Settings,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  FileText,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

interface NavItem {
  name: string
  href: string
  icon: React.ReactNode
  roles: string[]
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { userRole } = useAuth()

  const navItems: NavItem[] = useMemo(
    () => [
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
        name: "Tiket Ditugaskan",
        href: "/tickets/assigned",
        icon: <FileText className="h-5 w-5" />,
        roles: ["dosen", "admin"],
      },
      {
        name: "Pengguna",
        href: "/users",
        icon: <Users className="h-5 w-5" />,
        roles: ["admin", "executive"],
      },
      {
        name: "Laporan",
        href: "/reports",
        icon: <BarChart3 className="h-5 w-5" />,
        roles: ["admin", "executive"],
      },
      {
        name: "Pengaturan",
        href: "/settings",
        icon: <Settings className="h-5 w-5" />,
        roles: ["admin", "executive"],
      },
      {
        name: "Profil",
        href: "/profile",
        icon: <User className="h-5 w-5" />,
        roles: ["mahasiswa", "dosen", "admin", "executive"],
      },
    ],
    [],
  )

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter((item) => userRole && item.roles.includes(userRole))

  return (
    <div className="flex h-full flex-col gap-2 p-4">
      <div className="flex items-center justify-end py-2">
        <Button variant="ghost" size="icon" onClick={onToggle} className="hidden md:flex">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          <span className="sr-only">{collapsed ? "Expand sidebar" : "Collapse sidebar"}</span>
        </Button>
      </div>

      <nav className="grid gap-1 px-2">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                {item.icon}
              </motion.div>
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
