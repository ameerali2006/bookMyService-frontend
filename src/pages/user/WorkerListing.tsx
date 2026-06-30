"use client";

import { useEffect, useState } from "react";
import { Search, Star, Filter, ChevronDown, MapPin } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pagination } from "@/components/ui/Pagination";
import { WorkerProfileModal } from "@/components/user/ServiceListing/WorkerModal";
import Header from "@/components/user/shared/Header";
import { useNavigate, useParams } from "react-router-dom";
import { userService } from "@/api/UserService";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

interface Worker {
  _id: string;
  name: string;
  experience: string;
  description: string;
  skills: string[];
  fees: number;
  profileImage: string;
  zone: string;
  distance: number;

  avgRating: number;
  totalReviews: number;
  recentReviews?: Review[];
}

interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  userName: string;
}
type SortOption = "rating" | "experience" | "price";

export default function WorkerListingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("rating");
  const [currentPage, setCurrentPage] = useState(1);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [totalWorkers, setTotalWorkers] = useState(0);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const workersPerPage = 6;
  const [loading, setLoading] = useState(false);
  const param = useParams();
  const location = useSelector(
    (state: RootState) => state.userTokenSlice.location,
  );
  const navigate = useNavigate();

  // Fetch workers from backend
  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const serviceId = param.id;

      if (!location?.lat || !location?.lng) {
        console.warn("User location not available");
        setWorkers([]);
        setTotalWorkers(0);
        return;
      }

      const response = await userService.getWorkersNearBy(
        searchTerm,
        sortBy,
        currentPage,
        workersPerPage,
        serviceId as string,
        location?.lat,
        location.lng,
      );
      console.log(response);
      const data = response.data;
      if (data?.success) {
        setWorkers(data.workers);
        setTotalWorkers(data.totalCount);
      } else {
        setWorkers([]);
        setTotalWorkers(0);
      }
    } catch (err) {
      console.error("Error fetching workers:", err);
      setWorkers([]);
      setTotalWorkers(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [searchTerm, sortBy, currentPage]);

  const handleWorkerClick = async (worker: Worker) => {
    setIsModalOpen(true);

    try {
      const res = await userService.getWorkerProfile(worker._id);
        console.log(res.data)
      if (res.data.success) {
        setSelectedWorker({...res.data.data,distance:worker.distance});
      }
    } catch (error) {
      console.error("Failed to fetch worker profile", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 h-4.5 w-4.5" />
            <Input
              placeholder="Search workers by name, role, or skills..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // reset page when search changes
              }}
              className="pl-11 h-12 rounded-2xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 text-sm bg-slate-50/50 focus:bg-white transition-all duration-300"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="min-w-[150px] h-12 bg-white hover:bg-slate-50 border-slate-200 rounded-2xl transition cursor-pointer text-slate-700 text-sm font-semibold"
              >
                <Filter className="h-4 w-4 mr-2" />
                Sort by {sortBy}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-2xl border border-slate-100 shadow-xl p-1.5 bg-white z-50">
              <DropdownMenuItem onClick={() => setSortBy("rating")} className="rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition cursor-pointer">
                Highest Rating
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("experience")} className="rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition cursor-pointer">
                Most Experience
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("price")} className="rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition cursor-pointer">
                Lowest Price
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Results Count */}
        <div className="mb-6 px-1">
          {loading ? (
            <p className="text-slate-400 text-sm">Loading workers...</p>
          ) : (
            <p className="text-slate-500 text-sm font-medium">
              Showing {workers.length} of {totalWorkers} workers
            </p>
          )}
        </div>

        {/* Worker Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {workers.map((worker) => (
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ duration: 0.3 }}
              key={worker._id}
            >
              <Card
                className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => handleWorkerClick(worker)}
              >
                <CardContent className="p-6">
                  {/* Avatar + Name */}
                  <div className="flex items-center gap-4 mb-5">
                    <Avatar className="h-16 w-16 ring-4 ring-blue-50 group-hover:ring-blue-100 transition duration-300">
                      <AvatarImage
                        src={
                          worker.profileImage ||
                          "https://i.pinimg.com/236x/05/78/16/05781612d2cbadf5e423cd0cef59b4f1.jpg"
                        }
                      />
                      <AvatarFallback className="bg-blue-600 text-white font-bold">
                        {worker.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-300">
                        {worker.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {worker.experience} experience
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-5">
                    {worker.description}
                  </p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {worker.skills?.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100/50 px-3 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-5">
                    <Star className="h-4.5 w-4.5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-slate-800 text-sm">
                      {worker.avgRating ? worker.avgRating.toFixed(1) : "0.0"}
                    </span>
                    <span className="text-xs text-slate-400">
                      ({worker.totalReviews} reviews)
                    </span>
                  </div>

                  {/* Price + Location */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                    <span className="text-lg font-extrabold text-blue-600">
                      ₹{worker.fees}
                    </span>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <MapPin className="h-4 w-4 text-rose-500" />
                      {worker.zone}
                      <span className="text-slate-400">
                        ({(worker.distance / 1000).toFixed(1)} km)
                      </span>
                    </div>
                  </div>
                </CardContent>

                {/* Buttons */}
                <CardFooter className="px-6 pb-6 pt-0">
                  <div className="flex gap-3 w-full">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl h-10 text-xs font-semibold cursor-pointer border-slate-200 text-slate-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWorkerClick(worker);
                      }}
                    >
                      View Profile
                    </Button>

                    <Button
                      className="flex-1 rounded-xl h-10 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-100 hover:shadow-blue-200 transition cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/services/bookDetails/${worker._id}`);
                      }}
                    >
                      Book Now
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {!loading && workers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-2">
              No workers found
            </p>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalWorkers > workersPerPage && (
          <Pagination
            current={currentPage}
            total={totalWorkers}
            pageSize={workersPerPage}
            onChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>

      {/* Worker Profile Modal */}
      <WorkerProfileModal
        worker={selectedWorker}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
