import { createAxiosClient } from "./AxiosService";
import { removeAdmin } from "@/redux/slice/adminTokenSlice";
import { API_ROUTES } from "@/constants/apiRoutes";

const adminAxios = createAxiosClient({
  baseURL:"/admin",
  removeAuthAction: removeAdmin,
  loginRedirect: "/admin/login",
  refreshTokenEndpoint: API_ROUTES.AUTH.REFRESH_TOKEN
});

export default adminAxios;
