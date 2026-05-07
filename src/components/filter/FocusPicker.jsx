import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { FOCUS_OPTIONS } from "../../data/Graph";
import { SearchPopover } from "../common/Popover";
import { ColorAvatar } from "../common/Primitives";

function FocusOptionItem({ option, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs bg-transparent border-0 cursor-pointer text-left"
    >
      <span
        className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded border ${
          selected
            ? "bg-[var(--color-blue)] border-[var(--color-blue)]"
            : "border-[var(--font-color-tertiary)] bg-transparent"
        }`}
      >
        {selected && (
          <i className="ti ti-check text-[8px] text-[var(--font-color-on-accent)]" />
        )}
      </span>
      <ColorAvatar id={option.id} name={option.name} />
      <span className="flex-1 min-w-0 flex items-center gap-1 overflow-hidden">
        <span className="truncate text-[var(--font-color-primary)]">{option.name}</span>
        <span className="text-[var(--font-color-tertiary)] shrink-0">· {option.type}</span>
      </span>
    </button>
  );
}

export function FocusPicker({ value, onChange }) {
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
        className={`border-0 px-2 py-0.5 cursor-pointer rounded transition-colors ${
          open
            ? "bg-[var(--background-transparent-medium)]"
            : "bg-transparent hover:bg-[var(--background-transparent-light)]"
        }`}
      >
        Focus
      </button>
      <AnimatePresence>
        {open && (
          <SearchPopover
            align="right"
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
