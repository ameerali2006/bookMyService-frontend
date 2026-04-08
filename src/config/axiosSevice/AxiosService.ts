import axios from "axios";
import type {AxiosInstance} from "axios"
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
        blockedMessage = "Your account has been blocked. Please contact support."
    }: CreateAxiosClientOptions): AxiosInstance {
    const instance = axios.create({
        baseURL:ENV.VITE_SERVER_BASEURL+baseURL,
        withCredentials: true,
    });

    let isRefreshing = false;

    instance.interceptors.response.use(
        
        (response) => response,
        async (error) => {
        const originalRequest = error.config;
        console.log(error);

        if (publicRoutes.includes(originalRequest.url)) {
            return Promise.reject(error);
        }
        console.log("axios interseptor issue 1")
        console.log(error.response?.status ,error.response.data.message)

        if (
            error.response?.status === 401 &&
            error.response.data.message === "Token expired." &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;
                try {
                    console.log("refreshitta pannii")
                    await instance.post(refreshTokenEndpoint);
                    isRefreshing = false;
                    return instance(originalRequest);
                } catch (refreshError) {
                    isRefreshing = false;
                    store.dispatch(removeAuthAction());
                    window.location.href = loginRedirect;
                    WarningToast("Please login again");
                    return Promise.reject(refreshError);
                }
            }
        }

        // Account blocked
        if (
            error.response?.status === 403 &&
            error.response?.data?.message?.includes("Access denied") &&
            error.response?.data?.message?.includes("blocked")
        ) {
            store.dispatch(removeAuthAction());
            window.location.href = loginRedirect;
            ErrorToast(blockedMessage);
            return Promise.reject(error);
        }

        // Invalid token or blacklisted
        if (
            (error.response?.status === 401 &&
            error.response.data.message === "Invalid token") ||
            (error.response?.status === 403 &&
            error.response.data.message === "Token is blacklisted") ||
            (error.response?.status === 403 &&
            error.response.data.message === "Unauthorized access. Please log in.") ||
            (error.response?.status === 403 &&
            error.response.data.message === "Access denied: Your account has been blocked" &&
            !originalRequest._retry)
        ) {
            store.dispatch(removeAuthAction());
            window.location.href = loginRedirect;
            WarningToast("Please login again");
            return Promise.reject(error);
        }

        return Promise.reject(error);
        }
    );

    return instance;
}