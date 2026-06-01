import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AuditForm from "@/components/AuditForm";

describe("AuditForm", () => {
  it("renders the URL input and submit button", () => {
    render(<AuditForm onSubmit={vi.fn()} isLoading={false} />);
    expect(screen.getByPlaceholderText("https://yourwebsite.com")).toBeTruthy();
    expect(screen.getByRole("button", { name: /audit my website/i })).toBeTruthy();
  });

  it("shows a hint message by default (not an error)", () => {
    render(<AuditForm onSubmit={vi.fn()} isLoading={false} />);
    expect(screen.getByText(/enter any public url/i)).toBeTruthy();
  });

  it("shows an inline error when submitted with an empty URL", () => {
    render(<AuditForm onSubmit={vi.fn()} isLoading={false} />);
    fireEvent.click(screen.getByRole("button", { name: /audit my website/i }));
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByText(/please enter a website url/i)).toBeTruthy();
  });

  it("shows an error when a URL is missing https://", () => {
    render(<AuditForm onSubmit={vi.fn()} isLoading={false} />);
    fireEvent.change(screen.getByPlaceholderText("https://yourwebsite.com"), {
      target: { value: "google.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /audit my website/i }));
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByText(/https:\/\/google\.com/i)).toBeTruthy();
  });

  it("clears the error when the user starts typing again", () => {
    render(<AuditForm onSubmit={vi.fn()} isLoading={false} />);
    // Trigger an error first
    fireEvent.click(screen.getByRole("button", { name: /audit my website/i }));
    expect(screen.getByRole("alert")).toBeTruthy();
    // Then start typing — error should go away
    fireEvent.change(screen.getByPlaceholderText("https://yourwebsite.com"), {
      target: { value: "h" },
    });
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("calls onSubmit with the URL when a valid URL is entered", () => {
    const onSubmit = vi.fn();
    render(<AuditForm onSubmit={onSubmit} isLoading={false} />);
    fireEvent.change(screen.getByPlaceholderText("https://yourwebsite.com"), {
      target: { value: "https://google.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /audit my website/i }));
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith("https://google.com");
  });

  it("does NOT call onSubmit when the URL is invalid", () => {
    const onSubmit = vi.fn();
    render(<AuditForm onSubmit={onSubmit} isLoading={false} />);
    fireEvent.change(screen.getByPlaceholderText("https://yourwebsite.com"), {
      target: { value: "not-a-url" },
    });
    fireEvent.click(screen.getByRole("button", { name: /audit my website/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("disables the input and button while loading", () => {
    render(<AuditForm onSubmit={vi.fn()} isLoading={true} />);
    expect(screen.getByPlaceholderText("https://yourwebsite.com")).toHaveProperty("disabled", true);
    expect(screen.getByRole("button", { name: /audit my website/i })).toHaveProperty("disabled", true);
  });
});
