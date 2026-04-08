import type React from "react";
import { useEffect, useState } from "react";
import Navbar from "@/components/admin/Navbar";
import Sidebar from "@/components/admin/Sidebar";
import Footer from "@/components/user/shared/Footer";
import {
  TrendingUp,
  Calendar,
  XCircle,
  DollarSign,
  BarChart3,
  Star,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "@/redux/store";
import { removeAdmin } from "@/redux/slice/adminTokenSlice";
import { adminManagement } from "@/api/AdminManagement";
// import { logoutAdmin } from "@/services/admin/admin.service";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
export interface IAdminDashboardResponse {
  stats: {
    totalBookings: number;
    activeServices: number;
    cancelledJobs: number;
    totalRevenue: number;
    bookingGrowth: number;
    revenueGrowth: number;
  };
  revenueChart: {
    month: string;
    total: number;
  }[];
  serviceDistribution: {
    name: string;
    value: number;
  }[];
}

const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const adminData = useSelector(
    (state: RootState) => state.adminTokenSlice.admin,
  );
  const [activeMenuItem, setActiveMenuItem] = useState("Dashboard");
  const [dashboardData, setDashboardData] =
    useState<IAdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const fetchDashboard = async () => {
    try {
      const res = await adminManagement.getDashBoard();
      const raw = res.data.data.data;

      const formatted: IAdminDashboardResponse = {
        stats: {
          totalBookings: raw.stats.totalBookings,
          activeServices: raw.stats.activeServices,
          cancelledJobs: raw.stats.cancelledBookings,
          totalRevenue: raw.stats.totalRevenue,
          bookingGrowth: raw.stats.bookingGrowth,
          revenueGrowth: raw.stats.revenueGrowth,
        },

        revenueChart: raw.revenueChart.map((item: any) => ({
          month: item.month,
          total: item.revenue,   // 🔥 map revenue → total
        })),

        serviceDistribution: raw.serviceDistribution.map((item: any) => ({
          name: item.service,    // 🔥 map service → name
          value: item.count,     // 🔥 map count → value
        })),
      };

      setDashboardData(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchDashboard();
}, []);

  if (!dashboardData) {
    return <h2>loading....</h2>;
  }

  const stats = [
    {
      title: "Total Bookings",
      value: dashboardData.stats.totalBookings,
      change: ``,
      icon: Calendar,
      color: "bg-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Active Services",
      value: dashboardData.stats.activeServices,
      change: `3%`,
      icon: TrendingUp,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Cancelled Jobs",
      value: dashboardData.stats.cancelledJobs,
      change: `%`,
      icon: XCircle,
      color: "bg-red-500",
      bgColor: "bg-red-50",
    },
    {
      title: "Total Revenue",
      value: dashboardData.stats.totalRevenue.toFixed(2),
      change: `${dashboardData.stats.totalRevenue.toFixed(2)}%`,
      icon: DollarSign,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
    },
  ];

  const handleMenuItemClick = (item: string) => setActiveMenuItem(item);

  const handleLogout = async () => {
    try {
      //   await logoutAdmin();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      dispatch(removeAdmin());
      navigate("/admin/login");
    }
  };

  const renderDashboardContent = () => (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {adminData?.name || "Admin"}!
            </p>
          </div>
          <div className="bg-blue-50 p-3 rounded-md text-right">
            <p className="text-sm font-medium text-blue-800">Last 30 Days</p>
            <p className="text-xs text-blue-500">22 June - 21 July 2025</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white border rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon
                    className={`h-6 w-6 ${stat.color.replace("bg-", "text-")}`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Placeholder for Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Service Distribution
          </h3>
          <div className="h-[300px] bg-gray-50 flex justify-center items-center rounded-lg">
            
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dashboardData.serviceDistribution}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        

          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Revenue Chart
          </h3>
          <div className="h-[300px] bg-gray-50 flex justify-center items-center rounded-lg">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dashboardData.revenueChart}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeMenuItem) {
      case "Dashboard":
        return renderDashboardContent();
      case "Bookings":
        return (
          <Section
            title="All Bookings"
            description="List of service bookings."
          />
        );
      case "Services":
        return (
          <Section
            title="Service Categories"
            description="Manage available services."
          />
        );
      case "Workers":
        return (
          <Section
            title="Workers"
            description="Verify and manage worker profiles."
          />
        );
      case "Reviews":
        return (
          <Section
            title="Customer Feedback"
            description="Read and respond to reviews."
          />
        );
      case "Users":
        return (
          <Section title="Users" description="Registered customers overview." />
        );
      default:
        return renderDashboardContent();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        activeItem={activeMenuItem}
        onItemClick={handleMenuItemClick}
        onLogout={handleLogout}
      />
      <Navbar userName={adminData?.name || "Admin"} onSearch={() => {}} />
      <main className="ml-64 pt-16 p-6">
        <div className="max-w-7xl mx-auto">{renderContent()}</div>
      </main>
      <div className="ml-64 p-6">
        <Footer />
      </div>
    </div>
  );
};

const Section = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="bg-white p-6 rounded-lg border shadow-sm">
    <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default AdminDashboard;
