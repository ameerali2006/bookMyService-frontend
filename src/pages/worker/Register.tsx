"use client"

import type React from "react"

import { useState,useEffect } from "react"
import {
  
  User,
  Briefcase,
  MapIcon,
  Wrench,
  Zap,
  Droplets,
  Hammer,
  Car,
  Utensils,
} from "lucide-react"
import { Button } from "@/components/ui/button"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type {WorkerRegistrationData} from "@/protected/validation/worker/registerZod";
import {Step1Schema,Step2Schema,Step3Schema,} from "@/protected/validation/worker/registerZod"
import OtpModal from "@/components/shared/OtpModal"; // adjust path as needed
import {authService} from "@/api/AuthService";
import axios from "axios"

import "leaflet/dist/leaflet.css";
import { ErrorToast, SuccessToast } from "@/components/shared/Toaster"
import { useNavigate } from "react-router-dom"
import Step3 from "@/components/worker/Register/StepThree"
import Step2 from "@/components/worker/Register/StepTwo"
import Step1 from "@/components/worker/Register/StepOne"
import GoogleLoginComponent from "@/components/user/GoogleLogin"
import { addWorker } from "@/redux/slice/workerTokenSlice"
import { useDispatch } from "react-redux"




type categoryData={
  label:string,
  value:string
}
export default function WorkerRegistration() {
  const [isOtpOpen, setIsOtpOpen] = useState(false)
  const [workerEmail, setWorkerEmail] = useState("")
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isGoogleAuth, setIsGoogleAuth] = useState(false)
  const [formData, setFormData] = useState<WorkerRegistrationData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    category: "",
    experience: "",
    documents: null as File | null,
    latitude: "10.5009",
    longitude: " 76.5874",
    zone: "",
    
    
  })
  const [workCategories, setWorkCategories] = useState<
  { value: string; label: string; icon: typeof Briefcase; color: string }[]
>([]);
  const [errors, setErrors] = useState<Record<string, string>>({})
  const navigate=useNavigate()
  const dispatch=useDispatch()
  useEffect(()=>{
    const fetchData=async()=>{
      try {
        const response = await authService.getServiceNames()
        if(!response.data.success){
          ErrorToast("service name is not found")
          return
        }
        const data=response.data.data
        const colors=["text-blue-500","text-yellow-500","text-amber-600","text-gray-600", "text-green-500","text-red-500"]
        setWorkCategories(
          (data as categoryData[]).map((dat, i) => ({
            value: dat.value,
            label: dat.label.charAt(0).toUpperCase() + dat.label.slice(1),
            icon: Briefcase,
            color: colors[i % colors.length],
          }))
        );



      } catch (error) {
        
      }
    }
    fetchData()
  },[] )

  const totalSteps = 3
  const progress = (currentStep / totalSteps) * 100

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[a-z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 25
    return strength
  }

  const passwordStrength = getPasswordStrength(formData.password)
  const getStrengthColor = (strength: number) => {
    if (strength < 50) return "bg-red-500"
    if (strength < 75) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getStrengthText = (strength: number) => {
    if (strength < 50) return "Weak"
    if (strength < 75) return "Medium"
    return "Strong"
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleFileUpload = async(event: React.ChangeEvent<HTMLInputElement>) => {  const file = event.target.files?.[0];
  if (!file) return;

  try {
    // 1. Get secure signature from backend
    const { data } = await authService.workerCloudinory('worker-documents');

    // 2. Prepare form data for Cloudinary upload
    const formDataPayload = new FormData();
    formDataPayload.append("file", file);
    formDataPayload.append("api_key", data.apiKey);
    formDataPayload.append("timestamp", data.timestamp.toString());
    formDataPayload.append("signature", data.signature);
    formDataPayload.append("folder", data.folder);

    // 3. Upload to Cloudinary
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${data.cloudName}/auto/upload`;

    const uploadRes = await axios.post(cloudinaryUrl, formDataPayload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const uploadedUrl = uploadRes.data.secure_url;
    console.log("url",uploadedUrl)

    setFormData((prev) => ({
      ...prev,
      documents: uploadedUrl,
    }));
  } catch (err) {
    console.error("Cloudinary upload failed", err);
    // Optionally show toast or error message
  }
  }

  const validateStep = (step: number, formData: WorkerRegistrationData, setErrors: Function) => {
  let result

  if (step === 1) {
    result = Step1Schema.safeParse(formData)
  } else if (step === 2) {
    result = Step2Schema.safeParse(formData)
  } else if (step === 3) {
    result = Step3Schema.safeParse(formData)
  }

  if (result?.success === false) {
    const fieldErrors: Record<string, string> = {}
    result.error.errors.forEach((error) => {
      if (error.path[0]) fieldErrors[error.path[0] as string] = error.message
    })
    setErrors(fieldErrors)
    return false
  }

  setErrors({})
  return true
}

  const nextStep = (
    currentStep: number,
    setCurrentStep: (cb: (prev: number) => number) => void,
    totalSteps: number,
    formData: WorkerRegistrationData,
    setErrors: Function
  ) => {
    if (validateStep(currentStep, formData, setErrors)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
    }
  }

  const prevStep = (
    setCurrentStep: (cb: (prev: number) => number) => void
  ) => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (
    currentStep: number,
    formData: WorkerRegistrationData,
    setErrors: Function
  ) => {
    if (validateStep(currentStep, formData, setErrors)) {
      try {

        if(isGoogleAuth){
           handleWorkerVerified()

        }else{
          // optional: Send register data to server (or wait until after OTP)
          await authService.workerGenerateOtp(formData.email)
          setWorkerEmail(formData.email)
          setIsOtpOpen(true)
        }
        
      } catch (error) {
        console.error("OTP generation failed", error)
        // Optionally show toast or error
      }
    }
  }
  const handleLocation=async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`
          );
          const data = await response.json();
          console.log(data)
          const city =
            data?.address?.city || data?.address?.town || data?.address?.village || "";

          setFormData((prev) => ({
            ...prev,
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6),
            zone: city || "", // Auto-fill zone
          }));
        } catch (error) {
          console.error("Reverse geocoding failed", error);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Failed to get location. Please allow location access.");
      }
    );
  }
  type Props = {
    setFormData: React.Dispatch<React.SetStateAction<WorkerRegistrationData>>;
  };

  

  const handleWorkerVerified = async () => {
    try {
      console.log("Final submit: ", formData)
      setIsOtpOpen(false)
      console.log(formData)
      const response = await authService.workerRegister({...formData,role:"worker"})
      if(response.data.success){
        SuccessToast("Worker registered successfully!")
        console.log("hello worker register ayyiiii")
        dispatch(addWorker(response.data.worker))
        navigate("/worker/dashboard")
      }else{
        ErrorToast("Worker registeration is failed, try again")
      }
    } catch (error: any) {
      console.error("Worker registration failed", error)

      ErrorToast(
        error?.response?.data?.message || "Registration failed. Please try again."
      )
    }
  }

  const renderStepContent = () => {
  switch (currentStep) {
    case 1:
      return (
        <Step1
          formData={formData}
          errors={errors}
          showPassword={showPassword}
          isGoogleUser={isGoogleAuth}
          showConfirmPassword={showConfirmPassword}
          setShowPassword={setShowPassword}
          setShowConfirmPassword={setShowConfirmPassword}
          handleInputChange={handleInputChange}
          passwordStrength={passwordStrength}
          getStrengthColor={getStrengthColor}
          getStrengthText={getStrengthText}
        />
      )
    case 2:
      return (
        <Step2
          formData={formData}
          errors={errors}
          handleInputChange={handleInputChange}
          handleFileUpload={handleFileUpload}
          workCategories={workCategories}
        />
      )
    case 3:
      return (
        <Step3
          formData={formData}
          errors={errors}
          handleInputChange={handleInputChange}
          handleLocation={handleLocation}
          setFormData={setFormData}
        />
      )
    default:
      return null
  }
}


  const getStepIcon = (step: number) => {
    switch (step) {
      case 1:
        return User
      case 2:
        return Briefcase
      case 3:
        return MapIcon
      default:
        return User
    }
  }

  return (
    <div className="min-h-screen lg:flex " >
      {/* Left side - Image (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden ">
        <div className="absolute inset-0" />
        
        {/* Centered Image */}
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          <img
            src="https://res.cloudinary.com/dp1sx1dx2/image/upload/v1750684879/login-workers-img_jaf3eo.webp"
            alt="Professional technicians"
            className="w-2/3 h-auto object-contain"
          />
        </div>

        {/* Bottom-left Text */}
        <div className="absolute bottom-8 left-8 text-white z-20">
          <h2 className="text-3xl font-bold mb-2">Join Our Professional Network</h2>
          <p className="text-lg opacity-90">Connect with customers and grow your business</p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-4 lg:p-8 ">
        <Card className="w-full max-w-md shadow-xl rounded-2xl border-0">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Worker Registration</h1>
              <p className="text-gray-600">
                Step {currentStep} of {totalSteps}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <Progress value={progress} className="h-2 rounded-full" />
              <div className="flex justify-between mt-4">
                {[1, 2, 3].map((step) => {
                  const StepIcon = getStepIcon(step)
                  return (
                    <div
                      key={step}
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        step <= currentStep
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-white border-gray-300 text-gray-400"
                      }`}
                    >
                      <StepIcon className="w-5 h-5" />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Step Content */}
            <div className="mb-8">{renderStepContent()}</div>
            

            {/* Navigation Buttons */}
            <div className="space-y-4">
              {currentStep < totalSteps ? (
                <div className="flex gap-4">
                  {currentStep > 1 && (
                    <Button
                      variant="outline"
                      onClick={() => prevStep(setCurrentStep)}
                      className="flex-1 rounded-xl bg-transparent"
                    >
                      Previous
                    </Button>
                  )}
                  <Button
                    onClick={() => nextStep(currentStep, setCurrentStep, totalSteps, formData, setErrors)}
                    className="flex-1 bg-[#051F54] hover:bg-[#0A2B7C] rounded-xl"
                  >
                    Next Step
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => prevStep(setCurrentStep)}
                      className="flex-1 rounded-xl bg-transparent"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => handleSubmit(currentStep, formData, setErrors)}
                      className="flex-1 bg-[#051F54] hover:bg-[#0A2B7C] rounded-xl"
                    >
                      Complete Registration
                    </Button>
                  </div>
                </div>
                
              )}
            </div>
            {currentStep === 1 && !isGoogleAuth && (
              <div className="mb-6">
                <div className="text-center text-gray-500 mt-2 text-sm">or</div>
                
                <GoogleLoginComponent
                  userType="worker"
                  onGoogleSuccess={(email: string, name: string) => {
                    setIsGoogleAuth(true);
                    setFormData((prev) => ({
                      ...prev,
                      email,
                      name,
                      password: "123qwe123",
                      confirmPassword: "123qwe123",
                     
                    }));
                    
                  }}
                />
                
              </div>
            )}


          </CardContent>
        </Card>
      </div>
      <OtpModal
        role="worker"
        isOpen={isOtpOpen}
        onClose={() => setIsOtpOpen(false)}
        onFinalSubmit={handleWorkerVerified}
        email={workerEmail}
        generateOtp={authService.workerGenerateOtp}
        verifyOtp={authService.workerVerifyOtp}
      />
    </div>
  )
}

