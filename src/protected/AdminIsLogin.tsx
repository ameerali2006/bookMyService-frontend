import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import type { RootState } from "@/redux/store";
import { useRoleRedirect } from "@/hook/useRoleRedirect";

function IsAdminLogin({ children }: { children: React.ReactNode }) {

  const adminToken = useSelector(
    (state: RootState) => state.adminTokenSlice.admin
  );

  const redirect = useRoleRedirect();

  if (!adminToken) {
    if (redirect) return <Navigate to={redirect} replace />;
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

export default IsAdminLogin;