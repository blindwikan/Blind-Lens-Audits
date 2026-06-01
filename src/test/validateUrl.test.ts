import { describe, it, expect } from "vitest";
import { validateUrl } from "@/lib/validateUrl";

describe("validateUrl", () => {
  // --- Cases that SHOULD fail ---

  it("returns an error when the input is empty", () => {
    expect(validateUrl("")).not.toBeNull();
  });

  it("returns an error when the input is only whitespace", () => {
    expect(validateUrl("   ")).not.toBeNull();
  });

  it("returns an error and suggests adding https:// when protocol is missing", () => {
    const error = validateUrl("google.com");
    expect(error).not.toBeNull();
    // The suggestion should include the domain they typed
    expect(error).toContain("https://google.com");
  });

  it("returns an error for a completely random word", () => {
    expect(validateUrl("hello")).not.toBeNull();
  });

  it("returns an error for localhost", () => {
    expect(validateUrl("http://localhost:3000")).not.toBeNull();
  });

  it("returns an error for 127.0.0.1 (loopback address)", () => {
    expect(validateUrl("http://127.0.0.1")).not.toBeNull();
  });

  it("returns an error for a private network IP (192.168.x.x)", () => {
    expect(validateUrl("http://192.168.1.1")).not.toBeNull();
  });

  // --- Cases that SHOULD pass ---

  it("returns null (no error) for a valid https URL", () => {
    expect(validateUrl("https://google.com")).toBeNull();
  });

  it("returns null for a valid https URL with a path", () => {
    expect(validateUrl("https://www.bbc.co.uk/news")).toBeNull();
  });

  it("returns null for a valid http URL", () => {
    // http:// is technically valid — some older sites still use it
    expect(validateUrl("http://example.com")).toBeNull();
  });

  it("returns null for a URL with query parameters", () => {
    expect(validateUrl("https://example.com/page?ref=123")).toBeNull();
  });
});
