import React, { useEffect, useState, useCallback } from "react";
import { WorkerLayout } from "@/components/worker/Dashboard/WorkerLayout";
import { Navbar } from "@/components/worker/Dashboard/WorkerNavbar";
import { workerService } from "@/api/WorkerService";
import {
  DollarSign,
  Calendar,
  Briefcase,
  TrendingUp,
  Search,
  Download,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";

interface BookingItem {
  bookingId: string;
  customerName: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  totalAmount: number;
  workerEarnings: number;
  paymentStatus: string;
}

interface SummaryStats {
  lifetimeEarnings: number;
  todayEarnings: number;
  thisWeekEarnings: number;
  thisMonthEarnings: number;
  totalCompletedJobs: number;
  averageEarnings: number;
}

export default function WorkerRevenuePage() {
  const [stats, setStats] = useState<SummaryStats>({
    lifetimeEarnings: 0,
    todayEarnings: 0,
    thisWeekEarnings: 0,
    thisMonthEarnings: 0,
    totalCompletedJobs: 0,
    averageEarnings: 0,
  });

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [datePreset, setDatePreset] = useState<string>("lifetime");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Fetch summary stats
  const fetchSummary = async () => {
    try {
      const res = await workerService.getEarningsSummary();
      if (res.data && res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch earnings summary stats:", err);
    }
  };

  // Build query arguments based on filters
  const getQueryFilters = useCallback(() => {
    let from = "";
    let to = "";
    const now = new Date();

    if (datePreset === "today") {
      from = startOfDay(now).toISOString();
      to = endOfDay(now).toISOString();
    } else if (datePreset === "week") {
      from = startOfWeek(now, { weekStartsOn: 1 }).toISOString();
      to = endOfWeek(now, { weekStartsOn: 1 }).toISOString();
    } else if (datePreset === "month") {
      from = startOfMonth(now).toISOString();
      to = endOfMonth(now).toISOString();
    } else if (datePreset === "year") {
      from = startOfYear(now).toISOString();
      to = endOfYear(now).toISOString();
    } else if (datePreset === "custom") {
      if (startDate) from = new Date(startDate).toISOString();
      if (endDate) to = new Date(endDate).toISOString();
    }

    return { from, to };
  }, [datePreset, startDate, endDate]);

  // Fetch paginated bookings list
  const fetchBookingsList = useCallback(async () => {
    setLoading(true);
    try {
      const { from, to } = getQueryFilters();
      const res = await workerService.getEarningsList({
        page,
        limit,
        search,
        from: from || undefined,
        to: to || undefined,
      });

      if (res.data && res.data.success) {
        setBookings(res.data.data.bookings);
        setTotal(res.data.data.total);
      }
    } catch (err) {
      console.error("Failed to fetch bookings list:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, getQueryFilters]);

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchBookingsList();
  }, [fetchBookingsList]);

  // Clear all filters
  const handleClearFilters = () => {
    setSearch("");
    setDatePreset("lifetime");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  // Export PDF
  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const { from, to } = getQueryFilters();
      const res = await workerService.exportEarningsPdf({
        search: search || undefined,
        from: from || undefined,
        to: to || undefined,
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Earnings_Report_${new Date().toISOString().split("T")[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export PDF:", err);
    } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <WorkerLayout>
      <Navbar />
      <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Revenue & Earnings
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track your daily, weekly, monthly, and lifetime platform payouts dynamically.
            </p>
          </div>
          <button
            onClick={handleExportPdf}
            disabled={exporting || bookings.length === 0}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition shadow-sm disabled:opacity-50"
          >
            {exporting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Export Report PDF
          </button>
        </div>

        {/* Analytics Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Card 1: Lifetime */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5 rounded-2xl shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-blue-100 uppercase tracking-wider">
                Lifetime Earnings
              </span>
              <div className="p-2 bg-blue-400/25 rounded-lg">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold">₹{stats.lifetimeEarnings.toFixed(2)}</h2>
              <p className="text-blue-100 text-xs mt-1">All-time earnings net split</p>
            </div>
          </div>

          {/* Card 2: Today */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Today's Earnings
              </span>
              <div className="p-2 bg-emerald-50 rounded-lg">
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                ₹{stats.todayEarnings.toFixed(2)}
              </h2>
              <p className="text-slate-400 text-xs mt-1">Earned so far today</p>
            </div>
          </div>

          {/* Card 3: Week */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                This Week
              </span>
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Calendar className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                ₹{stats.thisWeekEarnings.toFixed(2)}
              </h2>
              <p className="text-slate-400 text-xs mt-1">Current week total</p>
            </div>
          </div>

          {/* Card 4: Month */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                This Month
              </span>
              <div className="p-2 bg-purple-50 rounded-lg">
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                ₹{stats.thisMonthEarnings.toFixed(2)}
              </h2>
              <p className="text-slate-400 text-xs mt-1">Current month total</p>
            </div>
          </div>

          {/* Card 5: Jobs Completed */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Completed Jobs
              </span>
              <div className="p-2 bg-amber-50 rounded-lg">
                <Briefcase className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{stats.totalCompletedJobs}</h2>
              <p className="text-slate-400 text-xs mt-1">Jobs completed successfully</p>
            </div>
          </div>

          {/* Card 6: Average */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Avg Earnings
              </span>
              <div className="p-2 bg-sky-50 rounded-lg">
                <TrendingUp className="w-4 h-4 text-sky-600" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
               ₹{stats.averageEarnings.toFixed(2)}
              </h2>
              <p className="text-slate-400 text-xs mt-1">Average payout per job</p>
            </div>
          </div>
        </div>

        {/* Filter Controls Panel */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-end lg:items-center justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 w-full lg:w-auto flex-1">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search customer, service..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              {/* Date Presets Dropdown */}
              <div>
                <select
                  value={datePreset}
                  onChange={(e) => {
                    setDatePreset(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                >
                  <option value="lifetime">Lifetime</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {/* Custom Datepicker inputs */}
              {datePreset === "custom" && (
                <>
                  <div>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setPage(1);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setPage(1);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Clear filters Button */}
            <div className="flex gap-2">
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-2 border border-slate-200 text-slate-600 font-medium px-4 py-2.5 rounded-xl text-sm hover:bg-slate-50 transition"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Bookings Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-lg">Earnings Breakdown</h3>
            <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-semibold">
              {total} Completed Bookings
            </span>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              /* Loading Skeletons */
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="h-6 bg-slate-200 rounded flex-1" />
                    <div className="h-6 bg-slate-200 rounded flex-1" />
                    <div className="h-6 bg-slate-200 rounded flex-1" />
                    <div className="h-6 bg-slate-200 rounded flex-1" />
                  </div>
                ))}
              </div>
            ) : bookings.length === 0 ? (
              /* Empty State */
              <div className="p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto space-y-4">
                <div className="p-4 bg-slate-50 rounded-full text-slate-400">
                  <Info className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-base">No Completed Payouts</h4>
                  <p className="text-slate-400 text-xs mt-1">
                    No completed bookings or successful payments match your current query. Try adjusting the search filters or date preset.
                  </p>
                </div>
              </div>
            ) : (
              /* Data Table */
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                    <th className="py-4 px-6">Booking Details</th>
                    <th className="py-4 px-6">Service Type</th>
                    <th className="py-4 px-6">Customer</th>
                    <th className="py-4 px-6">Work Duration</th>
                    <th className="py-4 px-6 text-right">Gross Total</th>
                    <th className="py-4 px-6 text-right text-blue-600">Net Earnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-600 font-medium">
                  {bookings.map((item) => (
                    <tr key={item.bookingId} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-800">
                          #{item.bookingId.slice(-6).toUpperCase()}
                        </div>
                        <div className="text-slate-400 text-xs mt-0.5">
                          {new Date(item.date).toLocaleDateString()} @ {item.startTime}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-800">{item.serviceName}</td>
                      <td className="py-4 px-6">{item.customerName}</td>
                      <td className="py-4 px-6 text-slate-500">{item.duration}</td>
                      <td className="py-4 px-6 text-right text-slate-400">
                        ₹{item.totalAmount.toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-right font-extrabold text-blue-600">
                        ₹{item.workerEarnings.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Table Pagination */}
          {!loading && bookings.length > 0 && (
            <div className="p-5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center justify-center p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition disabled:opacity-50 disabled:hover:bg-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center justify-center p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition disabled:opacity-50 disabled:hover:bg-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </WorkerLayout>
  );
}
