import { cn } from "@/lib/utils";
import { MessageRenderer } from "./MessageRender";
import type { Message } from "@/interface/shared/chat";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showSenderName?: boolean;
  reactToMessage: (messageId: string, emoji: string) => void;
  deleteMessage: (messageId: string) => void;
}

export function MessageBubble({
  message,
  isOwn,
  showSenderName = false,
  reactToMessage,
  deleteMessage,
}: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "flex mb-3 flex-col",
        isOwn ? "items-end" : "items-start"
      )}
    >
      {/* ACTIONS */}
      <div className="flex gap-2 mb-1">
        <button
          onClick={() => reactToMessage(message.id, "👍")}
          className="text-sm"
        >
          👍
        </button>

        <button
          onClick={() => reactToMessage(message.id, "❤️")}
          className="text-sm"
        >
          ❤️
        </button>

        <button
          onClick={() => reactToMessage(message.id, "😂")}
          className="text-sm"
        >
          😂
        </button>

        {isOwn && !message.isDeleted && (
          <button
            onClick={() => deleteMessage(message.id)}
            className="text-xs text-red-500 ml-2"
          >
            Delete
          </button>
        )}
      </div>

      {/* SENDER NAME */}
      {showSenderName && message.senderName && !isOwn && (
        <p className="text-xs text-gray-600 mb-1 px-2">
          {message.senderName}
        </p>
      )}

      {/* MESSAGE */}
      <MessageRenderer message={message} isOwn={isOwn} />
    </div>
  );
}