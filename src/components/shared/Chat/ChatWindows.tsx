"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { MessageBubble } from "./MessageBubble";
import type { Message } from "@/interface/shared/chat";

interface ChatWindowProps {
  messages: Message[];
  currentUserId: string;
  reactToMessage: (messageId: string, emoji: string) => void;
  deleteMessage: (messageId: string) => void;
  isLoading?: boolean;
  isEmpty?: boolean;
  showSenderNames?: boolean;
  className?: string;
}

export function ChatWindow({
  messages,
  currentUserId,
  reactToMessage,
  deleteMessage,
  isLoading = false,
  isEmpty = false,
  showSenderNames = false,
  className,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* Auto scroll to latest message */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  console.log(messages)

  return (
    <div
      className={cn(
        "flex flex-col flex-1 overflow-y-auto bg-white pb-28",
        className
      )}
    >
      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Loading messages...</div>
        </div>
      )}

      {/* Empty */}
      {isEmpty && !isLoading && (
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-400 text-center">
            <p>No messages yet</p>
            <p className="text-sm mt-1">Start a conversation!</p>
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div className="flex flex-col p-4 gap-3">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={String(message.senderId) === String(currentUserId)}
              showSenderName={showSenderNames}
              reactToMessage={reactToMessage}
              deleteMessage={deleteMessage}
            />
          ))}

          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}