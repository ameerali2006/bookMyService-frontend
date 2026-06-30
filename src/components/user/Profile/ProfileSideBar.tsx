"use client"

import { cn } from "@/lib/utils"
import { User, Calendar, Star, MapPin,Wallet } from "lucide-react"

type Section = "profile" | "services-taken" | "wallet" | "reviews" | "addresses"

interface ProfileSidebarProps {
  activeSection: Section
  onSectionChange: (section: Section) => void
}

const sidebarItems = [
  { id: "profile" as Section, label: "Profile", icon: User },
  // { id: "services-taken" as Section, label: "Services Taken", icon: Calendar },
  { id: "wallet" as Section, label: "Wallet", icon: Wallet },
  // { id: "reviews" as Section, label: "Reviews", icon: Star },
  { id: "addresses" as Section, label: "Addresses", icon: MapPin },
]

export function ProfileSidebar({ activeSection, onSectionChange }: ProfileSidebarProps) {
  return (
    <aside className="w-full lg:w-64 bg-white lg:bg-sidebar border-b lg:border-b-0 lg:border-r border-slate-100 lg:border-sidebar-border fixed top-16 left-0 z-30 lg:h-[calc(100vh-4rem)]">
      <div className="p-4 lg:p-8 flex lg:flex-col items-center lg:items-start justify-between lg:justify-start gap-4 overflow-x-auto lg:overflow-x-visible">
        <h1 className="text-sm lg:text-xl font-bold text-slate-800 lg:text-sidebar-foreground lg:mb-8 whitespace-nowrap">
          Account Settings
        </h1>
        <nav className="flex lg:flex-col gap-2 w-auto lg:w-full">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  "flex items-center gap-2.5 px-4 lg:px-3 py-2 text-xs lg:text-sm font-semibold rounded-xl transition-all duration-200 text-left whitespace-nowrap cursor-pointer",
                  activeSection === item.id
                    ? "bg-blue-50 text-blue-600 lg:bg-sidebar-accent lg:text-sidebar-accent-foreground"
                    : "text-slate-600 hover:bg-slate-50 lg:text-sidebar-foreground lg:hover:bg-sidebar-accent/50 lg:hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
