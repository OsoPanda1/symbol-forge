import { z } from "zod";

const EnvSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  RATE_LIMIT_WINDOW: z.coerce.number().default(60),
  RATE_LIMIT_MAX: z.coerce.number().default(30),
});

export const env = EnvSchema.parse(process.env);
