export const USER_ROUTES = {
  HOME: "/",
  REGISTER: "/register",
  LOGIN: "/login",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password/:token",
  PROFILE: "/profile",
  CHANGE_PASSWORD:"/profile/change-password",
  SERVICES: {
    LIST: "/services/:id",
    BOOK_DETAILS: "/services/bookDetails/:workerId",
    PRE_BOOKING_SLOT:"/services/preBooking/:bookingId",
  },
  
  WALLET:"/wallet",
  CHAT:"/chat/:bookingId"
};