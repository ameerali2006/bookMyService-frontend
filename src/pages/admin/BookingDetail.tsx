import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import Navbar from "@/components/admin/Navbar";
import Sidebar from "@/components/admin/Sidebar";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminManagement } from "@/api/AdminManagement";
import { ErrorToast } from "@/components/shared/Toaster";
import type { AdminBookingDetailsDto } from "@/interface/admin/booking";
import { generateBookingCode } from "@/utils/booking-convert";

function getStatusColor(status: string) {
  switch (status) {
    case "confirmed":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "in-progress":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "completed":
      return "bg-green-50 text-green-700 border-green-200";
    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

function isToday(dateString: string) {
  const today = new Date();
  const date = new Date(dateString);
  return today.toDateString() === date.toDateString();
}

export default function AdminBookingDetailsPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<AdminBookingDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!bookingId) return;

    const fetchBooking = async () => {
      try {
        const response = await adminManagement.getBookingDetailPage(bookingId);
        console.log(response.data.booking);
        setBooking(response.data.booking);
      } catch (error) {
        ErrorToast("Failed to load booking details");
        navigate("/admin/bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-gray-500">
        Loading booking...
      </div>
    );
  }

  if (!booking) return null;

  const googleMapsUrl = `https://www.google.com/maps?q=${booking.address.lat},${booking.address.lng}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      <Sidebar
        activeItem="WorkerManagement"
        onItemClick={() => {}}
        onLogout={() => {
          localStorage.removeItem("adminToken");
          sessionStorage.clear();
          navigate("/admin/login");
        }}
      />

      <Navbar userName="Admin" onSearch={setSearch} />

      <main className="ml-64 pt-16 px-10 pb-16">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* HERO HEADER */}

          <div className="bg-white rounded-2xl shadow-xl p-6 flex justify-between items-center">
            <div>
              <p className="text-xs uppercase text-gray-400 tracking-widest">
                Booking
              </p>

              <h1 className="text-2xl font-bold text-[#0B1F3A] mt-1">
                #{generateBookingCode(booking.id)}
              </h1>

              <p className="text-sm text-gray-500">
                {new Date(booking.bookingDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="flex gap-3">
              <Badge
                variant="outline"
                className={cn(
                  "border px-3 py-1",
                  getStatusColor(booking.status),
                )}
              >
                {booking.status}
              </Badge>

              {isToday(booking.bookingDate.toString()) && (
                <Badge className="bg-yellow-500 text-white">Today</Badge>
              )}
            </div>
          </div>

          {/* GRID */}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* LEFT SIDE */}

            <div className="lg:col-span-2 space-y-8">
              {/* CUSTOMER */}

              <Card className="shadow-xl border-0 rounded-2xl">
                <CardHeader>
                  <CardTitle>Customer</CardTitle>
                </CardHeader>

                <CardContent className="flex justify-between items-center">
                  <div className="flex gap-4 items-center">
                    <Avatar className="h-14 w-14 ring-2 ring-blue-200">
                      <AvatarImage src={booking.customer.avatar} />
                      <AvatarFallback>
                        {booking.customer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <p className="font-semibold text-lg">
                        {booking.customer.name}
                      </p>

                      <p className="text-gray-500">{booking.customer.phone}</p>
                    </div>
                  </div>

                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    className="text-blue-600 flex items-center gap-1"
                  >
                    Open Map
                    <ExternalLink size={14} />
                  </a>
                </CardContent>
              </Card>

              {/* MAP */}

              <Card className="shadow-xl border-0 rounded-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>

                <CardContent className="p-0">
                  <iframe
                    className="w-full h-[280px]"
                    src={`https://maps.google.com/maps?q=${booking.address.lat},${booking.address.lng}&z=15&output=embed`}
                  />
                </CardContent>
              </Card>

              {/* SERVICE */}

              <Card className="shadow-xl border-0 rounded-2xl">
                <CardHeader>
                  <CardTitle>Service Details</CardTitle>
                </CardHeader>

                <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
                  <p>
                    <span className="text-gray-400">Service</span>
                    <br />
                    {booking.service.name}
                  </p>

                  <p>
                    <span className="text-gray-400">Category</span>
                    <br />
                    {booking.service.category}
                  </p>

                  <p>
                    <span className="text-gray-400">Duration</span>
                    <br />
                    {booking.service.duration} mins
                  </p>

                  <p>
                    <span className="text-gray-400">Time Slot</span>
                    <br />
                    {booking.timeSlot}
                  </p>
                </CardContent>
              </Card>
              {booking.rating && (
                <Card className="shadow-xl border-0 rounded-2xl">
                  <CardHeader>
                    <CardTitle>Customer Rating</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Stars */}
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          className={cn(
                            i < booking.rating!.stars
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300",
                          )}
                        />
                      ))}
                    </div>

                    {/* Numeric */}
                    <p className="text-sm text-gray-500">
                      {booking.rating.stars} out of 5 
                    </p>

                    {/* Review */}
                    {booking.rating.review && (
                      <p className="text-gray-700 text-sm italic">
                        "{booking.rating.review}"
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* RIGHT SIDEBAR */}

            <div className="space-y-8">
              {/* WORKER */}

              <Card className="shadow-xl border-0 rounded-2xl">
                <CardHeader>
                  <CardTitle>Assigned Worker</CardTitle>
                </CardHeader>

                <CardContent className="space-y-2">
                  <p className="font-semibold">{booking.worker.name}</p>

                  <p className="text-gray-500">{booking.worker.phone}</p>

                  <p className="text-gray-500">{booking.worker.email}</p>
                </CardContent>
              </Card>

              {/* PAYMENT */}

              <Card className="shadow-xl border-0 rounded-2xl bg-gradient-to-br from-[#0B1F3A] to-[#132f52] text-white">
                <CardHeader>
                  <CardTitle>Payment Summary</CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="opacity-70">Advance</span>
                    <span>${booking.payment.advanceAmount.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="opacity-70">Remaining</span>
                    <span>${booking.payment.remainingAmount.toFixed(2)}</span>
                  </div>

                  <Separator className="bg-white/20" />

                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>${booking.payment.totalAmount.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
