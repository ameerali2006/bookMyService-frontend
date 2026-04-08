"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Star, Search } from "lucide-react";
import { format } from "date-fns";
import { adminManagement } from "@/api/AdminManagement";
import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/admin/Navbar";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/hook/useDebounce";

interface IReview {
  _id: string;
  bookingId: string;
  workerName?: string;
  userName?: string;
  rating: number;
  comment: string;
  isVisible?: boolean;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Filters
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [sort, setSort] = useState("latest");

  // 🔥 Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / limit);

  // 🔥 Fetch
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await adminManagement.getReviews({
        search: debouncedSearch,
        sort,
        page,
        limit,
      });
      console.log(response.data)

      setReviews(response.data.reviews);
      setTotal(response.data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [debouncedSearch, sort, page]);

  // ⭐ Stars
  const renderStars = (rating: number) => (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={16}
          className={
            i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }
        />
      ))}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background pt-10">
      <Sidebar
        activeItem="Reviews"
        onItemClick={() => {}}
        onLogout={() => {
          localStorage.removeItem("adminToken");
          sessionStorage.clear();
          navigate("/admin/login");
        }}
      />

      <div className="flex-1 ml-64">
        <Navbar userName="Admin" onSearch={() => {}} />

        <div className="p-6 space-y-6">
          {/* Header */}
          <h1 className="text-2xl font-bold">Reviews</h1>

          {/* 🔥 Toolbar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border shadow-sm">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                className="pl-8 w-full sm:w-72"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-3">
              <select
                className="border rounded-md px-3 py-2 text-sm"
                value={sort}
                onChange={(e) => {
                  setPage(1);
                  setSort(e.target.value);
                }}
              >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
                <option value="rating_high">Rating High → Low</option>
                <option value="rating_low">Rating Low → High</option>
              </select>

              {/* Reset */}
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setSort("latest");
                  setPage(1);
                }}
              >
                Reset
              </Button>
            </div>
          </div>

          {/* 🔹 TABLE */}
          <div className="bg-white rounded-xl border shadow">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50 text-left">
                <tr>
                  <th className="p-4">Review</th>
                  <th className="p-4">Worker</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : reviews.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-500">
                      No reviews found
                    </td>
                  </tr>
                ) : (
                  reviews.map((r) => (
                    <tr key={r._id} className="border-b hover:bg-gray-50" onClick={()=>navigate(`/admin/bookings/${r.bookingId}`)}>
                      <td className="p-4">
                        <p>{r.comment}</p>
                        <span className="text-xs text-gray-500">
                          by {r.userName}
                        </span>
                      </td>

                      <td className="p-4">{r.workerName}</td>

                      <td className="p-4">{renderStars(r.rating)}</td>

                      <td className="p-4">
                        {format(new Date(r.createdAt), "dd MMM yyyy")}
                      </td>

                      <td className="p-4">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            r.isVisible
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-500"
                          }`}
                        >
                          {r.isVisible ? "Visible" : "Hidden"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 🔥 Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}