import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { SubmitHandler } from "react-hook-form";
import { useForm} from "react-hook-form";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import GoogleLoginComponent from "@/components/user/GoogleLogin";
import { ErrorToast } from "./Toaster";
type SubmitResult = {
  success: boolean;
  message: string;
};
// Validation schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});

// TypeScript types
type LoginFormValues = z.infer<typeof loginSchema>;
interface LoginFormProps {
  onSubmit: (data: LoginFormValues) => Promise<SubmitResult>;
  role: string;
}

export default function LoginForm({ onSubmit, role }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errormsg, setErrormsg] = useState<string>("");
  const navigate = useNavigate();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    setIsLoading(true);
    try {
      let res=await onSubmit(values);
      if(!res.success){
        setErrormsg(res.message)
      }
    } catch (error) {
      console.error(error);
      setErrormsg("Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">
            {role === "admin" ? "Admin Sign in" : "Sign in"}
          </CardTitle>
          <CardDescription>Enter your credentials to continue</CardDescription>
          {errormsg && <p className="text-red-500">{errormsg}</p>}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="user@example.com"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setErrormsg("");
                        }}
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
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setErrormsg("");
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {showPassword ? "Hide password" : "Show password"}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Show "Forgot Password" and "Google Login" only for users */}
              {(role == "user"||role=="worker") && (
                <>
                  <button
                    type="button"
                    onClick={() => navigate(role=="user"?"/forgot-password":"/worker/forgot-password")}
                    className="text-primary text-sm hover:underline"
                  >
                    Forgot Password?
                  </button>
                  <GoogleLoginComponent userType={`${role}`} />
                </>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {role === "admin"
                      ? "Signing in as Admin..."
                      : "Signing in..."}
                  </>
                ) : role === "admin" ? (
                  "Admin Sign in"
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        {/* Show "Don't have an account? Register" only for users */}
        {role !== "admin" && (
          <CardFooter className="flex justify-center border-t pt-6">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button
                onClick={() => navigate(role=="user"?"/register":"/worker/register" )}
                className="text-primary hover:underline"
              >
                Register
              </button>
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
