"use client";

import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkerProfile, type Worker } from "@/components/user/ServiceListing/WorkerProfile";
import { userService } from "@/api/UserService";
import Loader from "@/components/shared/Loader";

export default function WorkerDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Try to read state passed through navigation
  const initialWorkerState = location.state?.worker as Worker | undefined;

  const [worker, setWorker] = useState<Worker | null>(initialWorkerState || null);
  const [loading, setLoading] = useState<boolean>(!initialWorkerState);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Scroll to top on page mount
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // If worker not passed in state, fetch via API
    if (!worker && id) {
      const fetchWorkerDetails = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await userService.getWorkerProfile(id);
          if (response.data?.success && response.data?.data) {
            setWorker(response.data.data);
          } else {
            setError("Could not retrieve the professional's profile details. Please try again.");
          }
        } catch (err) {
          console.error("Error fetching worker details:", err);
          setError("Failed to connect to the server. Please check your network and retry.");
        } finally {
          setLoading(false);
        }
      };

      fetchWorkerDetails();
    }
  }, [id, worker]);

  const handleBook = () => {
    if (worker) {
      navigate(`/services/bookDetails/${worker._id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 pt-20">
        <Loader message="Fetching professional details..." />
      </div>
    );
  }

  if (error || !worker) {
    return (
      <div className="min-h-screen bg-gray-50/50 pt-28 pb-12 flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl border border-gray-100 shadow-xl space-y-6">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
            <AlertCircle className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">An Error Occurred</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              {error || "We couldn't load the worker profile details."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
            <Button
              className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                setError(null);
                setWorker(null); // Triggers re-fetch
              }}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 min-h-screen pt-20">
      {/* Navigation Breadcrumb Bar */}
      <div className="bg-white border-b border-gray-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="group gap-2 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 px-3 py-1.5 h-auto text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Listings
          </Button>
        </div>
      </div>

      {/* Reusable Profile View in Page Mode */}
      <WorkerProfile
        worker={worker}
        mode="page"
        onBook={handleBook}
      />
    </div>
  );
}
