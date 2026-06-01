import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mock the Supabase client ---
// We don't want tests to hit the real server. This creates a fake
// version of Supabase that we can control in each test.
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

import { runAudit } from "@/lib/api/audit";
import { supabase } from "@/integrations/supabase/client";

// Helper to make TypeScript happy when setting mock return values
const mockInvoke = supabase.functions.invoke as ReturnType<typeof vi.fn>;

describe("runAudit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns audit data when the call is successful", async () => {
    const fakeResult = {
      success: true,
      url: "https://example.com",
      accessibilityScore: 72,
      severityCounts: { redFlag: 1, complicated: 2, minorIck: 3 },
      issues: [],
      closingSummary: "Overall okay.",
    };
    mockInvoke.mockResolvedValueOnce({ data: fakeResult, error: null });

    const result = await runAudit("https://example.com");
    expect(result).toEqual(fakeResult);
  });

  it("throws an error when Supabase returns a network/auth error", async () => {
    mockInvoke.mockResolvedValueOnce({
      data: null,
      error: { message: "Edge function error" },
    });

    await expect(runAudit("https://example.com")).rejects.toThrow("Edge function error");
  });

  it("throws an error when the response contains an error field (e.g. WAVE quota exceeded)", async () => {
    mockInvoke.mockResolvedValueOnce({
      data: { error: "WAVE rate limit reached. Try again later." },
      error: null,
    });

    await expect(runAudit("https://example.com")).rejects.toThrow(
      "WAVE rate limit reached. Try again later."
    );
  });

  it("calls Supabase with the correct function name and URL body", async () => {
    const fakeResult = {
      success: true,
      url: "https://example.com",
      accessibilityScore: 80,
      severityCounts: { redFlag: 0, complicated: 1, minorIck: 1 },
      issues: [],
      closingSummary: "Good job.",
    };
    mockInvoke.mockResolvedValueOnce({ data: fakeResult, error: null });

    await runAudit("https://example.com");

    expect(mockInvoke).toHaveBeenCalledWith("accessibility-audit", {
      body: { url: "https://example.com" },
    });
  });
});
