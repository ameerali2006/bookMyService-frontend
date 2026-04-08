"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, ShieldCheck, CameraOff } from "lucide-react";
import { workerService } from "@/api/WorkerService";
import { ErrorToast } from "@/components/shared/Toaster";

interface Props {
  bookingId: string;
  onVerified?: (otp: string) => void;
}
export function OtpQrVerification({ bookingId, onVerified }: Props) {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const qrRef = useRef<Html5Qrcode | null>(null);

  /* ---------------- OTP INPUT ---------------- */
  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  /* ---------------- VERIFY OTP ---------------- */
  const verifyOtp = async (code: string) => {
    if (code.length !== 4) return ErrorToast("Invalid OTP");

    try {
      setLoading(true);
      // await workerService.verifyBookingOtp(bookingId, code)
      onVerified?.(code);
    } catch {
      ErrorToast("OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- START CAMERA SCAN ---------------- */
  const startScan = async () => {
    try {
      setScanning(true);

      // wait for qr-reader to render
      await new Promise((r) => setTimeout(r, 100));

      const el = document.getElementById("qr-reader");
      if (!el) {
        setScanning(false);
        return ErrorToast("Scanner not ready");
      }

      // cleanup previous instance
      if (qrRef.current) {
        await qrRef.current.stop();
        qrRef.current.clear();
        qrRef.current = null;
      }

      const qr = new Html5Qrcode("qr-reader");
      qrRef.current = qr;

      await qr.start(
        {
          facingMode: "environment", // ✅ NOT exact
        },
        {
          fps: 10,
          qrbox: 250,
        },
        async (decodedText) => {
          console.log("QR Raw:", decodedText);

          await qr.stop();
          qr.clear();
          qrRef.current = null;
          setScanning(false);

          // ✅ Parse QR JSON
          const parsed = JSON.parse(decodedText);

          const otp = parsed?.otp;

          // ✅ Validate OTP
          if (typeof otp === "string" && /^\d{4}$/.test(otp)) {
            setOtp(otp.split(""));
            verifyOtp(otp);
          } else {
            ErrorToast("Invalid OTP in QR");
          }
        },
        (errorMessage) => {
          // REQUIRED by TypeScript
          // You can safely ignore scan errors
          // console.debug("QR scan error:", errorMessage)
        }
      );
    } catch (err: any) {
      console.error("Camera error:", err);

      if (err.name === "OverconstrainedError") {
        ErrorToast("Rear camera not available. Using default camera.");
        fallbackCamera();
      } else if (err.name === "NotAllowedError") {
        ErrorToast("Camera permission denied");
      } else {
        ErrorToast("Failed to open camera");
      }

      setScanning(false);
    }
  };
  const fallbackCamera = async () => {
    try {
      const qr = new Html5Qrcode("qr-reader");
      qrRef.current = qr;

      await qr.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          await qr.stop();
          qr.clear();
          qrRef.current = null;
          setScanning(false);

          const code = decodedText.trim();

          if (/^\d{4}$/.test(code)) {
            setOtp(code.split(""));
            verifyOtp(code);
          } else {
            ErrorToast("Invalid QR code");
          }
        },
        () => {
          // qrCodeErrorCallback (required by TS, safe to ignore)
        }
      );
    } catch {
      ErrorToast("No usable camera found");
    }
  };

  /* ---------------- STOP CAMERA ---------------- */
  const stopScan = async () => {
    if (qrRef.current) {
      await qrRef.current.stop();
      qrRef.current.clear();
      qrRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScan();
    };
  }, []);

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          User Verification
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* LEFT → QR SCANNER */}
          <div className="border rounded-lg p-4 bg-background flex flex-col items-center">
            {!scanning ? (
              <>
                <QrCode className="h-16 w-16 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Scan QR shown on user device
                </p>
                <Button onClick={startScan} variant="outline">
                  Open Camera
                </Button>
              </>
            ) : (
              <>
                <div
                  id="qr-reader"
                  className="w-full rounded-md overflow-hidden"
                />
                <Button
                  onClick={stopScan}
                  variant="destructive"
                  size="sm"
                  className="mt-3 gap-2"
                >
                  <CameraOff className="h-4 w-4" />
                  Stop Scan
                </Button>
              </>
            )}
          </div>

          {/* RIGHT → OTP INPUT */}
          <div className="flex flex-col items-center justify-center">
            <p className="text-sm font-medium mb-3">
              Enter 4-digit OTP manually
            </p>

            <div className="flex gap-3 mb-4">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => {
                    inputsRef.current[index] = el;
                  }}
                  value={digit}
                  maxLength={1}
                  onChange={(e) => handleChange(e.target.value, index)}
                  className="h-14 w-14 text-center text-xl font-bold"
                />
              ))}
            </div>

            <Button
              disabled={loading}
              onClick={() => verifyOtp(otp.join(""))}
              className="w-full max-w-xs"
            >
              Verify OTP
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
