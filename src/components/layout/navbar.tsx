"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/hooks/use-notification";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationList } from "@/components/notifications/notification-list";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Bell,
  LogOut,
  Settings,
  User,
  Search,
  HelpCircle,
  Calendar,
  PlusCircle,
  Menu,
  X,
  FileText,
  BarChart3,
  Ticket,
} from "lucide-react";
import { useSession } from "@/context/SessionContext";
import { logout } from "@/lib/action/auth.action";

interface NavbarProps {
  className?: string;
  toggleSidebar?: () => void;
  userRole?: string;
  isMobile?: boolean;
}

export function Navbar({
  className,
  toggleSidebar,
  userRole,
  isMobile,
}: NavbarProps) {
  const router = useRouter();
  const { user } = useSession();
  const { unreadCount } = useNotifications();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const notificationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Close notifications and search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node) &&
        searchOpen
      ) {
        setSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchOpen]);

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  // Quick actions based on user role
  const quickActions = [
    {
      name: "Buat Tiket Baru",
      href: "/tickets/create",
      icon: <PlusCircle className="h-4 w-4" />,
      roles: ["mahasiswa", "staff", "admin"],
    },
    {
      name: "Tiket Ditugaskan",
      href: "/tickets/assigned",
      icon: <FileText className="h-4 w-4" />,
      roles: ["staff"],
    },
    {
      name: "Kalender",
      href: "/calendar",
      icon: <Calendar className="h-4 w-4" />,
      roles: ["staff", "admin", "executive"],
    },
    {
      name: "Bantuan",
      href: "/help",
      icon: <HelpCircle className="h-4 w-4" />,
      roles: ["mahasiswa", "staff", "admin"],
    },
  ];

  const filteredQuickActions = quickActions
    .filter((action) => userRole && action.roles.includes(userRole))
    .slice(0, 5); // Only show top 5

  return (
    <header
      className={cn(
        "navbar flex h-[var(--header-height)] items-center gap-4 border-b px-4",
        className
      )}
    >
      {/* Mobile menu trigger and Logo section */}
      <div className="flex items-center gap-3 md:gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>

        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/logo-upnvj.png"
            alt="UPNVJ Logo"
            width={28}
            height={28}
            className="h-8 w-auto"
          />
          <div className="hidden md:block">
            <span className="font-semibold text-sm text-primary-600">
              Service Desk
            </span>
          </div>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-1 mx-4">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-foreground hover:bg-muted"
        >
          <Link href="/dashboard">Dashboard</Link>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-foreground hover:bg-muted"
        >
          <Link href="/tickets">Tiket</Link>
        </Button>
      </nav>

      {/* Right side actions */}
      <div className="ml-auto flex items-center gap-2">
        {/* Search */}
        <div className="relative" ref={searchRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(!searchOpen)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Search className="h-5 w-5" />
          </Button>

          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 10,
                  width: isMobile ? "calc(100vw - 2rem)" : "20rem",
                }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "fixed top-[var(--header-height)] right-0 p-3 bg-background border border-border shadow-lg rounded-md z-50",
                  isMobile ? "left-0 mx-4 mt-2" : "mt-1 right-3 w-80"
                )}
              >
                <form onSubmit={handleSearchSubmit} className="flex w-full">
                  <Input
                    type="search"
                    placeholder="Cari tiket, pengguna, atau dokumen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                    autoFocus
                  />
                  <Button type="submit" className="ml-2">
                    Cari
                  </Button>
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
              className="relative text-muted-foreground hover:text-foreground"
              aria-label="Quick Actions"
            >
              <PlusCircle className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-background">
            <DropdownMenuLabel>Aksi Cepat</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {filteredQuickActions.map((action) => (
              <DropdownMenuItem key={action.href} asChild>
                <Link href={action.href} className="flex items-center">
                  <span className="text-primary-500 mr-2">{action.icon}</span>
                  <span>{action.name}</span>
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
            className="relative text-muted-foreground hover:text-foreground"
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
                className={cn(
                  "fixed z-50 bg-background border border-border shadow-lg rounded-md overflow-hidden",
                  isMobile
                    ? "top-[var(--header-height)] left-0 right-0 mx-4 mt-2 max-h-[80vh]"
                    : "top-[var(--header-height)] right-4 mt-1 w-80 max-h-[calc(100vh-var(--header-height)-2rem)]"
                )}
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
              <Avatar className="h-8 w-8 border border-primary-100">
                <AvatarFallback className="bg-primary-50 text-primary-700">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-background">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">{user?.name}</span>
                <span className="text-xs text-muted-foreground">
                  {user?.email}
                </span>
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
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
