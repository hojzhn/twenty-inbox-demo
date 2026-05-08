import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconButton } from "../common/Primitives";

// Title + edit popover + clear. The chosen option's label becomes the heading.
// `sections` is `[{ id, options: [{ id, label }] }]`.

export function ActionHeader({ actionId, setActionId, sections }) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const wrapperRef = useRef(null);
  const options = sections.flatMap((section) => section.options);
  const selected = options.find((o) => o.id === actionId);

  useEffect(() => {
    if (!popoverOpen) return;
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setPopoverOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [popoverOpen]);

  return (
    <div className="flex items-center justify-between gap-2">
      <h3 className="m-0 text-[13px] font-semibold text-[var(--font-color-primary)]">
        {selected?.label || "No Action"}
      </h3>
      <div ref={wrapperRef} className="relative flex items-center gap-1">
        {selected && (
          <IconButton
            onClick={() => setActionId(null)}
            ariaLabel="Clear action"
          >
            ×
          </IconButton>
        )}
        <IconButton
          onClick={() => setPopoverOpen((v) => !v)}
          ariaLabel="Edit action"
          active={popoverOpen}
        >
          <i className="ti ti-edit text-[12px]" />
        </IconButton>
        <AnimatePresence>
          {popoverOpen && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-0 top-full mt-1 z-10 min-w-[180px] bg-[var(--background-transparent-primary)] backdrop-blur-md border border-[var(--border-color-light)] rounded shadow-lg py-1 flex flex-col"
            >
              {sections.map((section, sectionIndex) => (
                <div
                  key={section.id}
                  className={
                    sectionIndex > 0
                      ? "border-t border-[var(--border-color-light)] pt-1 mt-1"
                      : ""
                  }
                >
                  {section.options.map((o) => {
                    const isSel = actionId === o.id;
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => {
                          setActionId(o.id);
                          setPopoverOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs bg-transparent border-0 cursor-pointer ${
                          isSel
                            ? "text-[var(--color-blue)] font-medium"
                            : "text-[var(--font-color-primary)]"
                        }`}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
