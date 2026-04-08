import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { useRoleRedirect } from "@/hook/useRoleRedirect";

interface Props {
  children: React.ReactNode;
}
function IsLogin({ children }: { children: React.ReactNode }) {

  const userToken = useSelector(
    (state: RootState) => state.userTokenSlice.user
  );

  const redirect = useRoleRedirect();

  if (!userToken) {
    if (redirect) return <Navigate to={redirect} replace />;
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default IsLogin;