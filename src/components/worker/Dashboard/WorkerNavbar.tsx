import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

import NotificationPanel, { type INotification } from "@/components/shared/NotificationModal";

import { workerService } from "@/api/WorkerService"; // ✅ create this like userService

export const Navbar = () => {
  const workerData = useSelector(
    (state: RootState) => state.workerTokenSlice.worker
  );

  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);

  // ✅ Fetch worker notifications
  useEffect(() => {
    if (!workerData?._id) return;

    const fetchNotifications = async () => {
      try {
        const res = await workerService.getNotifications();
        setNotifications(res.data);
      } catch (err) {
        console.error("Failed to fetch worker notifications");
      }
    };

    fetchNotifications();
  }, [workerData]);

  // ✅ Mark single read
  const handleMarkRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );

    try {
      await workerService.markAsRead(id);
    } catch (err) {
      console.error("Failed to mark read");
    }
  };

  // ✅ Mark all read
  const handleMarkAllRead = async () => {
    try {
      await workerService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
    } catch (err) {
      console.error("Failed to mark all as read");
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b shadow-sm">
      <h1 className="text-xl font-semibold text-black">Dashboard</h1>

      <div className="flex items-center gap-4">
        {/* 🔔 Notification */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setNotifOpen(true)}
          className="relative"
        >
          <Bell className="w-5 h-5" />

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-[1px] rounded-full">
              {unreadCount}
            </span>
          )}
        </Button>

        {/* 👤 Avatar */}
        <Avatar>
          <AvatarImage src={workerData?.image} alt={workerData?.name} />
          <AvatarFallback>
            {workerData?.name?.[0]?.toUpperCase() ?? "W"}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* ✅ Notification Panel */}
      <NotificationPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
      />
    </header>
  );
};