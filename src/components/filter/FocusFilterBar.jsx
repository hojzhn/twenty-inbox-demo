import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { FOCUS_OPTIONS } from "../../data/Graph";
import { SearchPopover } from "../common/Popover";
import { FocusOptionItem } from "./FocusPicker";

export function FocusFilterBar({ focusOption, onChange, onClear }) {
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
          className="inline-flex items-center gap-1 border-0 px-2 py-0.5 rounded text-[var(--font-color-secondary)] cursor-pointer whitespace-nowrap transition-colors bg-transparent hover:bg-[var(--background-transparent-light)]"
        >
          <span>+</span>
          <span>Add filter</span>
        </button>
      </div>
      <div className="flex items-center gap-3">
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
      </div>
    </div>
  );
}
