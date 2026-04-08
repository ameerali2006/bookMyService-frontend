import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

function IsAdminLogout({ children }: { children: React.ReactNode }) {

  const admin = useSelector((state: RootState) => state.adminTokenSlice.admin);
  const user = useSelector((state: RootState) => state.userTokenSlice.user);
  const worker = useSelector((state: RootState) => state.workerTokenSlice.worker);

  // if already logged in as ADMIN
  if (admin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // if logged in as USER
  if (user) {
    return <Navigate to="/" replace />;
  }

  // if logged in as WORKER
  if (worker) {
    return <Navigate to="/worker/dashboard" replace />;
  }

  return <>{children}</>;
}

export default IsAdminLogout;