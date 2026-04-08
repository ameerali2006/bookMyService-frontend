"use client";

import React from "react"

import {
  useRef,
  useState,
  useCallback,
  useId,
} from "react";


import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Message } from "@/interface/shared/chat";
import { uploadToCloudinary } from "@/lib/cloudinaryService";

interface MessageInputProps {
  onSendMessage: (message: Message) => void;
  onSendMedia: (message: Message) => void;
  chatId: string;
  currentUserId: string;
  currentUserName?: string;
  isConnected: boolean;
  isLoading?: boolean;
  className?: string;
}

/**
 * Message input component with text and media upload support
 * Handles text messages, images, videos, and audio
 */
export function MessageInput({
  onSendMessage,
  onSendMedia,
  chatId,
  currentUserId,
  currentUserName,
  isConnected,
  isLoading = false,
  className,
}: MessageInputProps) {
  const [textInput, setTextInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // const audioRef = useRef<HTMLAudioElement>(null);
  const messageId = useId();

  const handleSendText = useCallback(() => {
    if (!textInput.trim() || !isConnected || isLoading) return;

    const message: Message = {
      id: `${messageId}-${Date.now()}`,
      chatId,
      senderId: currentUserId,
      senderName: currentUserName,
      type: "TEXT",
      content: textInput,
      createdAt: new Date().toISOString(),
      isOwn:true
    };

    onSendMessage(message);
    setTextInput("");
  }, [
    textInput,
    isConnected,
    isLoading,
    onSendMessage,
    messageId,
    chatId,
    currentUserId,
    currentUserName,
  ]);

  const handleMediaUpload = useCallback(
    async (file: File) => {
      if (!isConnected || isLoading) return;

      try {
        setIsUploading(true);
        const mediaType = file.type.split("/")[0];

        if (!["image", "video", "audio"].includes(mediaType)) {
          alert(
            "Unsupported file type. Please upload image, video, or audio."
          );
          return;
        }

        // Upload file via REST API
        const url = await uploadToCloudinary(file, "chat-media");


        const message: Message = {
          id: `${messageId}-${Date.now()}`,
          chatId,
          senderId: currentUserId,
          senderName: currentUserName,
          type: mediaType.toUpperCase() as "IMAGE" | "VIDEO" | "AUDIO",
          content: url,
          createdAt: new Date().toISOString(),
          isOwn:true
        };

        onSendMedia(message);
      } catch (error) {
        console.error("[MessageInput] Media upload error:", error);
        alert(
          "Failed to upload media. " +
            (error instanceof Error ? error.message : "")
        );
      } finally {
        setIsUploading(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [
      isConnected,
      isLoading,
      chatId,
      currentUserId,
      currentUserName,
      messageId,
      onSendMedia,
    ]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleMediaUpload(file);
      }
    },
    [handleMediaUpload]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendText();
      }
    },
    [handleSendText]
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-3 p-4 bg-white border-t border-gray-200",
        className
      )}
    >
      {!isConnected && (
        <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
          Connecting...
        </div>
      )}

      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,audio/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={!isConnected || isLoading || isUploading}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={!isConnected || isLoading || isUploading}
          className={cn(
            "p-2 rounded-lg transition-colors",
            isConnected && !isLoading && !isUploading
              ? "hover:bg-gray-100 text-gray-600"
              : "text-gray-300 cursor-not-allowed"
          )}
          title="Attach image, video, or audio"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>

        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={!isConnected || isLoading}
          rows={1}
          className={cn(
            "flex-1 p-2 border border-gray-300 rounded-lg resize-none",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            "disabled:bg-gray-50 disabled:text-gray-400"
          )}
        />

        <Button
          onClick={handleSendText}
          disabled={
            !textInput.trim() || !isConnected || isLoading || isUploading
          }
          size="sm"
          className="px-4"
        >
          {isUploading ? "Uploading..." : "Send"}
        </Button>
      </div>

      {isUploading && (
        <div className="text-xs text-gray-500">Uploading media...</div>
      )}

      <input
        
        type="hidden"
      />
    </div>
  );
}
