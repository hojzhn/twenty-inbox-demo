export function FocusFilterBar({ focusOption, onClear }) {
  return (
    <div className="py-2 border-b border-[var(--bg3)] flex items-center justify-between gap-2 text-xs">
      <div className="flex items-center gap-2 min-w-0">
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded  text-[var(--point)] border border-[var(--point)] whitespace-nowrap">
          <i className="fa-solid fa-bullseye text-[10px]" />
          <span>Focus: {focusOption?.name}</span>
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear focus"
            className="ml-1 bg-transparent border-0 p-0 text-[var(--point)] cursor-pointer leading-none"
          >
            ×
          </button>
        </span>
        <button
          type="button"
          className="inline-flex items-center gap-1 bg-transparent border-0 p-0 text-[var(--txt2)] cursor-pointer"
        >
          <span>+</span>
          <span>Add filter</span>
        </button>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onClear}
          className="bg-transparent border-0 p-0 text-[var(--txt2)] cursor-pointer"
        >
          Reset
        </button>
        <button
          type="button"
          className="px-2 py-1 rounded border border-[var(--point)] text-[var(--point)] bg-transparent cursor-pointer"
        >
          Save as new view
        </button>
      </div>
    </div>
  );
}
