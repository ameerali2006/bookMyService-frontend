"use client"

import { useNavigate } from "react-router-dom"
import LoginForm from "../../components/shared/Login"
import { useDispatch } from "react-redux"
import { addWorker } from "@/redux/slice/workerTokenSlice" 
import { authService } from "@/api/AuthService"
import { ErrorToast } from "@/components/shared/Toaster"
type SubmitResult = {
  success: boolean;
  message: string;
};
function WorkerLogin() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleWorkerLogin = async (values: {
    email: string
    password: string
  }):Promise<SubmitResult> => {
    try {
      const response = await authService.workerLogin({...values,role:"worker"}) // Assuming you have a workerLogin method
      console.log("Worker login working....")
      console.log(response.data.success)

      if (response.data.success) {
        console.log("worker for redux", response.data.worker)
        dispatch(addWorker(response.data.worker))
        navigate("/worker/dashboard") 
        return {message:response.data.message,success:response.data.success}
      } else {
        ErrorToast(response.data.message||"Invalid credentials")
        return {message:response.data.message,success:response.data.success}
      }
    } catch (error) {
      console.error("Worker login failed:", error)
      throw error
    }
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left image section */}
        <div className="hidden lg:flex lg:w-1/2 justify-center items-center ">
          <img
            src="https://res.cloudinary.com/dp1sx1dx2/image/upload/v1750684879/login-workers-img_jaf3eo.webp"
            alt="Worker Login Visual"
            className="w-2/3 h-auto object-contain"
          />
        </div>

        {/* Right login section */}
        <div className="flex justify-center items-center w-full lg:w-1/2 p-4">
          <div className="w-full max-w-md sm:max-w-lg md:max-w-xl">
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Worker Portal</h1>
              <p className="text-gray-600">Sign in to access your worker dashboard</p>
            </div>
            <LoginForm onSubmit={handleWorkerLogin} role="worker" />
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Need help? Contact{" "}
                <a href="/support" className="text-blue-600 hover:text-blue-500 underline">
                  support
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default WorkerLogin
