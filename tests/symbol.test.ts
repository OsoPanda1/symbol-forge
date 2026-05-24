import { describe, expect, it } from "vitest";
import { rateLimit } from "../src/lib/rate-limit";

describe("Rate Limit", () => {
  it("should block after max", () => {
    const key = `test-${Date.now()}`;
    for (let i = 0; i < 30; i++) {
      expect(rateLimit(key, 30, 1000)).toBe(true);
    }
    expect(rateLimit(key, 30, 1000)).toBe(false);
  });
});
