import { AnimatePresence, motion } from "framer-motion";
import { FocusFilterBar } from "../filter/FocusFilterBar";
import { FocusPicker } from "../filter/FocusPicker";
import { TaskTable } from "../task/TaskTable";
import { MAX_FOCUS_HOPS } from "../../app/inboxModel";

function MobileInboxActions() {
  return (
    <>
      <button
        type="button"
        aria-label="Filter"
        className="w-7 h-7 inline-flex items-center justify-center border-0 rounded bg-transparent text-[var(--font-color-secondary)] cursor-pointer transition-colors hover:bg-[var(--background-transparent-light)]"
      >
        <i className="ti ti-filter text-[14px]" />
      </button>
      <button
        type="button"
        aria-label="Sort"
        className="w-7 h-7 inline-flex items-center justify-center border-0 rounded bg-transparent text-[var(--font-color-secondary)] cursor-pointer transition-colors hover:bg-[var(--background-transparent-light)]"
      >
        <i className="ti ti-arrows-sort text-[14px]" />
      </button>
      <button
        type="button"
        aria-label="Options"
        className="w-7 h-7 inline-flex items-center justify-center border-0 rounded bg-transparent text-[var(--font-color-secondary)] cursor-pointer transition-colors hover:bg-[var(--background-transparent-light)]"
      >
        <i className="ti ti-adjustments-horizontal text-[14px]" />
      </button>
    </>
  );
}

function DesktopInboxActions() {
  return (
    <>
      <div className="cursor-pointer">Filter</div>
      <div className="cursor-pointer">Sort</div>
      <div className="cursor-pointer">Options</div>
    </>
  );
}

export function InboxView({
  focusId,
  focusOption,
  groups,
  isMobile,
  onFocusChange,
  onTaskSelect,
  selectedId,
  totalShown,
}) {
  return (
    <motion.div
      key="inbox"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="flex-1 min-h-0 flex flex-col"
    >
      <header style={{ flexShrink: 0 }} className="mt-4 mx-4">
        <div className="pb-2 flex flex-row justify-between border-b border-[var(--border-color-medium)] text-xs text-[var(--font-color-secondary)]">
          <div className="whitespace-nowrap flex flex-row items-center gap-2">
            <i className="ti ti-list whitespace-nowrap text-ellipsis" /> All
            Notifications <span>&middot; {totalShown}</span>{" "}
            <i className="ti ti-chevron-down" />
          </div>
          <div
            className={`flex flex-row items-center ${
              isMobile ? "gap-1" : "gap-4"
            }`}
          >
            <FocusPicker value={focusId} onChange={onFocusChange} />
            {isMobile ? <MobileInboxActions /> : <DesktopInboxActions />}
          </div>
        </div>
        <AnimatePresence initial={false}>
          {focusOption && (
            <motion.div
              key="focus-bar"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <FocusFilterBar
                focusOption={focusOption}
                onChange={onFocusChange}
                onClear={() => onFocusChange(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        <TaskTable
          groups={groups}
          selectedId={selectedId}
          onSelect={onTaskSelect}
        />

        {focusId && totalShown === 0 && (
          <p>
            <small>
              No tasks within {MAX_FOCUS_HOPS} hops of {focusOption?.name}.
            </small>
          </p>
        )}
      </div>
    </motion.div>
  );
}
