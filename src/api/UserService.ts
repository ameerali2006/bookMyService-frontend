import type { ChangePasswordInput } from "@/components/shared/ChangePassword";
import userAxios from "@/config/axiosSevice/UserAxios";
import type { WalletTransactionQuery } from "@/interface/shared/wallet";
import type { Numerals } from "react-day-picker";
import { API_ROUTES } from "@/constants/apiRoutes";

export interface AddressForm {
  label: "Home" | "Work" | "Shop";
  buildingName: string;
  street: string;
  area: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  landmark: string;
  latitude?: number;
  longitude?: number;
}
export interface CreatePaymentIntentInput {
  amount: number;
  currency: string;
  description: string;
  receiptEmail?: string;
  metadata: {
    bookingId: string;
    paymentType: "advance" | "final";
    addressId: string;
  };
}
export interface UpdatePaymentStatusInput {
  bookingId: string;
  paymentIntentId: string;
  status:
    | "pending"
    | "succeeded"
    | "failed"
    | "processing"
    | "refunded"
    | "partially_refunded";
}

export const userService = {
  getUserDetails: async () => {
    return await userAxios.get(API_ROUTES.USER.DETAILS);
  },
  updateUserDetails: async (
    user: Partial<{
      name: string;
      phone?: string;
      email?: string;
      image?: string;
    }>,
  ) => {
    return await userAxios.put(API_ROUTES.USER.UPDATE, user);
  },
  getWorkersNearBy: async (
    search: string = "",
    sort: string = "asc",
    page: number = 1,
    pageSize: number = 10,
    serviceId: string,
    lat: number,
    lng: number,
  ) => {
    return await userAxios.get(API_ROUTES.WORKER.NEARBY, {
      params: {
        search,
        sort,
        page,
        pageSize,
        serviceId,
        lat,
        lng,
      },
    });
  },
  getWorkerAvailability: async (workerId: string) => {
    return await userAxios.get(API_ROUTES.WORKER.AVAILABILITY(workerId));
  },
  getUserAddress: async () => {
    return await userAxios.get(API_ROUTES.LOCATION.GET_ADDRESSES);
  },
  addUserAddress: async (data: AddressForm) => {
    return await userAxios.post(API_ROUTES.LOCATION.ADD_ADDRESS, data);
  },
  setPrimaryAddress: async (toSetId: string) => {
    return await userAxios.put(API_ROUTES.LOCATION.SET_PRIMARY, { toSetId });
  },
  selectDateTimeAvailablity: async (data: {
    time: string;
    date: Date;
    description: string;
    workerId: string;
  }) => {
    return await userAxios.post(API_ROUTES.BOOKING.BASIC_DETAILS, data);
  },
  getBookingDetails: async (bookingId: string) => {
    return await userAxios.get(API_ROUTES.BOOKING.GET_DETAILS, {
      params: { bookingId },
    });
  },
  createPaymentIntent: async (data: CreatePaymentIntentInput) => {
    return await userAxios.post(API_ROUTES.PAYMENT.CREATE_INTENT, data);
  },
  updatePaymentStatus: async (data: UpdatePaymentStatusInput) => {
    return await userAxios.post(API_ROUTES.PAYMENT.WEBHOOK, data);
  },
  changePassword: async (payload: ChangePasswordInput) => {
    return await userAxios.put(API_ROUTES.USER.CHANGE_PASSWORD, payload);
  },
  verifyPayment: async (bookingId: string, type: "advance" | "final") => {
    return await userAxios.get(
      API_ROUTES.PAYMENT.VERIFY(bookingId, type),
    );
  },
  getBookingList: async (limit: number, page: number, search: string) => {
    return await userAxios.get(API_ROUTES.BOOKING.ONGOING, {
      params: { limit, page, search },
    });
  },
  bookingDetailData: async (bookingId: string) => {
    return await userAxios.get(API_ROUTES.BOOKING.ONGOING_DETAILS(bookingId));
  },
  userWalletData: async () => {
    return await userAxios.get(API_ROUTES.USER.WALLET_DATA);
  },
  getUserTransactions: async (query: WalletTransactionQuery) => {
    return await userAxios.get(API_ROUTES.USER.TRANSACTIONS, { params: query });
  },
  getChatId: async (bookingId: string) => {
    console.log("dffdfd");
    return await userAxios.get(API_ROUTES.CHAT.GET_ID, { params: { bookingId } });
  },
  chatHistory: async (chatId: string, limit: number, skip: number) => {
    console.log("cahjdsfjdsfjds");
    return await userAxios.get(API_ROUTES.CHAT.HISTORY, {
      params: { chatId, limit, skip },
    });
  },
  getInbox: async (userId: string) => {
    return await userAxios.get(API_ROUTES.CHAT.INBOX, { params: { userId } });
  },
  addReview: async (comment: string, rating: number, bookingId: string) => {
    return await userAxios.post(API_ROUTES.REVIEW.ADD, {
      comment,
      rating,
      bookingId,
    });
  },
   walletPayment:async (data: { bookingId: string; addressId:string, paymentType: "advance" | "final" })=> {
    return await userAxios.post(API_ROUTES.PAYMENT.WALLET_PAYMENT, data);
  },
  getWorkerProfile: async (workerId: string) => {
    return await userAxios.get(API_ROUTES.WORKER.PROFILE, { params: { workerId } });
  },
  getNotifications: async () => {
    return await userAxios.get(API_ROUTES.NOTIFICATION.GET);
  },

  markAsRead: async (notificationId: string) => {
    return await userAxios.patch(API_ROUTES.NOTIFICATION.MARK_READ(notificationId));
  },

 
  markAllAsRead: async () => {
    return await userAxios.patch(API_ROUTES.NOTIFICATION.MARK_ALL_READ);
  },
  cancelBooking: async (bookingId:string,data:{reason:string}) => {
    return await userAxios.patch(API_ROUTES.BOOKING.CANCEL(bookingId),data);
  },

};
