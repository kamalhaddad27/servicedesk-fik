import type React from "react"
import { cn } from "@/lib/utils"
import { Sparkles } from "lucide-react"

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  icon?: React.ReactNode
  variant?: "default" | "gradient" | "outline" | "glass"
  showBadge?: boolean
}

export function PremiumCard({
  title,
  description,
  icon,
  variant = "default",
  showBadge = false,
  className,
  children,
  ...props
}: PremiumCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden",
        variant === "default" && "bg-white border border-primary-100 shadow-sm",
        variant === "gradient" && "card-premium",
        variant === "outline" && "border border-primary-200 bg-white",
        variant === "glass" && "card-glass",
        className,
      )}
      {...props}
    >
      {showBadge && (
        <div className="absolute top-2 right-2 bg-primary-50 text-primary-600 rounded-full px-2 py-0.5 text-xs font-medium flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          Premium
        </div>
      )}

      {(title || description || icon) && (
        <div className="p-4 border-b border-primary-100">
          <div className="flex items-start gap-3">
            {icon && (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                {icon}
              </div>
            )}
            <div>
              {title && <h3 className="text-base font-semibold">{title}</h3>}
              {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
            </div>
          </div>
        </div>
      )}

      <div className={cn(!title && !description && !icon && "p-4")}>{children}</div>
    </div>
  )
}
