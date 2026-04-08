import { envSchema } from "./env.schema";


const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  console.error(' Invalid frontend environment variables:', parsed.error.format());
  throw new Error('Invalid VITE_ environment variables');
}else{
    console.log('env is okey')
}

export const ENV = parsed.data;