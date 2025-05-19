"use client"

import { User } from "@/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  user: User | undefined
  size?: "sm" | "md" | "lg"
  showBadge?: boolean
  className?: string
}

export function UserAvatar({ user, size = "md", showBadge = false, className }: UserAvatarProps) {
  if (!user) {
    return (
      <Avatar className={cn(
        size === "sm" ? "h-8 w-8" : size === "md" ? "h-10 w-10" : "h-14 w-14",
        "bg-muted",
        className
      )}>
        <AvatarFallback>?</AvatarFallback>
      </Avatar>
    )
  }
  
  // Get color scheme based on user role
  const getRoleTheme = () => {
    switch(user.role) {
      case 'mahasiswa': return { 
        border: "border-blue-200", 
        bg: "bg-blue-50", 
        text: "text-blue-700", 
        badge: "bg-blue-500" 
      }
      case 'dosen': return { 
        border: "border-indigo-200", 
        bg: "bg-indigo-50", 
        text: "text-indigo-700", 
        badge: "bg-indigo-500" 
      }
      case 'admin': return { 
        border: "border-violet-200", 
        bg: "bg-violet-50", 
        text: "text-violet-700", 
        badge: "bg-violet-500" 
      }
      case 'executive': return { 
        border: "border-amber-200", 
        bg: "bg-amber-50", 
        text: "text-amber-700", 
        badge: "bg-amber-500" 
      }
      default: return { 
        border: "border-gray-200", 
        bg: "bg-gray-50", 
        text: "text-gray-700", 
        badge: "bg-gray-500" 
      }
    }
  }
  
  const theme = getRoleTheme()
  
  // Get user initials for fallback
  const getInitials = () => {
    if (!user.name) return "?"
    
    const nameParts = user.name.split(" ")
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase()
    
    return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase()
  }
  
  return (
    <div className="relative">
      <Avatar className={cn(
        size === "sm" ? "h-8 w-8" : size === "md" ? "h-10 w-10" : "h-14 w-14",
        "border",
        theme.border,
        theme.bg,
        className
      )}>
        {/* If you have user images, you can uncomment this */}
        {/* <AvatarImage src={user.image} alt={user.name || "User"} /> */}
        <AvatarFallback className={theme.text}>
          {getInitials()}
        </AvatarFallback>
      </Avatar>
      
      {showBadge && (
        <span className={cn(
          "absolute bottom-0 right-0 block rounded-full border-2 border-background",
          size === "sm" ? "h-2.5 w-2.5" : size === "md" ? "h-3 w-3" : "h-3.5 w-3.5",
          theme.badge
        )}/>
      )}
    </div>
  )
}