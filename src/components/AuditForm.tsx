import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AuditFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

const AuditForm = ({ onSubmit, isLoading }: AuditFormProps) => {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
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
              type="url"
              placeholder="https://yourwebsite.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              disabled={isLoading}
              className="flex-1 h-14 text-base bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary rounded-xl px-5"
              aria-describedby="url-hint"
            />
            <Button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="h-14 px-8 text-base font-heading font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl glow-primary transition-all"
            >
              Audit My Website
              <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
            </Button>
          </form>
          <p id="url-hint" className="text-sm text-muted-foreground mt-3 text-center">
            Enter any public URL to receive a comprehensive accessibility audit
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default AuditForm;
