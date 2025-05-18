"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"
import {
  LayoutDashboard,
  Ticket,
  Users,
  Settings,
  BarChart3,
  FileText,
  User,
  PlusCircle,
  Calendar,
  HelpCircle,
  LogOut,
  ChevronDown,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

// Animation variants
const itemVariants = {
  open: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
  closed: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2 },
  },
}

const iconVariants = {
  open: {
    rotate: 0,
    transition: { duration: 0.2 },
  },
  closed: {
    rotate: -90,
    transition: { duration: 0.2 },
  },
}

export function AppSidebar() {
  const { user, userRole, logout } = useAuth()
  const pathname = usePathname()
  const { state } = useSidebar()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    tickets: true,
    help: false,
  })

  // Reset open groups when sidebar collapses
  useEffect(() => {
    if (state === "collapsed") {
      setOpenGroups({})
    }
  }, [state])

  const toggleGroup = (group: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }))
  }

  // Navigation items definitions
  const navItems = useMemo(() => {
    // Main navigation items
    const mainNavItems = [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: <LayoutDashboard className="h-4 w-4" />,
        roles: ["mahasiswa", "dosen", "admin", "executive"],
      },
    ]

    // Ticket navigation items
    const ticketNavItems = [
      {
        name: "Semua Tiket",
        href: "/tickets",
        icon: <Ticket className="h-4 w-4" />,
        roles: ["mahasiswa", "dosen", "admin", "executive"],
      },
      {
        name: "Buat Tiket",
        href: "/tickets/create",
        icon: <PlusCircle className="h-4 w-4" />,
        roles: ["mahasiswa", "dosen", "admin"],
      },
      {
        name: "Tiket Ditugaskan",
        href: "/tickets/assigned",
        icon: <FileText className="h-4 w-4" />,
        roles: ["dosen", "admin"],
      },
    ]

    // Admin navigation items
    const adminNavItems = [
      {
        name: "Pengguna",
        href: "/users",
        icon: <Users className="h-4 w-4" />,
        roles: ["admin", "executive"],
      },
      {
        name: "Laporan",
        href: "/reports",
        icon: <BarChart3 className="h-4 w-4" />,
        roles: ["admin", "executive"],
      },
      {
        name: "Kalender",
        href: "/calendar",
        icon: <Calendar className="h-4 w-4" />,
        roles: ["admin", "executive", "dosen"],
      },
      {
        name: "Pengaturan",
        href: "/settings",
        icon: <Settings className="h-4 w-4" />,
        roles: ["admin", "executive"],
      },
    ]

    // Help navigation items
    const helpNavItems = [
      {
        name: "Panduan Pengguna",
        href: "/help/guide",
        icon: <FileText className="h-4 w-4" />,
        roles: ["mahasiswa", "dosen", "admin", "executive"],
      },
      {
        name: "FAQ",
        href: "/help/faq",
        icon: <HelpCircle className="h-4 w-4" />,
        roles: ["mahasiswa", "dosen", "admin", "executive"],
      },
      {
        name: "Kontak Support",
        href: "/help/contact",
        icon: <User className="h-4 w-4" />,
        roles: ["mahasiswa", "dosen", "admin", "executive"],
      },
    ]

    return {
      mainNavItems,
      ticketNavItems,
      adminNavItems,
      helpNavItems,
    }
  }, [])

  // Filter items based on user role
  const filteredMainNavItems = navItems.mainNavItems.filter((item) => userRole && item.roles.includes(userRole))
  const filteredTicketNavItems = navItems.ticketNavItems.filter((item) => userRole && item.roles.includes(userRole))
  const filteredAdminNavItems = navItems.adminNavItems.filter((item) => userRole && item.roles.includes(userRole))
  const filteredHelpNavItems = navItems.helpNavItems.filter((item) => userRole && item.roles.includes(userRole))

  // Render menu item helper function
  const renderMenuItem = (item: any, isActive: boolean) => (
    <SidebarMenuItem key={item.href}>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.name}
        className="text-foreground hover:bg-primary-50 hover:text-primary-700 data-[active=true]:bg-primary-50 data-[active=true]:text-primary-700"
      >
        <Link href={item.href}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mr-2 text-primary-500">
            {item.icon}
          </motion.div>
          <AnimatePresence>
            {state === "expanded" && (
              <motion.span initial="closed" animate="open" exit="closed" variants={itemVariants}>
                {item.name}
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )

  return (
    <Sidebar className="sidebar glass-sidebar">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <Image src="/logo-upnvj.png" alt="UPNVJ Logo" width={32} height={32} className="h-8 w-auto" />
          <AnimatePresence>
            {state === "expanded" && (
              <motion.div
                initial="closed"
                animate="open"
                exit="closed"
                variants={itemVariants}
                className="flex flex-col"
              >
                <span className="font-bold text-sm text-primary">Service Desk</span>
                <span className="text-xs text-muted-foreground">FIK UPNVJ</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SidebarHeader>

      <SidebarSeparator className="bg-primary-100" />

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarMenu>
            {filteredMainNavItems.map((item) => {
              const isActive = pathname === item.href
              return renderMenuItem(item, isActive)
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Tickets Group */}
        <SidebarGroup>
          <Collapsible
            open={state === "expanded" && openGroups.tickets}
            onOpenChange={
              state === "expanded" ? (open) => setOpenGroups((prev) => ({ ...prev, tickets: open })) : undefined
            }
            className="w-full"
          >
            <SidebarGroupLabel asChild className="text-primary-700">
              <CollapsibleTrigger
                className="w-full flex justify-between items-center"
                onClick={() => state === "expanded" && toggleGroup("tickets")}
              >
                <span>Tiket</span>
                {state === "expanded" && (
                  <motion.div animate={openGroups.tickets ? "open" : "closed"} variants={iconVariants}>
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                )}
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent className="data-[state=closed]:hidden">
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredTicketNavItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                    return renderMenuItem(item, isActive)
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {/* Admin Group */}
        {filteredAdminNavItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-primary-700">Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredAdminNavItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  return renderMenuItem(item, isActive)
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Help Group */}
        <SidebarGroup>
          <Collapsible
            open={state === "expanded" && openGroups.help}
            onOpenChange={
              state === "expanded" ? (open) => setOpenGroups((prev) => ({ ...prev, help: open })) : undefined
            }
            className="w-full"
          >
            <SidebarGroupLabel asChild className="text-primary-700">
              <CollapsibleTrigger
                className="w-full flex justify-between items-center"
                onClick={() => state === "expanded" && toggleGroup("help")}
              >
                <span>Bantuan</span>
                {state === "expanded" && (
                  <motion.div animate={openGroups.help ? "open" : "closed"} variants={iconVariants}>
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                )}
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent className="data-[state=closed]:hidden">
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredHelpNavItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                    return renderMenuItem(item, isActive)
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator className="bg-primary-100" />
        <AnimatePresence mode="wait">
          {state === "expanded" ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="p-2"
            >
              <div className="flex items-center gap-3 rounded-md bg-primary-50 p-2">
                <Avatar className="h-8 w-8 border-2 border-primary-200">
                  <AvatarFallback className="bg-primary-100 text-primary-700">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                  {user?.profileImage && (
                    <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.name || "User"} />
                  )}
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium truncate">{user?.name}</span>
                  <span className="text-xs text-muted-foreground truncate">{user?.role}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto h-7 w-7 rounded-full text-primary-700 hover:bg-primary-100"
                  onClick={() => logout()}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Logout</span>
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex justify-center p-2"
            >
              <Avatar className="h-8 w-8 border-2 border-primary-200">
                <AvatarFallback className="bg-primary-100 text-primary-700">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
                {user?.profileImage && (
                  <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.name || "User"} />
                )}
              </Avatar>
            </motion.div>
          )}
        </AnimatePresence>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
