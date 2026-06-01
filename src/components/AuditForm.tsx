import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validateUrl } from "@/lib/validateUrl";

interface AuditFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
  cooldown?: number; // seconds remaining before next audit is allowed
}

const AuditForm = ({ onSubmit, isLoading, cooldown = 0 }: AuditFormProps) => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateUrl(url);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onSubmit(url.trim());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    // Clear the error as soon as the user starts typing again
    if (error) setError(null);
  };

  return (
    <section className="py-16 px-6" aria-labelledby="audit-heading">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 id="audit-heading" className="sr-only">
            Start your accessibility audit
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <label htmlFor="website-url" className="sr-only">
              Website URL
            </label>
            <Input
              id="website-url"
              type="text"
              placeholder="https://yourwebsite.com"
              value={url}
              onChange={handleChange}
              disabled={isLoading}
              className="flex-1 h-14 text-base bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary rounded-xl px-5"
              aria-describedby={error ? "url-error" : "url-hint"}
              aria-invalid={!!error}
            />
            <Button
              type="submit"
              disabled={isLoading || cooldown > 0}
              className="h-14 px-8 text-base font-heading font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl glow-primary transition-all"
              aria-label={cooldown > 0 ? `Please wait ${cooldown} seconds before auditing again` : "Audit My Website"}
            >
              {cooldown > 0 ? `Wait ${cooldown}s` : "Audit My Website"}
              <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
            </Button>
          </form>

          {/* Error message — shown inline so screen readers announce it immediately */}
          {error ? (
            <p id="url-error" role="alert" className="text-sm text-destructive mt-3 text-center">
              {error}
            </p>
          ) : (
            <p id="url-hint" className="text-sm text-muted-foreground mt-3 text-center">
              Enter any public URL to receive a comprehensive accessibility audit
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default AuditForm;
