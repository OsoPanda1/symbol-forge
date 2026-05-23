import { createHash } from "node:crypto";

export type SymbolicDNA = {
  dnaHash: string;
  entropy: number;
  signature: string;
};

export function buildSymbolicDNA(input: { prompt: string; styleId?: string; sigilContent: string }): SymbolicDNA {
  const canonical = `${input.prompt.trim().toLowerCase()}|${input.styleId ?? "default"}|${input.sigilContent.trim()}`;
  const dnaHash = createHash("sha256").update(canonical).digest("hex");
  const signature = dnaHash.slice(0, 24);
  const uniqueChars = new Set(canonical).size;
  const entropy = Number((uniqueChars / Math.max(canonical.length, 1)).toFixed(4));
  return { dnaHash, entropy, signature };
}
