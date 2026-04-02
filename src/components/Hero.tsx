import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeroProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

const Hero = ({ onSubmit, isLoading }: HeroProps) => {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  return (
    <section className="relative py-20 md:py-32 px-6" aria-labelledby="hero-heading">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <Eye className="w-10 h-10 text-primary" aria-hidden="true" />
          <span className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-foreground">
            Blind Audits
          </span>
        </motion.div>

        <motion.h1
          id="hero-heading"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold tracking-tight leading-tight mb-6"
        >
          See your website through the{" "}
          <span className="text-gradient">blind lens.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10"
        >
          An AI-powered website accessibility audit from the perspective of a blind person.
          Not just compliance checks — real insights from lived experience.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
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
          <p className="text-sm text-muted-foreground mt-3 text-center">
            Enter any public URL to receive a comprehensive accessibility audit
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
