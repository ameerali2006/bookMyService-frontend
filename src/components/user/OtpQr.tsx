"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QrCode, ShieldCheck } from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"

interface Props {
  otp: string
}

export function OtpQrCard({ otp }: Props) {
  // ✅ You can encode more data if needed
  const qrPayload = JSON.stringify({
    otp,
    type: "BOOKING_OTP",
    issuedAt: Date.now(),
  })

  return (
    <Card className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="text-blue-600" />
        <h3 className="text-lg font-bold text-slate-900">
          Service Verification
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* QR SECTION */}
        <div className="flex flex-col items-center">
          <div className="bg-white p-4 rounded-xl shadow border">
            <QRCodeCanvas
              value={qrPayload}
              size={160}
              level="H"
              includeMargin
            />
          </div>
          <p className="mt-2 text-sm text-slate-600 flex items-center gap-1">
            <QrCode size={14} />
            Worker can scan this QR
          </p>
        </div>

        {/* OTP SECTION */}
        <div className="flex flex-col items-center md:items-start">
          <p className="text-sm text-slate-500 font-semibold uppercase">
            Or share OTP
          </p>

          <div className="mt-2 flex gap-2">
            {otp.split("").map((digit, index) => (
              <div
                key={index}
                className="w-12 h-12 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-xl font-bold text-slate-900 shadow"
              >
                {digit}
              </div>
            ))}
          </div>

          <Badge className="mt-3 bg-emerald-100 text-emerald-700">
            Valid until worker starts service
          </Badge>
        </div>
      </div>
    </Card>
  )
}
