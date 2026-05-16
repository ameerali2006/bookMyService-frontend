import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, XCircle } from "lucide-react";

const DEFAULT_REASONS = [
  "Booked by mistake",
  "Not needed",
  "Schedule issue",
  "Found another worker",
  "Too expensive",
  "Emergency",
];

interface CancellationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payload: {
    reasons: string[];
    message: string;
    finalReason: string;
  }) => Promise<void> | void;
  loading?: boolean;
  bookingCode?: string;
  reasons?: string[];
}

export default function CancellationModal({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
  bookingCode,
  reasons = DEFAULT_REASONS,
}: CancellationModalProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const hasInput = selectedReasons.length > 0 || message.trim().length > 0;

  const finalReason = useMemo(
    () => [...selectedReasons, message.trim()].filter(Boolean).join(". "),
    [selectedReasons, message]
  );

  const toggleReason = (reason: string) => {
    setError("");
    setSelectedReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((item) => item !== reason)
        : [...prev, reason]
    );
  };

  const resetForm = () => {
    setSelectedReasons([]);
    setMessage("");
    setError("");
  };

  const handleClose = (nextOpen: boolean) => {
    if (loading) return;

    if (!nextOpen) resetForm(); 
    onOpenChange(nextOpen);
  };

  const handleSubmit = async () => {
    if (!hasInput) {
      setError("Select a reason or add a comment.");
      return;
    }

    await onConfirm({
      reasons: selectedReasons,
      message: message.trim(),
      finalReason,
    });

    resetForm(); 
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[430px] p-0 bg-white overflow-hidden rounded-2xl border-0 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-600 px-5 py-4 text-white">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>

              <div className="flex-1">
                <DialogTitle className="text-lg font-bold">
                  Cancel Booking?
                </DialogTitle>
                <DialogDescription className="text-red-100 text-xs mt-1">
                  Tell us why you're cancelling.
                </DialogDescription>

                {bookingCode && (
                  <Badge className="mt-2 bg-white/15 text-white border-0 hover:bg-white/15 text-[10px] px-2 py-0.5">
                    {bookingCode}
                  </Badge>
                )}
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Reason chips */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Quick Reasons
            </p>

            <div className="flex flex-wrap gap-2">
              {reasons.map((reason) => {
                const selected = selectedReasons.includes(reason);

                return (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => toggleReason(reason)} 
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selected
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:border-red-200 hover:text-red-600"
                    }`}
                  >
                    {reason}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment */}
          <div>
            <Textarea
              rows={3}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setError("");
              }}
              placeholder="Additional comments (optional)"
              className="resize-none rounded-xl text-sm"
            />
          </div>

          

          {/* Error */}
          {error && (
            <p className="text-xs text-red-600 font-medium">{error}</p>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-5 py-4 border-t bg-slate-50 flex-row justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleClose(false)} 
            disabled={loading}
            className="text-slate-600"
          >
            Keep Booking
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? (
              "Cancelling..."
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-1.5" /> 
                Cancel Booking
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

