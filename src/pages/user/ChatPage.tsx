import { Role, CapitalRole } from '../../config/constant/role';
import { useEffect, useState, useCallback, useMemo } from "react";
import { ChatWindow } from "@/components/shared/Chat/ChatWindows";
import { MessageInput } from "@/components/shared/Chat/MessageInput";
import type { Message, SocketAuth } from "@/interface/shared/chat";
import { useSocketChat } from "@/hook/useSocketChat";

import { useParams, useNavigate } from "react-router-dom";
import { userService } from "@/api/UserService";
import type { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

import Header from "@/components/user/shared/Header";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Star, MapPin, ShieldCheck, ArrowLeft, Eye } from "lucide-react";

export default function UserChatPage() {
  const user = useSelector((state: RootState) => state.userTokenSlice.user);
  const navigate = useNavigate();

  const currentUserId = user?._id;
  const currentUserName = user?.name;
  const userType = CapitalRole.USER;

  const { bookingId } = useParams<{ bookingId: string }>();

  const [chatId, setChatId] = useState<string>("");
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Worker detail states
  const [bookingDetail, setBookingDetail] = useState<any>(null);
  const [workerProfile, setWorkerProfile] = useState<any>(null);
  const [isLoadingBooking, setIsLoadingBooking] = useState(false);
  const [isLoadingWorker, setIsLoadingWorker] = useState(false);

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

  /* ================= FETCH BOOKING DETAILS ================= */

  useEffect(() => {
    const fetchBookingDetail = async () => {
      if (!bookingId) return;
      setIsLoadingBooking(true);
      try {
        const res = await userService.bookingDetailData(bookingId);
        if (res.data?.success) {
          setBookingDetail(res.data.booking);
        }
      } catch (err) {
        console.error("Error fetching booking details in chat:", err);
      } finally {
        setIsLoadingBooking(false);
      }
    };

    fetchBookingDetail();
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

  /* ================= EXTRACT WORKER ID & FETCH PROFILE ================= */

  const extractedWorkerId = useMemo(() => {
    if (!allMessages || allMessages.length === 0) return null;
    // Find the first message not sent by the user to identify the worker's ID
    const workerMsg = allMessages.find((m) => m.senderId !== currentUserId);
    return workerMsg ? workerMsg.senderId : null;
  }, [allMessages, currentUserId]);

  useEffect(() => {
    if (!extractedWorkerId) return;

    const fetchWorkerProfile = async () => {
      setIsLoadingWorker(true);
      try {
        const res = await userService.getWorkerProfile(extractedWorkerId);
        if (res.data?.success) {
          setWorkerProfile(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching worker profile in chat:", err);
      } finally {
        setIsLoadingWorker(false);
      }
    };

    fetchWorkerProfile();
  }, [extractedWorkerId]);

  /* ================= SEND MESSAGE ================= */

  const handleSendMessage = useCallback(
    (message: Message) => {
      sendMessage(message);
      console.log(message)
    },
    [sendMessage]
  );

  /* ================= UI RENDERERS ================= */

  const renderHeaderSection = () => {
    if (isLoadingBooking) {
      // Skeleton loader
      return (
        <div className="bg-white border-b border-slate-100 p-4 shadow-sm animate-pulse sticky top-0 z-10">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-200" />
              <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0" />
              <div className="space-y-2 min-w-0">
                <div className="h-4 w-32 bg-slate-200 rounded" />
                <div className="h-3 w-20 bg-slate-200 rounded" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-10 h-10 rounded-xl bg-slate-200" />
              <div className="w-24 h-10 rounded-xl bg-slate-200" />
            </div>
          </div>
        </div>
      );
    }

    // Fallback details if bookingDetails hasn't loaded yet
    const workerName = bookingDetail?.workerName || "Worker Professional";
    const serviceCategory = bookingDetail?.serviceName || "Service Expert";
    const workerImage = bookingDetail?.workerImage;
    const phoneContact = bookingDetail?.contact;

    const rating = workerProfile?.avgRating || null;
    const reviewsCount = workerProfile?.totalReviews || 0;
    const experience = workerProfile?.experience || null;
    const zone = workerProfile?.zone || null;
    const isOnline = workerProfile?.isActive || false;

    return (
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3.5 shadow-sm sticky top-0 z-10 transition-all duration-300">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Worker Info Area */}
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full shrink-0 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              onClick={() => navigate(`/bookings/${bookingId}`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            {/* Avatar with Online/Offline indicator */}
            <div className="relative shrink-0">
              <Avatar className="h-12 w-12 border-2 border-white shadow-sm ring-1 ring-slate-100">
                {workerImage ? (
                  <AvatarImage
                    src={workerImage}
                    alt={workerName}
                    className="object-cover"
                  />
                ) : null}
                <AvatarFallback className="bg-blue-600 text-white font-bold text-base">
                  {workerName
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              
              {/* Online Dot */}
              <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${
                isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
              }`} />
            </div>

            {/* Name and Details */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="font-extrabold text-slate-800 text-base md:text-lg leading-tight truncate max-w-[200px] sm:max-w-xs">
                  {workerName}
                </h2>
                <ShieldCheck className="h-4.5 w-4.5 text-blue-600 fill-blue-50 shrink-0" />
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 rounded bg-blue-50 text-blue-700 hover:bg-blue-50 border-0 font-bold uppercase shrink-0">
                  {serviceCategory}
                </Badge>
              </div>

              {/* Worker Stats */}
              <div className="flex items-center flex-wrap gap-x-2.5 gap-y-0.5 text-xs text-slate-500 font-medium mt-1">
                {rating !== null && (
                  <div className="flex items-center gap-1 text-slate-700">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold">{rating.toFixed(1)}</span>
                    <span className="text-slate-400">({reviewsCount} reviews)</span>
                  </div>
                )}
                {rating !== null && experience && <span className="text-slate-300">•</span>}
                {experience && (
                  <span>{experience} years exp</span>
                )}
                {(rating !== null || experience) && zone && <span className="text-slate-300">•</span>}
                {zone && (
                  <span className="inline-flex items-center gap-1 shrink-0">
                    <MapPin className="h-3 w-3 text-rose-500" />
                    {zone}
                  </span>
                )}
                <span className="text-slate-300">•</span>
                <span className={`text-[10px] font-bold uppercase ${isOnline ? "text-emerald-600" : "text-slate-400"}`}>
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:justify-end ml-12 md:ml-0">
            {phoneContact && (
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer shrink-0"
                onClick={() => window.open(`tel:${phoneContact}`)}
                title="Call worker"
              >
                <Phone className="h-4.5 w-4.5" />
              </Button>
            )}

            {extractedWorkerId && (
              <Button
                className="h-10 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-100 hover:shadow-blue-200 transition-all cursor-pointer gap-1.5"
                onClick={() => navigate(`/workers/${extractedWorkerId}`)}
              >
                <Eye className="h-4 w-4" />
                View Profile
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ================= MAIN RENDER ================= */

  return (
    <div className="flex flex-col h-screen bg-slate-50/50">
      <Header />

      <div className="flex flex-1 flex-col overflow-hidden bg-white max-w-6xl mx-auto w-full border-x border-slate-100 shadow-sm mt-20 md:mt-24 mb-4 rounded-t-3xl overflow-hidden">
        {/* Worker Details Header */}
        {renderHeaderSection()}

        {/* Connection status indicator if not connected */}
        {!isConnected && (
          <div className="bg-amber-50 text-amber-800 text-[11px] font-bold text-center py-1.5 border-b border-amber-100 tracking-wide uppercase shrink-0">
            Reconnecting to chat...
          </div>
        )}

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