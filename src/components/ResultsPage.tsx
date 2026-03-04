import { motion } from "framer-motion";
import { Shield, AlertTriangle, AlertCircle, Info, Eye, ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AuditResult } from "@/lib/api/audit";

interface ResultsPageProps {
  result: AuditResult;
  onBack: () => void;
}

const severityConfig = {
  Critical: { icon: AlertTriangle, className: "text-destructive bg-destructive/10 border-destructive/20" },
  Serious: { icon: AlertCircle, className: "text-warning bg-warning/10 border-warning/20" },
  Moderate: { icon: Info, className: "text-info bg-info/10 border-info/20" },
  Minor: { icon: Info, className: "text-muted-foreground bg-muted border-border" },
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
  const { wcagSummary, fixes, commentary, url } = result;

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
            Audit Results
          </h1>
          <p className="text-muted-foreground text-lg break-all">{url}</p>
        </motion.div>

        {/* WCAG Summary */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
          aria-labelledby="wcag-heading"
        >
          <h2 id="wcag-heading" className="text-2xl font-heading font-bold text-foreground mb-6 flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" aria-hidden="true" />
            WCAG Compliance Summary
          </h2>
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
              <div className="text-5xl font-heading font-bold text-destructive">{wcagSummary.score}/100</div>
              <div>
                <p className="text-lg font-semibold text-foreground">{wcagSummary.level}</p>
                <p className="text-muted-foreground">{wcagSummary.violations} violations found</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {wcagSummary.categories.map((cat) => (
                <div key={cat.name} className="bg-secondary/50 rounded-xl p-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-foreground">{cat.name}</span>
                    <span className="text-muted-foreground">{cat.score}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden" role="progressbar" aria-valuenow={cat.score} aria-valuemin={0} aria-valuemax={100} aria-label={`${cat.name} score: ${cat.score}%`}>
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Top Fixes */}
        <motion.section
          variants={container}
          initial="hidden"
          animate="show"
          className="mb-12"
          aria-labelledby="fixes-heading"
        >
          <h2 id="fixes-heading" className="text-2xl font-heading font-bold text-foreground mb-6 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-warning" aria-hidden="true" />
            Top {fixes.length} Prioritized Fixes
          </h2>
          <ol className="space-y-3" aria-label="Prioritized accessibility fixes">
            {fixes.map((fix, i) => {
              const config = severityConfig[fix.severity] || severityConfig.Minor;
              const Icon = config.icon;
              return (
                <motion.li key={i} variants={item}>
                  <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-start gap-4">
                      <span className="font-heading font-bold text-muted-foreground text-sm mt-1 w-6 shrink-0">
                        {i + 1}.
                      </span>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${config.className}`}>
                            <Icon className="w-3 h-3" aria-hidden="true" />
                            {fix.severity}
                          </span>
                          <h3 className="font-semibold text-foreground">{fix.title}</h3>
                        </div>
                        <p className="text-muted-foreground text-sm">{fix.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </motion.section>

        {/* Blind Lens Commentary */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
          aria-labelledby="commentary-heading"
        >
          <h2 id="commentary-heading" className="text-2xl font-heading font-bold text-foreground mb-6 flex items-center gap-3">
            <Eye className="w-6 h-6 text-primary" aria-hidden="true" />
            Blind Lens Commentary
          </h2>
          <div className="space-y-4">
            {commentary.map((comment, i) => (
              <motion.blockquote
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="bg-card border-l-4 border-primary rounded-r-xl p-5"
              >
                <p className="text-foreground leading-relaxed italic">"{comment}"</p>
              </motion.blockquote>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center pb-16"
        >
          <div className="separator-glow mb-12" aria-hidden="true" />
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">
            Ready to make your site accessible?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Book a strategy session with Wikan to turn these findings into an actionable plan.
          </p>
          <Button
            asChild
            className="h-14 px-10 text-lg font-heading font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl glow-primary"
          >
            <a
              href="https://cal.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Calendar className="mr-2 w-5 h-5" aria-hidden="true" />
              Get Your Strategy Session
            </a>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default ResultsPage;
