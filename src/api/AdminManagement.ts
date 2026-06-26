import adminAxios from "@/config/axiosSevice/AdminAxios";
import type { WalletTransactionQuery } from "@/interface/shared/wallet";
import { API_ROUTES } from "@/constants/apiRoutes";

export const adminManagement = {
  getAllUsers: async (
    page: number,
    limit: number,
    search?: string,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
  ) => {
    return await adminAxios.get(API_ROUTES.ADMIN.GET_USERS, {
      params: { page, limit, search, sortBy, sortOrder },
    });
  },
  updateUserStatus: async (userId: string, isActive: boolean) => {
    return await adminAxios.patch(API_ROUTES.ADMIN.UPDATE_USER_STATUS(userId), { isActive });
  },
  getAllWorkers: async (
    page: number,
    limit: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
    search?: string,
  ) => {
    return await adminAxios.get(API_ROUTES.ADMIN.GET_WORKERS, {
      params: { page, limit, sortBy, sortOrder, search },
    });
  },
  updateWorkerStatus: async (workerId: string, isActive: boolean) => {
    return await adminAxios.patch(API_ROUTES.ADMIN.UPDATE_WORKER_STATUS(workerId), { isActive });
  },
  getUnverifiedWorkers: async (page: number, pageSize: number) => {
    return await adminAxios.get(API_ROUTES.ADMIN.GET_UNVERIFIED_WORKERS, {
      params: { page, pageSize },
    });
  },
  verifyWorker: async (workerId: string, status: "approved" | "rejected") => {
    return await adminAxios.patch(API_ROUTES.ADMIN.VERIFY_WORKER(workerId), {
      status,
    });
  },
  getAllSerivces: async (
    search: string,
    sort: string,
    page: number,
    limit: number,
  ) => {
    return await adminAxios.get(API_ROUTES.SERVICE.GET_ADMIN_SERVICES, {
      params: { search, sort, page, limit },
    });
  },
  getCloudinarySignature: async (folder:string) => {
    return await adminAxios.get(API_ROUTES.CLOUDINARY.SIGNATURE,{params:{folder}});
  },
  createService: async (data: {
    category: string;
    description: string;
    price: number;
    priceUnit: "per job" | "per hour" | "per item";
    duration: number;
    image: string;
  }) => {
    return await adminAxios.post(API_ROUTES.SERVICE.CREATE, data);
  },
  updateServiceStatus: async (id: string, status: "active" | "inactive") => {
    return await adminAxios.patch(API_ROUTES.SERVICE.UPDATE_STATUS(id), { status });
  },
  getBookings: async (params: {
    search?: string;
    status?:
      | "confirmed"
      | "in-progress"
      | "completed"
      | "cancelled"
      | "awaiting-final-payment";
    service?:string,
    page?: number;
    limit?: number;
  }) => {
    return await adminAxios.get(API_ROUTES.BOOKING.GET_ADMIN_BOOKINGS, {
      params,
    });
  },
  getBookingDetailPage: async (bookingId: string) => {
    console.log(bookingId);
    return await adminAxios.get(API_ROUTES.BOOKING.GET_ADMIN_BOOKING_DETAILS(bookingId));
  },
  adminWalletData: async () => {
    return await adminAxios.get(API_ROUTES.ADMIN.WALLET_DATA);
  },
  getAdminTransactions: async (query: WalletTransactionQuery) => {
    return await adminAxios.get(API_ROUTES.ADMIN.TRANSACTIONS, { params: query });
  },
  getDashBoard: async () => {
    return await adminAxios.get(API_ROUTES.DASHBOARD.ADMIN);
  },
  getReviews: async ({search,sort}:{search:string,sort:string,page:number,limit:number}) => {
    return await adminAxios.get(API_ROUTES.REVIEW.GET_ADMIN_REVIEWS,{params:{search,sort}});
  },
};
