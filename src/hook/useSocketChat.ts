"use client";

import { ENV } from "@/config/env/env";
import type { Message, SocketAuth } from "@/interface/shared/chat";
import { useEffect, useRef, useState, useCallback } from "react";
import io from "socket.io-client";

interface UseSocketChatOptions {
  auth: SocketAuth;
  chatId: string;
}

interface UseSocketChatReturn {
  isConnected: boolean;
  messages: Message[];
  sendMessage: (message: Message) => void;
  deleteMessage: (messageId: string) => void;
  reactToMessage: (messageId: string, emoji: string) => void;
  setReplyMessage: (message: Message | null) => void;
  replyMessage: Message | null;
}

export function useSocketChat({
  auth,
  chatId,
}: UseSocketChatOptions): UseSocketChatReturn {
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyMessage, setReplyMessage] = useState<Message | null>(null);

  /* ================= SOCKET CONNECT ================= */

  useEffect(() => {
    const socket = io(ENV.VITE_SERVER_BASEURL, {
      auth: {
        userId: auth.userId,
        userType: auth.userType,
      },
    });

    socketRef.current = socket;

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    /* ================= RECEIVE MESSAGE ================= */

    socket.on("chat:receive", (message: Message) => {
      console.log("brr",message)
      setMessages((prev) => [...prev, message]);
    });

    /* ================= DELETE ================= */

    socket.on("chat:deleted", ({ messageId }:{messageId:string}) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, isDeleted: true }
            : msg
        )
      );
    });

    /* ================= REACTION ================= */

    socket.on("chat:reaction", ({ messageId, userId, emoji }:{ messageId:string, userId :string, emoji:string}) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== messageId) return msg;

          const reactions = msg.reactions ?? [];

          const existing = reactions.find(
            (r) => r.userId === userId
          );

          let updatedReactions;

          if (existing?.emoji === emoji) {
            // remove reaction (toggle)
            updatedReactions = reactions.filter(
              (r) => r.userId !== userId
            );
          } else if (existing) {
            // update emoji
            updatedReactions = reactions.map((r) =>
              r.userId === userId
                ? { ...r, emoji }
                : r
            );
          } else {
            // add reaction
            updatedReactions = [
              ...reactions,
              { userId, emoji },
            ];
          }

          return {
            ...msg,
            reactions: updatedReactions,
          };
        })
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [auth.userId, auth.userType]);

  /* ================= JOIN CHAT ================= */

  useEffect(() => {
    if (!chatId || !socketRef.current) return;

    socketRef.current.emit("chat:join", { chatId });
    setMessages([]);
  }, [chatId]);

  /* ================= SEND MESSAGE ================= */

  const sendMessage = useCallback(
    (message: Message) => {
      socketRef.current?.emit("chat:send", {
        chatId,
        message: {
          type: message.type,
          content: message.content,
          metadata: message.metadata,
          replyTo: replyMessage?.id || null,
        },
      });

      setReplyMessage(null);
    },
    [chatId, replyMessage]
  );

  /* ================= DELETE ================= */

  const deleteMessage = useCallback(
    (messageId: string) => {
      socketRef.current?.emit("chat:delete", {
        chatId,
        messageId,
      });
    },
    [chatId]
  );

  /* ================= REACT ================= */

  const reactToMessage = useCallback(
    (messageId: string, emoji: string) => {
      socketRef.current?.emit("chat:react", {
        chatId,
        messageId,
        emoji,
      });
    },
    [chatId]
  );

  return {
    isConnected,
    messages,
    sendMessage,
    deleteMessage,
    reactToMessage,
    setReplyMessage,
    replyMessage,
  };
}