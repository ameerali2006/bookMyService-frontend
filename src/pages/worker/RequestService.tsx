"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Clock } from "lucide-react";
import RequestDetailsModal from "@/components/worker/RequestService/DetailsModal";
import { Navbar } from "@/components/worker/Dashboard/WorkerNavbar";
import { WorkerLayout } from "@/components/worker/Dashboard/WorkerLayout";
import { ErrorToast } from "@/components/shared/Toaster";
import { workerService } from "@/api/WorkerService";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";


interface ServiceRequest {
  id: string;
  serviceName: string;
  userName: string;
  date: string;
  time: string;
  availableTime:string;
  location: string;
  status: "pending" | "approved" | "rejected";
  userLocation: { lat: number; lng: number };
  notes: string;
  phone: string;
}

export default function WorkerRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [selectedRequest, setSelectedRequest] =
    useState<ServiceRequest | null>(null);

  const [search, setSearch] = useState("");
  const [status] = useState<"pending" | "approved" | "rejected">("pending");
  const [date, setDate] = useState("");

  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [total, setTotal] = useState(0);

  // -------------------------------
  // 👉 Fetch requests from backend
  // -------------------------------
  const fetchRequests = async () => {
    try {
      setLoading(true);

      const response = await workerService.serviceRequest({
        search,
        status,
        date,
        page,
        limit: pageSize,
      });
      console.log(response)

      if (response.data.success) {
        setRequests(response.data.data.data);
        setTotal(response.data.data.total);
      } else {
        ErrorToast(response.data.message);
      }
    } catch (err) {
      ErrorToast("Failed to load service requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [search, status, date, page, pageSize,selectedRequest]); 

  const getStatusColor = (status: ServiceRequest["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "approved":
        return "bg-green-100 text-green-800 border-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <WorkerLayout>
      <Navbar />

      <div className="min-h-screen bg-slate-50/50 pt-24 pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
            Service Requests
          </h1>
          <p className="text-slate-500 text-sm mb-6">
            Manage all service requests assigned to you
          </p>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            {/* Search Bar */}
            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-2 col-span-2 bg-slate-50 focus-within:bg-white focus-within:border-blue-500 transition-all">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by service, customer, or location..."
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                className="flex-1 bg-transparent outline-none text-slate-800 placeholder-slate-400 text-sm"
              />
            </div>

            {/* Date Filter */}
            <input
              type="date"
              className="border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 text-sm focus:bg-white focus:border-blue-500 transition-all outline-none"
              value={date}
              onChange={(e) => {
                setPage(1);
                setDate(e.target.value);
              }}
            />
          </div>

          {/* Loader */}
          {loading && (
            <div className="text-center py-20 text-slate-400 font-semibold">
              Loading requests...
            </div>
          )}

          {/* Cards Grid */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map((request) => (
                <Card
                  key={request.id}
                  className="rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedRequest(request)}
                >
                  <CardHeader className="p-6 pb-4">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <CardTitle className="text-base font-bold text-slate-800 leading-snug">
                          {request.serviceName}
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-400 font-medium mt-1">
                          Client: {request.userName}
                        </CardDescription>
                      </div>

                      <Badge
                        className={cn(
                          "rounded-full font-bold text-[10px] px-2.5 py-0.5 border shrink-0",
                          request.status === "approved"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : request.status === "pending"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        )}
                      >
                        {request.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="px-6 pb-6">
                    <div className="text-xs flex items-center gap-2 text-slate-500 font-medium">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{request.date}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      <span>{request.time}</span>
                    </div>

                    <div className="text-xs mt-2.5 flex items-center gap-2 text-slate-500 font-medium">
                      <MapPin className="w-4 h-4 text-rose-500" />
                      <span className="truncate">{request.location}</span>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full mt-5 rounded-xl border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRequest(request);
                      }}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && requests.length === 0 && (
            <div className="text-center py-20 text-slate-400 font-medium italic">
              No requests assigned to you yet.
            </div>
          )}

          {/* Pagination Component */}
          <div className="mt-6">
            <Pagination
              current={page}
              total={total}
              pageSize={pageSize}
              onChange={(newPage, newSize) => {
                if (newSize && newSize !== pageSize) {
                  setPageSize(newSize);
                  setPage(1);
                } else {
                  setPage(newPage);
                }
              }}
              showSizeChanger={true}
              showQuickJumper={true}
              showTotal={(total, range) => (
                <span>
                  Showing {range[0]} to {range[1]} of {total} requests
                </span>
              )}
            />
          </div>
        </div>

        {/* Modal */}
        {selectedRequest && (
          <RequestDetailsModal
            request={selectedRequest}
            onClose={() => setSelectedRequest(null)}
          />
        )}
      </div>
    </WorkerLayout>
  );
}
