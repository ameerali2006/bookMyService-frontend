import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Loader from "./components/shared/Loader";
import AdminDashboard from "./pages/admin/AdminDashBoard";
import IsAdminLogin from "./protected/AdminIsLogin";
import IsAdminLogout from "./protected/AdminIsLogout";
import UserManagement from "./pages/admin/UserManagement";
import WorkerManagement from "./pages/admin/WorkerManagement";
import WorkerVerification from "./pages/admin/WorkerVerification";
import ServiceManagement from "./pages/admin/ServiceManagement";
import { ADMIN_ROUTES } from "./config/constant/routes/adminRoutes";
import AdminBookingsPage from "./pages/admin/BookingLising";
import AdminBookingDetailsPage from "./pages/admin/BookingDetail";
import AdminWallet from "./pages/admin/AdminWallet";
import AdminReviewsPage from "./pages/admin/Reviews";


const LoginPage = lazy(()=>import("./pages/admin/LoginPage"));

const Admin = () => {
  return (
    <>
    <Suspense fallback={<Loader message={'loading...'} />}>
        <Routes>
        {/* Auth Route */}
        <Route
          path={ADMIN_ROUTES.LOGIN}
          element={<IsAdminLogout><LoginPage /></IsAdminLogout>}
        />

        {/* Protected Routes */}
        <Route
          path={ADMIN_ROUTES.DASHBOARD}
          element={<IsAdminLogin><AdminDashboard /></IsAdminLogin>}
        />
        <Route
          path={ADMIN_ROUTES.USERS}
          element={<IsAdminLogin><UserManagement /></IsAdminLogin>}
        />
        <Route
          path={ADMIN_ROUTES.WORKERS}
          element={<IsAdminLogin><WorkerManagement /></IsAdminLogin>}
        />
        <Route
          path={ADMIN_ROUTES.UNVERIFIED}
          element={<IsAdminLogin><WorkerVerification /></IsAdminLogin>}
        />
        <Route
          path={ADMIN_ROUTES.SERVICES}
          element={<IsAdminLogin><ServiceManagement /></IsAdminLogin>}
        />
        <Route
          path={ADMIN_ROUTES.BOOKINGS}
          element={<IsAdminLogin><AdminBookingsPage /></IsAdminLogin>}
        />
        <Route
          path={ADMIN_ROUTES.BOOKING_DEETAIL}
          element={<IsAdminLogin><AdminBookingDetailsPage /></IsAdminLogin>}
        />
        <Route
          path={ADMIN_ROUTES.WALLET}
          element={<IsAdminLogin><AdminWallet /></IsAdminLogin>}
        />
        <Route
          path={ADMIN_ROUTES.REVIEW}
          element={<IsAdminLogin><AdminReviewsPage /></IsAdminLogin>}
        />
      </Routes>
    </Suspense></>
  )
}

export default Admin
