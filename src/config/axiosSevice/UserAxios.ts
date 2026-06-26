import { PUBLIC_ROUTES } from "../constant/publicRoute";
import { createAxiosClient } from "./AxiosService";
import { removeUser } from "@/redux/slice/userTokenSlice";
import { API_ROUTES } from "@/constants/apiRoutes";


const userAxios = createAxiosClient({
  baseURL: "",
  publicRoutes: PUBLIC_ROUTES,
  removeAuthAction: removeUser,
  loginRedirect: "/login",
  refreshTokenEndpoint: API_ROUTES.AUTH.REFRESH_TOKEN
});

export default userAxios;
