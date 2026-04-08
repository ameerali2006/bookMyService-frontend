import type { Message } from "@/interface/shared/chat";
import { cn } from "@/lib/utils";

interface MessageRendererProps {
  message: Message;
  isOwn: boolean;
}

export function MessageRenderer({ message, isOwn }: MessageRendererProps) {
  const baseStyles = "max-w-xs px-4 py-2 rounded-lg break-words";
  const containerStyles = cn(
    baseStyles,
    isOwn
      ? "bg-blue-500 text-white rounded-br-none"
      : "bg-gray-200 text-gray-900 rounded-bl-none"
  );

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const groupedReactions = message.reactions?.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div
      className={cn(
        "flex flex-col gap-1 max-w-xs",
        isOwn ? "items-end" : "items-start"
      )}
    >
      {/* MESSAGE BUBBLE */}
      <div className={containerStyles}>
        {/* REPLY PREVIEW */}
        {message.replyTo && (
          <div className="bg-black/10 text-xs p-2 rounded mb-2">
            {message.replyTo.isDeleted
              ? "Original message deleted"
              : message.replyTo.content}
          </div>
        )}

        {/* DELETED MESSAGE */}
        {message.isDeleted ? (
          <p className="italic text-gray-400 text-sm">
            This message was deleted
          </p>
        ) : (
          <>
            {message.type === "TEXT" && (
              <p className="text-sm">{message.content}</p>
            )}

            {message.type === "IMAGE" && (
              <div className="flex flex-col gap-2">
                <img
                  src={message.content || "/placeholder.svg"}
                  alt="Shared image"
                  className="max-w-xs h-auto rounded"
                  loading="lazy"
                />
                {message.metadata?.fileName && (
                  <p className="text-xs opacity-75">
                    {message.metadata.fileName}
                  </p>
                )}
              </div>
            )}

            {message.type === "VIDEO" && (
              <div className="flex flex-col gap-2">
                <video
                  src={message.content}
                  controls
                  className="max-w-xs h-auto rounded"
                />
                {message.metadata?.fileName && (
                  <p className="text-xs opacity-75">
                    {message.metadata.fileName}
                  </p>
                )}
              </div>
            )}

            {message.type === "AUDIO" && (
              <div className="flex flex-col gap-2">
                <audio src={message.content} controls className="max-w-xs" />
                {message.metadata?.fileName && (
                  <p className="text-xs opacity-75">
                    {message.metadata.fileName}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {/* TIME */}
        <p className="text-xs mt-1 opacity-75">
          {formatTime(message.createdAt)}
        </p>
      </div>

      {/* REACTIONS */}
      {groupedReactions && (
        <div className="flex gap-2">
          {Object.entries(groupedReactions).map(([emoji, count]) => (
            <span
              key={emoji}
              className="text-xs bg-gray-100 px-2 py-1 rounded-full"
            >
              {emoji} {count}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}