import { motion } from "framer-motion";
import { Shield, ArrowLeft, Calendar, CircleAlert, CircleDot, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AuditResult } from "@/lib/api/audit";

interface ResultsPageProps {
  result: AuditResult;
  onBack: () => void;
}

const severityConfig = {
  '🔴 Red Flag': { icon: CircleAlert, className: "text-destructive bg-destructive/10 border-destructive/20", label: "Red Flag — blocks access completely" },
  '🟡 It\'s Complicated': { icon: CircleDot, className: "text-warning bg-warning/10 border-warning/20", label: "It's Complicated — usable, but with major friction" },
  '⚪ Minor Ick': { icon: Circle, className: "text-muted-foreground bg-muted border-border", label: "Minor Ick — annoying, but still workable" },
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
  const { accessibilityScore, severityCounts, issues, closingSummary, url } = result;

  const scoreColor = accessibilityScore >= 90 ? "text-green-500" : accessibilityScore >= 50 ? "text-warning" : "text-destructive";

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

        {/* Score + Severity Tiers */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
          aria-labelledby="score-heading"
        >
          <h2 id="score-heading" className="text-2xl font-heading font-bold text-foreground mb-6 flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" aria-hidden="true" />
            Accessibility Score
          </h2>
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
              <div className={`text-5xl font-heading font-bold ${scoreColor}`}>{accessibilityScore}/100</div>
              <p className="text-muted-foreground">
                Based on Google PageSpeed Insights accessibility audit
              </p>
            </div>

            {/* Severity tier breakdown */}
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
