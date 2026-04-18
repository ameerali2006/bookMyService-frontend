import { ENV } from "@/config/env/env";
import io from "socket.io-client";

type SocketType = ReturnType<typeof io>;
let socket: SocketType | null = null;

/**
 * Connects the worker socket once (singleton)
 */
export const connectWorkerSocket = (workerId: string ): SocketType | null => {
  if (!workerId) return null;

  if (!socket) {
    socket = io(ENV.VITE_SERVER_BASEURL || "http://localhost:5000", {
      auth: { userId: workerId, userType: "worker" },
      transports: ["websocket"],
      reconnection: true,
    
    });

    socket.on("connect", () => {
      console.log("🟢 Worker socket connected:", socket?.id);
    });

    socket.on("disconnect", (reason: string) => {
      console.log("🔴 Worker socket disconnected:", reason);
    });
  }

  return socket;
};

export const getWorkerSocket = (): SocketType | null => socket;
