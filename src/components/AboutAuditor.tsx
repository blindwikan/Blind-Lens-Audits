import { motion } from "framer-motion";
import { User } from "lucide-react";

const AboutAuditor = () => {
  return (
    <section className="py-16 px-6" aria-labelledby="about-heading">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-card border border-border rounded-2xl p-8 md:p-10"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" aria-hidden="true" />
            </div>
            <h2 id="about-heading" className="text-xl md:text-2xl font-heading font-bold text-foreground">
              About the Auditor
            </h2>
          </div>
          <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
            Blind Audits is powered by Wikan — who became blind at 13, spent his career advancing
            disability inclusion at UNICEF, and is now pursuing an MSc in Disability, Design and
            Innovation at UCL London. Every audit reflects not just technical compliance, but the
            real, daily experience of navigating the web without sight.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutAuditor;
