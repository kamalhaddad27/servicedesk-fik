// "use client";

// import { useState } from "react";
// import { motion, Variants } from "framer-motion";
// import { useNotifications } from "@/hooks/use-notification";
// import { Button } from "@/components/ui/button";
// import { LoadingSpinner } from "@/components/ui/loading-spinner";
// import { formatRelativeTime } from "@/lib/utils";
// import {
//   Bell,
//   Check,
//   Trash2,
//   FileText,
//   MessageSquare,
//   Info,
// } from "lucide-react";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Badge } from "@/components/ui/badge";
// import { cn } from "@/lib/utils";

// interface NotificationListProps {
//   onClose: () => void;
// }

// // Animation variants
// const listVariants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: {
//       staggerChildren: 0.05,
//     },
//   },
// };

// const itemVariants: Variants = {
//   hidden: { opacity: 0, y: 10 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       type: "spring",
//       stiffness: 300,
//       damping: 24,
//     },
//   },
// };

// export function NotificationList({ onClose }: NotificationListProps) {
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center p-6">
//         <LoadingSpinner className="h-8 w-8 text-primary" />
//       </div>
//     );
//   }

//   if (notifications.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center py-8 text-center">
//         <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
//           <Bell className="h-6 w-6" />
//         </div>
//         <h3 className="text-base font-medium">Tidak ada notifikasi</h3>
//         <p className="text-sm text-muted-foreground mt-1">
//           Anda belum memiliki notifikasi
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col max-h-[calc(100vh-100px)]">
//       <div className="border-b border-border p-3">
//         <div className="flex justify-between items-center mb-3">
//           <h3 className="font-medium">Notifikasi</h3>
//           <Button variant="ghost" size="sm" className="text-xs h-7">
//             <Check className="mr-1 h-3.5 w-3.5" />
//             Tandai Semua Dibaca
//           </Button>
//         </div>
//         <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
//           <TabsList className="grid grid-cols-4 h-8">
//             <TabsTrigger value="all" className="text-xs">
//               Semua
//               {unreadCount > 0 && (
//                 <Badge
//                   variant="outline"
//                   className="ml-1.5 h-4 min-w-4 rounded-full px-1 py-0 text-[10px] bg-primary-50 text-primary-600 border-primary-100"
//                 >
//                   {unreadCount}
//                 </Badge>
//               )}
//             </TabsTrigger>
//             <TabsTrigger value="ticket" className="text-xs">
//               Tiket
//             </TabsTrigger>
//             <TabsTrigger value="message" className="text-xs">
//               Pesan
//             </TabsTrigger>
//             <TabsTrigger value="unread" className="text-xs">
//               Belum Dibaca
//             </TabsTrigger>
//           </TabsList>
//         </Tabs>
//       </div>

//       <div className="overflow-y-auto p-2 flex-grow">
//         {filteredNotifications.length > 0 ? (
//           <motion.ul
//             variants={listVariants}
//             initial="hidden"
//             animate="visible"
//             className="space-y-2"
//           >
//             {filteredNotifications.map((notification) => (
//               <motion.li
//                 key={notification.id}
//                 variants={itemVariants}
//                 className={cn(
//                   "relative rounded-lg p-3 transition-all",
//                   notification.isRead ? "bg-background" : "bg-primary-50",
//                   "hover:bg-muted group"
//                 )}
//               >
//                 <div className="flex gap-3">
//                   <div
//                     className={cn(
//                       "flex h-9 w-9 items-center justify-center rounded-full",
//                       notification.type === "ticket"
//                         ? "bg-primary-100 text-primary-600"
//                         : notification.type === "message"
//                         ? "bg-accent-100 text-accent-600"
//                         : "bg-warning-light text-warning"
//                     )}
//                   >
//                     {getNotificationIcon(notification.type || "default")}
//                   </div>

//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-start justify-between gap-2">
//                       <div className="flex-1 min-w-0">
//                         <h4
//                           className={cn(
//                             "text-sm font-medium",
//                             notification.isRead
//                               ? "text-foreground"
//                               : "text-primary-700"
//                           )}
//                         >
//                           {notification.title}
//                         </h4>
//                         <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
//                           {notification.message}
//                         </p>
//                       </div>
//                       <div className="flex flex-col items-end gap-1">
//                         <span className="text-[10px] text-muted-foreground whitespace-nowrap">
//                           {formatRelativeTime(notification.createdAt)}
//                         </span>
//                         {!notification.isRead && (
//                           <Badge
//                             variant="outline"
//                             className="h-1.5 w-1.5 rounded-full p-0 bg-primary border-primary"
//                           />
//                         )}
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-2 mt-2">
//                       {notification.actionUrl && (
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           className="h-7 text-xs border-primary-200 text-primary hover:bg-primary-50"
//                           onClick={() => onClose()}
//                           asChild
//                         >
//                           <a href={notification.actionUrl}>Lihat Detail</a>
//                         </Button>
//                       )}

//                       {!notification.isRead && (
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           className="h-7 text-xs text-muted-foreground hover:text-primary hover:bg-primary-50"
//                         >
//                           <Check className="mr-1 h-3 w-3" />
//                           Tandai Dibaca
//                         </Button>
//                       )}
//                     </div>
//                   </div>

//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     className="h-6 w-6 absolute top-2 right-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-muted hover:text-foreground"
//                   >
//                     <Trash2 className="h-3 w-3" />
//                     <span className="sr-only">Delete</span>
//                   </Button>
//                 </div>
//               </motion.li>
//             ))}
//           </motion.ul>
//         ) : (
//           <div className="flex flex-col items-center justify-center py-8 text-center">
//             <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
//               <Bell className="h-6 w-6" />
//             </div>
//             <h3 className="text-base font-medium">Tidak ada notifikasi</h3>
//             <p className="text-sm text-muted-foreground mt-1">
//               {activeTab === "unread"
//                 ? "Semua notifikasi telah dibaca"
//                 : activeTab === "all"
//                 ? "Anda belum memiliki notifikasi"
//                 : `Anda belum memiliki notifikasi ${
//                     activeTab === "ticket"
//                       ? "tiket"
//                       : activeTab === "message"
//                       ? "pesan"
//                       : "sistem"
//                   }`}
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Actions, Tipe & Helper
import {
  getNotifications,
  markNotificationsAsRead,
  markNotificationAsRead,
  deleteNotification,
} from "@/lib/action/notification.action";
import { Notification, NotificationType } from "@prisma/client";
import { formatDate, formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

// Komponen UI & Ikon
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, MessageSquare, Ticket, Trash2 } from "lucide-react";

interface NotificationListProps {
  onClose: () => void;
  setUnreadCount: (count: number) => void;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "TICKET":
      return <Ticket className="h-4 w-4" />;
    case "MESSAGE":
      return <MessageSquare className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

export function NotificationList({
  onClose,
  setUnreadCount,
}: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    getNotifications().then((result) => {
      setNotifications(result.notifications);
      setIsLoading(false);
    });
  }, []);

  const handleMarkAllRead = async () => {
    await markNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    toast.success("Semua notifikasi ditandai telah dibaca.");
  };

  const handleMarkOneRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case "unread":
        return notifications.filter((n) => !n.isRead);
      case "ticket":
        return notifications.filter((n) => n.type === "TICKET");
      case "message":
        return notifications.filter((n) => n.type === "MESSAGE");
      case "all":
      default:
        return notifications;
    }
  }, [activeTab, notifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="flex flex-col max-h-[calc(100vh-100px)] absolute right-0 top-full bg-white shadow border border-slate-50 rounded-xl">
      {isLoading ? (
        <div className="p-6 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <div className="border-b p-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Notifikasi</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7"
                onClick={handleMarkAllRead}
              >
                <Check className="mr-1 h-3.5 w-3.5" />
                Tandai Semua Dibaca
              </Button>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="flex items-center h-8 overflow-x-auto">
                <TabsTrigger value="all">Semua</TabsTrigger>
                <TabsTrigger value="ticket">Tiket</TabsTrigger>
                <TabsTrigger value="message">Pesan</TabsTrigger>
                <TabsTrigger value="unread">
                  Belum Dibaca
                  {unreadCount > 0 && (
                    <Badge className="ml-1.5">{unreadCount}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="overflow-y-auto p-2 flex-grow">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2" />
                <p className="font-medium">Tidak ada notifikasi.</p>
              </div>
            ) : (
              <ul className="space-y-1">
                {filteredNotifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={cn(
                      "relative rounded-lg p-3 group",
                      !notification.isRead ? "bg-blue-50" : "hover:bg-muted"
                    )}
                  >
                    <div className="flex gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={notification.url}
                          onClick={onClose}
                          className="hover:underline"
                        >
                          <h4 className="text-sm font-medium">
                            {notification.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                        </Link>
                        <div className="flex items-center gap-2 mt-2">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleMarkOneRead(notification.id)}
                            >
                              <Check className="mr-1 h-3 w-3" /> Tandai Dibaca
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: id,
                        })}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 absolute top-1 right-1 opacity-0 group-hover:opacity-100 cursor-pointer"
                      onClick={() => handleDelete(notification.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
