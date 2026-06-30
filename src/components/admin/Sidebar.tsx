"use client";

import type React from "react";
import {
  LayoutDashboard,
  Calendar,
  Settings,
  Store,
  Star,
  Shield,
  Users,
  LogOut,
  Layers,
  Wrench,
  Wallet
  
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "@/api/AuthService";
import { removeAdmin } from "@/redux/slice/adminTokenSlice";
import { useDispatch } from "react-redux";
import { ErrorToast, SuccessToast } from "../shared/Toaster";

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (item: string) => void;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem, onItemClick, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch=useDispatch()

  const menuItems = [
    { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { id: "BookingList", label: "Bookings", icon: Calendar, path: "/admin/bookings" },
    { id: "ServicesDetail", label: "Service Details", icon: Settings, path: "/admin/services" },
    { id: "Workers", label: "Workers", icon: Users, path: "/admin/workers" },
    { id: "Reviews", label: "Reviews", icon: Star, path: "/admin/reviews" },
    { id: "Verification", label: "Worker Verification", icon: Shield, path: "/admin/unverified" },
    { id: "Users", label: "Users", icon: Users, path: "/admin/users" },
    { id: "Wallet", label: "Wallet", icon: Wallet, path: "/admin/wallet" },
   
  ];

  const handleItemClick = (itemId: string, path: string) => {
    onItemClick?.(itemId);
    navigate(path);
  }; 

  const handleLogout = async () => {
    try {
      console.log('logout')
      const res=await authService.adminLogout()
      if(res.data.success){
        dispatch(removeAdmin())
        navigate("/admin/login")
        SuccessToast("LogOut Successfully")
      }else{
        ErrorToast("LogOut failed, Try Again")
      }
    } catch (error) {
      console.error(error)
    }
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-100 shadow-sm z-45 hidden lg:block">
      {/* Logo Section */}
      <div className="flex items-center px-6 py-4 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-sm">⚙️</span>
          </div>
          <span className="text-xl font-bold text-slate-800">Admin Panel</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id || location.pathname === item.path;

            return (
              <li key={item.id}>
                <button
                  onClick={() => handleItemClick(item.id, item.path)}
                  className={`w-full flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Logout Button */}
        <div className="absolute bottom-6 left-3 right-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-650 rounded-xl transition-colors duration-200 cursor-pointer"
          >
            <LogOut className="w-5 h-5 mr-3 text-red-550" />
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
