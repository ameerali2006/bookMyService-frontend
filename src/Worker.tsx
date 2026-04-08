import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Loader from "./components/shared/Loader";
import WorkerLogin from "./pages/worker/Login";
import WorkerDashboard from "./pages/worker/Dashboard";
import IsWorkerLogout from "./protected/WorkerIsLogout";
import IsWorkerLogin from "./protected/WorkerIsLogin";
import WorkerForgotPassword from "./pages/worker/ForgotPassword";
import WorkerResetPassword from "./pages/worker/ResetPassword";
import WorkerProfilePage from "./pages/worker/WorkerProfile";
import WorkManagementPage from "./pages/worker/SlotMangement";
import { WORKER_ROUTES } from "./config/constant/routes/workerRoutes";
import WorkerRequestsPage from "./pages/worker/RequestService";
import WorkerChangePasswordPage from "./pages/worker/ChangePassword";
import { WorkerApprovedServices } from "./pages/worker/ApprovedServiceListing";
import WorkerBookingDetailsPage from "./pages/worker/ApprovedServiceDetails";
import AllBookingsPage from "./pages/worker/AllBooking";
import WorkerWallet from "./pages/worker/WorkerWallet";
import WorkerMessagesPage from "./pages/worker/WorkerChat";


const WorkerRegistration=lazy(()=>import("@/pages/worker/Register"))
 
const Worker = () => {
  return (
    <Suspense fallback={<Loader message="loading..."/>}>
       <Routes>
        {/* Auth Routes */}
        <Route
          path={WORKER_ROUTES.REGISTER}
          element={<IsWorkerLogout><WorkerRegistration /></IsWorkerLogout>}
        />
        <Route
          path={WORKER_ROUTES.LOGIN}
          element={<IsWorkerLogout><WorkerLogin /></IsWorkerLogout>}
        />
        <Route
          path={WORKER_ROUTES.FORGOT_PASSWORD}
          element={<IsWorkerLogout><WorkerForgotPassword /></IsWorkerLogout>}
        />
        <Route
          path={WORKER_ROUTES.RESET_PASSWORD}
          element={<IsWorkerLogout><WorkerResetPassword /></IsWorkerLogout>}
        />

        {/* Protected Routes */}
        <Route
          path={WORKER_ROUTES.DASHBOARD}
          element={<IsWorkerLogin><WorkerDashboard /></IsWorkerLogin>}
        />
        <Route
          path={WORKER_ROUTES.PROFILE_VIEW}
          element={<IsWorkerLogin><WorkerProfilePage /></IsWorkerLogin>}
        />
        <Route
          path={WORKER_ROUTES.PROFILE_SLOT}
          element={<IsWorkerLogin><WorkManagementPage /></IsWorkerLogin>}
        />
        <Route
          path={WORKER_ROUTES.SERVICE_REQUEST}
          element={<IsWorkerLogin>< WorkerRequestsPage/></IsWorkerLogin>}
        />
        <Route
          path={WORKER_ROUTES.CHANGE_PASSWORD}
          element={<IsWorkerLogin>< WorkerChangePasswordPage/></IsWorkerLogin>}
        />
        <Route
          path={WORKER_ROUTES.SERVICE_APPROVED}
          element={<IsWorkerLogin>< WorkerApprovedServices/></IsWorkerLogin>}
        />
        <Route
          path={WORKER_ROUTES.SERVICE_APPROVED_DETAILPAGE}
          element={<IsWorkerLogin>< WorkerBookingDetailsPage/></IsWorkerLogin>}
        />
        <Route
          path={WORKER_ROUTES.All_BOOKINGS}
          element={<IsWorkerLogin>< AllBookingsPage/></IsWorkerLogin>}
        />
        <Route
          path={WORKER_ROUTES.WALLET}
          element={<IsWorkerLogin><WorkerWallet/></IsWorkerLogin>}
        />
        <Route
          path={WORKER_ROUTES.CHAT}
          element={<IsWorkerLogin><WorkerMessagesPage/></IsWorkerLogin>}
        />
      </Routes>
      
    </Suspense> 
  )
}

export default Worker
