"use client";

import { X, Bell, Check } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

export interface INotification {
  _id: string;
  title: string;
  message: string;
  type: "booking" | "payment" | "review" | "system";
  isRead: boolean;
  createdAt: Date;
}

interface Props {
  open: boolean;
  onClose: () => void;
  notifications: INotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void; // ✅ NEW
}

export default function NotificationPanel({
  open,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead
}: Props) {
  const [tab, setTab] = useState<"all" | "unread">("all");

  if (!open) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filtered =
    tab === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-[420px] max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-xl">
              <Bell className="text-blue-600" size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">
                Notification
              </h2>
              <p className="text-xs text-gray-500">
                {unreadCount === 0
                  ? "No unread notifications"
                  : `${unreadCount} unread notifications`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 p-3">
          <button
            onClick={() => setTab("unread")}
            className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 ${
              tab === "unread"
                ? "bg-gray-200 font-medium"
                : "text-gray-500"
            }`}
          >
            Unread
            <span className="text-xs bg-gray-300 px-1.5 rounded-full">
              {unreadCount}
            </span>
          </button>

          <button
            onClick={() => setTab("all")}
            className={`px-3 py-1.5 rounded-full text-sm ${
              tab === "all"
                ? "bg-blue-600 text-white"
                : "text-gray-500"
            }`}
          >
            All
          </button>

          <button
            onClick={onMarkAllRead}
            className="ml-auto bg-gray-100 p-2 rounded-lg hover:bg-gray-200"
            title="Mark all as read"
            >
            <Check size={16} />
            </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center text-sm text-gray-400 mt-10">
              No notifications
            </div>
          ) : (
            filtered.map((n) => (
              <div
                key={n._id}
                onClick={() => onMarkRead(n._id)}
                className={`p-4 rounded-xl cursor-pointer transition border ${
                  n.isRead
                    ? "bg-gray-50 hover:bg-gray-100"
                    : "bg-white border-blue-200 shadow-sm hover:shadow"
                }`}
              >
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-semibold text-gray-800">
                    {n.title}
                  </h4>

                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(n.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>

                <p className="text-xs text-gray-600 mt-1">
                  {n.message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}