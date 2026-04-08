"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
  Navigation,
  CheckCircle2,
  Circle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { WorkerLayout } from "@/components/worker/Dashboard/WorkerLayout";
import { Navbar } from "@/components/worker/Dashboard/WorkerNavbar";
import { useParams } from "react-router-dom";
import { workerService } from "@/api/WorkerService";
import { ErrorToast, SuccessToast } from "@/components/shared/Toaster";
import { OtpQrVerification } from "@/components/worker/WorkerService/Varification";

/* ---------------- TYPES ---------------- */

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
}

export interface IAdditionalItem {
  _id?: string;
  name: string;
  price: number;
}

export type BookingStatus =
  | "confirmed"
  | "in-progress"
  | "completed"
  | "awaiting-final-payment";

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
  description: string;
  address: IAddress;
  additionalItems?: IAdditionalItem[];
  verification: boolean;
}

export interface IBookingPopulated extends Omit<
  IBooking,
  "userId" | "serviceId"
> {
  userId: IUser;
  serviceId: IService;
}

/* ---------------- COMPONENT ---------------- */

export default function WorkerBookingDetailsPage() {
  const { bookingId } = useParams<{ bookingId: string }>();

  const [booking, setBooking] = useState<IBookingPopulated | null>(null);

  const [loading, setLoading] = useState(true);

  const [additionalItems, setAdditionalItems] = useState<IAdditionalItem[]>([]);

  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      setLoading(true);

      const res = await workerService.getBookingDetails(bookingId!);

      setBooking(res.data.booking);
      setAdditionalItems(res.data.booking.additionalItems || []);
    } catch {
      ErrorToast("Failed to load booking");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <WorkerLayout>
        <Navbar />
        <div className="flex justify-center items-center h-[60vh]">
          Loading...
        </div>
      </WorkerLayout>
    );
  }

  if (!booking) return null;

  const isToday =
    booking.date.split("T")[0] === new Date().toISOString().split("T")[0];

  const isEditable =
    booking.status === "confirmed" || booking.status === "in-progress";

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-600";
      case "in-progress":
        return "bg-yellow-100 text-yellow-600";
      case "completed":
        return "bg-green-100 text-green-600";
      default:
        return "bg-gray-100";
    }
  };

  const openMap = () => {
    const [lng, lat] = booking.address.location.coordinates;

    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  };

  const calculateDuration = () => {
    const start = new Date(
      `${booking.date.split("T")[0]}T${booking.startTime}`,
    );
    const end = new Date(`${booking.date.split("T")[0]}T${booking.endTime}`);

    const diff = (end.getTime() - start.getTime()) / 60000;

    return `${Math.floor(diff / 60)}h ${diff % 60}m`;
  };

  const calculateItemsTotal = () =>
    additionalItems.reduce((sum, item) => sum + item.price, 0);

  /* ---------------- UI ---------------- */

  return (
    <WorkerLayout>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-black">
        {/* HERO HEADER */}

        <div className="bg-white/80 backdrop-blur border-b">
          <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Booking</p>
              <h1 className="text-xl font-bold tracking-tight">
                {booking.serviceId.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {new Date(booking.date).toDateString()}
              </p>
            </div>

            <Badge className="text-sm px-4 py-1 capitalize">
              {booking.status.replace("-", " ")}
            </Badge>
          </div>
        </div>

        {/* PAGE GRID */}

        <div className="max-w-7xl mx-auto p-6 grid lg:grid-cols-3 gap-6">
          {/* LEFT SIDE */}

          <div className="lg:col-span-2 space-y-6">
            {/* CUSTOMER CARD */}

            <Card className="border-0 shadow-xl rounded-2xl bg-gradient-to-br from-white to-slate-50">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 ring-4 ring-blue-200 shadow">
                    <AvatarImage src={booking.userId.image} />
                    <AvatarFallback>{booking.userId.name[0]}</AvatarFallback>
                  </Avatar>

                  <div>
                    <h3 className="text-lg font-bold">{booking.userId.name}</h3>

                    <p className="text-sm text-muted-foreground flex gap-2 items-center">
                      <Phone size={14} />
                      {booking.userId.phone}
                    </p>

                    <p className="text-sm text-muted-foreground flex gap-2 items-center">
                      <MapPin size={14} />
                      {booking.address.city}, {booking.address.state}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={openMap}
                  className="bg-blue-600 hover:bg-blue-700 shadow-lg gap-2"
                >
                  <Navigation size={16} />
                  Navigate
                </Button>
              </CardContent>
            </Card>

            {/* MAP CARD */}

            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle>Customer Location</CardTitle>
              </CardHeader>

              <CardContent className="p-0">
                <iframe
                  className="w-full h-[280px]"
                  src={`https://maps.google.com/maps?q=${booking.address.location.coordinates[1]},${booking.address.location.coordinates[0]}&z=15&output=embed`}
                />
              </CardContent>
            </Card>

            {/* DESCRIPTION */}

            <Card className="border-0 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {booking.description || "No description provided"}
                </p>
              </CardContent>
            </Card>

            {/* ADDITIONAL ITEMS */}

            <Card className="border-0 shadow-xl rounded-2xl">
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>Additional Items</CardTitle>
                <Badge>{additionalItems.length}</Badge>
              </CardHeader>

              <CardContent className="space-y-3">
                {additionalItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between p-3 rounded-xl bg-slate-100"
                  >
                    <p>{item.name}</p>

                    <p className="font-semibold text-primary">₹{item.price}</p>
                  </div>
                ))}

                {additionalItems.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No additional items
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SIDEBAR */}

          <div className="space-y-6">
            {/* SERVICE INFO */}

            <Card className="border-0 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle>Service Info</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date(booking.date).toDateString()}
                  </p>
                </div>

                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Start</p>
                  <p className="font-medium">{booking.startTime}</p>
                </div>

                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">End</p>
                  <p className="font-medium">{booking.endTime}</p>
                </div>
              </CardContent>
            </Card>

            {/* PROGRESS */}

            <Card className="border-0 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle>Service Progress</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {["confirmed", "in-progress", "completed"].map((step) => {
                  const active =
                    step === booking.status ||
                    (step === "confirmed" && booking.status !== "confirmed");

                  return (
                    <div key={step} className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          active ? "bg-green-500 text-white" : "bg-gray-200",
                        )}
                      >
                        {active ? (
                          <CheckCircle2 size={16} />
                        ) : (
                          <Circle size={16} />
                        )}
                      </div>

                      <p className="capitalize font-medium">
                        {step.replace("-", " ")}
                      </p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </WorkerLayout>
  );
}
