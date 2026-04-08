"use client";

import RequestDetailsModal from "@/components/worker/RequestService/DetailsModal";
import { connectWorkerSocket } from "@/service/WorkerSocket";
import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

interface ServiceRequest {
  id: string;
  serviceName: string;
  userName: string;
  date: string;
  time: string;
  availableTime:string
  location: string;
  status: "pending" | "approved" | "rejected";
  userLocation: { lat: number; lng: number };
  notes: string;
  phone: string;
}

interface WorkerSocketContextValue {
  socket: any;
}

const WorkerSocketContext = createContext<WorkerSocketContextValue | undefined>(undefined);

export const WorkerSocketProvider = ({ workerId, children }: { workerId?: string; children: React.ReactNode }) => {
  const [socket, setSocket] = useState<any>(null);
  const [queue, setQueue] = useState<ServiceRequest[]>([]);
  const [currentRequest, setCurrentRequest] = useState<ServiceRequest | null>(null);

  useEffect(() => {

    console.log("worker layout")
    if (!workerId) return;

    const socketInstance = connectWorkerSocket(workerId);
    setSocket(socketInstance);
    console.log(socketInstance)

    if(socketInstance){
        
        console.log("'worker layout inside if")
         // 📨 On login — get pending bookings
        socketInstance.on("receive-pending-bookings", (bookings: ServiceRequest[]) => {
        console.log("📦 Pending bookings received:", bookings);
        if (bookings?.length) {
            toast.info(`${bookings.length} pending bookings found.`);
            setQueue((prev) => [...prev, ...bookings]);
        }
        });

        // ⚡ Real-time new booking
        socketInstance.on("receive-pending-booking", (booking: ServiceRequest) => {
        console.log("📩 New booking received:", booking);
        toast.success(`New booking: ${booking.serviceName} from ${booking.userName}`);
        setQueue((prev) => [...prev, booking]);
        });

        return () => {
        socketInstance.off("receive-pending-bookings");
        socketInstance.off("receive-pending-booking");
        socketInstance.disconnect();
        };
    }
  }, [workerId]);

  // 🎬 Show one modal at a time
  useEffect(() => {
    if (!currentRequest && queue.length > 0) {
      const next = queue[0];
      setCurrentRequest(next);
      setQueue((prev) => prev.slice(1));
    }
  }, [queue, currentRequest]);

  const handleModalClose = () => {
    setCurrentRequest(null);
  };

  return (
    <WorkerSocketContext.Provider value={{ socket }}>
      {children}

      {currentRequest && (
        <RequestDetailsModal
          key={currentRequest.id}
          request={currentRequest}
          onClose={handleModalClose}
        />
      )}
    </WorkerSocketContext.Provider>
  );
};

export const useWorkerSocket = () => {
  const context = useContext(WorkerSocketContext);
  if (!context) throw new Error("useWorkerSocket must be used within WorkerSocketProvider");
  return context;
};
