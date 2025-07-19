"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { getNotifications } from "@/lib/action/notification.action";
import { NotificationList } from "./notification-list";

export function NotificationBell() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUnreadCount = () => {
      getNotifications().then((result) => {
        setUnreadCount(result.unreadCount);
      });
    };
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Cek setiap 30 detik
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    setNotificationsOpen((prev) => !prev);
    if (!notificationsOpen) {
      setUnreadCount(0);
    }
  };

  return (
    <div className="relative" ref={notificationRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        className="relative"
      >
        <Bell className="h-5 w-5 text-primary" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </AnimatePresence>
      </Button>

      <AnimatePresence>
        {notificationsOpen && (
          <NotificationList
            onClose={() => setNotificationsOpen(false)}
            setUnreadCount={setUnreadCount}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
