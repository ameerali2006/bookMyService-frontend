"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface WalletModalProps {
  isOpen: boolean
  modalType: "topup" | "withdraw" | "commission" | "adjust" | null
  onClose: () => void
  isFrozen: boolean
}

export function WalletModal({ isOpen, modalType, onClose, isFrozen }: WalletModalProps) {
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setAmount("")
      setDescription("")
      onClose()
    }, 1000)
  }

  const handleClose = () => {
    setAmount("")
    setDescription("")
    onClose()
  }

  const getModalConfig = () => {
    switch (modalType) {
      case "topup":
        return {
          title: "Add Money",
          description: "Add funds to your wallet",
          buttonText: "Add Money",
        }
      case "withdraw":
        return {
          title: "Withdraw Earnings",
          description: "Withdraw your earnings to your account",
          buttonText: "Withdraw",
        }
      case "commission":
        return {
          title: "Commission Details",
          description: "View commission details and breakdown",
          buttonText: "View Details",
        }
      case "adjust":
        return {
          title: "Adjust Balance",
          description: "Adjust wallet balance with description",
          buttonText: "Adjust",
        }
      default:
        return {
          title: "",
          description: "",
          buttonText: "",
        }
    }
  }

  const config = getModalConfig()
  const isAmountInvalid = amount && (isNaN(Number(amount)) || Number(amount) <= 0)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        {isFrozen && modalType === "withdraw" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Your wallet is frozen and you cannot make withdrawals.</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
              required
              disabled={modalType === "commission"}
              className={isAmountInvalid ? "border-destructive" : ""}
            />
            {isAmountInvalid && <p className="text-xs text-destructive">Amount must be greater than 0</p>}
          </div>

          {(modalType === "adjust" || modalType === "topup") && (
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="Enter reason or reference"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          )}

          {modalType === "commission" && (
            <div className="space-y-3 rounded-lg bg-muted p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Commission Rate</span>
                <span className="font-semibold">10%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Earned</span>
                <span className="font-semibold">$1,250.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Commission Earned</span>
                <span className="font-semibold">$125.00</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-sm font-semibold">
                <span>Pending Commission</span>
                <span className="text-green-600 dark:text-green-400">$45.00</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading ||
                !amount ||
                isAmountInvalid ||
                (modalType === "withdraw" && isFrozen) ||
                modalType === "commission"
              }
              className="flex-1"
            >
              {isLoading ? "Processing..." : config.buttonText}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
