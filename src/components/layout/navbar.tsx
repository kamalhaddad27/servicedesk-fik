"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"
import { useNotifications } from "@/hooks/use-notification"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NotificationList } from "@/components/notifications/notification-list"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Bell,
  LogOut,
  Settings,
  User,
  Search,
  HelpCircle,
  Calendar,
  PlusCircle,
  Home,
  FileText,
  ChevronDown,
  BarChart3,
  Ticket,
} from "lucide-react"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"

interface NavbarProps {
  className?: string
}

export function Navbar({ className }: NavbarProps) {
  const router = useRouter()
  const { user, logout, userRole } = useAuth()
  const { unreadCount } = useNotifications()
  const { toggleSidebar } = useSidebar()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const notificationRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const [searchOpen, setSearchOpen] = useState(false)

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node) && searchOpen) {
        setSearchOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [searchOpen])

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
    }
  }

  // Quick actions based on user role
  const quickActions = [
    {
      name: "Buat Tiket Baru",
      href: "/tickets/create",
      icon: <PlusCircle className="h-4 w-4" />,
      roles: ["mahasiswa", "dosen", "admin"],
    },
    {
      name: "Lihat Kalender",
      href: "/calendar",
      icon: <Calendar className="h-4 w-4" />,
      roles: ["dosen", "admin", "executive"],
    },
    {
      name: "Laporan",
      href: "/reports",
      icon: <FileText className="h-4 w-4" />,
      roles: ["admin", "executive"],
    },
    {
      name: "Bantuan",
      href: "/help",
      icon: <HelpCircle className="h-4 w-4" />,
      roles: ["mahasiswa", "dosen", "admin", "executive"],
    },
  ]

  const filteredQuickActions = quickActions.filter((action) => userRole && action.roles.includes(userRole))

  return (
    <header className={cn("flex h-16 items-center gap-4 border-b px-4 md:px-6", className)}>
      <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
        <SidebarTrigger className="md:hidden text-primary" />

        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/logo-upnvj.png" alt="UPNVJ Logo" width={32} height={32} className="h-8 w-auto" />
          <span className="hidden font-bold md:inline-block text-primary">Service Desk FIK</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="hidden md:flex items-center space-x-1">
        <Button variant="ghost" size="sm" asChild className="text-primary hover:bg-primary-50 hover:text-primary-700">
          <Link href="/dashboard">
            <Home className="h-4 w-4 mr-2" />
            Dashboard
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary-50 hover:text-primary-700">
              <Ticket className="h-4 w-4 mr-2" />
              Tiket
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem asChild>
              <Link href="/tickets">Semua Tiket</Link>
            </DropdownMenuItem>
            {(userRole === "mahasiswa" || userRole === "dosen" || userRole === "admin") && (
              <DropdownMenuItem asChild>
                <Link href="/tickets/create">Buat Tiket</Link>
              </DropdownMenuItem>
            )}
            {(userRole === "dosen" || userRole === "admin") && (
              <DropdownMenuItem asChild>
                <Link href="/tickets/assigned">Tiket Ditugaskan</Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {(userRole === "admin" || userRole === "executive") && (
          <Button variant="ghost" size="sm" asChild className="text-primary hover:bg-primary-50 hover:text-primary-700">
            <Link href="/reports">
              <BarChart3 className="h-4 w-4 mr-2" />
              Laporan
            </Link>
          </Button>
        )}

        <Button variant="ghost" size="sm" asChild className="text-primary hover:bg-primary-50 hover:text-primary-700">
          <Link href="/help">
            <HelpCircle className="h-4 w-4 mr-2" />
            Bantuan
          </Link>
        </Button>
      </nav>

      <div className="ml-auto flex items-center gap-4">
        {/* Search */}
        <div className="relative" ref={searchRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(!searchOpen)}
            className="relative text-primary hover:bg-primary-50 hover:text-primary-700"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Button>

          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, width: "16rem" }}
                animate={{ opacity: 1, y: 0, width: "20rem" }}
                exit={{ opacity: 0, y: 10, width: "16rem" }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 origin-top-right rounded-md bg-background shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <form onSubmit={handleSearchSubmit} className="p-2">
                  <div className="flex items-center">
                    <Input
                      type="search"
                      placeholder="Cari tiket, pengguna, atau dokumen..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                      autoFocus
                    />
                    <Button type="submit" size="sm" className="ml-2 bg-primary hover:bg-primary-600">
                      Cari
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-primary hover:bg-primary-50 hover:text-primary-700"
              aria-label="Quick Actions"
            >
              <PlusCircle className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Aksi Cepat</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {filteredQuickActions.map((action) => (
              <DropdownMenuItem key={action.href} asChild>
                <Link href={action.href} className="flex items-center">
                  {action.icon}
                  <span className="ml-2">{action.name}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative text-primary hover:bg-primary-50 hover:text-primary-700"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-white"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Button>

          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-80 origin-top-right rounded-md bg-background shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <NotificationList onClose={() => setNotificationsOpen(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8 border-2 border-primary-100">
                <AvatarFallback className="bg-primary-50 text-primary-700">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
                {user?.profileImage && (
                  <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.name || "User"} />
                )}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">{user?.name}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Pengaturan</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()} className="text-primary-700 focus:text-primary-700">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
