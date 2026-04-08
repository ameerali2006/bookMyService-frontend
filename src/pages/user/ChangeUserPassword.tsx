"use client";

import React, { useState } from "react";

import axios from "axios";
import ChangePasswordForm, { type ChangePasswordInput } from "@/components/shared/ChangePassword";
import { ErrorToast, SuccessToast } from "@/components/shared/Toaster";
import { userService } from "@/api/UserService";
import { useNavigate } from "react-router-dom";
import Header from "@/components/user/shared/Header";

const UserChangePasswordPage = () => {
  const [loading, setLoading] = useState(false);
      const navigate= useNavigate()
  const handleChangePassword = async (data: ChangePasswordInput) => {
    setLoading(true);
    try {
          const response=await userService.changePassword(data)
          if(response.data.success){
            SuccessToast(response.data.message)
            navigate("/profile")
           
          }else{
            ErrorToast(response.data.message)
          }
        } catch (error: any) {
          ErrorToast(error.response?.data?.message || "Failed to change password");
        } finally {
          setLoading(false);
        }
  };

  return (<>
  
    <Header></Header>

    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <ChangePasswordForm
        role="user"
        onSubmit={handleChangePassword}
        loading={loading}
      />
    </div></>
  );
};

export default UserChangePasswordPage;
