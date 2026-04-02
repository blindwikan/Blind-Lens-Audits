import { useState, useCallback } from "react";
import Hero from "@/components/Hero";
import AboutAuditor from "@/components/AboutAuditor";
import LoadingScreen from "@/components/LoadingScreen";
import ResultsPage from "@/components/ResultsPage";
import { runAudit, type AuditResult } from "@/lib/api/audit";
import { toast } from "sonner";

const Index = () => {
  const [state, setState] = useState<"home" | "loading" | "results">("home");
  const [auditUrl, setAuditUrl] = useState("");
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const isLoading = state === "loading";

  const handleSubmit = useCallback(async (url: string) => {
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
    }
  }, []);

  const handleBack = useCallback(() => {
    setState("home");
    setAuditUrl("");
    setAuditResult(null);
  }, []);

  if (state === "loading") return <LoadingScreen />;
  if (state === "results" && auditResult) {
    return <ResultsPage result={auditResult} onBack={handleBack} />;
  }

  return (
    <main className="min-h-screen bg-background">
      <Hero onSubmit={handleSubmit} isLoading={isLoading} />
      <div className="separator-glow max-w-xl mx-auto" aria-hidden="true" />
      <AboutAuditor />
    </main>
  );
};

export default Index;
