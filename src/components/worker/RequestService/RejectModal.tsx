"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"

interface RejectionConfirmationModalProps {
  onConfirm: (reason: string) => void
  onCancel: () => void
}

export default function RejectionConfirmationModal({ onConfirm, onCancel }: RejectionConfirmationModalProps) {
  const [reason, setReason] = useState("")

  const handleConfirm = () => {
    onConfirm(reason)
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <DialogTitle>Confirm Rejection</DialogTitle>
          </div>
          <DialogDescription>Are you sure you want to reject this service request?</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="rejection-reason" className="text-sm font-medium">
              Reason for Rejection (Optional)
            </Label>
            <textarea
              id="rejection-reason"
              placeholder="Provide a reason for rejecting this request..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-2 min-h-24"
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={onCancel} variant="outline" className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleConfirm} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
              Confirm Rejection
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
