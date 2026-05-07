import { useState } from "react";
import { FOCUS_OPTIONS } from "./Graph";
import { SearchPopover } from "./Popover";
import { ColorAvatar } from "./Primitives";

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
            ? "bg-[var(--point)] border-[var(--point)]"
            : "border-[var(--txt3)] bg-transparent"
        }`}
      >
        {selected && (
          <i className="fa-solid fa-check text-[8px] text-[var(--point2)]" />
        )}
      </span>
      <ColorAvatar id={option.id} name={option.name} />
      <span className="flex-1 min-w-0 flex items-center gap-1 overflow-hidden">
        <span className="truncate text-[var(--txt)]">{option.name}</span>
        <span className="text-[var(--txt3)] shrink-0">· {option.type}</span>
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
        className="bg-transparent border-0 p-0 cursor-pointer"
      >
        Focus
      </button>
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
    </span>
  );
}
