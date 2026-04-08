"use client";

import { useEffect, useMemo, useState } from "react";
import { InboxList } from "@/components/shared/Chat/InboxList";
import { ChatWindow } from "@/components/shared/Chat/ChatWindows";
import { MessageInput } from "@/components/shared/Chat/MessageInput";
import { useSocketChat } from "@/hook/useSocketChat";
import type { SocketAuth, Message } from "@/interface/shared/chat";

import { WorkerLayout } from "@/components/worker/Dashboard/WorkerLayout";
import { Navbar } from "@/components/worker/Dashboard/WorkerNavbar";

import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { workerService } from "@/api/WorkerService";

export default function WorkerMessagesPage() {
  const worker = useSelector(
    (state: RootState) => state.workerTokenSlice.worker
  );

  const workerId = worker?._id;
  const workerName = worker?.name;

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [historyMessages, setHistoryMessages] = useState<Message[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  if (!workerId) {
    return <div>Loading...</div>;
  }

  /* ================= SOCKET AUTH ================= */

  const auth: SocketAuth = {
    userId: workerId,
    userType: "Worker",
  };

  /* ================= SOCKET ================= */

  const {
    messages: socketMessages,
    sendMessage,
    reactToMessage,
    deleteMessage,
    isConnected,
  } = useSocketChat({
    auth,
    chatId: selectedChatId ?? "",
  });

  /* ================= LOAD CHAT HISTORY ================= */

  useEffect(() => {
    if (!selectedChatId) return;

    const loadHistory = async () => {
      setIsLoadingHistory(true);

      const res = await workerService.chatHistory(
        selectedChatId,
        50,
        0
      );

      if (res.data.success) {
        setHistoryMessages(res.data.messages);
      }

      setIsLoadingHistory(false);
    };

    loadHistory();
  }, [selectedChatId]);

  /* ================= MERGE HISTORY + SOCKET ================= */

  const allMessages = useMemo(() => {
    const map = new Map<string, Message>();

    [...historyMessages, ...socketMessages].forEach((msg) => {
      map.set(msg.id, msg);
    });

    return Array.from(map.values()).sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()
    );
  }, [historyMessages, socketMessages]);

  /* ================= SEND MESSAGE ================= */

  const handleSendMessage = (message: Message) => {
    sendMessage(message);
  };

  return (
    <WorkerLayout>
      <Navbar />

      <div className="min-h-screen bg-background">
        <div className="flex h-[calc(100vh-64px)] bg-white">

          {/* LEFT — CHAT LIST */}
          <div className="w-60 border-r">
            <InboxList
              userId={workerId}
              role="worker"
              selectedChatId={selectedChatId ?? undefined}
              onSelectChat={setSelectedChatId}
            />
          </div>

          {/* RIGHT — CHAT */}
          <div className="flex-1 flex flex-col">

            {selectedChatId ? (
              <>
                {/* HEADER */}
                <div className="p-4 border-b">
                  <p className="font-semibold">Chat with User</p>

                  <p className="text-xs text-gray-500">
                    {isConnected ? "Connected" : "Connecting..."}
                  </p>
                </div>

                {/* MESSAGES */}
                <ChatWindow
                  messages={allMessages}
                  currentUserId={workerId}
                  reactToMessage={reactToMessage}
                  deleteMessage={deleteMessage}
                  showSenderNames
                  isLoading={isLoadingHistory}
                />

                {/* INPUT */}
                <MessageInput
                  onSendMessage={handleSendMessage}
                  onSendMedia={handleSendMessage}
                  chatId={selectedChatId}
                  currentUserId={workerId}
                  currentUserName={workerName}
                  isConnected={isConnected}
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                Select a user to start chatting
              </div>
            )}

          </div>
        </div>
      </div>
    </WorkerLayout>
  );
}