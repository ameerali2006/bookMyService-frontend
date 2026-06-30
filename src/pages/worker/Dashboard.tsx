import { WorkerLayout } from '@/components/worker/Dashboard/WorkerLayout';
import { WorkerStatsCard } from '@/components/worker/Dashboard/WorkerStatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Wrench,
  Zap,
  Calendar,
  DollarSign,
  MessageCircle,
  CheckCircle,
  Clock,
  Users,
  Activity,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';

import { Navbar } from '@/components/worker/Dashboard/WorkerNavbar';
import type { RootState } from '@/redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { API_ROUTES } from '@/constants/apiRoutes';
import { authService } from '@/api/AuthService';
import { ErrorToast } from '@/components/shared/Toaster';
import { updateLocation } from '@/redux/slice/userTokenSlice';
import type { WorkerDashboardResponse } from '@/interface/worker/dashboard.types';
import { workerService } from '@/api/WorkerService';
import { cn } from '@/lib/utils';

export default function WorkerDashboard() {
  const [data, setData] = useState<WorkerDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const dispatch=useDispatch()


  const worker = useSelector((state: RootState) => state.workerTokenSlice.worker);

  useEffect(()=>{
    autoUpdateLocation()
    fetchDashboard()
  },[])

  const fetchDashboard = async () => {
  try {
    setLoading(true);
    const res = await workerService.getDashboard();
    console.log("dashboard",res)
    setData(res.data.data);
  } catch (error) {
    ErrorToast("Failed to load dashboard");
  } finally {
    setLoading(false);
  }
};

  const autoUpdateLocation = () => {
    if (!navigator.geolocation) {
      console.log("Geolocation not available");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      try {
        // Reverse GEO API (OpenStreetMap)
        const res = await fetch(
          API_ROUTES.LOCATION.REVERSE_GEOCODE(latitude, longitude)
        );
        const data = await res.json();

        const address = data.display_name;
        const pincode =
          data.address.postcode || data.address.pincode || "";

        // Dispatch to Redux
        dispatch(
          updateLocation({
            lat: latitude,
            lng: longitude,
            address,
            city: data.address.city || data.address.town || "",
            pincode
          })
        );

        console.log("Auto Location Updated",{
            lat: latitude,
            lng: longitude,
            address,
            city: data.address.city || data.address.town || "",
            pincode
          });
      } catch (err) {
        console.log("Failed to fetch address");
      }
    });
  };

 if (loading) {

    return (
      
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
     
    );
  }
  if (data?.workerStatus === "pending"){

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center h-screen bg-green-50">
        <div className="text-center p-10 rounded-2xl shadow-lg bg-white">
          <ShieldCheck className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-green-700">Profile Under Review</h1>
          <p className="mt-2 text-green-600">
            Your profile has been submitted and is awaiting admin approval. 🚀
          </p>
        </div>
      </div>
    </>
  );
}

if (data?.workerStatus === "rejected") {
  return (<>
    <Navbar />
      <div className="flex items-center justify-center h-screen bg-red-50">
        <div className="text-center p-10 rounded-2xl shadow-lg bg-white">
          <ShieldAlert className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-red-700">Profile Rejected</h1>
          <p className="mt-2 text-red-600">
            Sorry, your profile was rejected by admin. Please contact support or update your details.
          </p>
          <Button
            className="mt-4 bg-red-600 text-white hover:bg-red-700"
            onClick={() => (window.location.href = "/worker/profile/edit")}
          >
            Update Profile
          </Button>
        </div>
      </div>
    </>
  );
}

  return (
    <WorkerLayout>
      <Navbar />
      <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Welcome */}
        <div className="fade-slide-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                Welcome back, {worker?.name || 'Superstar'}! 👷‍♂️
              </h1>
              <p className="text-slate-500 text-sm">
                Here's your job summary for today.
              </p>
            </div>
            <div className="text-left sm:text-right bg-white p-4 rounded-2xl border border-slate-100 shadow-sm min-w-[150px]">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Today</p>
              <p className="text-lg font-extrabold text-slate-800 mt-1">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <WorkerStatsCard
            title="Total Jobs"
            value={data?.stats.totalJobs.toString() || "0"}
            change={`${data?.stats.todayJobs || 0} today`}
            trend="up"
            icon={<Wrench className="h-5 w-5 text-blue-600" />}
          />

          <WorkerStatsCard
            title="Monthly Earnings"
            value={`₹${data?.stats.monthlyEarnings || 0}`}
            change={`${data?.stats.upcomingJobs || 0} upcoming`}
            trend="up"
            icon={<DollarSign className="h-5 w-5 text-blue-600" />}
          />

          <WorkerStatsCard
            title="Upcoming Jobs"
            value={data?.stats.upcomingJobs.toString() || "0"}
            change="Active bookings"
            trend="neutral"
            icon={<Calendar className="h-5 w-5 text-blue-600" />}
          />

          <WorkerStatsCard
            title="Rating"
            value={`${data?.stats.averageRating || 0} / 5`}
            change={`${data?.stats.totalReviews || 0} reviews`}
            trend="up"
            icon={<CheckCircle className="h-5 w-5 text-blue-600" />}
          />
        </div>

        {/* Schedule + Side Column */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Schedule */}
          <div className="lg:col-span-2 fade-slide-in">
            <Card className="h-full bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
              <CardHeader className="border-b border-slate-50 p-6 pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-bold text-slate-800">
                    Today’s Jobs
                  </CardTitle>
                  <Badge className="bg-slate-900 text-white rounded-full font-bold text-xs px-2.5 py-0.5">Active schedule</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {data?.todaySchedule && data.todaySchedule.length > 0 ? (
                  data.todaySchedule.map((job) => (
                    <div
                      key={job.bookingId}
                      className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-100/50 rounded-2xl transition duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-left">
                          <p className="text-sm font-bold text-slate-800">
                            {job.time}
                          </p>
                        </div>
                        <div className="w-px h-8 bg-slate-200" />
                        <div>
                          <p className="font-bold text-slate-800 text-sm">
                            {job.service}
                          </p>
                          <p className="text-xs text-slate-400 font-medium">
                            Client: {job.clientName}
                          </p>
                        </div>
                      </div>

                      <Badge
                        className={cn(
                          "rounded-full font-bold text-xs px-2.5 py-0.5 border",
                          job.status === "completed"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : job.status === "in-progress"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-slate-50 text-slate-700 border-slate-200"
                        )}
                      >
                        {job.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-400 text-sm italic py-10">No jobs scheduled for today.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Performance */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-slate-900 text-white border-0 rounded-3xl shadow-lg p-2">
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-base font-bold text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-3">
                <Button className="w-full h-11 bg-white text-slate-900 hover:bg-slate-50 justify-start rounded-xl font-bold transition cursor-pointer shadow-sm">
                  <Clock className="h-4 w-4 mr-2 text-blue-600" />
                  Start Job
                </Button>
                <Button className="w-full h-11 bg-white/10 text-white hover:bg-white/20 justify-start rounded-xl font-bold transition cursor-pointer border border-white/5">
                  <MessageCircle className="h-4 w-4 mr-2 text-blue-400" />
                  Chat with Client
                </Button>
                <Button className="w-full h-11 bg-white/10 text-white hover:bg-white/20 justify-start rounded-xl font-bold transition cursor-pointer border border-white/5">
                  <Zap className="h-4 w-4 mr-2 text-yellow-400" />
                  View Earnings
                </Button>
              </CardContent>
            </Card>

            {/* Performance */}
            <Card className="bg-white border border-slate-100 rounded-3xl shadow-sm">
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-2">
                      <span className="text-slate-400 uppercase tracking-wider">Job Efficiency</span>
                      <span className="text-slate-850">{data?.stats.efficiency || 0}%</span>
                    </div>
                    <Progress value={data?.stats.efficiency || 0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-2">
                      <span className="text-slate-400 uppercase tracking-wider">Client Satisfaction</span>
                      <span className="text-slate-850">{data?.stats.satisfaction || 0}%</span>
                    </div>
                    <Progress value={data?.stats.satisfaction || 0} className="h-2" />
                  </div>
                </div>
                <Separator className="bg-slate-100" />
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100/50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-700">Most Rated Worker</span>
                  </div>
                  <Badge className="bg-blue-50 text-blue-700 border border-blue-100 rounded-full font-bold text-[10px] px-2 py-0.5">This Month</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </WorkerLayout>
  );
}
