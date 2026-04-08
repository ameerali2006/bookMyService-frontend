"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Phone,
  Calendar,
  Clock,
  FileText,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Navigation,
  CheckCircle2,
  Circle,
  Wrench,
  CreditCard,
  ArrowLeft,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { WorkerLayout } from "@/components/worker/Dashboard/WorkerLayout";
import { Navbar } from "@/components/worker/Dashboard/WorkerNavbar";
import { useParams } from "react-router-dom";
import { workerService } from "@/api/WorkerService";
import { ErrorToast, SuccessToast } from "@/components/shared/Toaster";
import { OtpQrVerification } from "@/components/worker/WorkerService/Varification";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  image?: string;
}

export interface ILocation {
  type: "Point";
  coordinates: [number, number];
}

export interface IAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  location: ILocation;
}

export interface IService {
  _id: string;
  category: string;
  name: string;
  description?: string;
}

export interface IAdditionalItem {
  _id?: string;
  name: string;
  price: number;
}

export interface IPaymentItem {
  title: string;
  rate: number;
  label: string;
  quantity: number;
  total: number;
}

export type BookingStatus =
  | "confirmed"
  | "in-progress"
  | "completed"
  | "awaiting-final-payment";
export type PaymentMethod = "cash" | "card" | "upi" | "wallet";

export interface IBooking {
  _id: string;
  userId: string;
  workerId: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  totalAmount: number;
  remainingAmount: number;
  paymentMethod: PaymentMethod;
  description: string;
  address: IAddress;
  additionalItems?: IAdditionalItem[];
  paymentBreakdown?: IPaymentItem[];
  advanceAmount?: number;
  advancePaymentStatus?: string;
  advancePaymentId?: string;
  finalPaymentId?: string;
  createdAt: string;
  updatedAt: string;
  verification: boolean;
}

export interface IBookingPopulated
  extends Omit<IBooking, "userId" | "serviceId"> {
  userId: IUser;
  serviceId: IService;
}

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; dot: string; badge: string }
> = {
  confirmed: {
    label: "Confirmed",
    dot: "bg-sky-400",
    badge: "bg-sky-50 text-sky-700 border-sky-200",
  },
  "in-progress": {
    label: "In Progress",
    dot: "bg-amber-400",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  completed: {
    label: "Completed",
    dot: "bg-emerald-400",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  "awaiting-final-payment": {
    label: "Awaiting Payment",
    dot: "bg-violet-400",
    badge: "bg-violet-50 text-violet-700 border-violet-200",
  },
};

const TIMELINE_STEPS: { key: BookingStatus; label: string }[] = [
  { key: "confirmed", label: "Confirmed" },
  { key: "in-progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
];

const STEP_ORDER: BookingStatus[] = [
  "confirmed",
  "in-progress",
  "awaiting-final-payment",
  "completed",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({
  icon,
  title,
  action,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="text-slate-500">{icon}</span>
          <h2 className="font-semibold text-slate-800 text-sm tracking-wide uppercase">
            {title}
          </h2>
        </div>
        {action}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wide pt-0.5 min-w-[110px]">
        {label}
      </span>
      <span className="text-sm text-slate-700 text-right">{value}</span>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function WorkerBookingDetailsPage() {
  const { bookingId } = useParams<{ bookingId: string }>();

  const [booking, setBooking] = useState<IBookingPopulated | null>(null);
  const [loading, setLoading] = useState(true);
  const [additionalItems, setAdditionalItems] = useState<IAdditionalItem[]>([]);
  const [editingDescription, setEditingDescription] = useState(false);
  const [description, setDescription] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [isBreakdownExpanded, setIsBreakdownExpanded] = useState(false);

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    if (!bookingId) return;
    try {
      setLoading(true);
      const res = await workerService.getBookingDetails(bookingId);
      setBooking(res.data.booking);
      setAdditionalItems(res.data.booking.additionalItems || []);
      setDescription(res.data.booking.description || "");
    } catch {
      ErrorToast("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <WorkerLayout>
        <Navbar />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin" />
            <p className="text-sm text-slate-500">Loading booking details…</p>
          </div>
        </div>
      </WorkerLayout>
    );
  }

  if (!booking) {
    return (
      <WorkerLayout>
        <Navbar />
        <div className="flex justify-center items-center min-h-[60vh]">
          <p className="text-slate-500">Booking not found</p>
        </div>
      </WorkerLayout>
    );
  }

  const isToday =
    booking.date.split("T")[0] === new Date().toISOString().split("T")[0];
  const isEditable =
    booking.status === "confirmed" || booking.status === "in-progress";
  const isInProgress = booking.status === "in-progress";
  const statusCfg = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.confirmed;
  const currentStepIdx = STEP_ORDER.indexOf(booking.status);

  const formatAddress = () => {
    const { street, city, state, postalCode, country } = booking.address;
    return `${street}, ${city}, ${state} ${postalCode}, ${country}`;
  };

  const calculateDuration = () => {
    const start = new Date(`${booking.date.split("T")[0]}T${booking.startTime}`);
    const end = new Date(`${booking.date.split("T")[0]}T${booking.endTime}`);
    const diffMs = end.getTime() - start.getTime();
    const h = Math.floor(diffMs / 3600000);
    const m = Math.floor((diffMs % 3600000) / 60000);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const openMap = () => {
    const [lng, lat] = booking.address.location.coordinates;
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, "_blank");
  };

  const handleReachedLocation = async () => {
    try {
      const res = await workerService.reachedCustomerLocation(booking._id);
      setBooking(res.data.booking);
    } catch {
      ErrorToast("Failed to verify arrival");
    }
  };

  const handleCompleted = async () => {
    if (!booking?._id) return ErrorToast("Booking not found");
    try {
      const res = await workerService.workComplated(booking._id);
      if (!res.data.success) return ErrorToast(res.data.message || "Failed to complete work");
      SuccessToast("Work completed successfully");
      loadBooking();
    } catch {
      ErrorToast("Something went wrong while completing work");
    }
  };

  const handleVerify = async (otp: string) => {
    if (!booking?._id) return ErrorToast("Booking not found");
    try {
      const response = await workerService.verifyWorker(booking._id, otp);
      if (!response.data.success) return ErrorToast(response.data.message || "Verification failed");
      SuccessToast("Worker verified successfully");
      loadBooking();
    } catch (error: any) {
      ErrorToast(error?.response?.data?.message || "Something went wrong");
    }
  };

  const handleAddItem = async () => {
    // TODO: wire up API
  };

  const handleRemoveItem = async (_id: string) => {
    // TODO: wire up API
  };

  const calculateItemsTotal = () =>
    additionalItems.reduce((s, i) => s + i.price, 0);

  const handleDescriptionSave = () => {
    setBooking({ ...booking, description });
    setEditingDescription(false);
  };

  const getActionButton = (): { label: string; action: () => void; variant?: "default" | "emerald" } => {
    if (!isToday) return { label: "Navigate to Customer", action: openMap };
    if (booking.status === "awaiting-final-payment") return { label: "Verify Payment", action: handleReachedLocation, variant: "emerald" };
    if (!isInProgress) return { label: "Mark Arrived", action: handleReachedLocation };
    return { label: "Mark Work Complete", action: handleCompleted, variant: "emerald" };
  };

  const { label, action, variant } = getActionButton();

  return (
    <WorkerLayout>
      <Navbar />

      <div className="min-h-screen bg-slate-50 font-sans">

        {/* ── Top bar ── */}
        <div className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button className="text-slate-400 hover:text-slate-700 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs text-slate-400 leading-none mb-0.5">Booking</p>
                <p className="font-mono text-sm font-semibold text-slate-700 truncate max-w-[180px] sm:max-w-none">
                  #{booking._id.slice(-10).toUpperCase()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              {isToday && (
                <span className="hidden sm:inline-flex text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200 rounded-full px-2.5 py-1">
                  Today
                </span>
              )}
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 text-xs font-semibold border rounded-full px-3 py-1",
                  statusCfg.badge
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", statusCfg.dot)} />
                {statusCfg.label}
              </span>
              <span className="hidden sm:block text-xs text-slate-400">
                {new Date(booking.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-4">

          {/* ── Customer card ── */}
          <SectionCard icon={<Phone className="h-4 w-4" />} title="Customer">
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14 rounded-xl shrink-0">
                <AvatarImage src={booking.userId.image || "/placeholder.svg"} alt={booking.userId.name} />
                <AvatarFallback className="rounded-xl bg-slate-100 text-slate-600 font-semibold">
                  {booking.userId.name.split(" ").map((n: string) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 text-base leading-tight">{booking.userId.name}</h3>
                <a href={`tel:${booking.userId.phone}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mt-1 transition-colors">
                  <Phone className="h-3.5 w-3.5" />
                  {booking.userId.phone}
                </a>
                <p className="text-sm text-slate-500 flex items-start gap-1.5 mt-1.5">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-slate-400" />
                  <span className="leading-snug">{formatAddress()}</span>
                </p>
              </div>
            </div>

            {/* Action strip */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={openMap}
                className="gap-2 flex-1 sm:flex-none text-slate-600 border-slate-200 hover:bg-slate-50"
              >
                <Navigation className="h-3.5 w-3.5" />
                Open Map
              </Button>
              <Button
                size="sm"
                onClick={action}
                className={cn(
                  "gap-2 flex-1 sm:flex-none",
                  variant === "emerald"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                )}
              >
                <Navigation className="h-3.5 w-3.5" />
                {label}
              </Button>
            </div>
          </SectionCard>

          {/* ── OTP Verification ── */}
          {booking.verification && (
            <OtpQrVerification
              bookingId={booking._id}
              onVerified={(otp) => handleVerify(otp)}
            />
          )}

          {/* ── Service details ── */}
          <SectionCard icon={<Wrench className="h-4 w-4" />} title="Service Details">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="font-semibold text-slate-900">{booking.serviceId.name}</h3>
                <span className="inline-block mt-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-md px-2 py-0.5">
                  {booking.serviceId.category}
                </span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[11px] text-slate-400 uppercase font-medium tracking-wide">Date</p>
                  <p className="text-sm font-medium text-slate-800">
                    {new Date(booking.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[11px] text-slate-400 uppercase font-medium tracking-wide">Time</p>
                  <p className="text-sm font-medium text-slate-800">
                    {booking.startTime} – {booking.endTime}{" "}
                    <span className="text-slate-400 text-xs">({calculateDuration()})</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="pt-2">
              <p className="text-[11px] text-slate-400 uppercase font-medium tracking-wide mb-4">Progress</p>
              <div className="relative flex items-center justify-between">
                {/* Track line */}
                <div className="absolute top-4 left-0 right-0 h-px bg-slate-200" />
                <div
                  className="absolute top-4 left-0 h-px bg-slate-700 transition-all duration-500"
                  style={{
                    width: `${
                      currentStepIdx === 0
                        ? "0%"
                        : currentStepIdx >= STEP_ORDER.length - 1
                        ? "100%"
                        : `${(currentStepIdx / (STEP_ORDER.length - 1)) * 100}%`
                    }`,
                  }}
                />
                {TIMELINE_STEPS.map((step, i) => {
                  const stepIdx = STEP_ORDER.indexOf(step.key);
                  const done = currentStepIdx >= stepIdx;
                  return (
                    <div key={step.key} className="relative z-10 flex flex-col items-center gap-2">
                      <div
                        className={cn(
                          "h-8 w-8 rounded-full border-2 flex items-center justify-center bg-white transition-all",
                          done ? "border-slate-800" : "border-slate-200"
                        )}
                      >
                        {done ? (
                          <CheckCircle2 className="h-4 w-4 text-slate-800" />
                        ) : (
                          <Circle className="h-4 w-4 text-slate-300" />
                        )}
                      </div>
                      <span className={cn("text-xs font-medium", done ? "text-slate-700" : "text-slate-400")}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </SectionCard>

          {/* ── Description ── */}
          <SectionCard
            icon={<FileText className="h-4 w-4" />}
            title="Description"
            action={
              isEditable && !editingDescription ? (
                <button
                  onClick={() => setEditingDescription(true)}
                  className="text-xs font-medium text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-400 rounded-lg px-3 py-1.5 transition-all"
                >
                  Edit
                </button>
              ) : undefined
            }
          >
            {editingDescription ? (
              <div className="space-y-3">
                <textarea
                  className="w-full min-h-24 p-3 text-sm border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all bg-slate-50"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter booking description…"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleDescriptionSave} className="bg-slate-900 text-white hover:bg-slate-800">
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setDescription(booking.description); setEditingDescription(false); }}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600 leading-relaxed">
                {booking.description || <span className="text-slate-400 italic">No description provided.</span>}
              </p>
            )}
          </SectionCard>

          {/* ── Additional items ── */}
          {(isEditable || additionalItems.length > 0) && (
            <SectionCard
              icon={<Plus className="h-4 w-4" />}
              title="Additional Items"
              action={
                additionalItems.length > 0 ? (
                  <span className="text-xs font-semibold bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">
                    {additionalItems.length}
                  </span>
                ) : undefined
              }
            >
              {additionalItems.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {additionalItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-100"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-800">{item.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">₹{item.price.toFixed(2)}</p>
                      </div>
                      {isEditable && (
                        <button
                          onClick={() => handleRemoveItem(item._id!)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white rounded-xl">
                    <p className="text-sm font-semibold">Total</p>
                    <p className="font-bold">₹{calculateItemsTotal().toFixed(2)}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-6">No additional items added yet</p>
              )}

              {isEditable && (
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Add Item</p>
                  <div className="grid sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2 space-y-1">
                      <Label htmlFor="item-name" className="text-xs text-slate-500">Item Name</Label>
                      <Input
                        id="item-name"
                        placeholder="e.g. Replacement Parts"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className="text-sm rounded-xl border-slate-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="item-price" className="text-xs text-slate-500">Price (₹)</Label>
                      <Input
                        id="item-price"
                        type="number"
                        placeholder="0.00"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(e.target.value)}
                        min="0"
                        step="0.01"
                        className="text-sm rounded-xl border-slate-200"
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddItem} size="sm" className="gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl">
                    <Plus className="h-3.5 w-3.5" />
                    Add Item
                  </Button>
                </div>
              )}
            </SectionCard>
          )}

          {/* ── Payment breakdown ── */}
           {/* ── Payment Summary ── */}
          <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-200">
            {/* Dark header band */}
            <div className="bg-slate-900 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CreditCard className="h-4 w-4 text-slate-400" />
                <h2 className="font-semibold text-white text-sm tracking-wide uppercase">Payment Summary</h2>
              </div>
              <span className={cn(
                "text-xs font-semibold border rounded-full px-2.5 py-1 capitalize",
                booking.paymentMethod === "cash"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  : booking.paymentMethod === "upi"
                  ? "bg-violet-500/20 text-violet-300 border-violet-500/30"
                  : "bg-sky-500/20 text-sky-300 border-sky-500/30"
              )}>
                {booking.paymentMethod}
              </span>
            </div>

            {/* Amount stats row */}
            <div className="bg-white grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100">
              <div className="px-5 py-4">
                <p className="text-[11px] text-slate-400 uppercase font-medium tracking-wide mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-slate-900">₹{booking.totalAmount.toFixed(2)}</p>
              </div>
              <div className="px-5 py-4">
                <p className="text-[11px] text-slate-400 uppercase font-medium tracking-wide mb-1">Remaining</p>
                <p className={cn(
                  "text-2xl font-bold",
                  booking.remainingAmount > 0 ? "text-amber-600" : "text-emerald-600"
                )}>
                  ₹{booking.remainingAmount.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Advance payment row */}
            {booking.advanceAmount !== undefined && (
              <div className="bg-white px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Advance Paid</span>
                  {booking.advancePaymentStatus && (
                    <span className={cn(
                      "text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5",
                      booking.advancePaymentStatus === "paid"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    )}>
                      {booking.advancePaymentStatus}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-slate-800">₹{booking.advanceAmount.toFixed(2)}</p>
              </div>
            )}

            {/* Breakdown toggle */}
            {booking.paymentBreakdown && booking.paymentBreakdown.length > 0 && (
              <>
                <button
                  onClick={() => setIsBreakdownExpanded(!isBreakdownExpanded)}
                  className="w-full bg-white flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100"
                >
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    {isBreakdownExpanded ? "Hide" : "View"} Breakdown
                  </span>
                  {isBreakdownExpanded
                    ? <ChevronUp className="h-4 w-4 text-slate-400" />
                    : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>

                {isBreakdownExpanded && (
                  <div className="bg-slate-50 px-5 py-4 space-y-2">
                    {booking.paymentBreakdown.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-100"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-800">{item.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            ₹{item.rate.toFixed(2)} / {item.label} × {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-slate-800">₹{item.total.toFixed(2)}</p>
                      </div>
                    ))}

                    {/* Breakdown total */}
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-900 rounded-xl mt-1">
                      <p className="text-sm font-semibold text-slate-300">Subtotal</p>
                      <p className="text-sm font-bold text-white">
                        ₹{booking.paymentBreakdown.reduce((s, i) => s + i.total, 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Payment status footer */}
            <div className={cn(
              "px-5 py-3 flex items-center justify-between",
              booking.remainingAmount === 0
                ? "bg-emerald-50"
                : "bg-amber-50"
            )}>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "h-2 w-2 rounded-full",
                  booking.remainingAmount === 0 ? "bg-emerald-500" : "bg-amber-400"
                )} />
                <p className={cn(
                  "text-xs font-medium",
                  booking.remainingAmount === 0 ? "text-emerald-700" : "text-amber-700"
                )}>
                  {booking.remainingAmount === 0 ? "Payment fully settled" : "Payment pending collection"}
                </p>
              </div>
              {booking.finalPaymentId && (
                <p className="text-[10px] font-mono text-slate-400">#{booking.finalPaymentId.slice(-8)}</p>
              )}
            </div>
          </div>
          {/* Bottom padding */}
          <div className="h-6" />
        </div>
      </div>
    </WorkerLayout>
  );
}