import { useState, useCallback } from "react";
import Hero from "@/components/Hero";
import AboutAuditor from "@/components/AboutAuditor";
import AuditForm from "@/components/AuditForm";
import LoadingScreen from "@/components/LoadingScreen";
import ResultsPage from "@/components/ResultsPage";

const Index = () => {
  const [state, setState] = useState<"home" | "loading" | "results">("home");
  const [auditUrl, setAuditUrl] = useState("");

  const handleSubmit = useCallback((url: string) => {
    setAuditUrl(url);
    setState("loading");
    // Simulate audit processing
    setTimeout(() => setState("results"), 4500);
  }, []);

  const handleBack = useCallback(() => {
    setState("home");
    setAuditUrl("");
  }, []);

  if (state === "loading") return <LoadingScreen />;
  if (state === "results") return <ResultsPage url={auditUrl} onBack={handleBack} />;

  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <div className="separator-glow max-w-xl mx-auto" aria-hidden="true" />
      <AboutAuditor />
      <div className="separator-glow max-w-xl mx-auto" aria-hidden="true" />
      <AuditForm onSubmit={handleSubmit} isLoading={false} />
    </main>
  );
};

export default Index;
