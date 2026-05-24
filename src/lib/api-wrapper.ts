import { handleError } from "@/lib/error-handler";

export function withSecurity(handler: (req: Request) => Promise<Response>) {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (err) {
      return handleError(err);
    }
  };
}
