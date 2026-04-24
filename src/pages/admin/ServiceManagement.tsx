"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import Navbar from "@/components/admin/Navbar";
import Sidebar from "@/components/admin/Sidebar";
import { adminManagement } from "@/api/AdminManagement";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ErrorToast, SuccessToast, WarningToast } from "@/components/shared/Toaster";
import CreateServiceModal from "@/components/admin/Service/AddServiceModal";
import { useDebounce } from "@/hook/useDebounce";

// ✅ Match backend fields
interface Service {
  _id: string;
  category: string;
  description: string;
  price: number;
  priceUnit: "per hour" | "per job" | "per item";
  duration: number;
  image: string;
  status: "active" | "inactive";
  createdAt: string;
}

export default function ServiceManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [uploading, setUploading] = useState(false);
  // Modal states
  const [open, setOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 500)
  const [formData, setFormData] = useState<{
    category: string;
    description: string;
    price: number;
    priceUnit: "per job" | "per hour" | "per item";
    duration: number;
    image: string;
  }>({
    category: "",
    description: "",
    price: 0,
    priceUnit: "per job",
    duration: 0,
    image: "",
  });

  useEffect(() => {
    fetchServices();
  }, [search, sort, page]);

  const fetchServices = async () => {
    try {
      const limit = 6;
      const { data } = await adminManagement.getAllSerivces(
        debouncedSearch,
        sort,
        page,
        limit
      );
      setServices(data.services);
      setTotalPages(data.totalPages);
      setTotal(data.totalItems);
    } catch (error) {
      console.error("Failed to fetch services:", error);
    }
  };

  const toggleBlock = async (id: string, status: "active" | "inactive") => {
    try {
      const newStatus=status === "active" ? "inactive" : "active";
      const res= await adminManagement.updateServiceStatus(id, newStatus);
      if(res.data.success){
        setServices((prev) =>
        prev.map((s) =>
            s._id === id
              ? { ...s, status: res.data.status }
              : s
          )
        )
        SuccessToast("Status updated successfully")
      
      }
      
    } catch (err) {
      ErrorToast
      console.error("Failed to toggle status", err);
    }
  };

  const handleCreate = async (data:{
    category: string;
    description: string;
    price: number;
    priceUnit: "per job" | "per hour" | "per item";
    duration: number;
    image: string;
  }) => {
    try {
      console.log(data)
      const res=await adminManagement.createService(data)
      console.log(res)
      setOpen(false);
      setFormData({
        category: "",
        description: "",
        price: 0,
        priceUnit: "per job",
        duration: 0,
        image: "",
      });
      WarningToast(res.data.message)
      fetchServices();
    } catch (err) {
      console.error("Failed to create service:", err);
    }
  };
  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    setUploading(true);

    const { data: { signature, timestamp, apiKey, cloudName } } =
      await adminManagement.getCloudinarySignature("worker-documents");

    const formDataCloud = new FormData();
    formDataCloud.append("file", file);
    formDataCloud.append("api_key", apiKey);
    formDataCloud.append("timestamp", timestamp);
    formDataCloud.append("signature", signature);
    formDataCloud.append("folder", "worker-documents");
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formDataCloud }
    );
    

    const uploaded = await res.json();
    console.log(uploaded)
    setFormData((prev) => ({ ...prev, image: uploaded.url }));
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    ErrorToast("Image upload failed, please try again.");
  } finally {
    setUploading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        activeItem="ServiceManagement"
        onItemClick={() => {}}
        onLogout={() => {}}
      />
      <Navbar userName="Admin" onSearch={setSearch} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="ml-64 pt-16 p-6">
          <div className="p-6 space-y-6">
            {/* Top Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                <Input
                  placeholder="Search services..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="max-w-sm"
                />

                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">Latest</SelectItem>
                    <SelectItem value="lowPrice">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="highPrice">
                      Price: High to Low
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* ✅ Create Service Modal */}
              <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus size={16} /> Create Service
                </Button>
              </DialogTrigger>

              <CreateServiceModal
                open={open}
                setOpen={setOpen}
                onCreate={handleCreate}
              />
            </Dialog>
            </div>

            {/* Service Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card
                  key={service._id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-center mt-4">
                    <img
                      src={service.image}
                      alt="logo"
                      className="w-20 h-20 object-contain rounded-full border shadow"
                    />
                  </div>

                  <CardHeader>
                    <CardTitle>{service.category}</CardTitle>
                    <p className="text-sm text-gray-500">
                      Created:{" "}
                      {new Date(service.createdAt).toLocaleDateString()}
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <p className="text-gray-600 line-clamp-2">
                      {service.description}
                    </p>
                    <p className="font-semibold">
                      ₹{service.price}{" "}
                      <span className="text-sm text-gray-500">
                        ({service.priceUnit})
                      </span>
                    </p>
                    <p className="text-xs text-gray-400">
                      Duration: {service.duration} mins
                    </p>
                    <Button
                      onClick={() => toggleBlock(service._id, service.status)}
                      variant={
                        service.status === "inactive"
                          ? "destructive"
                          : "default"
                      }
                      className="w-full"
                    >
                      {service.status === "inactive"
                        ? "Activate"
                        : "Deactivate"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center">
              <Pagination
                current={page}
                pageSize={6}
                onChange={setPage}
                total={total}
                pageSizeOptions={[6, 8, 10, 12]}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
