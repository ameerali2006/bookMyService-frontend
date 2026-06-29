"use client";

import { X, Star, MapPin, Clock, Award, ShieldCheck, Check, MessageSquare, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface Review {
  _id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  userName: string;
}

export interface Worker {
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

interface WorkerProfileProps {
  worker: Worker | null;
  mode: "modal" | "page";
  onClose?: () => void;
  onBook?: () => void;
}

export function WorkerProfile({
  worker,
  mode,
  onClose,
  onBook,
}: WorkerProfileProps) {
  if (!worker) return null;

  const mockCompletedJobs = Math.max((worker.totalReviews || 0) * 3 + 12, 18);

  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  if (mode === "modal") {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8"
      >
        {/* LEFT COLUMN: Main Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="h-24 w-24 ring-4 ring-blue-100 shadow-md">
              <AvatarImage
                src={
                  worker.profileImage ||
                  "https://i.pinimg.com/236x/05/78/16/05781612d2cbadf5e423cd0cef59b4f1.jpg"
                }
                alt={worker.name}
              />
              <AvatarFallback className="text-lg bg-blue-600 text-white font-semibold">
                {worker.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl font-bold text-gray-900">{worker.name}</h2>
                <ShieldCheck className="h-5 w-5 text-blue-600 fill-blue-50" />
              </div>

              <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-blue-500" />
                  {worker.experience} experience
                </div>

                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-rose-500" />
                  {worker.zone}
                </div>

                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                  {(worker.distance / 1000).toFixed(1)} km away
                </span>
              </div>
            </div>

            <div className="text-center sm:text-right bg-blue-50/50 p-3 rounded-2xl border border-blue-100 min-w-[120px] lg:hidden">
              <div className="text-2xl font-bold text-blue-600">
                ₹{worker.fees}
              </div>
              <div className="flex items-center justify-center sm:justify-end gap-1 mt-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-gray-800">
                  {worker.avgRating ? worker.avgRating.toFixed(1) : "0.0"}
                </span>
                <span className="text-xs text-gray-500">
                  ({worker.totalReviews})
                </span>
              </div>
            </div>
          </div>

          {/* SKILLS */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Award className="h-4 w-4 text-blue-600" />
              Skills & Specialties
            </h3>

            <div className="flex flex-wrap gap-2">
              {worker.skills?.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition rounded-full px-3 py-1 font-medium text-xs"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* ABOUT */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-800 mb-2">About</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              {worker.description ||
                `${worker.name} is a highly skilled professional with ${worker.experience} of dedicated work experience. They are committed to delivering top-notch, reliable service with great attention to detail.`}
            </p>
          </div>

          {/* REVIEWS */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              Recent Reviews ({worker.totalReviews})
            </h3>

            {worker.recentReviews && worker.recentReviews.length > 0 ? (
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {worker.recentReviews.map((review) => (
                  <div
                    key={review._id}
                    className="rounded-xl border border-gray-100 p-3.5 bg-gray-50/50 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[10px] bg-gray-200 font-bold">
                            {review.userName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm text-gray-800">
                          {review.userName}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {review.comment && (
                      <p className="text-xs text-gray-600 leading-relaxed italic pl-8">
                        "{review.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic pl-1">
                No reviews available yet.
              </p>
            )}
          </div>

          {/* BUTTONS (Mobile/Tablet Only) */}
          <div className="flex gap-3 pt-4 border-t lg:hidden">
            <Button
              variant="outline"
              className="flex-1 rounded-xl hover:bg-gray-50 border-gray-200"
              onClick={onClose}
            >
              Close
            </Button>

            <Button
              className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold transition"
              onClick={onBook}
            >
              Book Now
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN: Desktop Only Sticky Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-0 border border-gray-100 bg-gray-50/50 p-6 rounded-3xl space-y-6">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">Service Fee</span>
              <div className="text-3xl font-extrabold text-blue-600 mt-1">
                ₹{worker.fees}
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-gray-800">
                  {worker.avgRating ? worker.avgRating.toFixed(1) : "0.0"}
                </span>
                <span className="text-xs text-gray-500">
                  ({worker.totalReviews} reviews)
                </span>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3.5 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-500 fill-emerald-50" />
                <span className="font-medium text-gray-700">Verified Partner</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-blue-500" />
                <span className="font-medium text-gray-700">{worker.experience} Experience</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4.5 w-4.5 text-rose-500" />
                <span className="font-medium text-gray-700">{worker.zone}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Button
                className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base py-5 shadow-lg shadow-blue-100 hover:shadow-blue-200 transition-all"
                onClick={onBook}
              >
                Book Now
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-2xl hover:bg-gray-100 border-gray-200 font-semibold"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // mode === 'page'
  return (
    <div className="min-h-screen bg-gray-50/50 pb-24 relative">
      {/* HERO BANNER SECTION */}
      <div className="relative bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white overflow-hidden py-16 border-b">
        {/* Background visual elements */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute -right-32 -bottom-32 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          <Avatar className="h-32 w-32 md:h-36 md:w-36 ring-4 ring-white/20 shadow-2xl">
            <AvatarImage
              src={
                worker.profileImage ||
                "https://i.pinimg.com/236x/05/78/16/05781612d2cbadf5e423cd0cef59b4f1.jpg"
              }
              alt={worker.name}
            />
            <AvatarFallback className="text-3xl bg-blue-600 font-bold">
              {worker.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                {worker.name}
              </h1>
              <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 fill-blue-300/10" />
                Verified Partner
              </span>
            </div>

            <p className="text-indigo-200 text-base md:text-lg max-w-2xl font-normal">
              {worker.skills?.slice(0, 4).join("  •  ") || "Professional Specialist"}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-6 gap-y-2 mt-4 text-sm text-indigo-100">
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-white">
                  {worker.avgRating ? worker.avgRating.toFixed(1) : "0.0"}
                </span>
                <span className="text-indigo-200">
                  ({worker.totalReviews} reviews)
                </span>
              </div>

              <div className="w-1.5 h-1.5 rounded-full bg-indigo-300/40 hidden sm:block" />

              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-indigo-300" />
                <span>{worker.experience} Experience</span>
              </div>

              <div className="w-1.5 h-1.5 rounded-full bg-indigo-300/40 hidden sm:block" />

              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-indigo-300" />
                <span>{worker.zone}</span>
                <span className="text-indigo-300 text-xs bg-white/10 px-1.5 py-0.5 rounded">
                  {(worker.distance / 1000).toFixed(1)} km away
                </span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex flex-col items-end bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-2xl min-w-[160px] shadow-lg">
            <span className="text-xs text-indigo-200 uppercase tracking-wider font-semibold">Service Fee</span>
            <div className="text-3xl font-extrabold text-white mt-1">
              ₹{worker.fees}
            </div>
            <span className="text-xs text-indigo-300 mt-1">per visit/job</span>
          </div>
        </div>
      </div>

      {/* CORE DETAILS GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LEFT SIDE DETAILS */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-3 space-y-8"
          >
            {/* STATS SECTION */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="border border-gray-200/80 bg-white shadow-sm rounded-2xl hover:shadow transition duration-200">
                <CardContent className="p-5 text-center flex flex-col items-center justify-center">
                  <div className="p-3 bg-blue-50 rounded-2xl mb-3">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">Completed</span>
                  <span className="text-lg font-bold text-gray-800 mt-1">{mockCompletedJobs}+ Jobs</span>
                </CardContent>
              </Card>

              <Card className="border border-gray-200/80 bg-white shadow-sm rounded-2xl hover:shadow transition duration-200">
                <CardContent className="p-5 text-center flex flex-col items-center justify-center">
                  <div className="p-3 bg-yellow-50 rounded-2xl mb-3">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">Rating</span>
                  <span className="text-lg font-bold text-gray-800 mt-1">
                    {worker.avgRating ? worker.avgRating.toFixed(1) : "0.0"} / 5
                  </span>
                </CardContent>
              </Card>

              <Card className="border border-gray-200/80 bg-white shadow-sm rounded-2xl hover:shadow transition duration-200">
                <CardContent className="p-5 text-center flex flex-col items-center justify-center">
                  <div className="p-3 bg-teal-50 rounded-2xl mb-3">
                    <Clock className="h-5 w-5 text-teal-600" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">Experience</span>
                  <span className="text-lg font-bold text-gray-800 mt-1">{worker.experience}</span>
                </CardContent>
              </Card>

              <Card className="border border-gray-200/80 bg-white shadow-sm rounded-2xl hover:shadow transition duration-200">
                <CardContent className="p-5 text-center flex flex-col items-center justify-center">
                  <div className="p-3 bg-indigo-50 rounded-2xl mb-3">
                    <MessageSquare className="h-5 w-5 text-indigo-600" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">Reviews</span>
                  <span className="text-lg font-bold text-gray-800 mt-1">{worker.totalReviews} Total</span>
                </CardContent>
              </Card>
            </motion.div>

            {/* ABOUT */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-4"
            >
              <h2 className="text-xl font-bold text-gray-800 pb-2 border-b">About {worker.name}</h2>
              <p className="text-gray-600 leading-relaxed">
                {worker.description ||
                  `${worker.name} is a highly accomplished service provider with an exceptional record of customer satisfaction. Offering over ${worker.experience} of domain experience, they specialize in clean execution, punctuality, and delivering long-lasting repairs and installations. Every job is handled with utmost professionalism and adherence to strict safety standards.`}
              </p>
            </motion.div>

            {/* SKILLS */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-4"
            >
              <h2 className="text-xl font-bold text-gray-800 pb-2 border-b flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                Skills & Specialties
              </h2>
              <div className="flex flex-wrap gap-2.5 pt-2">
                {worker.skills?.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="bg-blue-50/40 text-blue-600 border-blue-100 hover:bg-blue-50 transition rounded-full px-4 py-1.5 font-semibold text-xs md:text-sm"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </motion.div>

            {/* REVIEWS LIST */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6"
            >
              <div className="flex items-center justify-between pb-3 border-b">
                <h2 className="text-xl font-bold text-gray-800">
                  Recent Reviews ({worker.totalReviews})
                </h2>
                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-yellow-800 text-sm">
                    {worker.avgRating ? worker.avgRating.toFixed(1) : "0.0"}
                  </span>
                </div>
              </div>

              {worker.recentReviews && worker.recentReviews.length > 0 ? (
                <div className="space-y-4">
                  {worker.recentReviews.map((review) => (
                    <div
                      key={review._id}
                      className="rounded-2xl border border-gray-100 p-5 bg-gray-50/30 hover:bg-gray-50/70 transition duration-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-xs">
                              {review.userName.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-semibold text-sm text-gray-800 block">
                              {review.userName}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-lg p-1.5 px-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {review.comment && (
                        <p className="text-sm text-gray-600 leading-relaxed italic pl-1 border-l-2 border-blue-500/30 pl-4 py-0.5">
                          "{review.comment}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 italic">
                  No reviews posted for this professional yet.
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* DESKTOP STICKY BOOKING CARD */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border border-gray-200 bg-white shadow-xl rounded-3xl overflow-hidden">
                <div className="bg-blue-900 text-white p-6">
                  <span className="text-xs uppercase tracking-wider font-semibold text-blue-200">Excellent Value</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-extrabold">₹{worker.fees}</span>
                    <span className="text-sm text-blue-200">/ job</span>
                  </div>
                </div>

                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between text-sm py-2 border-b">
                    <span className="text-gray-500 font-medium">Ratings & reviews</span>
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-gray-800">
                        {worker.avgRating ? worker.avgRating.toFixed(1) : "0.0"}
                      </span>
                      <span className="text-gray-400">({worker.totalReviews})</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm py-2 border-b">
                    <span className="text-gray-500 font-medium">Professional Experience</span>
                    <span className="font-semibold text-gray-800">{worker.experience}</span>
                  </div>

                  <div className="space-y-3.5 pt-2">
                    <div className="flex items-start gap-2.5 text-xs text-gray-600">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Verified professional background and background-checked identity.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-gray-600">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Safety and health guideline compliance guaranteed.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-gray-600">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Free cancellation or schedule adjustment up to 2 hours before.</span>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-base py-6 rounded-2xl shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:scale-[1.01] transition-all"
                    onClick={onBook}
                  >
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200/80 p-4 px-6 flex items-center justify-between shadow-[0_-8px_20px_rgba(0,0,0,0.06)] backdrop-blur-md">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-gray-900">₹{worker.fees}</span>
            <span className="text-xs text-gray-500">/ job</span>
          </div>

          <div className="flex items-center gap-1.5 mt-0.5">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-bold text-gray-700">
              {worker.avgRating ? worker.avgRating.toFixed(1) : "0.0"}
            </span>
            <span className="text-[10px] text-gray-400">({worker.totalReviews})</span>
          </div>
        </div>

        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-4 rounded-xl shadow-md transition"
          onClick={onBook}
        >
          Book Now
        </Button>
      </div>
    </div>
  );
}
