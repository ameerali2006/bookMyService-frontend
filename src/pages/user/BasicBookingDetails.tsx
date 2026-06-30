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

interface DateAvailability {
  date: string;
  enabled: boolean;
  day: string;
  availableTimes: TimeRange[];
}

export default function BasicBookingDetails() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableTimes, setAvailableTimes] = useState<TimeRange[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [datesData, setDatesData] = useState<DateAvailability[]>([]);
  const navigate = useNavigate();
  const param = useParams();
  const workerId = param.workerId;

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);
        const response = await userService.getWorkerAvailability(
          workerId as string,
        );
        console.log(response);
        const { success, data } = response.data;

        if (success && data?.dates) {
          setDatesData(data.dates);
          const todayStr = getDateKey(selectedDate);
          const todayAvailability = data.dates.find(
            (d: DateAvailability) => d.date === todayStr,
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

    const selectedDateStr = getDateKey(date);
    const found = datesData.find((d: DateAvailability) => d.date === selectedDateStr);
    console.log("Selected:", selectedDateStr);

    console.log(
      datesData.map((d) => ({
        date: d.date,
        day: d.day,
      })),
    );
    if (found?.enabled) {
      setAvailableTimes(found.availableTimes);
    } else {
      setAvailableTimes([]);
    }
  };

  const handleTimeSelect = (t: string) => {
    setSelectedTime(t);
  };
  const getDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
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

      console.log(response);

      if (response.data.success) {
        console.log("1");
        SuccessToast(
          response.data.message || "Time slot selected successfully!",
        );

        navigate(`/services/preBooking/${response.data.bookingId}`);
      } else {
        console.log("2");
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
      <main className={cn("min-h-dvh w-full bg-slate-50 text-foreground pt-20")}>
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-10 pb-36">
          {loading ? (
            <p className="text-center text-slate-500 py-12">Loading availability...</p>
          ) : (
            <ChooseDateTime
              availableTimes={availableTimes}
              onTimeSelect={handleTimeSelect}
              onDateChange={handleDateChange}
              initialDate={selectedDate}
            />
          )}

          <div className="mt-8 rounded-3xl border border-slate-100 bg-white p-6 md:p-8 shadow-sm">
            <Label htmlFor="details" className="block text-base font-bold text-slate-800">
              Additional details
            </Label>
            <textarea
              id="details"
              placeholder="Please provide any additional details, special instructions, or service requirements..."
              className="mt-4 w-full min-h-40 resize-none rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-300"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 py-4 px-4 sm:px-6 lg:px-8 shadow-[0_-8px_24px_rgba(0,0,0,0.04)] z-40">
          <div className="max-w-5xl mx-auto">
            <button
              disabled={isProceedDisabled}
              onClick={handleProceed}
              className={cn(
                "w-full rounded-2xl py-4 text-base font-bold shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer",
                isProceedDisabled
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-yellow-400 text-slate-900 hover:bg-yellow-350 hover:scale-[1.01] active:scale-[0.99]",
              )}
            >
              Proceed
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
