"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pagination } from "@/components/ui/Pagination";
import { Table } from "@/components/ui/Table";

import Navbar from "@/components/admin/Navbar";
import Sidebar from "@/components/admin/Sidebar";
import { useNavigate } from "react-router-dom";
import { adminManagement } from "@/api/AdminManagement";
import { ErrorToast, SuccessToast } from "@/components/shared/Toaster";
import { DataTable, type TableColumn } from "@/components/shared/DataTable";

interface Worker {
  _id: string;
  name: string;
  email: string;
  phone: string;
  category: { category: string; _id: string };
  experience: string;
  isVerified: "pending" | "approved" | "rejected";
  documents?: string;
}

export default function WorkerManagement() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // ✅ Fetch workers (replace with API call)
  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, open]);

  const fetchData = async () => {
    try {
      console.log("fetch data of unverified workers");
      setLoading(true);
      const response = await adminManagement.getUnverifiedWorkers(
        currentPage,
        pageSize
      );
      console.log(response);

      // backend returns { success, workers, total, currentPage, totalPages }
      const { workers, total } = response.data;
      setCurrentPage(currentPage);
      setWorkers(workers);
      setTotal(total);
    } catch (error) {
      console.error("Failed to fetch workers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDetails = (record: Worker) => {
    setSelectedWorker(record);
    setOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedWorker) return;
    try {
      console.log(selectedWorker);
      const response = await adminManagement.verifyWorker(
        selectedWorker._id,
        "approved"
      );
      if (response.data.success) {
        setWorkers((prev) =>
          prev.map((w) => (w._id ? { ...w, status: response.data.status } : w))
        );

        SuccessToast("verified successfully");
        setOpen(false);
      } else {
        ErrorToast("verification is Failed, " + response.data.message);
      }
    } catch (err) {
      console.error(err);
      ErrorToast("verification is Failed");
    }
  };

  const handleReject = async () => {
    if (!selectedWorker) return;
    try {
      const response = await adminManagement.verifyWorker(
        selectedWorker._id,
        "rejected"
      );
      if (response.data.success) {
        setWorkers((prev) =>
          prev.map((w) =>
            w._id === selectedWorker._id
              ? { ...w, status: response.data.status }
              : w
          )
        );
        SuccessToast("verified successfully,");
        setOpen(false);
      } else {
        ErrorToast("verification is Failed, " + response.data.message);
      }
    } catch (err) {
      console.error(err);
      ErrorToast("verification is Failed");
    }
  };

  const columns: TableColumn<Worker>[] = [
    { key: "name", title: "Name", sortable: true },
    { key: "email", title: "Email" },
    { key: "phone", title: "Phone" },
    {
      key: "category",
      title: "Category",

      render: (value) => value?.category || "N/A",
    },
    { key: "experience", title: "Experience" },
    {
      key: "isVerified",
      title: "Status",

      render: (value) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            value === "pending"
              ? "bg-yellow-100 text-yellow-700"
              : value === "approved"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Actions",

      render: (_, record) => (
        <Button size="sm" onClick={() => handleDetails(record)}>
          Details
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        activeItem="WorkerManagement"
        onItemClick={() => {}}
        onLogout={() => {
          localStorage.removeItem("adminToken");
          sessionStorage.clear();
          navigate("/admin/login");
        }}
      />
      <Navbar userName="Admin" onSearch={setSearchTerm} />
      <main className="ml-64 pt-16 p-6">
        <h1 className="text-xl font-bold mb-4">Worker Verification</h1>

        {/* Reusable Table */}
        <DataTable
          columns={columns}
          data={workers.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize
          )}
          loading={loading}
        />

        {/* Pagination */}
        <div className="mt-4 flex justify-end">
          <Pagination
            current={currentPage}
            total={total}
            pageSize={pageSize}
            onChange={(page, newSize) => {
              setCurrentPage(page);
              if (newSize) setPageSize(newSize);
            }}
            showSizeChanger
            showQuickJumper
            showTotal={(t, range) => (
              <span>
                Showing {range[0]} to {range[1]} of {t} workers
              </span>
            )}
          />
        </div>

        {/* Details Modal */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Worker Details</DialogTitle>
            </DialogHeader>

            {selectedWorker && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <p>
                    <span className="font-semibold">Name:</span>{" "}
                    {selectedWorker.name}
                  </p>
                  <p>
                    <span className="font-semibold">Email:</span>{" "}
                    {selectedWorker.email}
                  </p>
                  <p>
                    <span className="font-semibold">Phone:</span>{" "}
                    {selectedWorker.phone}
                  </p>
                  <p>
                    <span className="font-semibold">Category:</span>{" "}
                    {selectedWorker.category.category}
                  </p>
                  <p>
                    <span className="font-semibold">Experience:</span>{" "}
                    {selectedWorker.experience}
                  </p>
                  <p>
                    <span className="font-semibold">Status:</span>{" "}
                    {selectedWorker.isVerified}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Documents</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedWorker.documents && (
                      <img
                        src={selectedWorker.documents}
                        alt={`document-${selectedWorker._id}`}
                        className="rounded-lg border shadow-sm"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="destructive" onClick={handleReject}>
                Reject
              </Button>
              <Button variant="default" onClick={handleApprove}>
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
