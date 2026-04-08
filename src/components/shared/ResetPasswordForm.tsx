import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { authService } from "@/api/AuthService";
import { ErrorToast, WarningToast } from "./Toaster";

interface ResetPasswordFormProps {
  role: "user" | "worker";
  token?: string;
  onBack?: () => void;
  onSuccess?: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ role, token, onBack, onSuccess }) => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!password || !confirmPassword) return setErrorMessage("Please fill in all fields.");
    if (password.length < 8) return setErrorMessage("Password must be at least 8 characters long.");
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) return setErrorMessage("Password must contain both letters and numbers.");
    if (password !== confirmPassword) return setErrorMessage("Passwords do not match.");
    if (!token) return setErrorMessage("Token not found.");

    setLoading(true);
    try {
      const result=await (role === "user" ? authService.userResetPassword : authService.workerResetPassword)({ token, password, confirmPassword });
      if(!result.data.success){
        ErrorToast(result.data.message)
      }
      setResetSuccess(true);
      onSuccess?.();
    } catch (error: any) {
      setErrorMessage(error?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToLogin = () => {
    navigate(role === "user" ? "/login" : "/worker/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
        <h2 className="text-2xl font-bold text-center mb-6 text-indigo-700">Reset Password</h2>

        {!resetSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMessage && (
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200">{errorMessage}</p>
            )}

            <div>
              <Label htmlFor="password">New Password</Label>
              <div className="relative mt-1">
                <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter new password" className="pr-10" />
                <span onClick={() => setShowPassword((prev) => !prev)} className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500 hover:text-gray-700">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative mt-1">
                <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="pr-10" />
                <span onClick={() => setShowConfirmPassword((prev) => !prev)} className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500 hover:text-gray-700">
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              {onBack && (
                <Button type="button" variant="outline" onClick={onBack}>Back</Button>
              )}
              <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-5">
            <p className="text-green-600 font-medium">Your password has been reset successfully!</p>
            <Button onClick={handleNavigateToLogin} className="bg-indigo-600 hover:bg-indigo-700">Continue to Login</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordForm;
