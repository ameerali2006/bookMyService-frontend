"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, TrendingUp } from "lucide-react"
import type { Wallet } from "./WalletPage"


interface WalletSummaryProps {
  wallet: Wallet
}

export function WalletSummary({ wallet }: WalletSummaryProps) {
  const getRoleLabel = () => {
    switch (wallet.role) {
      case "User":
        return "Wallet Balance"
      case "Worker":
        return "Total Earnings"
      case "Admin":
        return "Platform Funds"
      default:
        return "Balance"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  return (
    <Card className="bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">{getRoleLabel()}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Balance */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
            <p className="text-3xl font-bold text-foreground">{formatCurrency(wallet.balance)}</p>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Wallet Status</p>
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${wallet.isFrozen ? "bg-destructive" : "bg-green-500"}`} />
              <p className="text-sm font-semibold">{wallet.isFrozen ? "Frozen" : "Active"}</p>
            </div>
            {wallet.isFrozen && (
              <div className="mt-2 flex items-center gap-2 rounded-md bg-destructive/10 p-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-xs text-destructive">Wallet is frozen</span>
              </div>
            )}
          </div>

          {/* Last Activity */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Last Activity</p>
            <p className="text-sm font-semibold">{formatDate(wallet.lastActivityAt)}</p>
          </div>
        </div>

        {/* Quick Info */}
        {wallet.role === "Worker" && wallet.balance > 0 && (
          <div className="flex items-center gap-2 rounded-md bg-accent/10 p-3">
            <TrendingUp className="h-5 w-5 text-accent-foreground" />
            <p className="text-sm text-accent-foreground">You can withdraw your earnings anytime</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
