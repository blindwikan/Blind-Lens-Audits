import { motion } from "framer-motion";
import { Eye } from "lucide-react";

const Hero = () => {
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
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          An AI-powered website accessibility audit from the perspective of a blind person.
          Not just compliance checks — real insights from lived experience.
        </motion.p>
      </div>
    </section>
  );
};

export default Hero;
