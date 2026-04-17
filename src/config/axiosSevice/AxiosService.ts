import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

import store from "@/redux/store";
import { WarningToast, ErrorToast } from "@/components/shared/Toaster";
import { ENV } from "../env/env";

interface CreateAxiosClientOptions {
  baseURL: string;
  publicRoutes?: string[];
  removeAuthAction: () => any;
  loginRedirect: string;
  refreshTokenEndpoint: string;
  blockedMessage?: string;
}

export function createAxiosClient({
  baseURL,
  publicRoutes = [],
  removeAuthAction,
  loginRedirect,
  refreshTokenEndpoint,
  blockedMessage = "Your account has been blocked. Please contact support.",
}: CreateAxiosClientOptions): AxiosInstance {
  const instance = axios.create({
    baseURL: `${ENV.VITE_SERVER_BASEURL}${baseURL}`,
    withCredentials: true,
  });

  // 🔁 Refresh control
  let isRefreshing = false;
  let refreshSubscribers: Array<() => void> = [];

  const subscribeTokenRefresh = (cb: () => void) => {
    refreshSubscribers.push(cb);
  };

  const onRefreshed = () => {
    refreshSubscribers.forEach((cb) => cb());
    refreshSubscribers = [];
  };

  const logoutUser = (message?: string) => {
    store.dispatch(removeAuthAction());
    if (message) WarningToast(message);
    window.location.href = loginRedirect;
  };

  // 🔐 RESPONSE INTERCEPTOR
  instance.interceptors.response.use(
    (response) => {
      console.log("✅ API SUCCESS:", {
        url: response.config?.url,
        method: response.config?.method,
        status: response.status,
        data: response.data,
      });

      return response;
    },

    async (error: AxiosError<any>) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // ❗ Network / server down
      if (!error.response) {
        ErrorToast("Server not reachable. Please try again.");
        return Promise.reject(error);
      }

      const status = error.response.status;
      const message = error.response?.data?.message || "";

      // ✅ Skip public routes
      if (
        originalRequest?.url &&
        publicRoutes.some((route) => originalRequest.url?.includes(route))
      ) {
        return Promise.reject(error);
      }

      // 🔁 TOKEN EXPIRED → REFRESH FLOW
      if (
        status === 401 &&
        message.toLowerCase().includes("token expired") &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        if (!isRefreshing) {
          isRefreshing = true;

          try {
            await instance.post(refreshTokenEndpoint);
            isRefreshing = false;
            onRefreshed();
          } catch (refreshError) {
            isRefreshing = false;
            logoutUser("Session expired. Please login again.");
            return Promise.reject(refreshError);
          }
        }

        // ⏳ Queue pending requests
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => {
            resolve(instance(originalRequest));
          });
        });
      }

      // 🚫 ACCOUNT BLOCKED
      if (status === 403 && message.toLowerCase().includes("blocked")) {
        store.dispatch(removeAuthAction());
        ErrorToast(blockedMessage);
        window.location.href = loginRedirect;
        return Promise.reject(error);
      }

      // 🔐 INVALID / BLACKLISTED TOKEN
      if (
        (status === 401 && message.toLowerCase().includes("invalid")) ||
        (status === 403 && message.toLowerCase().includes("blacklisted")) ||
        (status === 403 && message.toLowerCase().includes("unauthorized"))
      ) {
        logoutUser("Please login again.");
        return Promise.reject(error);
      }

      return Promise.reject(error);
    },
  );

  return instance;
}
