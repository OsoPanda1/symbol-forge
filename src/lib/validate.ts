import type { z } from "zod";
import { AppError } from "@/lib/error-handler";

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AppError("Invalid input", 400);
  }
  return result.data;
}
