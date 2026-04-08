import { createAxiosClient } from "./AxiosService";
import { removeAdmin } from "@/redux/slice/adminTokenSlice";

const adminAxios = createAxiosClient({
  baseURL:"/admin",
  removeAuthAction: removeAdmin,
  loginRedirect: "/admin/login",
  refreshTokenEndpoint: "/refresh-token"
});

export default adminAxios;
