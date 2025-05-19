"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "./use-auth"
import ApiService from "@/lib/api"
import type { Notification } from "@/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useNotifications() {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch notifications with React Query
  const {
    data: notifications = [],
    isLoading,
    error,
    refetch: fetchNotifications
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      if (!isAuthenticated) {
        console.log('Not authenticated, skipping notification fetch')
        return []
      }
      
      try {
        return await ApiService.getNotifications()
      } catch (err) {
        console.error("Error fetching notifications:", err)
        return []
      }
    },
    enabled: isAuthenticated,
  })

  // Update unread count when notifications change
  useEffect(() => {
    const unreadNotifications = notifications.filter(notification => !notification.isRead)
    setUnreadCount(unreadNotifications.length)
  }, [notifications])

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      return await ApiService.markNotificationAsRead(id)
    },
    onSuccess: (_, id) => {
      // Update local cache immediately
      queryClient.setQueryData(['notifications'], (oldData: Notification[] = []) => {
        return oldData.map(notification => 
          notification.id === id 
            ? { ...notification, isRead: true }
            : notification
        )
      })
      
      // Decrement unread count
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  })

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return await ApiService.markAllNotificationsAsRead()
    },
    onSuccess: () => {
      // Update all notifications in cache
      queryClient.setQueryData(['notifications'], (oldData: Notification[] = []) => {
        return oldData.map(notification => ({ ...notification, isRead: true }))
      })
      
      // Reset unread count
      setUnreadCount(0)
    }
  })

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: number) => {
      return await ApiService.deleteNotification(id)
    },
    onSuccess: (_, id) => {
      // Remove from local cache
      queryClient.setQueryData(['notifications'], (oldData: Notification[] = []) => {
        const removedNotification = oldData.find(n => n.id === id)
        const newData = oldData.filter(notification => notification.id !== id)
        
        // Update unread count if needed
        if (removedNotification && !removedNotification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
        
        return newData
      })
    }
  })

  // Fetch notifications on mount and when auth status changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications()
      
      // Setup interval to refresh notifications every minute
      const interval = setInterval(fetchNotifications, 60000)
      
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, fetchNotifications])

  // Simple wrapper functions for mutations
  const markAsRead = async (id: number) => {
    return markAsReadMutation.mutateAsync(id)
  }

  const markAllAsRead = async () => {
    return markAllAsReadMutation.mutateAsync()
  }

  const deleteNotification = async (id: number) => {
    return deleteNotificationMutation.mutateAsync(id)
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  }
}