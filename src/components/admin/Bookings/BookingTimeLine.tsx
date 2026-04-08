"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatusTimelineProps {
  currentStatus: "confirmed" | "in-progress" | "completed" | "cancelled"
}

export function StatusTimeline({ currentStatus }: StatusTimelineProps) {
  const steps = [
    { key: "confirmed", label: "Confirmed" },
    { key: "in-progress", label: "In Progress" },
    { key: "completed", label: "Completed" },
  ]

  const getStepStatus = (stepKey: string) => {
    if (currentStatus === "cancelled") return "cancelled"

    const currentIndex = steps.findIndex((s) => s.key === currentStatus)
    const stepIndex = steps.findIndex((s) => s.key === stepKey)

    if (stepIndex < currentIndex) return "completed"
    if (stepIndex === currentIndex) return "current"
    return "upcoming"
  }

  return (
    <div className="flex items-center justify-between relative">
      {steps.map((step, index) => {
        const status = getStepStatus(step.key)

        return (
          <div key={step.key} className="flex-1 flex flex-col items-center relative">
            {/* Connection line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "absolute top-5 left-[50%] w-full h-0.5",
                  status === "completed" || status === "current" ? "bg-primary" : "bg-muted",
                )}
              />
            )}

            {/* Step circle */}
            <div
              className={cn(
                "relative z-10 flex items-center justify-center size-10 rounded-full border-2 transition-colors",
                status === "completed" && "bg-primary border-primary",
                status === "current" && "bg-primary border-primary",
                status === "upcoming" && "bg-background border-muted",
                status === "cancelled" && "bg-muted border-muted",
              )}
            >
              {status === "completed" && <Check className="size-5 text-primary-foreground" />}
              {status === "current" && <div className="size-3 rounded-full bg-primary-foreground animate-pulse" />}
            </div>

            {/* Label */}
            <span
              className={cn(
                "mt-2 text-sm font-medium text-center",
                (status === "completed" || status === "current") && "text-foreground",
                status === "upcoming" && "text-muted-foreground",
                status === "cancelled" && "text-muted-foreground line-through",
              )}
            >
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
