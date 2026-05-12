import { motion } from "framer-motion";
import { ArrowLeft, Calendar, CircleAlert, CircleDot, Circle, Waves, Gauge, HelpCircle, Download } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { AuditResult } from "@/lib/api/audit";
import { calculateBlindLensScore, getScoreVerdict } from "@/lib/pdf/scoreUtils";
import { BlindLensReportPdf } from "@/lib/pdf/BlindLensReportPdf";

function safeHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "").replace(/\./g, "-");
  } catch {
    return "site";
  }
}

interface ResultsPageProps {
  result: AuditResult;
  onBack: () => void;
}

const severityConfig = {
  '🔴 Red Flag': { icon: CircleAlert, className: "text-destructive bg-destructive/10 border-destructive/20" },
  '🟡 It\'s Complicated': { icon: CircleDot, className: "text-warning bg-warning/10 border-warning/20" },
  '⚪ Minor Ick': { icon: Circle, className: "text-muted-foreground bg-muted border-border" },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const ResultsPage = ({ result, onBack }: ResultsPageProps) => {
  const { severityCounts, issues, closingSummary, url, waveStats, lighthouse } = result;

  const blindLensScore = calculateBlindLensScore(waveStats, lighthouse);
  const verdict = getScoreVerdict(blindLensScore);

  // WAVE-driven headline status
  const waveStatus =
    waveStats.totalErrors === 0
      ? { label: "No critical errors", tone: "text-success" }
      : waveStats.totalErrors >= 10
      ? { label: "Severe accessibility barriers", tone: "text-destructive" }
      : { label: "Multiple accessibility barriers", tone: "text-warning" };

  return (
    <div className="min-h-screen bg-background py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-8 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 w-4 h-4" aria-hidden="true" />
            New Audit
          </Button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">
            Blind Lens Report
          </h1>
          <p className="text-muted-foreground text-lg break-all">{url}</p>
        </motion.div>

        {/* Blind Lens Score — display-only headline metric */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-10"
          aria-labelledby="bls-heading"
        >
          <div className={`rounded-2xl border ${verdict.ring} ${verdict.bg} p-6 md:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6`}>
            <div className="flex items-center gap-6">
              <div
                className={`shrink-0 w-28 h-28 md:w-32 md:h-32 rounded-full border-4 ${verdict.ring} bg-card flex items-center justify-center`}
                role="img"
                aria-label={`Blind Lens Score ${blindLensScore} out of 100, ${verdict.label}`}
              >
                <span className={`text-5xl md:text-6xl font-heading font-bold ${verdict.tone}`}>
                  {blindLensScore}
                </span>
              </div>
              <div>
                <h2 id="bls-heading" className="text-sm uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                  Blind Lens Score
                </h2>
                <p className={`text-3xl font-heading font-bold ${verdict.tone}`}>{verdict.label}</p>
                <p className="text-sm text-muted-foreground mt-1">out of 100</p>
              </div>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 self-start sm:self-center"
                >
                  <HelpCircle className="w-4 h-4" aria-hidden="true" />
                  How is this calculated?
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 text-sm leading-relaxed">
                <p className="font-semibold text-foreground mb-2">How the Blind Lens Score works</p>
                <p className="text-muted-foreground mb-2">
                  We start at 100 and subtract points based on what the scanners found:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground mb-2">
                  <li><span className="text-foreground font-medium">WAVE errors</span>: −6 each (heaviest)</li>
                  <li><span className="text-foreground font-medium">Contrast failures</span>: −3 each</li>
                  <li><span className="text-foreground font-medium">Alerts</span>: −1 each</li>
                </ul>
                <p className="text-muted-foreground mb-2">
                  That WAVE score is blended with Google Lighthouse's accessibility score: roughly <span className="text-foreground font-medium">70% WAVE</span> and <span className="text-foreground font-medium">30% Lighthouse</span>. If Lighthouse data isn't available, the score uses WAVE only.
                </p>
                <p className="text-muted-foreground">
                  Verdicts: 90+ Excellent · 75+ Good · 55+ Fair · 35+ Poor · below 35 Critical.
                </p>
              </PopoverContent>
            </Popover>
          </div>
        </motion.section>

        {/* WAVE Accessibility Scan — PRIMARY headline */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
          aria-labelledby="wave-heading"
        >
          <div className="flex items-center gap-3 mb-2">
            <Waves className="w-7 h-7 text-primary" aria-hidden="true" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Primary accessibility scan
            </span>
          </div>
          <h2 id="wave-heading" className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-3">
            WAVE Accessibility Scan
          </h2>
          <p className="text-muted-foreground text-lg mb-6">
            By WebAIM — the leading lens for evaluating real accessibility barriers on the web.
          </p>

          {/* Headline metric cards */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-1">Overall WAVE assessment</p>
              <p className={`text-2xl font-heading font-bold ${waveStatus.tone}`}>{waveStatus.label}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 text-center">
                <div className="text-4xl font-heading font-bold text-destructive mb-1">{waveStats.totalErrors}</div>
                <p className="text-sm text-muted-foreground font-medium">Errors</p>
              </div>
              <div className="bg-warning/5 border border-warning/20 rounded-xl p-4 text-center">
                <div className="text-4xl font-heading font-bold text-warning mb-1">{waveStats.contrastErrors}</div>
                <p className="text-sm text-muted-foreground font-medium">Contrast Failures</p>
              </div>
              <div className="bg-warning/5 border border-warning/20 rounded-xl p-4 text-center">
                <div className="text-4xl font-heading font-bold text-warning mb-1">{waveStats.alerts}</div>
                <p className="text-sm text-muted-foreground font-medium">Alerts</p>
              </div>
              <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 text-center">
                <div className="text-4xl font-heading font-bold text-accent mb-1">{waveStats.features}</div>
                <p className="text-sm text-muted-foreground font-medium">Positive Features</p>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                <div className="text-4xl font-heading font-bold text-primary mb-1">{waveStats.structuralElements}</div>
                <p className="text-sm text-muted-foreground font-medium">Structural Elements</p>
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            WAVE accessibility data provided by{" "}
            <a
              href="https://wave.webaim.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent/80 underline underline-offset-2 font-medium transition-colors"
            >
              WebAIM
            </a>
            .
          </p>
        </motion.section>

        {/* Severity Tiers — driven by Blind Lens issues */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
          aria-labelledby="severity-heading"
        >
          <h2 id="severity-heading" className="text-2xl font-heading font-bold text-foreground mb-6">
            Severity Breakdown
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 text-center">
              <div className="text-3xl font-heading font-bold text-destructive mb-1">{severityCounts.redFlag}</div>
              <p className="text-sm text-destructive/80 font-medium">🔴 Red Flags</p>
              <p className="text-xs text-muted-foreground mt-1">Blocks access</p>
            </div>
            <div className="bg-warning/5 border border-warning/20 rounded-xl p-4 text-center">
              <div className="text-3xl font-heading font-bold text-warning mb-1">{severityCounts.complicated}</div>
              <p className="text-sm text-warning/80 font-medium">🟡 It's Complicated</p>
              <p className="text-xs text-muted-foreground mt-1">Major friction</p>
            </div>
            <div className="bg-muted border border-border rounded-xl p-4 text-center">
              <div className="text-3xl font-heading font-bold text-muted-foreground mb-1">{severityCounts.minorIck}</div>
              <p className="text-sm text-muted-foreground font-medium">⚪ Minor Icks</p>
              <p className="text-xs text-muted-foreground mt-1">Still workable</p>
            </div>
          </div>
        </motion.section>

        {/* Issues with Blind Lens Commentary */}
        <motion.section
          variants={container}
          initial="hidden"
          animate="show"
          className="mb-12"
          aria-labelledby="issues-heading"
        >
          <h2 id="issues-heading" className="text-2xl font-heading font-bold text-foreground mb-6">
            Issues Through the Blind Lens
          </h2>
          <ol className="space-y-4" aria-label="Accessibility issues with Blind Lens commentary">
            {issues.map((issue, i) => {
              const config = severityConfig[issue.severity] || severityConfig['⚪ Minor Ick'];
              return (
                <motion.li key={i} variants={item}>
                  <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${config.className}`}>
                        {issue.severity}
                      </span>
                      <h3 className="font-semibold text-foreground">{issue.title}</h3>
                    </div>
                    <blockquote className="border-l-4 border-primary/40 pl-4">
                      <p className="text-muted-foreground text-sm leading-relaxed italic">
                        "{issue.blindLensCommentary}"
                      </p>
                    </blockquote>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </motion.section>

        {/* Lighthouse — SECONDARY supplementary checks (a11y only, no perf) */}
        {lighthouse && lighthouse.failedAudits.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
            aria-labelledby="lighthouse-heading"
          >
            <div className="bg-muted/40 border border-border rounded-xl p-5">
              <div className="flex items-start gap-3 mb-2">
                <Gauge className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <h2 id="lighthouse-heading" className="text-sm font-semibold text-foreground">
                    Additional Accessibility Checks (Lighthouse)
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Supplementary automated checks from Google Lighthouse — accessibility audits only ({lighthouse.failedAudits.length} flagged).
                  </p>
                </div>
              </div>
              <Accordion type="single" collapsible className="mt-2">
                <AccordionItem value="lh" className="border-b-0">
                  <AccordionTrigger className="text-sm py-2 hover:no-underline text-muted-foreground hover:text-foreground">
                    View Lighthouse a11y findings
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 mt-2">
                      {lighthouse.failedAudits.map((a) => (
                        <li key={a.id} className="text-sm bg-background/60 border border-border rounded-md px-3 py-2">
                          <p className="font-medium text-foreground">{a.title}</p>
                          {a.displayValue && (
                            <p className="text-xs text-muted-foreground mt-0.5">{a.displayValue}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </motion.section>
        )}

        {/* Closing Summary */}
        {closingSummary && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-16"
            aria-labelledby="summary-heading"
          >
            <h2 id="summary-heading" className="text-2xl font-heading font-bold text-foreground mb-6">
              Wikan's Verdict
            </h2>
            <div className="bg-card border-l-4 border-primary rounded-r-xl p-6">
              <p className="text-foreground leading-relaxed italic">"{closingSummary}"</p>
            </div>
          </motion.section>
        )}

        {/* Download Report */}
        {(() => {
          const domain = safeHostname(url);
          const today = new Date();
          const dateStr = today.toISOString().slice(0, 10);
          const generatedAt = today.toLocaleString();
          const fileName = `blind-lens-audit-${domain}-${dateStr}.pdf`;
          return (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8 text-center"
              aria-label="Download report"
            >
              <PDFDownloadLink
                document={
                  <BlindLensReportPdf
                    result={result}
                    domain={domain}
                    dateStr={dateStr}
                    generatedAt={generatedAt}
                  />
                }
                fileName={fileName}
                className="inline-flex items-center justify-center gap-2 h-14 px-10 text-lg font-heading font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl glow-primary transition-colors"
              >
                {({ loading }) => (
                  <>
                    <Download className="w-5 h-5" aria-hidden="true" />
                    {loading ? "Preparing PDF…" : "Download Report"}
                  </>
                )}
              </PDFDownloadLink>
            </motion.section>
          );
        })()}

        {/* Booking CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
          aria-labelledby="cta-heading"
        >
          <div className="bg-card border border-border rounded-2xl p-8 md:p-10 text-center">
            <h2 id="cta-heading" className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-3">
              Want to fix this?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Book a 30-minute strategy call with Wikan and let's work through your accessibility issues together.
            </p>
            <Button
              asChild
              className="h-14 px-10 text-lg font-heading font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl glow-primary"
            >
              <a
                href="https://calendly.com/madewikandana97"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Calendar className="mr-2 w-5 h-5" aria-hidden="true" />
                Book a Call
              </a>
            </Button>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default ResultsPage;
