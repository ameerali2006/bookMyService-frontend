import { Role } from '../config/constant/role';
import userAxios from "@/config/axiosSevice/UserAxios";
import adminAxios from "@/config/axiosSevice/AdminAxios";
import workerAxios from "@/config/axiosSevice/WorkerAxios";
import type { WorkerRegistrationData } from "@/protected/validation/worker/registerZod";
import { API_ROUTES } from "@/constants/apiRoutes";

interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export const authService = {
  generateOtp: async (email: string) => {
    return await userAxios.post(API_ROUTES.AUTH.GENERATE_OTP, { email });
  },
  register: async (formData: RegisterPayload & { role: string }) => {
    return await userAxios.post(API_ROUTES.AUTH.REGISTER, formData);
  },
  googleLogin: async (token: string, role: typeof Role.USER) => {
    console.log("google>login");
    let dat = await userAxios.post(API_ROUTES.AUTH.GOOGLE_LOGIN, { token, role });
    console.log("dfddffarra", dat.data);
    return dat;
  },
  verifyOtp: async (otp: string, email: string, role: string) => {
    return await userAxios.post(API_ROUTES.AUTH.VERIFY_OTP, { otp, email, role });
  },
  login: async (credentials: {
    email: string;
    password: string;
    role: typeof Role.USER;
  }) => {
    return await userAxios.post(API_ROUTES.AUTH.LOGIN, credentials);
  },
  userResetLink: async (email: string) => {
    return await userAxios.post(API_ROUTES.AUTH.FORGOT_PASSWORD, { email });
  },
  userResetPassword: async (data: {
    token: string;
    password: string;
    confirmPassword: string;
  }) => {
    return await userAxios.post(API_ROUTES.AUTH.RESET_PASSWORD, data);
  },
  getUserServices: async (location: {
    city: string;
    lat: number;
    lng: number;
  }) => {
    const query = `location=${encodeURIComponent(location.city)}&lat=${location.lat}&lng=${location.lng}`;
    const res = await userAxios.get(`${API_ROUTES.SERVICE.GET_SERVICE}?${query}`);
    console.log("FULL RESPONSE:", res);
    console.log("DATA:", res.data);
    return res;
  },
  logout: async () => {
    return await userAxios.post(API_ROUTES.AUTH.LOGOUT);
  },
  workerVerifyOtp: async (otp: string, email: string, role: string) => {
    return await workerAxios.post(API_ROUTES.AUTH.VERIFY_OTP, { otp, email, role });
  },
  workerGenerateOtp: async (email: string) => {
    return await workerAxios.post(API_ROUTES.AUTH.GENERATE_OTP, { email });
  },
  workerCloudinory: async (folder: string) => {
    return await workerAxios.post(API_ROUTES.CLOUDINARY.SIGNATURE, { folder });
  },
  workerRegister: async (data: WorkerRegistrationData & { role: string }) => {
    return await workerAxios.post(API_ROUTES.AUTH.REGISTER, data);
  },
  googleWorkerLogin: async (token: string, role: "worker") => {
    return await workerAxios.post(API_ROUTES.AUTH.GOOGLE_WORKER_LOGIN, { token, role });
  },
  workerLogin: async (data: {
    email: string;
    password: string;
    role: "worker";
  }) => {
    return await workerAxios.post(API_ROUTES.AUTH.LOGIN, data);
  },
  workerLogout: async () => {
    return await workerAxios.post(API_ROUTES.AUTH.LOGOUT);
  },

  workerResetLink: async (email: string) => {
    return await workerAxios.post(API_ROUTES.AUTH.FORGOT_PASSWORD, { email });
  },
  workerResetPassword: async (data: {
    token: string;
    password: string;
    confirmPassword: string;
  }) => {
    return await workerAxios.post(API_ROUTES.AUTH.RESET_PASSWORD, data);
  },
  workerIsVerified: async (email: string) => {
    return await workerAxios.get(API_ROUTES.AUTH.WORKER_IS_VERIFIED, { params: { email } });
  },

  adminLogin: async (credentials: {
    email: string;
    password: string;
    role: "admin";
  }) => {
    return await adminAxios.post(API_ROUTES.AUTH.LOGIN, credentials);
  },
  adminLogout: async () => {
    return await adminAxios.post(API_ROUTES.AUTH.LOGOUT);
  },

  getServiceNames: async () => {
    return await workerAxios.get(API_ROUTES.SERVICE.GET_SERVICE_NAMES);
  },
};
