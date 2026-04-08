import { PUBLIC_ROUTES } from "../constant/publicRoute";
import { createAxiosClient } from "./AxiosService";
import { removeWorker } from "@/redux/slice/workerTokenSlice";


const workerAxios = createAxiosClient({
  baseURL: "/worker",
  publicRoutes: PUBLIC_ROUTES,
  removeAuthAction: removeWorker,
  loginRedirect: "/worker/login",
  refreshTokenEndpoint: "/refresh-token"
});

export default workerAxios;
