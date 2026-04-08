import { z } from 'zod';

export const envSchema = z.object({
  VITE_SERVER_BASEURL: z.string().url(),
  VITE_GOOGLE_CLIENT_ID: z.string().min(10),
  VITE_CLOUDINARY_BASE_URL: z.string().min(10),
  VITE_CLOUDINARY_UPLOAD_PRESET: z.string().min(1),
  VITE_STRIPE_PUBLIC_KEY: z.string().min(10),
  VITE_ORS_BEARER: z.string().min(10),
  
});
