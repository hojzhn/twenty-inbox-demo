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
import { useIsMobile } from "./utils/useIsMobile";

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
  const isMobile = useIsMobile();
  // Mobile-only: sidebar slides in as overlay when toggled from the bottom nav.
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  // Mobile-only: temporarily slide the action panel off-screen so the user can
  // see the center panel beneath, without clearing `selected`.
  const [actionPanelHidden, setActionPanelHidden] = useState(false);

  // Reset mobile-only UI state when crossing back into desktop layout.
  useEffect(() => {
    if (!isMobile) {
      setMobileSidebarOpen(false);
      setActionPanelHidden(false);
    }
  }, [isMobile]);

  const [selectedId, setSelectedId] = useState(null);

  // Reveal the action panel again whenever a different task is selected.
  useEffect(() => {
    setActionPanelHidden(false);
  }, [selectedId]);
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

  const navigate = (entity, options = {}) => {
    // On mobile, default to the Notes tab (rather than Home / the type's
    // first tab) when no specific tab is requested — chip clicks land users
    // on something more useful than the field summary.
    const tab =
      options.tab !== undefined ? options.tab : isMobile ? "Notes" : undefined;
    setView({ entity, tab });
    // On mobile, fold the action panel out of view so the record detail in the
    // center panel is visible. The user can summon it back via the bottom nav.
    if (isMobile) setActionPanelHidden(true);
  };
  const closeView = () => {
    setView(null);
    // Stay folded on mobile — closing the record detail should reveal the
    // inbox table, not the action panel. The user can summon it back via the
    // bottom nav's panel toggle.
  };

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

  function markDone(primaryId, extraIds = []) {
    const allIds = [primaryId, ...extraIds.filter((id) => id !== primaryId)];
    const doneSet = new Set(allIds);

    // Pick the next adjacent task that's NOT in the bulk-done set. Prefer the
    // newer one (visually above); fall back to older below.
    const flat = groups.flatMap((g) => g.items);
    const idx = flat.findIndex((t) => t.id === primaryId);
    let nextId = null;
    if (idx !== -1) {
      for (let i = idx - 1; i >= 0; i--) {
        if (!doneSet.has(flat[i].id)) {
          nextId = flat[i].id;
          break;
        }
      }
      if (!nextId) {
        for (let i = idx + 1; i < flat.length; i++) {
          if (!doneSet.has(flat[i].id)) {
            nextId = flat[i].id;
            break;
          }
        }
      }
    }

    const justDone = MARCUS_TASKS.find((t) => t.id === primaryId);

    setDoneIds((prev) => {
      const next = new Set(prev);
      allIds.forEach((id) => next.add(id));
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
      ids: allIds,
      title: justDone?.title || "task",
      extraCount: allIds.length - 1,
      prevSelectedId: primaryId,
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
      undoToast.ids.forEach((id) => next.delete(id));
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
          flexDirection: "column",
          height: "100dvh",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            minHeight: 0,
            padding: 8,
            gap: isMobile ? 0 : 8,
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          <Sidebar
            mobileOpen={mobileSidebarOpen}
            onMobileClose={() => setMobileSidebarOpen(false)}
          />
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
                      <span className="text-[var(--font-color-tertiary)]">
                        /
                      </span>
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
              {!isMobile && (
                <button
                  type="button"
                  aria-label="Open command menu"
                  className="shrink-0 inline-flex items-center rounded border border-[var(--border-color-medium)] bg-[var(--background-secondary)] text-[var(--font-color-secondary)] text-[11px] font-medium cursor-pointer overflow-hidden hover:bg-[var(--background-tertiary)] transition-colors"
                >
                  <span className="flex items-center justify-center px-1.5 py-1">
                    <i className="ti ti-dots-vertical text-[12px]" />
                  </span>
                  <span className="text-[0.65em] text-[var(--font-color-tertiary)]">
                    |
                  </span>
                  <span className="px-2 py-1 text-[var(--font-color-tertiary)]">
                    Ctrl K
                  </span>
                </button>
              )}
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
              {!isMobile && (
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
                          {undoToast.extraCount > 0 && (
                            <span> · +{undoToast.extraCount} more</span>
                          )}
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
              )}

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
                          <div className="pb-2 flex flex-row justify-between border-b border-[var(--border-color-medium)] text-xs text-[var(--font-color-secondary)]">
                            <div className="whitespace-nowrap flex flex-row items-center gap-2">
                              <i className="ti ti-list whitespace-nowrap text-ellipsis" />{" "}
                              All Notifications <span>· {totalShown}</span>{" "}
                              <i className="ti ti-chevron-down" />
                            </div>
                            <div
                              className={`flex flex-row items-center ${isMobile ? "gap-1" : "gap-4"}`}
                            >
                              <FocusPicker
                                value={focusId}
                                onChange={setFocusId}
                              />
                              {isMobile ? (
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
                              ) : (
                                <>
                                  <div className="cursor-pointer">Filter</div>
                                  <div className="cursor-pointer">Sort</div>
                                  <div className="cursor-pointer">Options</div>
                                </>
                              )}
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
                                  onChange={setFocusId}
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
                  {selected &&
                    (isMobile ? (
                      <motion.aside
                        key="action-panel-mobile"
                        initial={{ x: "100%" }}
                        animate={{ x: actionPanelHidden ? "100%" : 0 }}
                        exit={{ x: "100%" }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="fixed top-0 left-0 right-0 bottom-[52px] z-50 bg-[var(--background-primary)] overflow-hidden"
                      >
                        <ActionPanel
                          task={selected}
                          doneIds={doneIds}
                          onClose={() => setSelectedId(null)}
                          onMarkDone={(extraIds) =>
                            markDone(selected.id, extraIds)
                          }
                        />
                      </motion.aside>
                    ) : (
                      <motion.aside
                        key="action-panel-desktop"
                        initial={{ width: 0 }}
                        animate={{ width: 500 }}
                        exit={{ width: 0 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="h-full overflow-hidden flex-shrink-0"
                      >
                        <div className="w-[500px] h-full pl-2">
                          <ActionPanel
                            task={selected}
                            doneIds={doneIds}
                            onClose={() => setSelectedId(null)}
                            onMarkDone={(extraIds) =>
                              markDone(selected.id, extraIds)
                            }
                          />
                        </div>
                      </motion.aside>
                    ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {isMobile && (
          <div className="shrink-0 z-[60] flex items-center justify-around gap-1 px-2 py-2 bg-[var(--background-secondary)] border-t border-[var(--border-color-medium)]">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen((v) => !v)}
              aria-label={mobileSidebarOpen ? "Close menu" : "Open menu"}
              className={`flex-1 inline-flex items-center justify-center h-9 rounded transition-colors cursor-pointer border-0 ${
                mobileSidebarOpen
                  ? "bg-[var(--background-transparent-medium)] text-[var(--font-color-primary)]"
                  : "bg-transparent text-[var(--font-color-secondary)] hover:bg-[var(--background-transparent-light)]"
              }`}
            >
              <i className="ti ti-menu-2 text-[16px]" />
            </button>
            <button
              type="button"
              aria-label="Search"
              className="flex-1 inline-flex items-center justify-center h-9 rounded bg-transparent text-[var(--font-color-secondary)] cursor-default border-0"
            >
              <i className="ti ti-search text-[16px]" />
            </button>
            <button
              type="button"
              aria-label="New chat"
              className="flex-1 inline-flex items-center justify-center h-9 rounded bg-transparent text-[var(--font-color-secondary)] cursor-default border-0"
            >
              <i className="ti ti-message-circle text-[16px]" />
            </button>
            <button
              type="button"
              onClick={() => setActionPanelHidden((v) => !v)}
              disabled={!selected}
              aria-label={
                actionPanelHidden ? "Show action panel" : "Hide action panel"
              }
              className={`flex-1 inline-flex items-center justify-center h-9 rounded transition-colors border-0 ${
                !selected
                  ? "bg-transparent text-[var(--font-color-extra-light)] cursor-not-allowed"
                  : actionPanelHidden
                    ? "bg-transparent text-[var(--font-color-secondary)] cursor-pointer hover:bg-[var(--background-transparent-light)]"
                    : "bg-[var(--background-transparent-medium)] text-[var(--font-color-primary)] cursor-pointer"
              }`}
            >
              <i
                className={`ti ${
                  actionPanelHidden
                    ? "ti-layout-sidebar-right"
                    : "ti-layout-sidebar-right-collapse"
                } text-[16px]`}
              />
            </button>
          </div>
        )}

        {/* Mobile-only: fixed-overlay version of the undo toast so it floats
         * above the fullscreen action panel. Desktop renders the inline
         * version inside the main column above. */}
        {isMobile && (
          <div className="fixed top-3 left-0 right-0 z-[70] flex justify-center pointer-events-none px-3">
            <AnimatePresence initial={false}>
              {undoToast && (
                <motion.div
                  key="undo-toast-mobile"
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="pointer-events-auto flex items-center justify-center gap-3 px-4 py-2 rounded bg-[var(--accent-tertiary)] border border-[var(--color-blue)] text-[var(--color-blue)] text-[13px] shadow-lg max-w-full"
                >
                  <span className="truncate">
                    Marked done ·{" "}
                    <span className="font-medium">{undoToast.title}</span>
                    {undoToast.extraCount > 0 && (
                      <span> · +{undoToast.extraCount} more</span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={undoMarkDone}
                    className="shrink-0 px-2 py-0.5 rounded border border-[var(--color-blue)] text-[var(--color-blue)] bg-transparent cursor-pointer text-[12px] transition-colors hover:bg-[var(--color-blue)] hover:text-[var(--font-color-on-accent)]"
                  >
                    Undo
                  </button>
                  <button
                    type="button"
                    onClick={dismissUndoToast}
                    aria-label="Dismiss"
                    className="shrink-0 ml-1 bg-transparent border-0 text-[var(--color-blue)] cursor-pointer text-[14px] leading-none transition-opacity opacity-70 hover:opacity-100"
                  >
                    ×
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </ChipClickContext.Provider>
  );
}
