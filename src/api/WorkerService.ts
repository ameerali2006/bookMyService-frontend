import type { ChangePasswordInput } from "@/components/shared/ChangePassword";
import workerAxios from "@/config/axiosSevice/WorkerAxios";
import type { WalletTransactionQuery } from "@/interface/shared/wallet";
type Break = {
  label: string;
  breakStart: string;
  breakEnd: string;
};
interface AdditionalItem {
  name: string;
  price: number;
}

interface ApprovalData {
  bookingId: string;
  serviceName: string;
  durationHours: number;
  distance: number;
  additionalItems?: AdditionalItem[];
  additionalNotes?: string;
}
export interface IRequestFilters {
  search?: string;
  status: "pending" | "approved" | "rejected";
  date?: string;
  page?: number;
  limit?: number;
}
type DaySchedule = {
  day: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
  breaks: Break[];
};
interface ICustomSlot {
  date: Date;
  startTime: string;
  endTime: string;
}
interface IHoliday {
  date: Date;
  reason?: string;
}
export type PayLoad = {
  days: DaySchedule[];
};
export const workerService = {
  getWorkingDetails: async (email: string) => {
    return await workerAxios.get(`/profile/slot?email=${email}`);
  },
  updateWorkingDetails: async (email: string, payload: PayLoad) => {
    return await workerAxios.post(`/profile/slot/update`, { email, payload });
  },
  getProfileDetails: async () => {
    return await workerAxios.get(`/profile/details`);
  },
  updateProfileDetails: async (payload: {
    name?: string;
    phone?: string;
    experience?: string;
    description?:string
    skills?:string[]
    fees?: number;
    image?: string;
  }) => {
    console.log(payload);
    return await workerAxios.put(`/profile/update`, payload);
  },
  changePassword: async (payload: ChangePasswordInput) => {
    return await workerAxios.put(`/profile/changePassword`, payload);
  },
  getCalenderData: async () => {
    return await workerAxios.get(`/calender/getData`);
  },
  updateCalenderData: async (data: {
    holidays: IHoliday[];
    customSlots: ICustomSlot[];
  }) => {
    return await workerAxios.put("/calender/update", data);
  },
  serviceApprove: async (data: ApprovalData) => {
    return await workerAxios.put("/service/approve", data);
  },
  serviceReject: async (data: { description: string; bookingId: string }) => {
    return await workerAxios.put("/service/reject", data);
  },
  serviceRequest: async (data: IRequestFilters) => {
    return await workerAxios.get(`/service/requests`, { params: data });
  },
  getApprovedServices: async (params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
  }) => {
    return await workerAxios.get(`/service/approveds`, { params });
  },
  getBookingDetails: async (bookingId: string) => {
    return await workerAxios.get(`/service/approveds/${bookingId}`);
  },
  reachedCustomerLocation: async (bookingId: string) => {
    return await workerAxios.get(`/service/reach-location/${bookingId}`);
  },
  verifyWorker: async (bookingId: string, otp: string) => {
    return await workerAxios.put("/service/verify-worker", { bookingId, otp });
  },
  workComplated: async (bookingId: string) => {
    return await workerAxios.patch("/service/work-complated", { bookingId });
  },
  allBookings: async (params: {
    page: number;
    limit: number;
    search?: string;
    statuses?: string[];
    workerResponses?: ("accepted" | "rejected" | "pending")[];
    from?: Date;
    to?: Date;
  }) => {
    return await workerAxios.get("/service/allBookings", {
      params: {
        page: params.page,
        limit: params.limit,
        search: params.search,
        statuses: params.statuses?.join(","),
        workerResponses: params.workerResponses?.join(","),
        from: params.from,
        to: params.to,
      },
    });
  },
  workerWalletData: async () => {
    return await workerAxios.get("/profile/walletData");
  },
  getWorkerTransactions: async (query: WalletTransactionQuery) => {
    return await workerAxios.get(`/profile/transactions`, { params: query });
  },
  getWorkerInbox: async (workerId: string) => {
    return await workerAxios.get("/chat/chatInbox", { params: { workerId } });
  },
  chatHistory: async (chatId: string, limit: number, skip: number) => {
    console.log("cahjdsfjdsfjds");
    return await workerAxios.get(`/chat/chatHistory`, {
      params: { chatId, limit, skip },
    });
  },
  getDashboard: async () => {
    return await workerAxios.get("/dashboard");
  },
  getNotifications: async () => {
      return await workerAxios.get("/notifications");
    },
  
    markAsRead: async (notificationId: string) => {
      return await workerAxios.patch(`/notifications/${notificationId}/read`);
    },
  
   
    markAllAsRead: async () => {
      return await workerAxios.patch("/notifications/read-all");
    },
};
