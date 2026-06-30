"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";

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
    } catch (error) {
      let errorMessage = "Wallet payment failed";
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      ErrorToast(errorMessage);
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
    <main className="min-h-[100dvh] bg-slate-50 pb-24">
      

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Address Selection */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 px-1">
              Select Service Address
            </h2>

            {addresses.length > 0 ? (
              <div className="space-y-4">
                <form className="space-y-4 max-h-[400px] overflow-y-auto pr-2" aria-label="Saved addresses">
                  {addresses.map((addr) => (
                    <label key={addr._id} className="block cursor-pointer">
                      <Card
                        className={cn(
                          "rounded-2xl p-5 border transition-all duration-200 bg-white shadow-sm hover:shadow-md",
                          selectedAddressId === addr._id
                            ? "border-blue-500 ring-2 ring-blue-50/50 bg-blue-50/10"
                            : "border-slate-100 hover:border-slate-200",
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <input
                            type="radio"
                            name="address"
                            className="mt-1 h-4 w-4 accent-blue-600 cursor-pointer"
                            checked={selectedAddressId === addr._id}
                            onChange={() => setSelectedAddressId(addr._id)}
                          />
                          <div className="space-y-1">
                            <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                              {addr.label}
                            </span>
                            <p className="text-sm text-slate-600 leading-relaxed mt-2">
                              {`${addr.buildingName}, ${addr.street}, ${addr.area}, ${addr.city}`}
                            </p>
                            <p className="text-xs text-slate-400 font-medium">
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
                  className="w-full h-11 border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition cursor-pointer font-semibold"
                  variant="outline"
                >
                  + Add New Address
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setShowAddAddressModal(true)}
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition cursor-pointer shadow-md"
              >
                + Add Address
              </Button>
            )}
          </div>

          {/* Right: Booking Details & Payment */}
          <div className="space-y-6">
            {/* Booking Details */}
            <Card className="rounded-3xl p-6 border border-slate-100 bg-white shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-50">
                Booking Details
              </h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div className="space-y-1">
                  <dt className="text-xs text-slate-400 font-medium uppercase tracking-wider">Worker Name</dt>
                  <dd className="text-slate-800 font-bold">{bookingDetails.workerName}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-xs text-slate-400 font-medium uppercase tracking-wider">Service Name</dt>
                  <dd className="text-slate-800 font-bold">{bookingDetails.serviceName}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-xs text-slate-400 font-medium uppercase tracking-wider">Date</dt>
                  <dd className="text-slate-600 font-semibold">{bookingDetails.date}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-xs text-slate-400 font-medium uppercase tracking-wider">Time</dt>
                  <dd className="text-slate-600 font-semibold">{bookingDetails.time}</dd>
                </div>
                <div className="sm:col-span-2 space-y-1 pt-2 border-t border-slate-50">
                  <dt className="text-xs text-slate-400 font-medium uppercase tracking-wider">Description</dt>
                  <dd className="text-slate-600 text-sm leading-relaxed italic">
                    "{bookingDetails.description || 'No instructions provided.'}"
                  </dd>
                </div>
                <div className="sm:col-span-2 flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
                  <dt className="font-bold text-slate-800">Total Price</dt>
                  <dd className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-xs">
                    To be decided after work
                  </dd>
                </div>
              </dl>
            </Card>

            {/* Bill Summary + Payment */}
            {!showStripePayment ? (
              <Card className="rounded-3xl p-6 bg-white border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-50">
                  Bill Summary
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Total Amount</span>
                    <span>₹--</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <span className="text-slate-800 font-semibold">Advance to Pay Now</span>
                    <span className="text-lg font-extrabold text-slate-900">
                      ₹{bookingDetails.advance}
                    </span>
                  </div>
                </div>

                {addresses.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full h-11 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition cursor-pointer font-bold"
                      onClick={handleWalletPay}
                      disabled={!selectedAddressId || isWalletPaying}
                    >
                      {isWalletPaying
                        ? "Processing..."
                        : `Pay ₹${bookingDetails.advance} via Wallet`}
                    </Button>
                    <Button
                      type="button"
                      className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition cursor-pointer font-bold shadow-md shadow-blue-100"
                      onClick={handleStripePay}
                      disabled={!selectedAddressId}
                    >
                      Pay ₹{bookingDetails.advance} via Card (Stripe)
                    </Button>
                  </div>
                )}
              </Card>
            ) : (
              // Replace Bill Summary with Stripe Payment
              clientSecret && (
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <PaymentWrapper
                    clientSecret={clientSecret}
                    paymentType="advance"
                    bookingId={bookingId}
                  />
                </div>
              )
            )}
          </div>
        </section>
      </div>

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
