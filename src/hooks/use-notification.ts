"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ApiService } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import type { Notification } from "@/types"

export function useNotifications() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Get all notifications
  const {
    data: notifications = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: () => ApiService.getNotifications(),
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  // Get unread notifications
  const { data: unreadNotifications = [] } = useQuery<Notification[]>({
    queryKey: ["notifications", "unread"],
    queryFn: () => ApiService.getNotifications(true),
    refetchInterval: 15000, // Refetch more frequently
  })

  // Mark notification as read
  const markAsRead = useMutation({
    mutationFn: (id: number) => ApiService.markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
    onError: (error: any) => {
      toast({
        title: "Gagal menandai notifikasi sebagai dibaca",
        description: ApiService.handleError(error),
        variant: "destructive",
      })
    },
  })

  // Mark all notifications as read
  const markAllAsRead = useMutation({
    mutationFn: () => ApiService.markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      toast({
        title: "Semua notifikasi telah ditandai sebagai dibaca",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Gagal menandai semua notifikasi sebagai dibaca",
        description: ApiService.handleError(error),
        variant: "destructive",
      })
    },
  })

  // Delete notification
  const deleteNotification = useMutation({
    mutationFn: (id: number) => ApiService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      toast({
        title: "Notifikasi berhasil dihapus",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Gagal menghapus notifikasi",
        description: ApiService.handleError(error),
        variant: "destructive",
      })
    },
  })

  return {
    notifications,
    unreadNotifications,
    unreadCount: unreadNotifications.length,
    isLoading,
    isError,
    error,
    refetch,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  }
}
