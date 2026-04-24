import type { ChangePasswordInput } from "@/components/shared/ChangePassword";
import userAxios from "@/config/axiosSevice/UserAxios";
import type { WalletTransactionQuery } from "@/interface/shared/wallet";
import type { Numerals } from "react-day-picker";

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
    return await userAxios.get("/profile/userDetails");
  },
  updateUserDetails: async (
    user: Partial<{
      name: string;
      phone?: string;
      email?: string;
      image?: string;
    }>,
  ) => {
    return await userAxios.put("/profile/updateUserDetails", user);
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
    return await userAxios.get("/workers/nearby", {
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
    return await userAxios.get(`/workers/availability?workerId=${workerId}`);
  },
  getUserAddress: async () => {
    return await userAxios.get("/addresses");
  },
  addUserAddress: async (data: AddressForm) => {
    return await userAxios.post("/addAddress", data);
  },
  setPrimaryAddress: async (toSetId: string) => {
    return await userAxios.put("/address/setPrimary", { toSetId });
  },
  selectDateTimeAvailablity: async (data: {
    time: string;
    date: Date;
    description: string;
    workerId: string;
  }) => {
    return await userAxios.post("/basicBookingDetails", data);
  },
  getBookingDetails: async (bookingId: string) => {
    return await userAxios.get("/getBoookingDetails", {
      params: { bookingId },
    });
  },
  createPaymentIntent: async (data: CreatePaymentIntentInput) => {
    return await userAxios.post("/payment/create-payment-intent", data);
  },
  updatePaymentStatus: async (data: UpdatePaymentStatusInput) => {
    return await userAxios.post("/payment/webhook", data);
  },
  changePassword: async (payload: ChangePasswordInput) => {
    return await userAxios.put(`/profile/changePassword`, payload);
  },
  verifyPayment: async (bookingId: string, type: "advance" | "final") => {
    return await userAxios.get(
      `/payment/verify?bookingId=${bookingId}&paymentType=${type}`,
    );
  },
  getBookingList: async (limit: number, page: number, search: string) => {
    return await userAxios.get(`/bookings/ongoing`, {
      params: { limit, page, search },
    });
  },
  bookingDetailData: async (bookingId: string) => {
    return await userAxios.get(`/bookings/ongoing/${bookingId}`);
  },
  userWalletData: async () => {
    return await userAxios.get("/profile/walletData");
  },
  getUserTransactions: async (query: WalletTransactionQuery) => {
    return await userAxios.get(`/profile/transactions`, { params: query });
  },
  getChatId: async (bookingId: string) => {
    console.log("dffdfd");
    return await userAxios.get(`/chat/chatId`, { params: { bookingId } });
  },
  chatHistory: async (chatId: string, limit: number, skip: number) => {
    console.log("cahjdsfjdsfjds");
    return await userAxios.get(`/chat/chatHistory`, {
      params: { chatId, limit, skip },
    });
  },
  getInbox: async (userId: string) => {
    return await userAxios.get("/chat/chatInbox", { params: { userId } });
  },
  addReview: async (comment: string, rating: number, bookingId: string) => {
    return await userAxios.post("/review/addReview", {
      comment,
      rating,
      bookingId,
    });
  },
   walletPayment:async (data: { bookingId: string; addressId:string, paymentType: "advance" | "final" })=> {
    return await userAxios.post("/wallet/payment", data);
  },
  getWorkerProfile: async (workerId: string) => {
    return await userAxios.get("/workers/workerProfile", { params: { workerId } });
  },
  getNotifications: async () => {
    return await userAxios.get("/notifications");
  },

  markAsRead: async (notificationId: string) => {
    return await userAxios.patch(`/notifications/${notificationId}/read`);
  },

 
  markAllAsRead: async () => {
    return await userAxios.patch("/notifications/read-all");
  },
  // cancelBooking: async (bookingId:string) => {
  //   return await userAxios.patch(`/booking/${bookingId}/cancel`);
  // },

};
