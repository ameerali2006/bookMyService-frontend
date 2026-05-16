"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/admin/Navbar";
import { AdminBookingCard } from "@/components/admin/Bookings/BookingCard";

import { adminManagement } from "@/api/AdminManagement";
import { useDebounce } from "@/hook/useDebounce";

import type { AdminBooking } from "@/interface/admin/booking";
import type { BookingStatus } from "../worker/ApprovedServiceDetails";

const CATEGORIES: { value: string; label: string }[] = [
  { label: "Driver", value: "Driver" },
  { label: "Plumber", value: "Plumber" },
  { label: "Chef", value: "Chef" },
];

const LIMIT = 5;

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="p-4">
          {/* Mobile Skeleton */}
          <div className="flex flex-col gap-3 sm:hidden">
            <div className="flex items-start justify-between">
              <div className="h-10 w-24 animate-pulse rounded bg-muted" />
              <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-10 animate-pulse rounded bg-muted" />
              <div className="h-10 animate-pulse rounded bg-muted" />
            </div>
          </div>

          {/* Desktop Skeleton */}
          <div className="hidden animate-pulse gap-6 sm:grid sm:grid-cols-8">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="h-10 rounded bg-muted" />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

export default function AdminBookingsPage() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  // Filters
  const [status, setStatus] = useState<BookingStatus | "all">("all");
  const [service, setService] = useState<string>("all");

  // Pagination
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const fetchBookings = async () => {
    setLoading(true);

    try {
      const res = await adminManagement.getBookings({
        search: debouncedSearch || undefined,
        status: status === "all" ? undefined : status,
        service: service === "all" ? undefined : service,
        page,
        limit: LIMIT,
      });

      setBookings(res.data.bookings ?? []);
      setTotal(res.data.total ?? 0);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      setBookings([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when filters change
  useEffect(() => {
    fetchBookings();
  }, [debouncedSearch, status, service, page]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    sessionStorage.clear();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        activeItem="Bookings"
        onItemClick={() => {}}
        onLogout={handleLogout}
      />

      {/* Navbar */}
      <Navbar userName="Admin" onSearch={setSearch} />

      {/* Main Content */}
      <main className="ml-64 pt-16 p-6 min-h-screen bg-gray-50">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="text-2xl font-semibold">All Bookings</h2>

          {/* Filters */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customer or worker"
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                className="pl-9 w-full"
              />
            </div>

            {/* Work Category */}
            <div className="space-y-2">
              <Label htmlFor="service">Work Category</Label>
              <Select
                value={service}
                onValueChange={(value) => {
                  setPage(1);
                  setService(value);
                }}
              >
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue placeholder="Select work category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map((category) => (
                    <SelectItem
                      key={category.value}
                      value={category.value}
                    >
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(value) => {
                  setPage(1);
                  setStatus(value as BookingStatus | "all");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSkeleton />
        ) : bookings.length === 0 ? (
          <EmptyState
            title="No bookings found"
            description="Try adjusting your filters or search terms."
          />
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <AdminBookingCard
                key={booking.id }
                booking={booking}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && total > 0 && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((prev) => prev - 1)}
              >
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}