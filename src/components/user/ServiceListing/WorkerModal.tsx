"use client";

import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { WorkerProfile, type Worker } from "./WorkerProfile";

interface WorkerProfileModalProps {
  worker: Worker | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WorkerProfileModal({
  worker,
  isOpen,
  onClose,
}: WorkerProfileModalProps) {
  const navigate = useNavigate();

  if (!worker) return null;

  const handleBook = () => {
    navigate(`/services/bookDetails/${worker._id}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl lg:w-[80vw] lg:max-w-[1400px] max-h-[90vh] overflow-y-auto rounded-3xl border border-gray-200 bg-white/95 backdrop-blur-md shadow-2xl p-6 md:p-8">
        <DialogHeader className="relative">
          <DialogTitle className="sr-only">Worker Profile</DialogTitle>
          {/* <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 rounded-full hover:bg-gray-100 transition-colors"
            onClick={onClose}
          >
            <X className="h-5 w-5 text-gray-500" />
          </Button> */}
        </DialogHeader>

        <WorkerProfile
          worker={worker}
          mode="modal"
          onClose={onClose}
          onBook={handleBook}
        />
      </DialogContent>
    </Dialog>
  );
}