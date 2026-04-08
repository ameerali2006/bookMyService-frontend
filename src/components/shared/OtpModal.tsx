import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { AxiosError, type AxiosResponse } from "axios";
import { ErrorToast } from "../shared/Toaster";
import { authService } from "@/api/AuthService";

type OtpModalProps = {
  isOpen: boolean;
  onFinalSubmit: () => void;
  onClose: () => void;
  email?: string;
  role:"user"|"worker"
  generateOtp?: (email: string) => Promise<AxiosResponse<any>>
  verifyOtp?: (otp: string, email: string,role:"user"|"worker") => Promise<any>;
};

export default function OtpModal({
  isOpen,
  onFinalSubmit,
  onClose,
  email = "",
  role,
  generateOtp,
  verifyOtp,
}: OtpModalProps) {
  const [otp, setOtp] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [timer, setTimer] = useState<number>(120);
  const [showResend, setShowResend] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setTimer(120);
    setShowResend(false);

    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          setShowResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    intervalRef.current = countdown;
    return countdown;
  };

  useEffect(() => {
    if (isOpen) {
      setOtp("");
      setError("");
      const countdown = startTimer();

      return () => {
        clearInterval(countdown);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isOpen]);

  const handleOtpChange = (value: string) => {
    setOtp(value);
    setError("");
  };

  const verifyOtpHandler = async () => {
    if (otp.length !== 4) {
      setError("Please enter a valid 4-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      console.log('here it is')
      const response = verifyOtp
        ? await verifyOtp(otp, email,role)
        : await authService.verifyOtp(otp, email,role);

      if (response?.data?.success) {
        onFinalSubmit();
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        if (err.response?.status === 409) {
          onClose();
          ErrorToast("User already exists");
        } else {
          setError(
            err.response?.data?.message || "Invalid OTP. Please try again."
          );
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const resendOtpHandler = async () => {
    try {
      if (generateOtp) {
        await generateOtp(email);
      } else {
        await authService.generateOtp(email);
      }
      startTimer();
    } catch (error) {
      console.error(error);
      setError("Failed to resend OTP. Please try again.");
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Enter OTP</DialogTitle>
          <DialogDescription className="text-lg">
            Please enter the 4-digit one-time password sent to{" "}
            {email || "your email"}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-6">
          <div className="flex justify-center">
            <InputOTP maxLength={4} value={otp} onChange={handleOtpChange}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div className="text-center">
            {!showResend ? (
              <p className="text-gray-600">
                Resend OTP in <strong>{formatTime(timer)}</strong>
              </p>
            ) : (
              <button
                className="text-blue-500 hover:underline text-sm"
                onClick={resendOtpHandler}
                disabled={loading}
              >
                Resend OTP
              </button>
            )}
          </div>

          <Button
            type="button"
            className="w-full"
            onClick={verifyOtpHandler}
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
