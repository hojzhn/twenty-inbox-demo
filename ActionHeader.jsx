import { useState, useEffect, useRef } from "react";
import { IconButton } from "./Primitives";

// Title + edit popover + clear. The chosen option's label becomes the heading.
// `options` is `[{ id, label }]`.

export function ActionHeader({ actionId, setActionId, options }) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const wrapperRef = useRef(null);
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
      <h3 className="m-0 text-[13px] font-semibold text-[var(--txt)]">
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
        >
          <i className="fa-regular fa-pen-to-square text-[12px]" />
        </IconButton>
        {popoverOpen && (
          <div className="absolute right-0 top-full mt-1 z-10 min-w-[180px] bg-[var(--bg)] border border-[var(--txt3)] rounded shadow-lg py-1 flex flex-col">
            {options.map((o) => {
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
                      ? "text-[var(--point)] font-medium"
                      : "text-[var(--txt)]"
                  }`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
