import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {Card,CardContent, CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authService } from '@/api/AuthService';
import { SuccessToast } from '@/components/shared/Toaster';
import GoogleLoginComponent from '@/components/user/GoogleLogin';
import OtpModal from '@/components/shared/OtpModal';
import { useDispatch } from 'react-redux';
import { addUser } from '@/redux/slice/userTokenSlice';


const formSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Invalid email address."),
    phone: z
      .string()
      .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(
        /^[a-z0-9]+$/,
        "Password must contain only lowercase letters and numbers."
      )
      .regex(
        /[a-z]/,
        "Password must include at least one lowercase letter."
      )
      .regex(
        /[0-9]/,
        "Password must include at least one number."
      ),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Form types
type FormValues = z.infer<typeof formSchema>;


const register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [storedFormValues, setStoredFormValues] = useState<FormValues | null>(
    null
  );
  const navigate=useNavigate()
  const dispatch=useDispatch()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "",phone:"", password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: FormValues): Promise<void> => {
    setIsLoading(true);
    try {
      setStoredFormValues(values);
      console.log('1')

     const otpResponse = await authService.generateOtp(values.email);
     console.log('2')
      console.log("✅ OTP generated successfully:", otpResponse.data);
      console.log('3')
      setIsOtpModalOpen(true);
      console.log('4')
      console.log("Form submitted:", values);
    } catch (error) {
      console.error("Error submitting form", error);
    } finally {
      setIsLoading(false);
    }
  };
  const onFinalSubmit = async () => {
   ;
    try {
      const response=await authService.register({...storedFormValues as FormValues,role:"user"});
      if(response.data.success){
        SuccessToast("successfully registered !!");
        dispatch(addUser(response.data.userData))
        navigate("/")
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <> 
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* ✅ Left Side Image (Only for laptop and above) */}
      <div className="hidden lg:flex lg:w-1/2 justify-center items-center">
        <img
          src="https://res.cloudinary.com/dp1sx1dx2/image/upload/v1750684879/login-workers-img_jaf3eo.webp" 
          alt="Register Visual"
          className="w-2/3 h-auto object-contain"
        />
      </div>
    
      {/* ✅ Right Side - Register Form */}
      <div className="flex justify-center items-center w-full lg:w-1/2 p-4">
        <Card className="w-full max-w-md border border-gray-400">
          <CardHeader>
            <CardTitle className="text-xl">Create an Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input className="border border-gray-400" placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                        className="border border-gray-400"
                          type="email"
                          placeholder="john@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input
                      className="border border-gray-400"
                        type="tel"
                        placeholder="9876543210"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                          className="border border-gray-400"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                        className="border border-gray-400"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <GoogleLoginComponent userType='user' />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center pt-4">
            <p className="text-sm">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-primary hover:underline"
              >
                Sign in
              </button>
            </p>
          </CardFooter>
        </Card>
        <OtpModal
          role='user'
          isOpen={isOtpModalOpen}
          onClose={() => setIsOtpModalOpen(false)}
          onFinalSubmit={onFinalSubmit}
          email={storedFormValues?.email || ""}
        />
      </div>
    </div>

    </>
  )
}

export default register
