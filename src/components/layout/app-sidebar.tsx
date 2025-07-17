"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  LayoutDashboard,
  Ticket,
  Users,
  Settings,
  FileText,
  PlusCircle,
  HelpCircle,
  LogOut,
  ChevronDown,
  ClipboardList,
  Book,
  Bell,
  Database,
  Layers,
  BookOpen,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types";
import { useSession } from "@/context/SessionContext";
import { logout } from "@/lib/action/auth.action";

// Animation variants
const itemVariants: Variants = {
  open: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
  closed: {
    opacity: 0,
    x: -10,
    transition: { duration: 0.2 },
  },
};

const iconVariants = {
  open: {
    rotate: 0,
    transition: { duration: 0.2 },
  },
  closed: {
    rotate: -90,
    transition: { duration: 0.2 },
  },
};

interface SidebarProps {
  isOpen: boolean;
  userRole?: UserRole;
}

export function Sidebar({ isOpen, userRole }: SidebarProps) {
  const { user } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  // Use useRef to avoid the infinite re-renders
  const openGroupsRef = useRef<Record<string, boolean>>({
    tickets: true,
    help: false,
  });

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Use this state only for re-rendering the component when groups toggle
  const [, setTriggerRender] = useState(0);

  // Function to toggle a group
  const toggleGroup = (group: string) => {
    if (!isOpen) return;

    // Update the ref directly
    openGroupsRef.current = {
      ...openGroupsRef.current,
      [group]: !openGroupsRef.current[group],
    };

    // Trigger re-render
    setTriggerRender((prev) => prev + 1);
  };

  // Reset open groups when sidebar collapses - without causing infinite loops
  useEffect(() => {
    if (!isOpen) {
      openGroupsRef.current = {};
      setTriggerRender((prev) => prev + 1);
    }
  }, [isOpen]);

  // Define navigation items based on role with different visual hierarchies
  const getNav = () => {
    // Common items for all roles
    const common = {
      // Dashboard varies by role for different views
      dashboard: {
        name: "Dashboard",
        href: "/dashboard",
        icon: <LayoutDashboard className="h-4 w-4" />,
        color: "text-blue-500",
      },

      // Tickets section with sub-items
      tickets: {
        name: "Tiket",
        icon: <Ticket className="h-4 w-4" />,
        color: "text-primary-500",
        subItems: [
          ...(userRole === "user" || userRole === "admin"
            ? [
                {
                  name: "Buat Tiket",
                  href: "/tickets/create",
                  icon: <PlusCircle className="h-4 w-4" />,
                  color: "text-primary-400",
                },
              ]
            : []),
          {
            name: "Semua Tiket",
            href: "/tickets",
            icon: <FileText className="h-4 w-4" />,
            color: "text-primary-600",
          },
          ...(userRole === "staff"
            ? [
                {
                  name: "Tiket Ditugaskan",
                  href: "/tickets/assigned",
                  icon: <ClipboardList className="h-4 w-4" />,
                  color: "text-primary-500",
                },
              ]
            : []),
          ...(userRole === "user"
            ? [
                {
                  name: "Tiket Saya",
                  href: "/tickets/my-tickets",
                  icon: <ClipboardList className="h-4 w-4" />,
                  color: "text-primary-500",
                },
              ]
            : []),
        ],
      },

      // Help & Support section
      help: {
        name: "Bantuan",
        icon: <HelpCircle className="h-4 w-4" />,
        color: "text-amber-500",
        subItems: [
          {
            name: "Panduan Pengguna",
            href: "/help/guide",
            icon: <BookOpen className="h-4 w-4" />,
            color: "text-amber-400",
          },
          {
            name: "FAQ",
            href: "/help/contact",
            icon: <HelpCircle className="h-4 w-4" />,
            color: "text-amber-500",
          },
        ],
      },
    };

    // Role-specific items
    switch (userRole) {
      case "user":
        return {
          main: [common.dashboard],
          groups: [
            common.tickets,
            {
              name: "Layanan",
              icon: <Layers className="h-4 w-4" />,
              color: "text-green-500",
              subItems: [
                {
                  name: "Panduan Layanan",
                  href: "/help/guides",
                  icon: <Book className="h-4 w-4" />,
                  color: "text-green-500",
                },
                {
                  name: "Status Layanan",
                  href: "/service-status",
                  icon: <Bell className="h-4 w-4" />,
                  color: "text-green-600",
                },
              ],
            },
            common.help,
          ],
        };

      case "admin":
        return {
          main: [common.dashboard],
          groups: [
            common.tickets,
            {
              name: "Administrasi",
              icon: <Database className="h-4 w-4" />,
              color: "text-violet-500",
              subItems: [
                {
                  name: "Pengguna",
                  href: "/users",
                  icon: <Users className="h-4 w-4" />,
                  color: "text-violet-400",
                },
                {
                  name: "Pengaturan",
                  href: "/settings",
                  icon: <Settings className="h-4 w-4" />,
                  color: "text-violet-600",
                },
              ],
            },
            common.help,
          ],
        };

      default:
        return {
          main: [common.dashboard],
          groups: [common.tickets, common.help],
        };
    }
  };

  const nav = getNav();

  // Sidebar Link component
  const SidebarLink = ({
    item,
    isActive,
  }: {
    item: any;
    isActive: boolean;
  }) => (
    <Link
      href={item.href}
      className={cn(
        "flex items-center rounded-md p-2 text-sm transition-colors",
        isActive
          ? "bg-primary-50 font-medium"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <span className={cn("mr-2", item.color || "text-primary-500")}>
        {item.icon}
      </span>
      <AnimatePresence>
        {isOpen && (
          <motion.span
            initial="closed"
            animate="open"
            exit="closed"
            variants={itemVariants}
            className={cn("truncate", isActive ? item.color : "")}
          >
            {item.name}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );

  return (
    <aside
      className={cn(
        "sidebar h-full flex flex-col border-r bg-gradient-to-b",
        "from-violet-500/5 to-fuchsia-500/5 border-violet-500/10",
        isOpen
          ? "w-[var(--sidebar-width)]"
          : "w-[var(--sidebar-collapsed-width)]",
        "transition-all duration-200 ease-in-out"
      )}
    >
      {/* Sidebar header with role-based styling */}
      <div
        className={cn(
          "flex items-center h-14 px-3 border-b",
          "from-violet-500/5 to-fuchsia-500/5 border-violet-500/10"
        )}
      >
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/logo-upnvj.png"
            alt="UPNVJ Logo"
            width={28}
            height={28}
            className="h-8 w-auto"
          />
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial="closed"
                animate="open"
                exit="closed"
                variants={itemVariants}
                className="flex flex-col"
              >
                <span className="font-semibold text-sm text-primary-600">
                  Service Desk
                </span>
                <span className="text-xs text-muted-foreground">FIK UPNVJ</span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Sidebar content */}
      <div className="flex-1 overflow-auto py-2 px-2 space-y-2">
        {/* Main items */}
        <div className="mb-2">
          {nav.main.map((item: any) => {
            const isActive = pathname === item.href;
            return (
              <SidebarLink key={item.name} item={item} isActive={isActive} />
            );
          })}
        </div>

        {/* Groups with collapsible sections */}
        {nav.groups.map((group: any) => (
          <div key={group.name} className="space-y-1">
            {/* Group header */}
            <button
              className={cn(
                "flex w-full items-center justify-between p-2 text-sm rounded-md",
                "hover:bg-muted font-medium",
                !isOpen && "justify-center"
              )}
              onClick={() => toggleGroup(group.name)}
            >
              <div className="flex items-center gap-2">
                <span className={group.color}>{group.icon}</span>
                {isOpen && <span>{group.name}</span>}
              </div>
              {isOpen && (
                <motion.div
                  animate={
                    openGroupsRef.current[group.name] ? "open" : "closed"
                  }
                  variants={iconVariants}
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              )}
            </button>

            {/* Group items - only show when sidebar is open and group is expanded */}
            {isOpen && openGroupsRef.current[group.name] && (
              <div className="ml-1 mt-1 space-y-1 border-l-2 border-muted pl-2">
                {group.subItems.map((item: any) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                  return (
                    <SidebarLink
                      key={item.href}
                      item={item}
                      isActive={isActive}
                    />
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Profile section with role-specific styling */}
      <div
        className={cn(
          "border-t p-2 mt-auto",
          "from-violet-500/5 to-fuchsia-500/5 border-violet-500/10"
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className={cn(
                  "flex items-center gap-3 rounded-md p-2",
                  "bg-white/50 backdrop-blur-sm"
                )}
              >
                <Avatar
                  className={cn(
                    "h-8 w-8 border",
                    userRole === "user"
                      ? "border-blue-200 bg-blue-50"
                      : userRole === "staff"
                      ? "border-indigo-200 bg-indigo-50"
                      : userRole === "admin"
                      ? "border-violet-200 bg-violet-50"
                      : "border-amber-200 bg-amber-50"
                  )}
                >
                  <AvatarFallback
                    className={cn(
                      userRole === "user"
                        ? "text-blue-700"
                        : userRole === "staff"
                        ? "text-indigo-700"
                        : userRole === "admin"
                        ? "text-violet-700"
                        : "text-amber-700"
                    )}
                  >
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium truncate">
                    {user?.name}
                  </span>
                  <span
                    className={cn(
                      "text-xs capitalize truncate",
                      userRole === "user"
                        ? "text-blue-600"
                        : userRole === "staff"
                        ? "text-indigo-600"
                        : userRole === "admin"
                        ? "text-violet-600"
                        : "text-amber-600"
                    )}
                  >
                    {user?.role}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto h-7 w-7 rounded-full text-muted-foreground hover:bg-primary-100 hover:text-primary-700"
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
              className="flex justify-center"
            >
              <Avatar
                className={cn(
                  "h-8 w-8 border cursor-pointer",
                  userRole === "user"
                    ? "border-blue-200 bg-blue-50"
                    : userRole === "staff"
                    ? "border-indigo-200 bg-indigo-50"
                    : userRole === "admin"
                    ? "border-violet-200 bg-violet-50"
                    : "border-amber-200 bg-amber-50"
                )}
                onClick={() => logout()}
              >
                <AvatarFallback
                  className={cn(
                    userRole === "user"
                      ? "text-blue-700"
                      : userRole === "staff"
                      ? "text-indigo-700"
                      : userRole === "admin"
                      ? "text-violet-700"
                      : "text-amber-700"
                  )}
                >
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}
