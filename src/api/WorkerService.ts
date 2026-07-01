import type { ChangePasswordInput } from "@/components/shared/ChangePassword";
import workerAxios from "@/config/axiosSevice/WorkerAxios";
import type { WalletTransactionQuery } from "@/interface/shared/wallet";
import { API_ROUTES } from "@/constants/apiRoutes";

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
    return await workerAxios.get(API_ROUTES.WORKER.GET_SLOT(email));
  },
  updateWorkingDetails: async (email: string, payload: PayLoad) => {
    return await workerAxios.post(API_ROUTES.WORKER.UPDATE_SLOT, { email, payload });
  },
  getProfileDetails: async () => {
    return await workerAxios.get(API_ROUTES.WORKER.DETAILS);
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
    return await workerAxios.put(API_ROUTES.WORKER.UPDATE, payload);
  },
  changePassword: async (payload: ChangePasswordInput) => {
    return await workerAxios.put(API_ROUTES.WORKER.CHANGE_PASSWORD, payload);
  },
  getCalenderData: async () => {
    return await workerAxios.get(API_ROUTES.WORKER.CALENDAR_GET);
  },
  updateCalenderData: async (data: {
    holidays: IHoliday[];
    customSlots: ICustomSlot[];
  }) => {
    return await workerAxios.put(API_ROUTES.WORKER.CALENDAR_UPDATE, data);
  },
  serviceApprove: async (data: ApprovalData) => {
    return await workerAxios.put(API_ROUTES.BOOKING.SERVICE_APPROVE, data);
  },
  serviceReject: async (data: { description: string; bookingId: string }) => {
    return await workerAxios.put(API_ROUTES.BOOKING.SERVICE_REJECT, data);
  },
  serviceRequest: async (data: IRequestFilters) => {
    return await workerAxios.get(API_ROUTES.BOOKING.SERVICE_REQUESTS, { params: data });
  },
  getApprovedServices: async (params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
  }) => {
    return await workerAxios.get(API_ROUTES.BOOKING.SERVICE_APPROVEDS, { params });
  },
  getBookingDetails: async (bookingId: string) => {
    return await workerAxios.get(API_ROUTES.BOOKING.SERVICE_APPROVEDS_DETAILS(bookingId));
  },
  reachedCustomerLocation: async (bookingId: string) => {
    return await workerAxios.get(API_ROUTES.BOOKING.REACH_LOCATION(bookingId));
  },
  verifyWorker: async (bookingId: string, otp: string) => {
    return await workerAxios.put(API_ROUTES.BOOKING.VERIFY_WORKER, { bookingId, otp });
  },
  workComplated: async (bookingId: string) => {
    return await workerAxios.patch(API_ROUTES.BOOKING.WORK_COMPLETED, { bookingId });
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
    return await workerAxios.get(API_ROUTES.BOOKING.ALL_BOOKINGS, {
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
    return await workerAxios.get(API_ROUTES.WORKER.WALLET_DATA);
  },
  getWorkerTransactions: async (query: WalletTransactionQuery) => {
    return await workerAxios.get(API_ROUTES.WORKER.TRANSACTIONS, { params: query });
  },
  getWorkerInbox: async (workerId: string) => {
    return await workerAxios.get(API_ROUTES.CHAT.INBOX, { params: { workerId } });
  },
  chatHistory: async (chatId: string, limit: number, skip: number) => {
    console.log("cahjdsfjdsfjds");
    return await workerAxios.get(API_ROUTES.CHAT.HISTORY, {
      params: { chatId, limit, skip },
    });
  },
  getDashboard: async () => {
    return await workerAxios.get(API_ROUTES.DASHBOARD.WORKER);
  },
  getNotifications: async () => {
      return await workerAxios.get(API_ROUTES.NOTIFICATION.GET);
    },
  
    markAsRead: async (notificationId: string) => {
      return await workerAxios.patch(API_ROUTES.NOTIFICATION.MARK_READ(notificationId));
    },
  
   
    markAllAsRead: async () => {
      return await workerAxios.patch(API_ROUTES.NOTIFICATION.MARK_ALL_READ);
    },
    getEarningsSummary: async () => {
      return await workerAxios.get(API_ROUTES.WORKER.EARNINGS_SUMMARY);
    },
    getEarningsList: async (params: {
      page: number;
      limit: number;
      search?: string;
      from?: string;
      to?: string;
    }) => {
      return await workerAxios.get(API_ROUTES.WORKER.EARNINGS_LIST, { params });
    },
    exportEarningsPdf: async (params: {
      search?: string;
      from?: string;
      to?: string;
    }) => {
      return await workerAxios.get(API_ROUTES.WORKER.EARNINGS_EXPORT, {
        params,
        responseType: "blob",
      });
    },
};
