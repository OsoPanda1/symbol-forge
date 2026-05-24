export class AppError extends Error {
  constructor(message: string, public status = 500) {
    super(message);
  }
}

export function handleError(error: unknown) {
  console.error("[ERROR]", error);

  if (error instanceof AppError) {
    return new Response(JSON.stringify({ error: error.message }), { status: error.status });
  }

  return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
}
