import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { FOCUS_OPTIONS } from "../../data/Graph";
import { SearchPopover } from "../common/Popover";
import { FocusOptionItem } from "./FocusPicker";
import { useIsMobile } from "../../utils/useIsMobile";

export function FocusFilterBar({ focusOption, onChange, onClear }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  function pick(id) {
    onChange(id === focusOption?.id ? null : id);
    setOpen(false);
  }

  return (
    <div className="py-2 border-b border-[var(--border-color-medium)] flex items-center justify-between gap-2 text-xs whitespace-nowrap">
      <div className="flex items-center gap-2">
        <span className="relative inline-block">
          <span className="inline-flex items-stretch rounded border border-[var(--color-blue)] overflow-hidden">
            {/* Left half: opens the focus picker so the user can swap target. */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className={`inline-flex items-center gap-1 px-2 py-0.5 border-0 cursor-pointer text-[var(--color-blue)] whitespace-nowrap transition-colors ${
                open
                  ? "bg-[var(--background-transparent-medium)]"
                  : "bg-transparent hover:bg-[var(--background-transparent-light)]"
              }`}
            >
              <i className="ti ti-target text-[10px]" />
              <span>Focus: {focusOption?.name}</span>
            </button>
            <span
              aria-hidden="true"
              className="self-stretch w-px bg-[var(--color-blue)] opacity-40"
            />
            {/* Right half: clears focus only. */}
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear focus"
              className="inline-flex items-center px-2 py-0.5 border-0 cursor-pointer text-[var(--color-blue)] leading-none transition-colors bg-transparent hover:bg-[var(--background-transparent-light)]"
            >
              ×
            </button>
          </span>
          <AnimatePresence>
            {open && (
              <SearchPopover
                align="left"
                items={FOCUS_OPTIONS}
                filterFn={(o, q) => o.name.toLowerCase().includes(q)}
                renderItem={(o) => (
                  <FocusOptionItem
                    key={o.id}
                    option={o}
                    selected={o.id === focusOption?.id}
                    onClick={() => pick(o.id)}
                  />
                )}
                onClose={() => setOpen(false)}
              />
            )}
          </AnimatePresence>
        </span>
        <button
          type="button"
          aria-label="Add filter"
          className={
            isMobile
              ? "w-7 h-7 inline-flex items-center justify-center border-0 rounded text-[var(--font-color-secondary)] cursor-pointer transition-colors bg-transparent hover:bg-[var(--background-transparent-light)]"
              : "inline-flex items-center gap-1 border-0 px-2 py-0.5 rounded text-[var(--font-color-secondary)] cursor-pointer whitespace-nowrap transition-colors bg-transparent hover:bg-[var(--background-transparent-light)]"
          }
        >
          {isMobile ? (
            <i className="ti ti-filter-plus text-[14px]" />
          ) : (
            <>
              <span>+</span>
              <span>Add filter</span>
            </>
          )}
        </button>
      </div>
      <div className="flex items-center gap-2">
        {isMobile ? (
          <>
            <button
              type="button"
              onClick={onClear}
              aria-label="Reset"
              className="w-7 h-7 inline-flex items-center justify-center border-0 rounded text-[var(--font-color-secondary)] cursor-pointer transition-colors bg-transparent hover:bg-[var(--background-transparent-light)]"
            >
              <i className="ti ti-arrow-back-up text-[14px]" />
            </button>
            <button
              type="button"
              aria-label="Save as new view"
              className="w-7 h-7 inline-flex items-center justify-center rounded border border-[var(--color-blue)] text-[var(--color-blue)] bg-transparent cursor-pointer transition-colors hover:bg-[var(--background-transparent-light)]"
            >
              <i className="ti ti-bookmark-plus text-[14px]" />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onClear}
              className="border-0 px-2 py-0.5 rounded text-[var(--font-color-secondary)] cursor-pointer whitespace-nowrap transition-colors bg-transparent hover:bg-[var(--background-transparent-light)]"
            >
              Reset
            </button>
            <button
              type="button"
              className="px-2 py-1 rounded border border-[var(--color-blue)] text-[var(--color-blue)] bg-transparent cursor-pointer whitespace-nowrap transition-colors hover:bg-[var(--background-transparent-light)]"
            >
              Save as new view
            </button>
          </>
        )}
      </div>
    </div>
  );
}
