"use client"

import * as React from "react"
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import { cn } from "@/lib/utils"
import { cva } from "class-variance-authority"

// simple open/closed height animation
const contentVariants = cva("overflow-hidden transition-all", {
  variants: {
    state: {
      open: "h-auto opacity-100",
      closed: "h-0 opacity-0",
    },
  },
  defaultVariants: {
    state: "closed",
  },
})

export const Collapsible = CollapsiblePrimitive.Root

export const CollapsibleTrigger = CollapsiblePrimitive.Trigger

export const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content> & {
    forceMount?: boolean
  }
>(({ className, children, forceMount, ...props }, ref) => {
  // radix sets data-state="open" | "closed"
  const state = (props as any)["data-state"] as "open" | "closed"

  return (
    <CollapsiblePrimitive.Content
      ref={ref}
      forceMount={forceMount}
      className={cn(contentVariants({ state }), className)}
      {...props}
    >
      {children}
    </CollapsiblePrimitive.Content>
  )
})
CollapsibleContent.displayName = CollapsiblePrimitive.Content.displayName
