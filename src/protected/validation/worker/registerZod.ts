import { z } from "zod";

// Step 1 base schema without `.refine`
export const Step1Schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[a-z]/, "Password must include at least one lowercase letter.")
    .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
    .regex(/[0-9]/, "Password must include at least one number.")
    .regex(
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/,
      "Password must include at least one special character.",
    )
    .regex(
      /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]+$/,
      "Password contains invalid characters.",
    ),
  confirmPassword: z.string(),
});

// Step 2 & 3 stay unchanged
export const Step2Schema = z.object({
  category: z.string().min(1, "Work category is required"),
  experience: z.string().min(1, "Experience is required"),
});

export const Step3Schema = z.object({
  zone: z.string().min(1, "Zone is required"),
  latitude: z.string(),
  longitude: z.string(),
});

// Merge all base schemas
const MergedSchema = Step1Schema.merge(Step2Schema)
  .merge(Step3Schema)
  .extend({
    documents: z.union([z.instanceof(File), z.null()]).optional(),
  });

// Final schema with cross-field validation
export const FullWorkerSchema = MergedSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  },
);

export type WorkerRegistrationData = z.infer<typeof FullWorkerSchema>;
