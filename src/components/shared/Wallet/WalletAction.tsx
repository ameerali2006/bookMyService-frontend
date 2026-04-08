"use client"

import { Button } from "@/components/ui/button"
import { CreditCard, TrendingDown, Eye, Settings } from "lucide-react"

interface WalletActionsProps {
  role: "User" | "Worker" | "Admin"
  isFrozen: boolean
  onOpenModal: (modalType: "topup" | "withdraw" | "commission" | "adjust") => void
}

export function WalletActions({ role, isFrozen, onOpenModal }: WalletActionsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {/* User Actions */}
      {role === "User" && (
        <Button onClick={() => onOpenModal("topup")} className="gap-2" size="lg">
          <CreditCard className="h-4 w-4" />
          Add Money
        </Button>
      )}

      {/* Worker Actions */}
      {role === "Worker" && (
        <Button
          onClick={() => onOpenModal("withdraw")}
          disabled={isFrozen}
          variant={isFrozen ? "secondary" : "default"}
          className="gap-2"
          size="lg"
        >
          <TrendingDown className="h-4 w-4" />
          Withdraw
        </Button>
      )}

      {/* Admin Actions */}
      {role === "Admin" && (
        <>
          <Button onClick={() => onOpenModal("commission")} variant="outline" className="gap-2" size="lg">
            <Eye className="h-4 w-4" />
            View Commission
          </Button>
          <Button onClick={() => onOpenModal("adjust")} variant="outline" className="gap-2" size="lg">
            <Settings className="h-4 w-4" />
            Adjust Balance
          </Button>
        </>
      )}
    </div>
  )
}
