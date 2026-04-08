// context/NotificationContext.tsx

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import  io  from "socket.io-client";
import { showToast } from "@/utils/notification-toster";



interface Notification {
  title: string;
  message: string;
  type?:"booking"|"payment"|"review"| "system" ;
  isRead?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider = ({ children }: any) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
    const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);

  // ✅ Get user dynamically
  const userData = useSelector((state: RootState) => state.userTokenSlice.user);
    const workerData = useSelector((state: RootState) => state.workerTokenSlice.worker);

    const user = userData || workerData;

    const userType = userData ? "user" : "worker";
  useEffect(() => {
    if (!user?._id) return;

    // ✅ Create socket only when user exists
    const newSocket = io("http://localhost:5000", {
      auth: {
        userId: user._id,
        userType
      },
    });
    console.log(newSocket)

    setSocket(newSocket);

    newSocket.on("receive_notification", (data: Notification) => {
      setNotifications((prev) => [data, ...prev]);
      console.log(data)

      // 🔥 toast trigger
      showToast(data);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  return (
    <NotificationContext.Provider value={{ notifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotification must be used within provider");
  return context;
};