import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

function IsWorkerLogout({ children }: { children: React.ReactNode }) {

  const admin = useSelector((state: RootState) => state.adminTokenSlice.admin);
  const user = useSelector((state: RootState) => state.userTokenSlice.user);
  const worker = useSelector((state: RootState) => state.workerTokenSlice.worker);

  if (worker) {
    return <Navigate to="/worker/dashboard" replace />;
  }

  if (admin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default IsWorkerLogout;
