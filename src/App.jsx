import { useState, useMemo, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MARCUS_TASKS, sortByCreatedDesc } from "./data/Tasks";
import { FOCUS_OPTIONS, taskDistance } from "./data/Graph";
import ActionPanel from "./components/layout/ActionPanel";
import { FocusPicker } from "./components/filter/FocusPicker";
import { FocusFilterBar } from "./components/filter/FocusFilterBar";
import { TaskTable } from "./components/task/TaskTable";
import { Sidebar, ToneIcon } from "./components/layout/Sidebar";
import { RecordDetail, getRecordMeta } from "./components/layout/RecordDetail";
import { ChipClickContext } from "./context/ChipContext";

const MAX_FOCUS_HOPS = 2;
const HOP_LABELS = ["Direct", "1 hop away", "2 hops away"];

function buildGroups(tasks, focusId) {
  if (!focusId) {
    return [{ label: "Notification", items: sortByCreatedDesc(tasks) }];
  }
  const buckets = HOP_LABELS.map(() => []);
  for (const t of tasks) {
    const d = taskDistance(t, focusId);
    if (d === Infinity || d > MAX_FOCUS_HOPS) continue;
    buckets[d].push(t);
  }
  return buckets
    .map((items, hop) => ({
      label: `${HOP_LABELS[hop]} (${items.length})`,
      items: sortByCreatedDesc(items),
    }))
    .filter((g) => g.items.length > 0);
}

export default function App() {
  const [selectedId, setSelectedId] = useState(null);
  const [focusId, setFocusId] = useState(null);
  const [introOpen, setIntroOpen] = useState(true);
  const [doneIds, setDoneIds] = useState(() => new Set());
  // { id, title, prevSelectedId } | null — drives the top Undo banner.
  const [undoToast, setUndoToast] = useState(null);
  const undoTimerRef = useRef(null);

  function clearUndoTimer() {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
  }
  useEffect(() => clearUndoTimer, []);
  // { entity, tab? } — `tab` is an optional initial RecordDetail tab.
  // AnimatePresence keeps the previous view mounted during exit; no shadow state needed.
  const [view, setView] = useState(null);

  const navigate = (entity, options = {}) =>
    setView({ entity, tab: options.tab });
  const closeView = () => setView(null);

  const [readIds, setReadIds] = useState(
    new Set(MARCUS_TASKS.filter((t) => t.read).map((t) => t.id)),
  );

  const tasks = useMemo(
    () =>
      MARCUS_TASKS.filter((t) => !doneIds.has(t.id)).map((t) => ({
        ...t,
        read: readIds.has(t.id),
      })),
    [readIds, doneIds],
  );

  function markDone(id) {
    // Pick the adjacent task to keep the action panel populated.
    // Prefer the newer one (visually above); fall back to the older
    // one below if the removed task was already at the top.
    const flat = groups.flatMap((g) => g.items);
    const idx = flat.findIndex((t) => t.id === id);
    let nextId = null;
    if (idx !== -1) {
      if (idx > 0) nextId = flat[idx - 1].id;
      else if (idx + 1 < flat.length) nextId = flat[idx + 1].id;
    }

    const justDone = MARCUS_TASKS.find((t) => t.id === id);

    setDoneIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setSelectedId(nextId);
    if (nextId) {
      setReadIds((prev) => {
        const next = new Set(prev);
        next.add(nextId);
        return next;
      });
    }

    // Stage the Undo toast and start the auto-dismiss timer.
    clearUndoTimer();
    setUndoToast({
      id,
      title: justDone?.title || "task",
      prevSelectedId: id,
    });
    undoTimerRef.current = setTimeout(() => {
      setUndoToast(null);
      undoTimerRef.current = null;
    }, 5000);
  }

  function undoMarkDone() {
    if (!undoToast) return;
    setDoneIds((prev) => {
      const next = new Set(prev);
      next.delete(undoToast.id);
      return next;
    });
    setSelectedId(undoToast.prevSelectedId);
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(undoToast.prevSelectedId);
      return next;
    });
    clearUndoTimer();
    setUndoToast(null);
  }

  function dismissUndoToast() {
    clearUndoTimer();
    setUndoToast(null);
  }

  const groups = useMemo(() => buildGroups(tasks, focusId), [tasks, focusId]);
  const totalShown = groups.reduce((acc, g) => acc + g.items.length, 0);

  const selected = tasks.find((t) => t.id === selectedId);

  const focusOption = focusId
    ? FOCUS_OPTIONS.find((o) => o.id === focusId)
    : null;

  function pick(id) {
    setSelectedId((prev) => (prev === id ? null : id));
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

  return (
    <ChipClickContext.Provider value={navigate}>
      <div
        style={{
          display: "flex",
          height: "100vh",
          padding: 8,
          gap: 8,
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        <Sidebar />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minWidth: 0,
            height: "100%",
            overflow: "hidden",
          }}
        >
          <div
            className="flex items-center justify-between shrink-0 gap-3"
            style={{ marginBottom: 8, marginTop: 4 }}
          >
            {view ? (
              (() => {
                const meta = getRecordMeta(view.entity);
                return (
                  <div className="flex items-center gap-2 min-w-0 text-[15px]">
                    <button
                      type="button"
                      onClick={closeView}
                      aria-label="Close"
                      className="inline-flex items-center justify-center w-7 h-7 p-0 bg-transparent border-0 text-[var(--font-color-secondary)] text-base rounded cursor-pointer transition-colors hover:bg-[var(--background-transparent-light)]"
                    >
                      ×
                    </button>
                    <ToneIcon tone={meta.tone} size={24} fontSize={14}>
                      <i className={`ti ${meta.icon}`} />
                    </ToneIcon>
                    <span className="text-[var(--font-color-secondary)]">
                      {meta.plural}
                    </span>
                    <span className="text-[var(--font-color-tertiary)]">/</span>
                    <span className="font-medium truncate">{meta.name}</span>
                  </div>
                );
              })()
            ) : (
              <div className="flex items-center gap-2 font-medium">
                <ToneIcon tone="sky" size={22} fontSize={13}>
                  <i className="ti ti-inbox" />
                </ToneIcon>
                <div className="text-[13px]">Inbox</div>
              </div>
            )}
            <button
              type="button"
              aria-label="Open command menu"
              className="shrink-0 inline-flex items-center rounded border border-[var(--border-color-medium)] bg-[var(--background-secondary)] text-[var(--font-color-secondary)] text-[11px] font-medium cursor-pointer overflow-hidden hover:bg-[var(--background-tertiary)] transition-colors"
            >
              <span className="flex items-center justify-center px-1.5 py-1">
                <i className="ti ti-dots-vertical text-[12px]" />
              </span>
              <span className="w-px self-stretch bg-[var(--border-color-medium)]" />
              <span className="px-2 py-1">Ctrl K</span>
            </button>
          </div>

          <div
            className="flex-col"
            style={{
              display: "flex",
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
            }}
          >
            <AnimatePresence initial={false}>
              {undoToast && (
                <motion.div
                  key="undo-toast"
                  initial={{ opacity: 0, height: 0, y: -8 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="shrink-0 overflow-hidden"
                >
                  <div className="flex items-center justify-center gap-3 px-4 py-2 mb-2 rounded bg-[var(--accent-tertiary)] border border-[var(--color-blue)] text-[var(--color-blue)] text-[13px]">
                    <span>
                      Marked done ·{" "}
                      <span className="font-medium">{undoToast.title}</span>
                    </span>
                    <button
                      type="button"
                      onClick={undoMarkDone}
                      className="px-2 py-0.5 rounded border border-[var(--color-blue)] text-[var(--color-blue)] bg-transparent cursor-pointer text-[12px] transition-colors hover:bg-[var(--color-blue)] hover:text-[var(--font-color-on-accent)]"
                    >
                      Undo
                    </button>
                    <button
                      type="button"
                      onClick={dismissUndoToast}
                      aria-label="Dismiss"
                      className="ml-1 bg-transparent border-0 text-[var(--color-blue)] cursor-pointer text-[14px] leading-none transition-opacity opacity-70 hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div
              style={{
                display: "flex",
                flex: 1,
                minHeight: 0,
                overflow: "hidden",
              }}
            >
              <main
                className="border rounded-lg border-[var(--background-tertiary)] bg-[var(--background-primary)]"
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {view ? (
                    <motion.div
                      key="record"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="flex-1 min-h-0 flex flex-col"
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                          key={view.entity.objectId}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.14, ease: "easeOut" }}
                          className="flex-1 min-h-0 flex flex-col"
                        >
                          <RecordDetail
                            entity={view.entity}
                            defaultTab={view.tab}
                          />
                        </motion.div>
                      </AnimatePresence>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="inbox"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="flex-1 min-h-0 flex flex-col"
                    >
                      <header style={{ flexShrink: 0 }} className="mt-4 mx-4">
                        <div className="pb-2 flex flex-row justify-between border-b border-[var(--border-color-medium)] text-sm text-[var(--font-color-secondary)]">
                          <div className="whitespace-nowrap">
                            <i className="ti ti-list whitespace-nowrap text-ellipsis" />{" "}
                            All Notifications <span>· {totalShown}</span>{" "}
                            <i className="ti ti-chevron-down" />
                          </div>
                          <div className="flex flex-row items-center gap-4">
                            <FocusPicker
                              value={focusId}
                              onChange={setFocusId}
                            />
                            <div>Filter</div>
                            <div>Sort</div>
                            <div>Options</div>
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
                              style={{ overflow: "hidden" }}
                            >
                              <FocusFilterBar
                                focusOption={focusOption}
                                onClear={() => setFocusId(null)}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </header>

                      <div
                        style={{
                          flex: 1,
                          minHeight: 0,
                          overflow: "auto",
                        }}
                      >
                        <TaskTable
                          groups={groups}
                          selectedId={selectedId}
                          onSelect={pick}
                        />

                        {focusId && totalShown === 0 && (
                          <p>
                            <small>
                              No tasks within {MAX_FOCUS_HOPS} hops of{" "}
                              {focusOption?.name}.
                            </small>
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </main>
              <AnimatePresence initial={false}>
                {selected && (
                  <motion.aside
                    key="action-panel"
                    initial={{ width: 0 }}
                    animate={{ width: 500 }}
                    exit={{ width: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    style={{
                      height: "100%",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 500,
                        height: "100%",
                        paddingLeft: 8,
                      }}
                    >
                      <ActionPanel
                        task={selected}
                        onClose={() => setSelectedId(null)}
                        onMarkDone={() => markDone(selected.id)}
                      />
                    </div>
                  </motion.aside>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </ChipClickContext.Provider>
  );
}
