import { useEffect, useState, useCallback, useMemo } from "react";
import { ChatWindow } from "@/components/shared/Chat/ChatWindows";
import { MessageInput } from "@/components/shared/Chat/MessageInput";
import type { Message, SocketAuth } from "@/interface/shared/chat";
import { useSocketChat } from "@/hook/useSocketChat";

import { useParams } from "react-router-dom";
import { userService } from "@/api/UserService";
import type { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

import Header from "@/components/user/shared/Header";

export default function UserChatPage() {
  const user = useSelector((state: RootState) => state.userTokenSlice.user);

  const currentUserId = user?._id;
  const currentUserName = user?.name;
  const userType = "User" as const;

  const { bookingId } = useParams<{ bookingId: string }>();

  const [chatId, setChatId] = useState<string>("");
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  /* ================= GET CHAT ID ================= */

  useEffect(() => {
    const loadChatId = async () => {
      if (!bookingId) return;

      const res = await userService.getChatId(bookingId);

      if (res.data?.chatId) {
        setChatId(res.data.chatId);
      }
    };

    loadChatId();
  }, [bookingId]);

  if (!currentUserId) {
    return <div>Loading...</div>;
  }

  /* ================= SOCKET AUTH ================= */

  const auth: SocketAuth = {
    userId: currentUserId,
    userType,
  };

  /* ================= SOCKET CHAT ================= */

  const {
    isConnected,
    messages: socketMessages,
    sendMessage,
    reactToMessage,
    deleteMessage,
  } = useSocketChat({
    auth,
    chatId,
  });

  /* ================= LOAD HISTORY ================= */

  useEffect(() => {
    if (!chatId) return;

    const loadHistory = async () => {
      setIsLoadingHistory(true);

      const res = await userService.chatHistory(chatId, 50, 0);

      if (res.data.success) {
        setInitialMessages(res.data.messages);
      }

      setIsLoadingHistory(false);
    };

    loadHistory();
  }, [chatId]);

  /* ================= MERGE MESSAGES ================= */

  const allMessages = useMemo(() => {
    const map = new Map<string, Message>();

    [...initialMessages, ...socketMessages].forEach((msg) => {
      map.set(msg.id, msg);
    });

    return Array.from(map.values()).sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()
    );
  }, [initialMessages, socketMessages]);

  /* ================= SEND MESSAGE ================= */

  const handleSendMessage = useCallback(
    (message: Message) => {
      sendMessage(message);
      console.log(message)
    },
    [sendMessage]
  );

  /* ================= UI ================= */

  return (
    <div className="flex flex-col h-screen bg-white">
      <Header />

      <div className="flex flex-1 flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b">
          <p className="font-semibold">Chat with Worker</p>

          <p className="text-xs text-gray-500">
            {isConnected ? "Connected" : "Connecting..."}
          </p>
        </div>

        {/* Messages */}
        <ChatWindow
          messages={allMessages}
          currentUserId={currentUserId}
          reactToMessage={reactToMessage}
          deleteMessage={deleteMessage}
          isLoading={isLoadingHistory}
        />

        {/* Input */}
        <MessageInput
          onSendMessage={handleSendMessage}
          onSendMedia={handleSendMessage}
          chatId={chatId}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          isConnected={isConnected}
        />
      </div>
    </div>
  );
}