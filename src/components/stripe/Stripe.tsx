"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ErrorToast, SuccessToast } from "../shared/Toaster";

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

/* -------------------------- Payment Form Component -------------------------- */
const PaymentForm = ({
  bookingId,
  paymentType,
}: {
  bookingId: string;
  paymentType: "advance" | "final";
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [isPaymentValid, setIsPaymentValid] = useState(false);

  const handlePayment = async () => {
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // ⭐ IMPORTANT: Redirect to SUCCESS PAGE
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: "if_required",
      });

      const { error, paymentIntent } = result;

      if (error) {
        ErrorToast(error.message || "Payment failed");
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        SuccessToast(
          `${paymentType === "advance" ? "Advance" : "Final"} payment successful!`
        );

        // ⭐ Redirect WITH booking info
        setTimeout(() => {
          window.location.href = `/booking/${bookingId}/success?type=${paymentType}`;
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      ErrorToast("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-center">
          Complete Payment
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <PaymentElement
          options={{
            layout: "tabs",
            paymentMethodOrder: ["card", "apple_pay", "google_pay"],
          }}
          onChange={(e) => setIsPaymentValid(e.complete)}
        />

        <Button
          onClick={handlePayment}
          disabled={!stripe || !elements || !isPaymentValid || loading}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg"
        >
          {loading ? "Processing..." : "Pay Now"}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          🔒 Secure payment powered by Stripe
        </p>
      </CardContent>
    </Card>
  );
};

/* -------------------------- Payment Wrapper Component -------------------------- */
export const PaymentWrapper = ({
  clientSecret,
  bookingId,
  paymentType,
}: {
  clientSecret: string;
  bookingId: string;
  paymentType: "advance" | "final";
}) => {
  const appearance = {
    theme: "stripe" as const,
    variables: {
      colorPrimary: "#2563eb",
      borderRadius: "8px",
    },
  };

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
      {/* ⭐ Pass required props */}
      <PaymentForm bookingId={bookingId} paymentType={paymentType} />
    </Elements>
  );
};
