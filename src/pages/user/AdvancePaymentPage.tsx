"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { userService } from "@/api/UserService";
import AddAddressModal from "@/components/user/Profile/AddAddress";

import { useParams } from "react-router-dom";
import { PaymentWrapper } from "@/components/stripe/Stripe";
import { ErrorToast, SuccessToast } from "@/components/shared/Toaster";


export type AddressLabel = "Home" | "Work" | "Shop";
type Address = {
  _id: string;
  label: AddressLabel;
  buildingName: string;
  street: string;
  area: string;
  city: string;
  state: string;
  phone: string;
  country: string;
  pinCode: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  isPrimary: boolean;
};

export default function AdvancePaymentPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showStripePayment, setShowStripePayment] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isWalletPaying, setIsWalletPaying] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<{
    workerName: string;
    serviceName: string;
    date: string;
    time: string;
    description: string;
    totalPrice: number;
    advance: number;
  } | null>(null);
  const param = useParams();
  const bookingId = param.bookingId;

  if (!bookingId) {
    return (
      <>
        <div className="w-full border-b border-border bg-background">
        
        </div>
        {/* <NotFoundPage/> */}
        
      </>
    );
  }

  useEffect(() => {
    if (bookingId) {
      fetchAddresses();
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      console.log(bookingId);
      const res = await userService.getBookingDetails(bookingId as string);
      console.log(res);
      if (res.data.details) {
      const data = res.data.details;

      // 🚀 KEY FIX HERE
      if (data.advancePaymentStatus === "paid") {
        window.location.replace(`/booking/${bookingId}/success?type=advance`);
        return;
      }

      setBookingDetails(data);
    }
    } catch (err) {
      console.error("Failed to fetch booking details:", err);
    }
  };
  const fetchAddresses = async () => {
    try {
      const res = await userService.getUserAddress();
      if (res.data.addresses && res.data.addresses.length > 0) {
        setAddresses(res.data.addresses);
        const primary =
          res.data.addresses.find((a: Address) => a.isPrimary) ||
          res.data.addresses[0];

        setSelectedAddressId(primary._id);
      }
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
    }
  };
  if (!bookingDetails) {
    return <p>Loading booking details...</p>;
  }
  const selectedAddress = addresses.find((a) => a._id === selectedAddressId);

  const handleWalletPay = async () => {
    try {
      if (!bookingId) {
        ErrorToast("Booking not found");
        return;
      }

      setIsWalletPaying(true);

      const res = await userService.walletPayment({
        bookingId,
        addressId: selectedAddressId,
        paymentType: "advance",
      });

      if (res.data.success) {
        SuccessToast(res.data.message);
        fetchBookingDetails()
        setTimeout(() => {
          window.location.href = `/booking/${bookingId}/success?type=advance`;
        }, 1200);
      } else {
        ErrorToast(res.data.message);
      }
    } catch (error: any) {
      ErrorToast(error?.response?.data?.message || "Wallet payment failed");
    } finally {
      setIsWalletPaying(false);
    }
  };

  const handleStripePay = async () => {
    try {
      const bookingId = param.bookingId;
      if (!bookingId) {
        ErrorToast("booking detalils not fount ");
        return;
      }

      const res = await userService.createPaymentIntent({
        amount: bookingDetails.advance * 100,
        currency: "inr",
        description: "Advance payment",
        metadata: {
          bookingId,
          addressId: selectedAddressId,
          paymentType: "advance",
        },
      });

      setClientSecret(res.data.clientSecret);
      setShowStripePayment(true);
    } catch (err) {
      console.log(err);
      ErrorToast("Failed to initialize Stripe payment");
    }
  };

  return (
    <main className="min-h-[100dvh] bg-white">
      <div className="w-full border-b border-border bg-background">
        
      </div>

      <section className="mx-auto max-w-6xl grid grid-cols-1 pt-20 md:grid-cols-2 gap-6 p-6 bg-white">
        {/* Left: Address Selection */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground text-pretty">
            Select Address
          </h2>

          {addresses.length > 0 ? (
            <>
              <form   className="space-y-3 max-h-[350px] overflow-y-auto pr-2"
  aria-label="Saved addresses">
                {addresses.map((addr) => (
                  <label key={addr._id} className="block">
                    <Card
                      className={cn(
                        "shadow-lg rounded-2xl p-4 border border-border transition-colors cursor-pointer bg-white",
                        selectedAddressId === addr._id
                          ? "ring-2 ring-ring bg-gray-300"
                          : "hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="address"
                          className="mt-1 h-4 w-4 accent-yellow-400"
                          checked={selectedAddressId === addr._id}
                          onChange={() => setSelectedAddressId(addr._id)}
                        />
                        <div className="space-y-1">
                          <p className="font-medium">{addr.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {`${addr.buildingName}, ${addr.street}, ${addr.area}, ${addr.city}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Phone: {addr.phone}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </label>
                ))}
              </form>

              {/* Add Address Button */}
              <Button
                onClick={() => setShowAddAddressModal(true)}
                className="w-full mt-2"
                variant="outline"
              >
                + Add New Address
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setShowAddAddressModal(true)}
              className="w-full"
            >
              + Add Address
            </Button>
          )}
        </div>

        {/* Right: Booking Details & Payment */}
        <div className="space-y-6 ">
          {/* Booking Details */}
          <Card className="shadow-lg rounded-2xl p-4  border border-border bg-gray-50">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Booking Details
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <dt className="text-muted-foreground">Worker Name</dt>
                <dd className="text-foreground">{bookingDetails.workerName}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-muted-foreground">Service Name</dt>
                <dd className="text-foreground">
                  {bookingDetails.serviceName}
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-muted-foreground">Date</dt>
                <dd className="text-foreground">{bookingDetails.date}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-muted-foreground">Time</dt>
                <dd className="text-foreground">{bookingDetails.time}</dd>
              </div>
              <div className="sm:col-span-2 space-y-1">
                <dt className="text-muted-foreground">Description</dt>
                <dd className="text-foreground">
                  {bookingDetails.description}
                </dd>
              </div>
              <div className="sm:col-span-2 flex items-center justify-between pt-2 border-t border-border">
                <dt className="font-medium text-foreground">Total Price</dt>
                <dd className="font-semibold text-foreground">
                  To be decided after work
                </dd>
              </div>
            </dl>
          </Card>

          {/* Bill Summary + Payment */}
          {!showStripePayment ? (
            <Card className="shadow-lg rounded-2xl p-4 bg-gray-100 border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Bill Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="text-foreground">₹--</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Advance to Pay Now
                  </span>
                  <span className="font-semibold text-foreground">
                    ₹{bookingDetails.advance}
                  </span>
                </div>
              </div>

              {addresses.length > 0 && (
                <div className="mt-4 space-y-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full hover:bg-gray-300"
                    onClick={handleWalletPay}
                    disabled={!selectedAddressId || isWalletPaying}
                  >
                    {isWalletPaying
                      ? "Processing..."
                      : `Pay ₹${bookingDetails.advance} via Wallet`}
                  </Button>
                  <Button
                    type="button"
                    className="w-full bg-blue-900 hover:bg-blue-800"
                    onClick={handleStripePay} // <── FIXED
                    disabled={!selectedAddressId}
                  >
                    Pay ₹{bookingDetails.advance} via Stripe
                  </Button>
                </div>
              )}
            </Card>
          ) : (
            // Replace Bill Summary with Stripe Payment
            clientSecret && (
              <PaymentWrapper
                clientSecret={clientSecret}
                paymentType="advance"
                bookingId={bookingId}
              />
            )
          )}
        </div>
      </section>

      {showAddAddressModal && (
        <AddAddressModal
          open={showAddAddressModal}
          onClose={() => {
            setShowAddAddressModal(false);
            fetchAddresses();
          }}
        />
      )}

      
    </main>
  );
}
