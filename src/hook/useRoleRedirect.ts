
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

export function useRoleRedirect() {
  const user = useSelector((state: RootState) => state.userTokenSlice.user);
  const worker = useSelector((state: RootState) => state.workerTokenSlice.worker);
  const admin = useSelector((state: RootState) => state.adminTokenSlice.admin);

  if (admin) return "/admin/dashboard";
  if (worker) return "/worker/dashboard";
  if (user) return "/";

  return null;
}