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

      render: (value) => (value as Worker["category"])?.category || "N/A",
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
          {value as string}
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
    <div className="min-h-screen bg-slate-50 pt-14">
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
      <main className="lg:ml-64 pt-24 p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Worker Verification</h1>
            <p className="text-slate-500 text-sm mt-0.5">Verify and review registration documents of new service workers</p>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <DataTable
              columns={columns}
              data={workers.slice(
                (currentPage - 1) * pageSize,
                currentPage * pageSize
              )}
              loading={loading}
            />
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
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
                <span className="text-xs font-semibold text-slate-500">
                  Showing {range[0]} to {range[1]} of {t} workers
                </span>
              )}
            />
          </div>

          {/* Details Modal */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-2xl rounded-3xl p-6 bg-white">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-slate-800">Worker Verification Details</DialogTitle>
              </DialogHeader>

              {selectedWorker && (
                <div className="space-y-6 mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <p className="text-slate-600">
                      <span className="font-bold text-slate-800 mr-1.5">Name:</span>
                      {selectedWorker.name}
                    </p>
                    <p className="text-slate-600">
                      <span className="font-bold text-slate-800 mr-1.5">Email:</span>
                      {selectedWorker.email}
                    </p>
                    <p className="text-slate-600">
                      <span className="font-bold text-slate-800 mr-1.5">Phone:</span>
                      {selectedWorker.phone}
                    </p>
                    <p className="text-slate-600">
                      <span className="font-bold text-slate-800 mr-1.5">Category:</span>
                      {selectedWorker.category.category}
                    </p>
                    <p className="text-slate-600">
                      <span className="font-bold text-slate-800 mr-1.5">Experience:</span>
                      {selectedWorker.experience} years
                    </p>
                    <p className="text-slate-600">
                      <span className="font-bold text-slate-800 mr-1.5">Status:</span>
                      <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-xs bg-amber-50 text-amber-700 border border-amber-100">
                        {selectedWorker.isVerified}
                      </span>
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-3">Verification Documents</h3>
                    <div className="max-w-md">
                      {selectedWorker.documents ? (
                        <img
                          src={selectedWorker.documents}
                          alt={`document-${selectedWorker._id}`}
                          className="rounded-2xl border border-slate-200 shadow-sm w-full object-cover max-h-64"
                        />
                      ) : (
                        <p className="text-sm text-slate-400 italic">No document image uploaded.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter className="mt-6 flex gap-3">
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  className="rounded-xl font-bold cursor-pointer h-10 px-5"
                >
                  Reject Verification
                </Button>
                <Button
                  variant="default"
                  onClick={handleApprove}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer h-10 px-5 shadow-md shadow-blue-100"
                >
                  Approve Verification
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}
