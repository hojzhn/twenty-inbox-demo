import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TAB_ICON } from "./model";

function TabPill({ label, active, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 flex items-center gap-2 cursor-pointer border-0 bg-transparent transition-colors hover:bg-[var(--background-transparent-light)] ${
        active
          ? "border-b-2 border-[var(--font-color-primary)] text-[var(--font-color-primary)] -mb-px"
          : "text-[var(--font-color-secondary)]"
      } ${className}`}
    >
      <i className={`ti ${TAB_ICON[label] || "ti-circle"} text-[12px]`} />
      <span>{label}</span>
    </button>
  );
}

export function Tabs({ tabs, active, onSelect }) {
  const containerRef = useRef(null);
  const measureRefs = useRef([]);
  const moreWrapperRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(tabs.length);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const RESERVE = 90;

    function measure() {
      const containerWidth = container.clientWidth;
      const widths = measureRefs.current.map((el) => el?.offsetWidth || 0);
      const total = widths.reduce((a, b) => a + b, 0);
      if (total <= containerWidth) {
        setVisibleCount(tabs.length);
        return;
      }
      let used = 0;
      let count = 0;
      for (let i = 0; i < tabs.length; i++) {
        if (used + widths[i] + RESERVE > containerWidth) break;
        used += widths[i];
        count++;
      }
      setVisibleCount(Math.max(count, 1));
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [tabs]);

  useEffect(() => {
    if (!popoverOpen) return;
    function handleClick(e) {
      if (
        moreWrapperRef.current &&
        !moreWrapperRef.current.contains(e.target)
      ) {
        setPopoverOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [popoverOpen]);

  const visibleTabs = tabs.slice(0, visibleCount);
  const hiddenTabs = tabs.slice(visibleCount);
  const activeHidden = hiddenTabs.includes(active);

  return (
    <div className="border-b border-[var(--border-color-medium)] text-[13px] relative">
      <div
        aria-hidden="true"
        className="absolute opacity-0 pointer-events-none flex items-center gap-1"
      >
        {tabs.map((label, i) => (
          <div
            key={label}
            ref={(el) => (measureRefs.current[i] = el)}
            className="px-3 py-2 flex items-center gap-2"
          >
            <i className={`ti ${TAB_ICON[label] || "ti-circle"} text-[12px]`} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div ref={containerRef} className="flex items-center gap-1 min-w-0">
        <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden">
          {visibleTabs.map((label) => (
            <TabPill
              key={label}
              label={label}
              active={label === active}
              onClick={() => onSelect?.(label)}
            />
          ))}
        </div>
        {hiddenTabs.length > 0 && (
          <span ref={moreWrapperRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setPopoverOpen((v) => !v)}
              className={`px-3 py-2 flex items-center gap-1 border-0 cursor-pointer whitespace-nowrap transition-colors ${
                activeHidden
                  ? "border-b-2 border-[var(--font-color-primary)] text-[var(--font-color-primary)] -mb-px"
                  : "text-[var(--font-color-secondary)]"
              } ${
                popoverOpen
                  ? "bg-[var(--background-transparent-medium)]"
                  : "bg-transparent hover:bg-[var(--background-transparent-light)]"
              }`}
            >
              <span>+{hiddenTabs.length} More</span>
              <i className="ti ti-chevron-down text-[10px]" />
            </button>
            <AnimatePresence>
              {popoverOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-1 z-20 min-w-[160px] bg-[var(--background-primary)] border border-[var(--border-color-medium)] rounded shadow-lg py-1 flex flex-col"
                >
                  {hiddenTabs.map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        onSelect?.(label);
                        setPopoverOpen(false);
                      }}
                      className={`w-full text-left flex items-center gap-2 px-3 py-1.5 text-[12px] cursor-pointer border-0 bg-transparent transition-colors hover:bg-[var(--background-transparent-light)] ${
                        label === active
                          ? "text-[var(--color-blue)] font-medium"
                          : "text-[var(--font-color-primary)]"
                      }`}
                    >
                      <i
                        className={`ti ${TAB_ICON[label] || "ti-circle"} text-[12px]`}
                      />
                      <span>{label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </span>
        )}
      </div>
    </div>
  );
}
