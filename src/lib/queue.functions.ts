import { supabaseAdmin } from "@/integrations/supabase/client.server";

const admin: any = supabaseAdmin;

export type QueueJobPayload = Record<string, unknown>;

export async function enqueueJob(topic: string, payload: QueueJobPayload, runAt = new Date()) {
  const { data, error } = await admin
    .from("job_queue")
    .insert({ topic, payload, run_at: runAt.toISOString() })
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}

export async function claimNextJob(workerId: string) {
  const { data, error } = await admin.rpc("claim_next_job", { worker_id: workerId });
  if (error) throw error;
  return data?.[0] ?? null;
}

export async function completeJob(jobId: string) {
  const { error } = await admin.from("job_queue").update({ status: "done", last_error: null }).eq("id", jobId);
  if (error) throw error;
}

export async function failJob(jobId: string, errorMessage: string) {
  const { error } = await admin.rpc("fail_job_with_retry", {
    p_job_id: jobId,
    p_error: errorMessage.slice(0, 500),
  });
  if (error) throw error;
}
