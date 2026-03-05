import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Check, Loader2, Circle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const STEPS = [
  "Scraping website content",
  "Analyzing accessibility",
  "Generating report",
];

const STEP_DELAYS = [0, 3000, 8000];

const LoadingScreen = ({ url }: { url?: string }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timers = STEP_DELAYS.slice(1).map((delay, i) =>
      setTimeout(() => setCurrentStep(i + 1), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
      role="status"
      aria-live="polite"
    >
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="mb-6"
      >
        <Eye className="w-14 h-14 text-primary" aria-hidden="true" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xl md:text-2xl font-heading font-semibold text-foreground text-center px-6 mb-2"
      >
        Viewing your website through the blind lens...
      </motion.p>

      {url && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-muted-foreground mb-8 truncate max-w-xs"
        >
          {url}
        </motion.p>
      )}

      <div className="flex flex-col gap-4 mt-4 w-full max-w-xs">
        <AnimatePresence>
          {STEPS.map((label, i) => {
            const status = i < currentStep ? "done" : i === currentStep ? "active" : "pending";
            return (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="flex items-center gap-3"
              >
                {status === "done" && (
                  <Check className="w-5 h-5 text-primary shrink-0" />
                )}
                {status === "active" && (
                  <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
                )}
                {status === "pending" && (
                  <Circle className="w-5 h-5 text-muted-foreground/40 shrink-0" />
                )}
                <span
                  className={
                    status === "done"
                      ? "text-foreground"
                      : status === "active"
                        ? "text-foreground font-medium"
                        : "text-muted-foreground/50"
                  }
                >
                  {label}
                  {status === "active" && "..."}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="w-full max-w-xs mt-8">
        <Progress value={progress} className="h-1.5" />
      </div>
    </div>
  );
};

export default LoadingScreen;
