"use client"

import { AlertCircle, Bug, FileQuestion, HelpCircle, MessageSquare, Settings, Wrench } from 'lucide-react'
import { cn } from "@/lib/utils"

interface TicketIconProps {
  category?: string
  className?: string
  size?: number
}

export function TicketIcon({ category, className, size = 16 }: TicketIconProps) {
  const iconProps = {
    className: cn("text-muted-foreground", className),
    size,
  }

  // Map category to icon
  switch (category?.toLowerCase()) {
    case "bug":
    case "error":
    case "issue":
      return <Bug {...iconProps} />
    case "request":
    case "feature request":
      return <MessageSquare {...iconProps} />
    case "question":
    case "inquiry":
      return <HelpCircle {...iconProps} />
    case "support":
    case "technical support":
      return <Wrench {...iconProps} />
    case "urgent":
    case "critical":
      return <AlertCircle {...iconProps} />
    case "configuration":
    case "settings":
      return <Settings {...iconProps} />
    default:
      return <FileQuestion {...iconProps} />
  }
}

// Default export 
export default TicketIcon