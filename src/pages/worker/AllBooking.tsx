"use client";

import { useState, useCallback, useMemo, useEffect } from "react";

import { Pagination } from "@/components/ui/Pagination";
import { BookingsTable } from "@/components/worker/AllBooking/BookingTable";
import { BookingsFilter } from "@/components/worker/AllBooking/BookingFilter";
import { WorkerLayout } from "@/components/worker/Dashboard/WorkerLayout";
import { Navbar } from "@/components/worker/Dashboard/WorkerNavbar";
import { workerService } from "@/api/WorkerService";
import { useNavigate } from "react-router-dom";
export type WorkerResponse = "accepted" | "rejected" | "pending";
export interface Booking {
  id: string;
  userId: string;
  userName: string;
  serviceName: string;
  date: string;
  time: string;
  address: string;
  status:
    | "confirmed"
    | "in-progress"
    | "awaiting-final-payment"
    | "completed"
    | "cancelled";
  workerResponse: WorkerResponse;
}

export default function AllBookingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [workerResponses, setWorkerResponses] = useState<WorkerResponse[]>([]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      const res = await workerService.allBookings({
        page,
        limit,
        search: searchQuery,
        statuses: selectedStatuses,
        workerResponses,
        from: dateRange.from,
        to: dateRange.to,
      });
      

      setBookings(res.data.data.bookings);
      setTotal(res.data.data.total);
      setLoading(false);
    };

    loadBookings();
  }, [page, limit, searchQuery, selectedStatuses, dateRange, workerResponses]);

  {
    loading ? (
      <WorkerLayout>
        <Navbar />
        <div className="py-12 text-center">Loading...</div>
      </WorkerLayout>
    ) : bookings.length > 0 ? (
      <BookingsTable bookings={bookings} onViewDetails={() => {}} />
    ) : (
      <WorkerLayout>
        <Navbar />
        <div className="py-12 text-center text-muted-foreground">
          No bookings found
        </div>
      </WorkerLayout>
    );
  }

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedStatuses([]);
    setWorkerResponses([]);
    setDateRange({});
    setPage(1);
  }, []);

  const handlePageChange = (newPage: number, newPageSize?: number) => {
    setPage(newPage);
    if (newPageSize) {
      setLimit(newPageSize);
      setPage(1);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasActiveFilters =
    searchQuery ||
    selectedStatuses.length > 0 ||
    workerResponses.length > 0 ||
    dateRange.from ||
    dateRange.to;

  return (
    <WorkerLayout>
      <Navbar />
      <div className="min-h-screen bg-gray-300">
        <div className="flex flex-col">
          {/* Header */}
          <div className="border-b border-border px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold">My Bookings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              View and manage your assigned bookings
            </p>
          </div>

          <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8 space-y-6">
            {/* Filters */}
            <div className="sticky top-0 z-10 rounded-lg border bg-background/95 backdrop-blur">
              <BookingsFilter
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedStatuses={selectedStatuses}
                onStatusChange={setSelectedStatuses}
                selectedWorkerResponses={workerResponses}
                onWorkerResponseChange={setWorkerResponses}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                onClearFilters={handleClearFilters}
                hasActiveFilters={Boolean(hasActiveFilters)}
              />
            </div>

            {/* Table */}
            <div className="rounded-lg border">
              {total > 0 ? (
                <BookingsTable
                  bookings={bookings}
                  onViewDetails={(id: string) =>
                    navigate(`/worker/appointments/approved/${id}`)
                  }
                />
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  No bookings found
                </div>
              )}
            </div>
            {/* 🔼 Pagination on TOP */}
            {total > 0 && (
              <Pagination
                current={page}
                total={total}
                pageSize={limit}
                onChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>
    </WorkerLayout>
  );
}
