import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { useRoleRedirect } from "@/hook/useRoleRedirect";

interface Props {
  children: React.ReactNode;
}

function IsWorkerLogin({ children }: { children: React.ReactNode }) {

  const workerToken = useSelector(
    (state: RootState) => state.workerTokenSlice.worker
  );

  const redirect = useRoleRedirect();

  if (!workerToken) {
    if (redirect) return <Navigate to={redirect} replace />;
    return <Navigate to="/worker/login" replace />;
  }

  return <>{children}</>;
}

export default IsWorkerLogin;
