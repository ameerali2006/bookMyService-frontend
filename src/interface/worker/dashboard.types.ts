export interface TodayScheduleItem {
  bookingId: string;
  time: string;
  service: string;
  clientName: string;
  status: "completed" | "in-progress" | "confirmed" | "pending";
}

export interface WorkerDashboardResponse {
  workerStatus: "approved" | "pending" | "rejected";

  stats: {
    totalJobs: number;
    monthlyEarnings: number;
    upcomingJobs: number;
    averageRating: number;
    totalReviews: number;
    todayJobs: number;
    efficiency: number;
    satisfaction: number;
  };

  todaySchedule: TodayScheduleItem[];
}
