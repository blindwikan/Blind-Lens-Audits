import { motion } from "framer-motion";
import { Eye } from "lucide-react";

const LoadingScreen = () => {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
      role="status"
      aria-live="polite"
    >
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="mb-8"
      >
        <Eye className="w-16 h-16 text-primary" aria-hidden="true" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xl md:text-2xl font-heading font-semibold text-foreground text-center px-6"
      >
        Viewing your website through the blind lens...
      </motion.p>

      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "200px" }}
        transition={{ duration: 4, ease: "easeInOut" }}
        className="h-1 bg-primary rounded-full mt-8"
      />
    </div>
  );
};

export default LoadingScreen;
