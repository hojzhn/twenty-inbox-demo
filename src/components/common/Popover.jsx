import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

// Anchored popover with built-in search and outside-click dismiss.
// The trigger is rendered by the caller; this component is the floating panel.
//
// Pass either `items` (flat list) or `sections` (`[{ label, items }]` for
// grouped lists with faint headers between groups). renderItem must return
// a keyed React element.

export function SearchPopover({
  items,
  sections,
  filterFn,
  renderItem,
  onClose,
  align = "left",
  width = 260,
  searchPlaceholder = "Search",
  emptyMessage = "No matches",
  showSearch = true,
}) {
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      // The popover is rendered inside the trigger's wrapper. Use the wrapper
      // (parent element) as the "inside" zone so clicking the trigger button
      // is not treated as outside — the trigger's own onClick toggles.
      const inside = ref.current?.parentElement || ref.current;
      if (inside && !inside.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const lower = query.toLowerCase();
  const useFilter = showSearch && query;

  let body;
  if (sections) {
    const visible = useFilter
      ? sections
          .map((s) => ({
            ...s,
            items: s.items.filter((i) => filterFn(i, lower)),
          }))
          .filter((s) => s.items.length > 0)
      : sections;
    body =
      visible.length === 0 ? (
        <div className="px-3 py-2 text-xs text-[var(--font-color-tertiary)]">
          {emptyMessage}
        </div>
      ) : (
        visible.map((s, i) => (
          <div key={s.label || i} className="flex flex-col">
            {s.label && (
              <div className="px-3 pt-2 pb-1 text-[11px] text-[var(--font-color-tertiary)]">
                {s.label}
              </div>
            )}
            {s.items.map((item) => renderItem(item))}
          </div>
        ))
      );
  } else {
    const filtered = useFilter
      ? items.filter((item) => filterFn(item, lower))
      : items;
    body =
      filtered.length === 0 ? (
        <div className="px-3 py-2 text-xs text-[var(--font-color-tertiary)]">
          {emptyMessage}
        </div>
      ) : (
        filtered.map((item) => renderItem(item))
      );
  }

  return (
    <motion.div
      ref={ref}
      onClick={(e) => e.stopPropagation()}
      // For center alignment we set `left: 50%` on the box and shift it back
      // by half its own width via framer's `x` (in pixels). Composing x with
      // y this way lets framer animate y while keeping x as a static offset.
      initial={{ opacity: 0, y: 4, x: align === "center" ? -width / 2 : 0 }}
      animate={{ opacity: 1, y: 0, x: align === "center" ? -width / 2 : 0 }}
      exit={{ opacity: 0, y: 4, x: align === "center" ? -width / 2 : 0 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="z-50 bg-[var(--background-transparent-primary)] backdrop-blur-md border border-[var(--border-color-light)] rounded shadow-lg flex flex-col overflow-hidden"
      style={{
        // Force absolute positioning via inline style so Tailwind class
        // ordering / framer-motion can't interfere. `top: 100%` puts the
        // popover just below the trigger; the horizontal anchor switches
        // between left, right, and center (50%) per `align`.
        position: "absolute",
        top: "100%",
        marginTop: 4,
        ...(align === "right"
          ? { right: 0 }
          : align === "center"
            ? { left: "50%" }
            : { left: 0 }),
        width,
      }}
    >
      {showSearch && (
        <div className="px-3 py-2 border-b border-[var(--border-color-light)]">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-transparent border-0 outline-none text-xs text-[var(--font-color-primary)] placeholder:text-[var(--font-color-tertiary)]"
          />
        </div>
      )}
      <div className="max-h-[280px] overflow-y-auto py-1 flex flex-col">
        {body}
      </div>
    </motion.div>
  );
}
