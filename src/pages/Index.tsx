import { useState, useCallback, useEffect, useRef } from "react";
import Hero from "@/components/Hero";
import AboutAuditor from "@/components/AboutAuditor";
import AuditForm from "@/components/AuditForm";
import LoadingScreen from "@/components/LoadingScreen";
import ResultsPage from "@/components/ResultsPage";
import { runAudit, type AuditResult } from "@/lib/api/audit";
import { toast } from "sonner";

const COOLDOWN_SECONDS = 10;

const Index = () => {
  const [state, setState] = useState<"home" | "loading" | "results">("home");
  const [auditUrl, setAuditUrl] = useState("");
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [cooldown, setCooldown] = useState(0); // seconds remaining
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isLoading = state === "loading";

  // Tick the cooldown counter down every second
  useEffect(() => {
    if (cooldown <= 0) return;
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(cooldownRef.current!);
  }, [cooldown]);

  const startCooldown = useCallback(() => {
    clearInterval(cooldownRef.current!);
    setCooldown(COOLDOWN_SECONDS);
  }, []);

  const handleSubmit = useCallback(async (url: string) => {
    if (cooldown > 0) return; // Extra safety — AuditForm button is already disabled
    setAuditUrl(url);
    setState("loading");
    try {
      const result = await runAudit(url);
      setAuditResult(result);
      setState("results");
    } catch (error) {
      console.error("Audit failed:", error);
      toast.error(error instanceof Error ? error.message : "Audit failed. Please try again.");
      setState("home");
      startCooldown(); // Only start cooldown on failure so users can try again
    }
  }, [cooldown, startCooldown]);

  const handleBack = useCallback(() => {
    setState("home");
    setAuditUrl("");
    setAuditResult(null);
    startCooldown(); // Short pause before allowing a new audit from the results page
  }, [startCooldown]);

  if (state === "loading") return <LoadingScreen />;
  if (state === "results" && auditResult) {
    return <ResultsPage result={auditResult} onBack={handleBack} />;
  }

  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <div className="separator-glow max-w-xl mx-auto" aria-hidden="true" />
      <AboutAuditor />
      <div className="separator-glow max-w-xl mx-auto" aria-hidden="true" />
      <AuditForm onSubmit={handleSubmit} isLoading={isLoading} cooldown={cooldown} />
    </main>
  );
};

export default Index;
