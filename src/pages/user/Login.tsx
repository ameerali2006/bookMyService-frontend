import { useNavigate } from 'react-router-dom';
import LoginForm from '../../components/shared/Login'

import { useDispatch } from 'react-redux';
import { addUser } from '@/redux/slice/userTokenSlice';
import { authService } from '@/api/AuthService';
import { ErrorToast } from '@/components/shared/Toaster';
type SubmitResult = {
  success: boolean;
  message: string;
};
function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleUserLogin = async (values: {
    email: string;
    password: string;
    
  }):Promise<SubmitResult> => {
  const response = await authService.login({...values,role:"user"});
    console.log('working....');
    console.log(response.data.success);
    
    if (response.data.success) {
      console.log( "user for redux",response.data.user)
      dispatch(addUser(response.data.user));
      navigate("/");
      return {message:response.data.message,success:response.data.success}
    } else {
      ErrorToast(response.data.message||"Invalid credentials")
      
      return {message:response.data.message,success:response.data.success}
    }
  };
  return (
    <>
  <div className="flex flex-col lg:flex-row min-h-screen">
    {/* Left image section */}
    <div className="hidden lg:flex lg:w-1/2 justify-center items-center">
      <img
        src="https://res.cloudinary.com/dp1sx1dx2/image/upload/v1750684879/login-workers-img_jaf3eo.webp"
        alt="Register Visual"
        className="w-2/3 h-auto object-contain"
      />
    </div>

    {/* Right login section */}
    <div className="flex justify-center items-center w-full lg:w-1/2 p-4">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl"> {/* Control width here */}
        <LoginForm onSubmit={handleUserLogin} role="user" />
      </div>
    </div>
  </div>
</>

  )
}

      
export default Login