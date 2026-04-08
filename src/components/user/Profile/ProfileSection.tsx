"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit3, Save, X, Loader2, KeyRound } from "lucide-react";
import { userService } from "@/api/UserService";
import {
  ErrorToast,
  SuccessToast,
  WarningToast,
} from "@/components/shared/Toaster";
import CropImageModal from "@/components/shared/ImageCropModal.";
import { uploadToCloudinary } from "@/lib/cloudinaryService";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  image?: string;
}

export function ProfileSection() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    image: "",
  });
  const [originalData, setOriginalData] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    image: "",
  });
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [isCropOpen, setIsCropOpen] = useState(false);
  const navigate=useNavigate()

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await userService.getUserDetails();
      if (response?.data?.user) {
        setFormData(response.data.user);
        setOriginalData(response.data.user);
      } else {
        ErrorToast(response?.data?.message || "User data not found");
      }
    } catch (error) {
      console.error(error);
      ErrorToast("Invalid Profile, Try again");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: { name?: string; phone?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (!/^[A-Za-z\s]+$/.test(formData.name.trim())) {
      newErrors.name = "Name can only contain letters";
    } else if (
      formData.name.trim().length < 3 ||
      formData.name.trim().length > 20
    ) {
      newErrors.name = "Name must be between 3 and 20 characters";
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleCropComplete = async (file: File) => {
    try {
      setSaving(true);
      console.log("Uploading to Cloudinary...");

      const newImageUrl = await uploadToCloudinary(file,"user-image");
      console.log("Image uploaded:", newImageUrl);

      const updatedData = { ...formData, image: newImageUrl };
      const response = await userService.updateUserDetails(updatedData);

      if (response.data.success) {
        setFormData(updatedData);
        setOriginalData(updatedData);
        SuccessToast("Profile photo updated successfully");
      } else {
        ErrorToast("Failed to update photo");
      }
    } catch (err) {
      console.error(err);
      ErrorToast("Error uploading image");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    if (JSON.stringify(formData) === JSON.stringify(originalData)) {
      WarningToast("No changes made to your profile");
      setIsEditing(false);
      return;
    }

    try {
      setSaving(true);
      const response = await userService.updateUserDetails(formData);

      if (!response?.data?.success) {
        setFormData(originalData);
        ErrorToast(response?.data?.message || "User editing failed");
      } else {
        setOriginalData(formData);
        SuccessToast("User profile updated successfully");
      }
    } catch (error) {
      console.error(error);
      ErrorToast("Something went wrong while updating your profile");
    } finally {
      setSaving(false);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setErrors({});
    setIsEditing(false);
  };

  if (loading) {
    return (
      <p className="text-center text-muted-foreground">Loading profile...</p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and account settings.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Personal Information</CardTitle>
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <Edit3 className="h-4 w-4" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="flex items-center gap-2 bg-transparent"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={
                  formData?.image ||
                  "https://i.pinimg.com/736x/e5/9e/51/e59e51dcbba47985a013544769015f25.jpg"
                }
              />
              <AvatarFallback className="text-lg">
                {formData?.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-foreground">Profile Picture</h3>
              <p className="text-sm text-muted-foreground">
                Upload a new profile picture to personalize your account.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 bg-transparent"
                onClick={() => setIsCropOpen(true)}
              >
                Change Photo
              </Button>

              <CropImageModal
                open={isCropOpen}
                onClose={() => setIsCropOpen(false)}
                onCropComplete={handleCropComplete}
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              {isEditing ? (
                <>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </>
              ) : (
                <p className="text-foreground font-medium">{formData.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled={true}
                />
              ) : (
                <p className="text-foreground font-medium">{formData.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              {isEditing ? (
                <>
                  <Input
                    id="phone"
                    placeholder={formData.phone ? "" : "Add your Phone"}
                    value={formData.phone || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone}</p>
                  )}
                </>
              ) : (
                <p className="text-foreground font-medium">
                  {formData.phone || "Add your Phone..."}
                </p>
              )}
            </div>
          </div>
          <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={()=>navigate('/profile/change-password')}
        >
            <KeyRound className="w-4 h-4" />
            Change Password
      </Button>
        </CardContent>
      </Card>
    </div>
  );
}
