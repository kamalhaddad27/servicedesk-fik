"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Ticket,
  FileText,
  User,
  HelpCircle,
  PlusCircle,
} from "lucide-react";

interface MobileNavProps {
  className?: string;
  userRole?: string;
}

export function MobileNav({ className, userRole }: MobileNavProps) {
  const pathname = usePathname();

  // Define navigation items based on user role
  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      roles: ["mahasiswa", "staff", "admin"],
    },
    {
      name: "Tiket",
      href: "/tickets",
      icon: <Ticket className="h-5 w-5" />,
      roles: ["mahasiswa", "staff", "admin"],
    },
    {
      name: "Buat",
      href: "/tickets/create",
      icon: <PlusCircle className="h-5 w-5" />,
      roles: ["mahasiswa", "staff", "admin"],
    },
    {
      name: "Ditugaskan",
      href: "/tickets/assigned",
      icon: <FileText className="h-5 w-5" />,
      roles: ["staff"],
    },
    {
      name: "Bantuan",
      href: "/services/help",
      icon: <HelpCircle className="h-5 w-5" />,
      roles: ["mahasiswa", "staff", "admin"],
    },
    {
      name: "Profil",
      href: "/profile",
      icon: <User className="h-5 w-5" />,
      roles: ["mahasiswa", "staff", "admin"],
    },
  ];

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(
    (item) => userRole && item.roles.includes(userRole)
  );

  // Only show the most important 5 nav items on mobile
  const mobileNavItems = filteredNavItems.slice(0, 5);

  return (
    <motion.nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background py-2 px-4 flex items-center justify-around h-[var(--mobile-nav-height)]",
        className
      )}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {mobileNavItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link key={item.href} href={item.href} className="block text-center">
            <motion.div
              className="flex flex-col items-center"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <div
                className={cn(
                  "p-1.5 rounded-full mb-1 transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                )}
              >
                {item.icon}
              </div>
              <span
                className={cn(
                  "text-xs transition-colors",
                  isActive
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                )}
              >
                {item.name}
              </span>
            </motion.div>
          </Link>
        );
      })}
    </motion.nav>
  );
}
