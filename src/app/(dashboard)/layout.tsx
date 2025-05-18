"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"
import { useNotifications } from "@/hooks/use-notification"
import { NotificationList } from "@/components/notifications/notification-list"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ToastProvider } from "@/components/ui/toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter  } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  BarChart3,
  Bell,
  LogOut,
  Menu,
  MessageSquare,
  PlusCircle,
  Settings,
  Users,
  Search,
  HelpCircle,
  User,
  ChevronRight,
  Sun,
  Clock,
  Calendar,
  FileText,
  LayoutDashboard,
  ChevronDown,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Suspense } from "react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

// Animation variants
const sidebarItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  }),
}

const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
}

const slideUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

const notificationBadgeVariants = {
  initial: { scale: 0 },
  animate: {
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 15,
    },
  },
  exit: {
    scale: 0,
    transition: {
      duration: 0.2,
    },
  },
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { unreadCount, notifications } = useNotifications()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const headerOpacity = useTransform(scrollY, [0, 50], [1, 0.98])
  const headerShadow = useTransform(scrollY, [0, 50], ["0px 0px 0px rgba(0,0,0,0)", "0px 4px 20px rgba(0,0,0,0.05)"])

  // Track scroll for header shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      requiredRoles: ["mahasiswa", "dosen", "admin", "executive"],
      badge: null,
      description: "Lihat ringkasan aktivitas dan statistik",
    },
    {
      name: "Tiket",
      href: "/tickets",
      icon: MessageSquare,
      requiredRoles: ["mahasiswa", "dosen", "admin", "executive"],
      badge: unreadCount > 0 ? unreadCount : null,
      description: "Kelola dan pantau tiket layanan",
    },
    {
      name: "Buat Tiket",
      href: "/tickets/create",
      icon: PlusCircle,
      requiredRoles: ["mahasiswa", "dosen", "admin"],
      badge: null,
      description: "Buat tiket layanan baru",
    },
    {
      name: "Tiket Ditugaskan",
      href: "/tickets/assigned",
      icon: FileText,
      requiredRoles: ["dosen", "admin"],
      badge: null,
      description: "Lihat tiket yang ditugaskan kepada Anda",
    },
    {
      name: "Laporan",
      href: "/reports",
      icon: BarChart3,
      requiredRoles: ["admin", "executive"],
      badge: null,
      description: "Lihat laporan dan analitik",
    },
    {
      name: "Pengguna",
      href: "/users",
      icon: Users,
      requiredRoles: ["admin", "executive"],
      badge: null,
      description: "Kelola pengguna dan hak akses",
    },
    {
      name: "Pengaturan",
      href: "/settings",
      icon: Settings,
      requiredRoles: ["admin", "executive"],
      badge: null,
      description: "Konfigurasi sistem dan preferensi",
    },
  ]

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter((item) => item.requiredRoles.includes(user?.role || ""))

  // Get current active navigation item
  const activeNavItem = filteredNavigation.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  )

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Mobile header */}
      <motion.header
        style={{
          opacity: headerOpacity,
          boxShadow: headerShadow,
        }}
        className={cn(
          "sticky top-0 z-40 flex h-16 items-center justify-between px-4 py-2 md:hidden bg-white",
          scrolled ? "shadow-md" : "",
        )}
      >
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-primary-50 text-primary-600">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="py-8 border-r-primary-200 w-[300px] sm:max-w-sm">
            <SheetHeader className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8">
                    <Image src="/logo-upnvj.png" alt="UPNVJ Logo" fill className="object-contain" />
                  </div>
                  <SheetTitle className="gradient-text font-bold">Service Desk FIK</SheetTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="absolute right-4 top-4 rounded-full hover:bg-primary-50 text-primary-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </SheetHeader>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari menu atau tiket..."
                className="pl-9 bg-muted border-none focus-visible:ring-1 focus-visible:ring-primary-300"
              />
            </div>

            <nav className="space-y-1">
              {filteredNavigation.map((item, i) => (
                <motion.div
                  key={item.name}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={sidebarItemVariants}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative overflow-hidden",
                      pathname === item.href || pathname.startsWith(`${item.href}/`)
                        ? "bg-primary-500 text-white shadow-primary"
                        : "text-foreground hover:text-primary-600 hover:bg-primary-50",
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <div className="flex flex-col">
                      <span>{item.name}</span>
                      <span className="text-xs font-normal opacity-80">{item.description}</span>
                    </div>
                    {item.badge && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "ml-auto h-5 min-w-5 rounded-full px-1.5 py-0 text-xs font-medium",
                          pathname === item.href || pathname.startsWith(`${item.href}/`)
                            ? "bg-white text-primary-600 border-white"
                            : "bg-primary-50 text-primary-600 border-primary-100",
                        )}
                      >
                        {item.badge > 9 ? "9+" : item.badge}
                      </Badge>
                    )}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <SheetFooter className="absolute bottom-8 left-0 right-0 px-6">
              <div className="card-premium p-4 rounded-xl">
                <div className="gradient-border-content p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-primary-200">
                      <AvatarFallback className="bg-primary-50 text-primary-600">
                        {user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                      {user?.profileImage && (
                        <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user?.name || "User"} />
                      )}
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{user?.name}</span>
                      <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
                    </div>
                  </div>
                  <div className="divider-gradient my-3"></div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-primary-200 text-primary-600 hover:bg-primary-50"
                      asChild
                    >
                      <Link href="/profile">
                        <User className="mr-1 h-3.5 w-3.5" />
                        Profil
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => logout()}
                    >
                      <LogOut className="mr-1 h-3.5 w-3.5" />
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="relative w-6 h-6">
            <Image src="/logo-upnvj.png" alt="UPNVJ Logo" fill className="object-contain" />
          </div>
          <span className="text-primary-600 font-bold">Service Desk FIK</span>
        </Link>

        <div className="flex items-center gap-2">
          <Sheet open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-primary-50 text-primary-600">
                <Bell className="h-5 w-5" />
                <AnimatePresence>
                  {unreadCount > 0 && (
                    <motion.div
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={notificationBadgeVariants}
                      className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[10px] text-white"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </motion.div>
                  )}
                </AnimatePresence>
                <span className="sr-only">Notifications</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="border-l-primary-200 w-[380px] sm:max-w-md">
              <SheetHeader className="mb-4">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-primary-600 flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notifikasi
                    {unreadCount > 0 && (
                      <Badge variant="outline" className="bg-primary-50 text-primary-600 border-primary-100">
                        {unreadCount} baru
                      </Badge>
                    )}
                  </SheetTitle>
                  <Button variant="ghost" size="sm" className="text-xs text-primary-600 hover:bg-primary-50">
                    Tandai semua dibaca
                  </Button>
                </div>
              </SheetHeader>
              <NotificationList onClose={() => setIsNotificationOpen(false)} />
            </SheetContent>
          </Sheet>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary-50">
                <Avatar className="h-8 w-8 border-2 border-primary-100">
                  <AvatarFallback className="bg-primary-50 text-primary-600">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                  {user?.profileImage && (
                    <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user?.name || "User"} />
                  )}
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-primary-100">
              <DropdownMenuLabel className="font-bold text-primary-600">{user?.name}</DropdownMenuLabel>
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">{user?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-primary-100" />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild className="hover:bg-primary-50 hover:text-primary-600">
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:bg-primary-50 hover:text-primary-600">
                  <Link href="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Pengaturan</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-primary-100" />
              <DropdownMenuItem onClick={() => logout()} className="text-red-500 hover:bg-red-50 hover:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
                <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.header>

      <div className="flex flex-1">
        {/* Sidebar for larger screens */}
        <motion.aside
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="hidden w-[var(--sidebar-width)] flex-col border-r border-r-primary-100 bg-white md:flex"
        >
          <div className="flex h-16 items-center border-b border-b-primary-100 px-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="relative w-7 h-7">
                <Image src="/logo-upnvj.png" alt="UPNVJ Logo" fill className="object-contain" />
              </div>
              <span className="font-bold text-primary-600 text-lg">Service Desk FIK</span>
            </Link>
          </div>

          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari menu atau tiket..."
                className="pl-9 bg-muted border-none focus-visible:ring-1 focus-visible:ring-primary-300"
              />
            </div>

            <div className="mb-6">
              <div className="flex items-center px-3 mb-2">
                <h3 className="text-xs font-medium text-muted-foreground">MENU UTAMA</h3>
                <div className="ml-auto flex items-center gap-1">
                  <Badge
                    variant="outline"
                    className="h-5 px-1.5 py-0 text-[10px] bg-primary-50 text-primary-600 border-primary-100"
                  >
                    {filteredNavigation.length}
                  </Badge>
                </div>
              </div>

              <nav className="space-y-1">
                {filteredNavigation.map((item, i) => (
                  <motion.div
                    key={item.name}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={sidebarItemVariants}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative overflow-hidden",
                        pathname === item.href || pathname.startsWith(`${item.href}/`)
                          ? "bg-primary-500 text-white shadow-primary"
                          : "text-foreground hover:text-primary-600 hover:bg-primary-50",
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="truncate">{item.name}</span>
                        <span className="text-xs font-normal opacity-80 truncate">{item.description}</span>
                      </div>
                      {item.badge && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "ml-auto h-5 min-w-5 rounded-full px-1.5 py-0 text-xs font-medium flex-shrink-0",
                            pathname === item.href || pathname.startsWith(`${item.href}/`)
                              ? "bg-white text-primary-600 border-white"
                              : "bg-primary-50 text-primary-600 border-primary-100",
                          )}
                        >
                          {item.badge > 9 ? "9+" : item.badge}
                        </Badge>
                      )}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </div>

            <div className="mb-4">
              <div className="flex items-center px-3 mb-2">
                <h3 className="text-xs font-medium text-muted-foreground">PINTASAN</h3>
              </div>

              <div className="space-y-1">
                <Link
                  href="/help"
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-foreground hover:text-primary-600 hover:bg-primary-50"
                >
                  <HelpCircle className="h-5 w-5" />
                  <span>Bantuan & Dukungan</span>
                </Link>
                <Link
                  href="/calendar"
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-foreground hover:text-primary-600 hover:bg-primary-50"
                >
                  <Calendar className="h-5 w-5" />
                  <span>Kalender Layanan</span>
                </Link>
              </div>
            </div>

            <div className="card-premium p-4 rounded-xl mt-6">
              <div className="gradient-border-content p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10 border-2 border-primary-200">
                      <AvatarFallback className="bg-primary-50 text-primary-600">
                        {user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                      {user?.profileImage && (
                        <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user?.name || "User"} />
                      )}
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-success border-2 border-white"></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{user?.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
                  </div>
                </div>
                <div className="divider-gradient my-3"></div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-primary-200 text-primary-600 hover:bg-primary-50"
                    asChild
                  >
                    <Link href="/profile">
                      <User className="mr-1 h-3.5 w-3.5" />
                      Profil
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => logout()}
                  >
                    <LogOut className="mr-1 h-3.5 w-3.5" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-background">
          {/* Header for larger screens */}
          <motion.div
            style={{
              opacity: headerOpacity,
              boxShadow: headerShadow,
            }}
            className={cn(
              "hidden h-16 items-center justify-between border-b border-b-primary-100 px-6 bg-white md:flex sticky top-0 z-10 transition-all duration-200",
              scrolled ? "shadow-md" : "",
            )}
          >
            <div className="flex items-center gap-4">
              {activeNavItem && (
                <div className="flex items-center gap-2">
                  <activeNavItem.icon className="h-5 w-5 text-primary-600" />
                  <h1 className="text-lg font-semibold text-primary-600">{activeNavItem.name}</h1>
                </div>
              )}

              <div className="hidden lg:flex items-center text-sm text-muted-foreground">
                <Link href="/dashboard" className="hover:text-primary-600">
                  Home
                </Link>
                <ChevronRight className="h-4 w-4 mx-1" />
                {activeNavItem && <span className="font-medium text-foreground">{activeNavItem.name}</span>}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search bar */}
              <div className="relative hidden lg:block" ref={searchRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Cari tiket, pengguna, atau dokumen..."
                    className={cn(
                      "h-9 w-64 rounded-full bg-muted pl-9 pr-4 text-sm focus-visible:ring-1 focus-visible:ring-primary-300 border-none transition-all duration-200",
                      isSearchFocused ? "w-80" : "w-64",
                    )}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                  />
                </div>

                <AnimatePresence>
                  {isSearchFocused && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-80 rounded-lg bg-white shadow-lg border border-primary-100 z-50"
                    >
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-muted-foreground">Pencarian Cepat</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 rounded-full hover:bg-primary-50 text-muted-foreground"
                            onClick={() => setIsSearchFocused(false)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        {searchQuery ? (
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground mb-2">Hasil untuk "{searchQuery}"</div>
                            <div className="text-sm text-center py-2">Tidak ada hasil yang ditemukan</div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-xs text-muted-foreground mb-1">Pencarian Terbaru</div>
                            <div className="flex flex-col gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="justify-start h-8 px-2 text-sm hover:bg-primary-50"
                              >
                                <Clock className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                                <span>Tiket belum selesai</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="justify-start h-8 px-2 text-sm hover:bg-primary-50"
                              >
                                <Clock className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                                <span>Laporan bulanan</span>
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Quick actions */}
              <TooltipProvider>
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="hidden md:flex gap-1 border-primary-200 text-primary-600 hover:bg-primary-50"
                        >
                          <PlusCircle className="h-4 w-4" />
                          <span>Aksi Cepat</span>
                          <ChevronDown className="h-3.5 w-3.5 ml-1 opacity-70" />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Aksi cepat untuk tugas umum</TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="end" className="w-56 border-primary-100">
                    <DropdownMenuItem asChild className="hover:bg-primary-50 hover:text-primary-600">
                      <Link href="/tickets/create">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        <span>Buat Tiket Baru</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="hover:bg-primary-50 hover:text-primary-600">
                      <Link href="/reports/generate">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <span>Buat Laporan</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-primary-100" />
                    <DropdownMenuItem asChild className="hover:bg-primary-50 hover:text-primary-600">
                      <Link href="/help">
                        <HelpCircle className="mr-2 h-4 w-4" />
                        <span>Bantuan</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipProvider>

              {/* Help button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary-50 text-primary-600">
                      <HelpCircle className="h-5 w-5" />
                      <span className="sr-only">Help</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Bantuan & Dukungan</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Notifications */}
              <Sheet open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative hover:bg-primary-50 text-primary-600">
                          <Bell className="h-5 w-5" />
                          <AnimatePresence>
                            {unreadCount > 0 && (
                              <motion.div
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                variants={notificationBadgeVariants}
                                className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[10px] text-white"
                              >
                                {unreadCount > 9 ? "9+" : unreadCount}
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <span className="sr-only">Notifications</span>
                        </Button>
                      </SheetTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Notifikasi</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <SheetContent side="right" className="border-l-primary-200 w-[380px] sm:max-w-md">
                  <SheetHeader className="mb-4">
                    <div className="flex items-center justify-between">
                      <SheetTitle className="text-primary-600 flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Notifikasi
                        {unreadCount > 0 && (
                          <Badge variant="outline" className="bg-primary-50 text-primary-600 border-primary-100">
                            {unreadCount} baru
                          </Badge>
                        )}
                      </SheetTitle>
                      <Button variant="ghost" size="sm" className="text-xs text-primary-600 hover:bg-primary-50">
                        Tandai semua dibaca
                      </Button>
                    </div>
                  </SheetHeader>
                  <NotificationList onClose={() => setIsNotificationOpen(false)} />
                </SheetContent>
              </Sheet>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary-50">
                    <Avatar className="h-8 w-8 border-2 border-primary-100">
                      <AvatarFallback className="bg-primary-50 text-primary-600">
                        {user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                      {user?.profileImage && (
                        <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user?.name || "User"} />
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 border-primary-100">
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-10 w-10 border-2 border-primary-100">
                      <AvatarFallback className="bg-primary-50 text-primary-600">
                        {user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                      {user?.profileImage && (
                        <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user?.name || "User"} />
                      )}
                    </Avatar>
                    <div>
                      <DropdownMenuLabel className="font-bold text-primary-600 p-0">{user?.name}</DropdownMenuLabel>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-primary-100" />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild className="hover:bg-primary-50 hover:text-primary-600">
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="hover:bg-primary-50 hover:text-primary-600">
                      <Link href="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Pengaturan</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-primary-100" />
                  <DropdownMenuGroup>
                    <DropdownMenuItem className="hover:bg-primary-50 hover:text-primary-600">
                      <Sun className="mr-2 h-4 w-4" />
                      <span>Light Mode</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-primary-100" />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </motion.div>

          {/* Page content */}
          <motion.div className="p-4 md:p-6" initial="hidden" animate="visible" variants={slideUpVariants}>
            <Suspense>{children}</Suspense>
          </motion.div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-primary-100 flex items-center justify-around px-2 z-30"
      >
        {filteredNavigation.slice(0, 5).map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link key={item.name} href={item.href} className="flex flex-col items-center justify-center w-16 relative">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "flex flex-col items-center justify-center",
                  isActive ? "text-primary-600" : "text-muted-foreground",
                )}
              >
                <div className={cn("p-1.5 rounded-full mb-1", isActive ? "bg-primary-50" : "")}>
                  <item.icon className="h-5 w-5" />
                  {item.badge && (
                    <span className="absolute top-0 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[10px] text-white">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium">{item.name}</span>
              </motion.div>
            </Link>
          )
        })}
      </motion.div>

      <ToastProvider />
    </div>
  )
}
