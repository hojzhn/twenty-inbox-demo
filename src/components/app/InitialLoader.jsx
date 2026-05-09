import { motion } from "framer-motion";

export function InitialLoader() {
  return (
    <motion.div
      key="initial-loader"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="h-[100dvh] w-full flex items-center justify-center bg-[var(--background-primary)] text-[var(--font-color-primary)]"
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-[var(--color-blue)] text-[var(--font-color-on-accent)] text-[13px] font-semibold">
          V
        </span>
        <span className="w-4 h-4 rounded-full border-2 border-[var(--border-color-strong)] border-t-[var(--color-blue)] animate-spin" />
      </div>
    </motion.div>
  );
}
