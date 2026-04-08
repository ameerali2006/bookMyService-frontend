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

      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Service Requests
          </h1>
          <p className="text-muted-foreground mb-6">
            Manage all service requests assigned to you
          </p>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2 col-span-2">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by service, customer, or location..."
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                className="flex-1 bg-transparent outline-none text-foreground placeholder-muted-foreground"
              />
            </div>

            {/* Date Filter */}
            <input
              type="date"
              className="border border-border rounded-lg px-3 py-2 bg-card"
              value={date}
              onChange={(e) => {
                setPage(1);
                setDate(e.target.value);
              }}
            />
          </div>

          {/* Loader */}
          {loading && (
            <div className="text-center py-20 text-muted-foreground">
              Loading...
            </div>
          )}

          {/* Cards Grid */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {requests.map((request) => (
                <Card
                  key={request.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedRequest(request)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {request.serviceName}
                        </CardTitle>
                        <CardDescription>{request.userName}</CardDescription>
                      </div>

                      <Badge
                        className={`${getStatusColor(request.status)} border`}
                      >
                        {request.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {request.date}
                      </span>
                      <span className="font-medium">{request.time}</span>
                    </div>

                    <div className="text-sm mt-1 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">{request.location}</span>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full mt-4"
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
            <div className="text-center py-20 text-muted-foreground">
              No requests found.
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
