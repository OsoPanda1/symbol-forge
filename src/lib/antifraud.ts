const HIGH_RISK_DOMAINS = new Set(["mailinator.com", "tempmail.com", "10minutemail.com"]);

export type FraudInput = {
  email: string;
  amountMxn: number;
  prompt: string;
  ip: string;
  userAgent: string;
  recentAttempts: number;
};

export function fraudScore(input: FraudInput): { score: number; reasons: string[]; blocked: boolean } {
  let score = 0;
  const reasons: string[] = [];

  const domain = input.email.toLowerCase().split("@")[1] ?? "";
  if (HIGH_RISK_DOMAINS.has(domain)) {
    score += 40;
    reasons.push("disposable_email");
  }

  if (input.amountMxn > 200000) {
    score += 25;
    reasons.push("high_amount");
  }

  if (input.recentAttempts >= 6) {
    score += 30;
    reasons.push("velocity_abuse");
  }

  if (/(free money|hack|stolen|carding)/i.test(input.prompt)) {
    score += 20;
    reasons.push("prompt_risk_keywords");
  }

  if (input.userAgent.length < 12 || input.ip === "unknown") {
    score += 10;
    reasons.push("low_quality_fingerprint");
  }

  return { score, reasons, blocked: score >= 60 };
}
