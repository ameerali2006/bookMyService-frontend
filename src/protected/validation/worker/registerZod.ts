import { z } from "zod"

// Step 1 base schema without `.refine`
export const Step1Schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    
    .refine((val) => /[a-z]/.test(val), { message: "Must include lowercase letter" })
    .refine((val) => /[0-9]/.test(val), { message: "Must include a number" }),
  confirmPassword: z.string(),
})

// Step 2 & 3 stay unchanged
export const Step2Schema = z.object({
  category: z.string().min(1, "Work category is required"),
  experience: z.string().min(1, "Experience is required"),
})

export const Step3Schema = z.object({
  zone: z.string().min(1, "Zone is required"),
  latitude: z.string(),
  longitude: z.string(),
})

// Merge all base schemas
const MergedSchema = Step1Schema
  .merge(Step2Schema)
  .merge(Step3Schema)
  .extend({
    documents: z.union([z.instanceof(File), z.null()]).optional(),
  })

// Final schema with cross-field validation
export const FullWorkerSchema = MergedSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }
)

export type WorkerRegistrationData = z.infer<typeof FullWorkerSchema>
