"use client";

import { useEffect, useState } from "react";


import { cn } from "@/lib/utils";
import type { Chat } from "@/interface/shared/chat";
import { workerService } from "@/api/WorkerService";
import { userService } from "@/api/UserService";

interface InboxListProps {
  userId: string;
  role: "user" | "worker"; 
  selectedChatId?: string;
  onSelectChat: (chatId: string) => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * Inbox component that displays list of active chats
 * Fetches from REST API
 */
export function InboxList({
  userId,
  role,
  selectedChatId,
  onSelectChat,
  isLoading: externalLoading = false,
  className,
}: InboxListProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch inbox on mount
  useEffect(() => {
    const loadInbox = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response =
          role === "worker"
            ? await workerService.getWorkerInbox(userId)
            : await userService.getInbox(userId);
        if (response.data.success) {
          setChats(response.data.chats); 
        } else { 
          setError("Failed to load inbox");
        }
      } catch (err) {
        console.error("[InboxList] Error loading inbox:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load inbox"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadInbox();
  }, [userId]);

  const truncateText = (text: string, maxLength: number = 50) => {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-gray-50 border-r border-gray-200",
        className
      )}
    >
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-lg">Messages</h2>
      </div>

      {isLoading || externalLoading ? (
        <div className="flex items-center justify-center p-4">
          <div className="text-gray-500 text-sm">Loading chats...</div>
        </div>
      ) : error ? (
        <div className="p-4">
          <div className="text-red-500 text-sm">{error}</div>
        </div>
      ) : chats.length === 0 ? (
        <div className="flex items-center justify-center flex-1 p-4">
          <div className="text-gray-400 text-center">
            <p className="text-sm">No active chats</p>
            <p className="text-xs mt-1">
              Complete a booking to start messaging
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={cn(
                "w-full text-left p-4 border-b border-gray-100 hover:bg-gray-100 transition-colors",
                selectedChatId === chat.id && "bg-blue-50"
              )}
            >
              <div className="flex items-center gap-3">
                {chat.participantName && (
                  <img
                    src={chat.participantAvatar || "https://st3.depositphotos.com/3581215/18899/v/450/depositphotos_188994514-stock-illustration-vector-illustration-male-silhouette-profile.jpg"}
                    alt={chat.participantName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {chat.participantName || "Unknown"}
                  </p>
                  {chat.lastMessage && (
                    <p className="text-xs text-gray-600 truncate">
                      {truncateText(chat.lastMessage)}
                    </p>
                  )}
                  {chat.lastMessageTime && (
                    <p className="text-xs text-gray-400 mt-1">
                      {formatChatTime(chat.lastMessageTime)}
                    </p>
                  )}
                </div>
                {chat.unreadCount && chat.unreadCount > 0 && (
                  <div className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold shrink-0">
                    {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Format timestamp for inbox display
 */
function formatChatTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;

    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}
