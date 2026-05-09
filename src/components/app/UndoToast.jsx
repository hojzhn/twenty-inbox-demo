import { AnimatePresence, motion } from "framer-motion";

function ToastBody({ toast, onUndo, onDismiss, mobile }) {
  return (
    <>
      <span className={mobile ? "truncate" : undefined}>
        Marked done &middot;{" "}
        <span className="font-medium">{toast.title}</span>
        {toast.extraCount > 0 && (
          <span> &middot; +{toast.extraCount} more</span>
        )}
      </span>
      <button
        type="button"
        onClick={onUndo}
        className={`${mobile ? "shrink-0 " : ""}px-2 py-0.5 rounded border border-[var(--color-blue)] text-[var(--color-blue)] bg-transparent cursor-pointer text-[12px] transition-colors hover:bg-[var(--color-blue)] hover:text-[var(--font-color-on-accent)]`}
      >
        Undo
      </button>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className={`${mobile ? "shrink-0 " : ""}ml-1 bg-transparent border-0 text-[var(--color-blue)] cursor-pointer text-[14px] leading-none transition-opacity opacity-70 hover:opacity-100`}
      >
        &times;
      </button>
    </>
  );
}

export function UndoToast({ toast, onUndo, onDismiss, mobile = false }) {
  if (mobile) {
    return (
      <div className="fixed top-3 left-0 right-0 z-[70] flex justify-center pointer-events-none px-3">
        <AnimatePresence initial={false}>
          {toast && (
            <motion.div
              key="undo-toast-mobile"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="pointer-events-auto flex items-center justify-center gap-3 px-4 py-2 rounded bg-[var(--accent-tertiary)] border border-[var(--color-blue)] text-[var(--color-blue)] text-[13px] shadow-lg max-w-full"
            >
              <ToastBody
                toast={toast}
                onUndo={onUndo}
                onDismiss={onDismiss}
                mobile
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <AnimatePresence initial={false}>
      {toast && (
        <motion.div
          key="undo-toast"
          initial={{ opacity: 0, height: 0, y: -8 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={{ opacity: 0, height: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="shrink-0 overflow-hidden"
        >
          <div className="flex items-center justify-center gap-3 px-4 py-2 mb-2 rounded bg-[var(--accent-tertiary)] border border-[var(--color-blue)] text-[var(--color-blue)] text-[13px]">
            <ToastBody toast={toast} onUndo={onUndo} onDismiss={onDismiss} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
