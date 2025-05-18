"use client"

import React, { createContext, useContext, useState } from "react"
import { toast } from "sonner"

type NotificationContextType = {
  showNotification: (message: string, type?: "success" | "error" | "info" | "warning") => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const showNotification = (message: string, type: "success" | "error" | "info" | "warning" = "info") => {
    switch (type) {
      case "success":
        toast.success(message)
        break
      case "error":
        toast.error(message)
        break
      case "warning":
        toast.warning(message)
        break
      case "info":
      default:
        toast.info(message)
        break
    }
  }

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotification = () => {
  const context = useContext(NotificationContext)
  
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  
  return context
}