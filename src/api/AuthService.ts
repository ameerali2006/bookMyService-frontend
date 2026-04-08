import userAxios from "@/config/axiosSevice/UserAxios";
import adminAxios from "@/config/axiosSevice/AdminAxios"; 
import workerAxios from "@/config/axiosSevice/WorkerAxios"; 
import type { WorkerRegistrationData } from "@/protected/validation/worker/registerZod";


interface RegisterPayload{
    name:string
    email:string
    phone:string
    password:string
    confirmPassword:string
}

export const authService={
    generateOtp:async (email:string)=>{
        
        return await userAxios.post('/generate-otp',{email})

    },
    register:async (formData:RegisterPayload & {role:string})=>{
        return await userAxios.post('/register',formData)
    },
    googleLogin:async (token:string,role:"user")=>{
        console.log("google>login")
        let dat= await userAxios.post('/google-login',{token,role})
        console.log("dfddffarra",dat.data)
        return dat
    },
    verifyOtp:async (otp:string,email:string,role:string)=>{
        return await userAxios.post('/verify-otp',{otp,email,role})
    },
    login: async (credentials: { email: string; password: string,role:"user" }) => {
        return await userAxios.post("/login", credentials);
    },
    userResetLink:async (email:string)=>{
        return await userAxios.post('/forgot-password',{email})
    },
    userResetPassword:async (data:{token:string,password: string,confirmPassword:string})=>{
        return await userAxios.post('/reset-password',data)
    },
    getUserServices:async(location:{city:string,lat:number,lng:number})=>{
          const query = `location=${encodeURIComponent(location.city)}&lat=${location.lat}&lng=${location.lng}`;
        return await userAxios.get(`/getService?${query}`)
    },
    logout: async ()=>{
        return await userAxios.post('/logout')
    }, 
    workerVerifyOtp:async (otp:string,email:string,role:string)=>{
        return await workerAxios.post('/verify-otp',{otp,email,role})
    },
    workerGenerateOtp:async (email:string)=>{
        
        return await workerAxios.post('/generate-otp',{email})

    },
    workerCloudinory:async (folder:string)=>{
        return await workerAxios.post('/cloudinary-signature',{folder})
    },
    workerRegister: async (data: WorkerRegistrationData & {role:string}) => {
        return await workerAxios.post("/register", data); 
    },
    googleWorkerLogin:async (token:string,role:"worker")=>{
        return await workerAxios.post('/google-auth',{token,role})
    },
    workerLogin:async (data:{email:string,password:string,role:"worker"}) => {
        return await workerAxios.post("/login", data); 
    },
    workerLogout: async ()=>{
        return await workerAxios.post('/logout')
    },

    workerResetLink:async (email:string)=>{
        return await workerAxios.post('/forgot-password',{email})
    },
    workerResetPassword:async (data:{token:string,password: string,confirmPassword:string})=>{
        return await workerAxios.post('/reset-password',data)
    },
    workerIsVerified:async(email:string)=>{
        return await workerAxios.get("/isVerified",{params:{email}})
    },


    
    adminLogin: async (credentials: { email: string; password: string ,role:"admin"}) => {
        return await adminAxios.post("/login", credentials);
    },
    adminLogout: async () => {
        return await adminAxios.post("/logout");
    },

    


    getServiceNames:async ()=>{
        return await workerAxios.get('/getserviceNames')
    },
}