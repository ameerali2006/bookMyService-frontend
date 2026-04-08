import { PUBLIC_ROUTES } from "../constant/publicRoute";
import { createAxiosClient } from "./AxiosService";
import { removeUser } from "@/redux/slice/userTokenSlice";


const userAxios = createAxiosClient({
  baseURL: "",
  publicRoutes: PUBLIC_ROUTES,
  removeAuthAction: removeUser,
  loginRedirect: "/login",
  refreshTokenEndpoint: "/refresh-token"
});

export default userAxios;
