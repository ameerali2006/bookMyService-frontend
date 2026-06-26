import { PUBLIC_ROUTES } from "../constant/publicRoute";
import { createAxiosClient } from "./AxiosService";
import { removeWorker } from "@/redux/slice/workerTokenSlice";
import { API_ROUTES } from "@/constants/apiRoutes";


const workerAxios = createAxiosClient({
  baseURL: "/worker",
  publicRoutes: PUBLIC_ROUTES,
  removeAuthAction: removeWorker,
  loginRedirect: "/worker/login",
  refreshTokenEndpoint: API_ROUTES.AUTH.REFRESH_TOKEN
});

export default workerAxios;
