import {
  GoogleOAuthProvider,
  GoogleLogin,
  type CredentialResponse,
} from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addUser } from "@/redux/slice/userTokenSlice";
import { authService } from "@/api/AuthService";
import { ENV } from "@/config/env/env";
import { addWorker } from "@/redux/slice/workerTokenSlice";

const clientId = ENV.VITE_GOOGLE_CLIENT_ID;

interface GoogleLoginComponentProps {
  userType: "worker" | "user"; 
  onGoogleSuccess?: (email: string, name: string) => void; 
}

const GoogleLoginComponent = ({ userType, onGoogleSuccess }: GoogleLoginComponentProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        throw new Error("Google credential is missing");
      }

      const token: string = credentialResponse.credential;

      // Call the correct service method based on userType
      const response =
        userType === "worker"
          ? await authService.googleWorkerLogin(token,userType)
          : await authService.googleLogin(token,userType);

        console.log(response.data)

      if (response.data.success) {
        const {name,email}=response.data.user
        
        if(userType=="user"){
          dispatch(addUser(response.data.user));
          navigate("/user/")
        }

        if(userType=="worker"&&response.data.isNew){
          
          if (onGoogleSuccess) onGoogleSuccess(email,name); 
          
        }else{
          dispatch(addWorker(response.data.user));
          navigate("/worker/dashboard")
        }
      }
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="rounded-xl  overflow-hidden  border border-gray-300">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => console.log("Login Failed")}
      />
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleLoginComponent;
