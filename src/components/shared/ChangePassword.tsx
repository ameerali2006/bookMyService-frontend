"use client";

import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormMessage, FormControl } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { Eye, EyeOff } from "lucide-react";

const schema = z
  .object({
    oldPassword: z.string().min(6, "Old password must be at least 6 characters."),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters.")
      
      .regex(/[a-z]/, "Must include at least one lowercase letter.")
      .regex(/[0-9]/, "Must include at least one number."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof schema>;

interface ChangePasswordFormProps {
  role: "user" | "worker";
  onSubmit: (data: ChangePasswordInput) => Promise<void>;
  loading?: boolean;
}

const getPasswordStrength = (password: string): number => {
  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (/[A-Z]/.test(password)) strength += 25;
  if (/[0-9]/.test(password)) strength += 25;
  if (/[^A-Za-z0-9]/.test(password)) strength += 25;
  return strength;
};

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  role,
  onSubmit,
  loading,
}) => {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = form.watch("newPassword");
  const strength = getPasswordStrength(newPassword);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5 w-full max-w-md mx-auto"
      >
        <h2 className="text-2xl font-semibold text-center">
          Change {role === "worker" ? "Worker" : "User"} Password
        </h2>

        {/* Old Password */}
        <FormField
          control={form.control}
          name="oldPassword"
          render={({ field }) => (
            <FormItem>
              <Label>Old Password</Label>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showOld ? "text" : "password"}
                    placeholder="Enter your old password"
                    {...field}
                  />
                  <div
                    onClick={() => setShowOld(!showOld)}
                    className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
                  >
                    {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* New Password */}
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <Label>New Password</Label>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showNew ? "text" : "password"}
                    placeholder="Enter your new password"
                    {...field}
                  />
                  <div
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
                  >
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </div>
              </FormControl>
              <Progress value={strength} className="h-2 mt-2" />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Confirm Password */}
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <Label>Confirm Password</Label>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm your new password"
                    {...field}
                  />
                  <div
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Changing..." : "Change Password"}
        </Button>
      </form>
    </Form>
  );
};

export default ChangePasswordForm;
