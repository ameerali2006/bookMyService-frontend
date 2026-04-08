"use client";

import { useState } from "react";

import axios from "axios";
import type { ChangePasswordInput } from "@/components/shared/ChangePassword";
import ChangePasswordForm from "@/components/shared/ChangePassword";
import { WorkerLayout } from "@/components/worker/Dashboard/WorkerLayout";
import { Navbar } from "@/components/worker/Dashboard/WorkerNavbar";
import { ErrorToast, SuccessToast } from "@/components/shared/Toaster";
import { workerService } from "@/api/WorkerService";
import { useNavigate } from "react-router-dom";

const WorkerChangePasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate= useNavigate()

  const handleChangePassword = async (data: ChangePasswordInput) => {
    setLoading(true);
    try {
      const response=await workerService.changePassword(data)
      if(response.data.success){
        SuccessToast(response.data.message)
        navigate("/worker/profile/view")
       
      }else{
        ErrorToast(response.data.message)
      }
    } catch (error: any) {
      ErrorToast(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <WorkerLayout>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <ChangePasswordForm
          role="worker"
          onSubmit={handleChangePassword}
          loading={loading}
        />
      </div>
    </WorkerLayout>
  );
};

export default WorkerChangePasswordPage;
