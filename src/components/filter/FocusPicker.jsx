import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { FOCUS_OPTIONS } from "../../data/Graph";
import { SearchPopover } from "../common/Popover";
import { ColorAvatar } from "../common/Primitives";
import { useIsMobile } from "../../utils/useIsMobile";

export function FocusOptionItem({ option, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs bg-transparent border-0 cursor-pointer text-left"
    >
      <ColorAvatar id={option.id} name={option.name} />
      <span className="flex-1 min-w-0 flex items-center gap-1 overflow-hidden">
        <span
          className={`truncate ${
            selected
              ? "text-[var(--color-blue)] font-medium"
              : "text-[var(--font-color-primary)]"
          }`}
        >
          {option.name}
        </span>
        <span className="text-[var(--font-color-tertiary)] shrink-0">· {option.type}</span>
      </span>
    </button>
  );
}

export function FocusPicker({ value, onChange }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  function pick(id) {
    onChange(id === value ? null : id);
    setOpen(false);
  }

  return (
    <span className="relative inline-block align-middle">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Focus"
        className={
          isMobile
            ? `w-7 h-7 inline-flex items-center justify-center border-0 cursor-pointer rounded text-[var(--font-color-secondary)] transition-colors ${
                open
                  ? "bg-[var(--background-transparent-medium)]"
                  : "bg-transparent hover:bg-[var(--background-transparent-light)]"
              }`
            : `border-0 px-2 py-0.5 cursor-pointer rounded transition-colors ${
                open
                  ? "bg-[var(--background-transparent-medium)]"
                  : "bg-transparent hover:bg-[var(--background-transparent-light)]"
              }`
        }
      >
        {isMobile ? (
          <i className="ti ti-target text-[14px]" />
        ) : (
          "Focus"
        )}
      </button>
      <AnimatePresence>
        {open && (
          <SearchPopover
            align="center"
            items={FOCUS_OPTIONS}
            filterFn={(o, q) => o.name.toLowerCase().includes(q)}
            renderItem={(o) => (
              <FocusOptionItem
                key={o.id}
                option={o}
                selected={o.id === value}
                onClick={() => pick(o.id)}
              />
            )}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </span>
  );
}
