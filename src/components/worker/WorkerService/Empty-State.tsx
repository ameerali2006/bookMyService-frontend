import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  title: string
  description: string
  icon: LucideIcon
  variant?: "default" | "muted"
}

export function EmptyState({ title, description, icon: Icon, variant = "default" }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed p-8 text-center",
        variant === "default" && "border-border bg-muted/20",
        variant === "muted" && "border-muted-foreground/25 bg-muted/10",
      )}
    >
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
        <Icon className="size-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}