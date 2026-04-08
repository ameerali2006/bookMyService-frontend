"use client";

import ChooseDateTime, {
  type TimeRange,
} from "@/components/user/ServiceListing/DateTimeSelect";
import { cn } from "@/lib/utils";
import Header from "@/components/user/shared/Header";
import { Label } from "@/components/ui/label";
import { userService } from "@/api/UserService";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ErrorToast, SuccessToast } from "@/components/shared/Toaster";

export default function BasicBookingDetails() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableTimes, setAvailableTimes] = useState<TimeRange[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [datesData, setDatesData] = useState<any[]>([]);
  const navigate=useNavigate()
  const param = useParams();
  const workerId = param.workerId;

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);
        const response = await userService.getWorkerAvailability(
          workerId as string
        );
        console.log(response)
        const { success, data } = response.data;

        if (success && data?.dates) {
          setDatesData(data.dates);
          const todayStr = selectedDate.toISOString().split("T")[0];
          const todayAvailability = data.dates.find(
            (d: any) => d.date === todayStr
          );
          setAvailableTimes(todayAvailability?.availableTimes || []);
        } else {
          setDatesData([]);
          setAvailableTimes([]);
        }
      } catch (err) {
        console.error("Error fetching availability:", err);
        setAvailableTimes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [workerId]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);

    const selectedDateStr = date.toISOString().split("T")[0];
    const found = datesData.find((d: any) => d.date === selectedDateStr);

    if (found?.enabled) {
      setAvailableTimes(found.availableTimes);
    } else {
      setAvailableTimes([]);
    }
  };

  const handleTimeSelect = (t: string) => {
    setSelectedTime(t);
  };

  const handleProceed = async () => {
    try {
      if (!workerId) {
        ErrorToast("Worker not found. Please try again.");
        return;
      }

      if (!selectedTime) {
        ErrorToast("Please select a time slot before proceeding.");
        return;
      }

      const data = {
        date: selectedDate,
        time: selectedTime,
        description,
        workerId,
      };

      setLoading(true);

      const response = await userService.selectDateTimeAvailablity(data);
      
      console.log(response)

      if (response.data.success) {
        console.log("1")
        SuccessToast(response.data.message||"Time slot selected successfully!");
        
        navigate(`/services/preBooking/${response.data.bookingId}`);
      } else {
        console.log('2')
        ErrorToast(response.data.message || "Failed to confirm time slot.");
      }
    } catch (error) {
      console.error(error);
      ErrorToast("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isProceedDisabled =
    !selectedDate || !selectedTime || description.trim().length === 0;

  return (
    <>
      <Header />
      <main className={cn("min-h-dvh w-full bg-background text-foreground")}>
        <div className="mx-auto w-full max-w-5xl px-6 py-10 pt-20 pb-36">
          {loading ? (
            <p className="text-center text-gray-500">Loading availability...</p>
          ) : (
            <ChooseDateTime
              availableTimes={availableTimes}
              onTimeSelect={handleTimeSelect}
              onDateChange={handleDateChange}
              initialDate={selectedDate}
            />
          )}

          <div className="mt-8 rounded-lg border border-border bg-card p-6 shadow-sm">
            <Label htmlFor="details" className="block text-base font-medium">
              Additional details
            </Label>
            <textarea
              id="details"
              placeholder="Enter details here"
              className="mt-2 w-full min-h-40 resize-none rounded-xl bg-white p-3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="fixed bottom-0 left-0 w-full bg-white py-3 shadow-md">
          <button
            disabled={isProceedDisabled}
            onClick={handleProceed}
            className={cn(
              "mx-auto block w-[800px] rounded-2xl px-8 py-4 text-xl font-semibold shadow-lg transition",
              isProceedDisabled
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-yellow-400 text-blue-900 hover:bg-yellow-500"
            )}
          >
            Proceed
          </button>
        </div>
      </main>
    </>
  );
}
