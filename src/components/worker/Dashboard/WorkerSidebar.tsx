import {
  LayoutDashboard,
  Calendar,
  MessageCircle,
  UserCog,
  LogOut,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { removeWorker } from "@/redux/slice/workerTokenSlice";
import { authService } from "@/api/AuthService";

const navItems = [
  { label: "Dashboard", icon: <LayoutDashboard />, path: "/worker/dashboard" },
  { label: "Messages", icon: <MessageCircle />, path: "/worker/messages" },
];

const appointmentSubItems = [
  { label: "All Bookings", path: "/worker/appointments/allBookings" },
  { label: "Requests", path: "/worker/appointments/request" },
  { label: "Approved", path: "/worker/appointments/approved" },
 
];

const profileSubItems = [
  { label: "View Profile", path: "/worker/profile/view" },
  { label: "Wallet", path: "/worker/profile/wallet" },
  { label: "Slot Management", path: "/worker/profile/slot" },
];

export const WorkerSidebar = () => {
  const dispatch = useDispatch();
  const [profileOpen, setProfileOpen] = useState(false);
  const [appointmentOpen, setAppointmentOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.workerLogout();
      dispatch(removeWorker());
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <aside className="w-64 bg-white shadow-md h-full flex flex-col justify-between">
      <div className="p-6 space-y-6">
        <h2 className="text-2xl font-bold text-black">Worker Panel</h2>
        <nav className="space-y-2">
          {/* Static Links */}
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 p-2 rounded-lg font-medium hover:bg-muted transition ${
                  isActive ? "bg-muted text-primary" : "text-muted-foreground"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}

          {/* Appointments with Submenu */}
          <div>
            <button
              onClick={() => setAppointmentOpen((prev) => !prev)}
              className="flex w-full items-center justify-between p-2 rounded-lg font-medium hover:bg-muted transition text-muted-foreground"
            >
              <span className="flex items-center gap-3">
                <Calendar />
                Appointments
              </span>
              {appointmentOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {appointmentOpen && (
              <div className="pl-8 mt-2 space-y-1">
                {appointmentSubItems.map((subItem) => (
                  <NavLink
                    key={subItem.path}
                    to={subItem.path}
                    className={({ isActive }) =>
                      `block p-2 rounded-md text-sm hover:bg-muted transition ${
                        isActive ? "bg-muted text-primary" : "text-muted-foreground"
                      }`
                    }
                  >
                    {subItem.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Profile with Submenu */}
          <div>
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex w-full items-center justify-between p-2 rounded-lg font-medium hover:bg-muted transition text-muted-foreground"
            >
              <span className="flex items-center gap-3">
                <UserCog />
                Profile
              </span>
              {profileOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {profileOpen && (
              <div className="pl-8 mt-2 space-y-1">
                {profileSubItems.map((subItem) => (
                  <NavLink
                    key={subItem.path}
                    to={subItem.path}
                    className={({ isActive }) =>
                      `block p-2 rounded-md text-sm hover:bg-muted transition ${
                        isActive ? "bg-muted text-primary" : "text-muted-foreground"
                      }`
                    }
                  >
                    {subItem.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>

      <div className="p-6 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-red-600 hover:text-red-800 font-medium"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};
