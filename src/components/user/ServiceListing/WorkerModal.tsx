"use client";

import { X, Star, MapPin, Clock, Award } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Review {
  _id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  userName: string;
}

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

interface WorkerProfileModalProps {
  worker: Worker | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WorkerProfileModal({
  worker,
  isOpen,
  onClose,
}: WorkerProfileModalProps) {
  if (!worker) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white/90 backdrop-blur-lg shadow-2xl">

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <DialogHeader>
            <DialogTitle className="sr-only">Worker Profile</DialogTitle>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <div className="space-y-6">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

              <Avatar className="h-24 w-24 ring-4 ring-blue-100">
                <AvatarImage
                  src={
                    worker.profileImage ||
                    "https://i.pinimg.com/236x/05/78/16/05781612d2cbadf5e423cd0cef59b4f1.jpg"
                  }
                  alt={worker.name}
                />
                <AvatarFallback className="text-lg">
                  {worker.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold">{worker.name}</h2>

                <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-2 text-sm text-gray-500">

                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {worker.experience} experience
                  </div>

                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {worker.zone}
                  </div>

                  <span className="text-xs text-gray-400">
                    {(worker.distance / 1000).toFixed(1)} km away
                  </span>

                </div>
              </div>

              <div className="text-center sm:text-right">
                <div className="text-2xl font-bold text-blue-600">
                  ₹{worker.fees}
                </div>

                <div className="flex items-center justify-center sm:justify-end gap-1 mt-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />

                  <span className="font-semibold">
                    {worker.avgRating?.toFixed(1)}
                  </span>

                  <span className="text-sm text-gray-500">
                    ({worker.totalReviews})
                  </span>
                </div>
              </div>

            </div>

            {/* SKILLS */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center">
                <Award className="h-4 w-4 mr-2" />
                Skills & Specialties
              </h3>

              <div className="flex flex-wrap gap-2">
                {worker.skills?.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs font-medium bg-blue-50 text-blue-600 px-3 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* ABOUT */}
            <div>
              <h3 className="font-semibold mb-3">About</h3>

              <p className="text-gray-600 leading-relaxed">
                {worker.description ||
                  `${worker.name} is a professional worker with ${worker.experience} experience.`}
              </p>
            </div>

            {/* REVIEWS */}
            <div>
              <h3 className="font-semibold mb-3">Recent Reviews</h3>

              {worker.recentReviews && worker.recentReviews.length > 0 ? (
                <div className="space-y-4">

                  {worker.recentReviews.map((review) => (
                    <div
                      key={review._id}
                      className="rounded-xl border border-gray-200 p-4 bg-gray-50 hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center gap-2 mb-2">

                        <div className="flex">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-4 w-4 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>

                        <span className="font-medium">
                          {review.userName}
                        </span>

                        <span className="text-sm text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>

                      </div>

                      {review.comment && (
                        <p className="text-sm text-gray-600">
                          {review.comment}
                        </p>
                      )}

                    </div>
                  ))}

                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No reviews yet
                </p>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-3 pt-4 border-t">

              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={onClose}
              >
                Close
              </Button>

              <Button className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700">
                Book Now
              </Button>

            </div>

          </div>
        </motion.div>

      </DialogContent>
    </Dialog>
  );
}