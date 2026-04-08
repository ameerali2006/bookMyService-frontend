import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { userService } from "@/api/UserService";
import { ErrorToast } from "@/components/shared/Toaster";
import { generateBookingCode } from "@/utils/booking-convert";

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams<{ bookingId: string }>();
  const [searchParams] = useSearchParams();
  const rawType = searchParams.get("type");
  const type: "advance" | "final" = rawType === "advance" ? "advance" : "final";

  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);
  const confettiRef = useRef(false);

  useEffect(() => {
    if (!bookingId) return;

    const fetchPaymentData = async () => {
      try {
        const res = await userService.verifyPayment(bookingId, type);

        if (res.data.success) {
          setPaymentData(res.data.data);
        } else {
          ErrorToast(res.data.message || "Something went wrong");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, [bookingId]);

  useEffect(() => {
    if (confettiRef.current || loading) return;

    confettiRef.current = true;
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
  }, [loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-semibold">
        Verifying payment...
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500 font-bold">
        Payment verification failed.
      </div>
    );
  }

  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(paymentData.amountPaid || 34.09);

  const msg =
    paymentData.type === "advance"
      ? {
          title: "Advance Payment Successful",
          subtitle: "Your advance payment has been confirmed",
        }
      : {
          title: "Payment Completed",
          subtitle: "Your booking is fully paid",
        };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted p-3">
      <Card className="w-full max-w-md shadow-xl rounded-2xl border animate-in fade-in zoom-in duration-500">
        <CardContent className="p-6 text-center space-y-6">
          
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold">{msg.title}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {msg.subtitle}
            </p>
          </div>

          {/* Amount Highlight */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Amount Paid</p>
            <h2 className="text-3xl font-bold text-green-600">
              {formattedAmount}
            </h2>
          </div>

          {/* Divider */}
          <div className="border-t" />

          {/* Details */}
          <div className="space-y-3 text-sm">
            <Info label="Booking ID" value={generateBookingCode(bookingId?.toString() as string)} />
            <Info label="Payment Type" value={paymentData.type} />
            <Info label="Status" value="Success" highlight />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={() => navigate(`/bookings/${bookingId}`)}
              size="lg"
              className="w-full"
            >
              View Booking
            </Button>

            <Button
              onClick={() => navigate("/")}
              variant="outline"
              size="lg"
              className="w-full"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Info = ({
  label,
  value,
  highlight,
}: {
  label: string;
  value: any;
  highlight?: boolean;
}) => (
  <div className="flex justify-between items-center">
    <span className="text-muted-foreground">{label}</span>
    <span
      className={`font-medium ${
        highlight ? "text-green-600 font-semibold" : ""
      }`}
    >
      {value}
    </span>
  </div>
);

export default PaymentSuccessPage;