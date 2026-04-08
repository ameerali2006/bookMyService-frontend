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
  { id: "services-taken" as Section, label: "Services Taken", icon: Calendar },
  { id: "wallet" as Section, label: "Wallet", icon: Wallet },
  { id: "reviews" as Section, label: "Reviews", icon: Star },
  { id: "addresses" as Section, label: "Addresses", icon: MapPin },
]

export function ProfileSidebar({ activeSection, onSectionChange }: ProfileSidebarProps) {
  return (
    <aside className="w-64 min-h-screen bg-sidebar border-r border-sidebar-border fixed">
      <div className="p-8">
        <h1 className="text-xl font-semibold text-sidebar-foreground mb-8">Account Settings</h1>
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors text-left",
                  activeSection === item.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
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
