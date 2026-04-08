import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Loader from "./components/shared/Loader";
import IsLogin from "./protected/IsLogin";
import IsLogout from "./protected/IsLogout";
import UserForgotPassword from "./pages/user/ForgotPassword";
import UserResetPassword from "./pages/user/UserResetPassword";
import { ProfilePage } from "./pages/user/Profile";
import WorkerListingPage from "./pages/user/WorkerListing";
import BasicBookingDetails from "./pages/user/BasicBookingDetails";
import { USER_ROUTES } from "./config/constant/routes/userRoutes";
import AdvancePaymentPage from "./pages/user/AdvancePaymentPage";
import UserChangePasswordPage from "./pages/user/ChangeUserPassword";
import PaymentSuccessPage from "./pages/user/SuccessPage";
import UserBookingsPage from "./pages/user/BookingList";
import { BookingDetailPage } from "./pages/user/BookingDetail";
import UserWallet from "./pages/user/UserWallet";
import UserChatPage from "./pages/user/ChatPage";
import UserLayout from "./layout/userLayout";
import NotFound from "./components/shared/NotFound";
import ContactPage from "./pages/user/Contact";





const Register = lazy(()=>import("./pages/user/Register"))
const Homepage = lazy(()=>import("./pages/user/Home"))
const  Login   = lazy(()=>import("./pages/user/Login")) ;


const User = () => {
  return (
    <Suspense fallback={<Loader message="loading..."/>}>
        <Routes>
          <Route
          path={USER_ROUTES.REGISTER}
          element={<IsLogout><Register /></IsLogout>}
        />
        <Route
          path={USER_ROUTES.LOGIN}
          element={<IsLogout><Login /></IsLogout>}
        />
        <Route
          path={USER_ROUTES.FORGOT_PASSWORD}
          element={<IsLogout><UserForgotPassword /></IsLogout>}
        />
        <Route
          path={USER_ROUTES.RESET_PASSWORD}
          element={<IsLogout><UserResetPassword /></IsLogout>}
        />
        <Route
                  path={USER_ROUTES.CHAT}
                  element={<IsLogin><UserChatPage /></IsLogin>}
                />

        <Route element={<UserLayout />}>
          
       
        <Route index element={<Homepage />} />

        
        
       
        <Route
          path={USER_ROUTES.PROFILE}
          element={<IsLogin><ProfilePage /></IsLogin>}
        />
        <Route
          path={USER_ROUTES.SERVICES.LIST}
          element={<WorkerListingPage />}
        />
        <Route
          path={USER_ROUTES.SERVICES.BOOK_DETAILS}
          element={<IsLogin><BasicBookingDetails /></IsLogin>}
        />
        <Route
          path={USER_ROUTES.SERVICES.PRE_BOOKING_SLOT}
          element={<IsLogin><AdvancePaymentPage /></IsLogin>}
        />
        <Route
          path={USER_ROUTES.CHANGE_PASSWORD}
          element={<IsLogin><UserChangePasswordPage /></IsLogin>}
        />
        <Route
          path={"/bookings"}
          element={<IsLogin><UserBookingsPage /></IsLogin>}
        />
        <Route
          path={"/bookings/:bookingId"}
          element={<IsLogin><BookingDetailPage /></IsLogin>}
        />
        <Route
          path={"/booking/:bookingId/success"}
          element={<IsLogin><PaymentSuccessPage /></IsLogin>}
        />
        <Route
          path={USER_ROUTES.WALLET}
          element={<IsLogin><UserWallet /></IsLogin>}
        />
         <Route
          path={"/contact"}
          element={<IsLogin><ContactPage /></IsLogin>}
        />
        </Route>
        <Route path="*" element={<NotFound />} />
       
      </Routes>
      
    </Suspense> 
  ) 
}

export default User
