"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
// import { useNotifications } from "@/hooks/use-notification";
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
import { NotificationBell } from "../notifications/notification-bell";

interface NavbarProps {
  className?: string;
  toggleSidebar?: () => void;
}

export function Navbar({ className, toggleSidebar }: NavbarProps) {
  const router = useRouter();
  const { user } = useSession();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

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
        {/* Notifications */}
        <NotificationBell />

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
