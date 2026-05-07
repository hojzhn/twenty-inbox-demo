import { useState, useMemo, useRef, useEffect } from "react";
import { MARCUS_TASKS, sortByCreatedDesc } from "./Tasks";
import { FOCUS_OPTIONS, taskDistance } from "./Graph";
import ActionPanel from "./ActionPanel";
import { FocusPicker } from "./FocusPicker";
import { FocusFilterBar } from "./FocusFilterBar";
import { TaskTable } from "./TaskTable";
import { Sidebar } from "./Sidebar";
import { RecordDetail } from "./RecordDetail";
import { ChipClickContext } from "./ChipContext";
import { IntroModal } from "./IntroModal";

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
  const [view, setView] = useState(null);
  const navigate = (entity, options = {}) =>
    setView({ entity, tab: options.tab });
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
  const splitMode = !!selected;
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
      {introOpen && <IntroModal onStart={() => setIntroOpen(false)} />}
      <div
        style={{
          display: "flex",
          height: "100vh",
          padding: 16,
          gap: 16,
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
          {!view && (
            <h1 style={{ marginBottom: 16, flexShrink: 0 }}>Inbox</h1>
          )}

          {undoToast && (
            <div className="shrink-0 flex items-center justify-center gap-3 px-4 py-2 mb-2 rounded bg-[var(--point2)] border border-[var(--point)] text-[var(--point)] text-[13px]">
              <span>
                Marked done ·{" "}
                <span className="font-medium">{undoToast.title}</span>
              </span>
              <button
                type="button"
                onClick={undoMarkDone}
                className="px-2 py-0.5 rounded border border-[var(--point)] text-[var(--point)] bg-transparent cursor-pointer text-[12px]"
              >
                Undo
              </button>
              <button
                type="button"
                onClick={dismissUndoToast}
                aria-label="Dismiss"
                className="ml-1 bg-transparent border-0 text-[var(--point)] cursor-pointer text-[14px] leading-none"
              >
                ×
              </button>
            </div>
          )}

          <div
            style={{
              display: "flex",
              flex: 1,
              minHeight: 0,
              gap: 16,
              overflow: "hidden",
            }}
          >
            <main
              style={{
                flex: 1,
                minWidth: 0,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                paddingRight: 8,
              }}
            >
              {view ? (
                <RecordDetail
                  entity={view.entity}
                  defaultTab={view.tab}
                  onClose={() => setView(null)}
                />
              ) : (
                <>
                  <header style={{ flexShrink: 0 }}>
                    <div className="py-2 flex flex-row justify-between border-b border-[var(--bg3)]">
                      <div>
                        <i className="fa-solid fa-list" /> All Notifications{" "}
                        <span>· {totalShown}</span>{" "}
                        <i className="fa-solid fa-angle-down" />
                      </div>
                      <div className="flex flex-row items-center gap-4">
                        <FocusPicker value={focusId} onChange={setFocusId} />
                        <div>Filter</div>
                        <div>Sort</div>
                        <div>Options</div>
                      </div>
                    </div>
                    {focusOption && (
                      <FocusFilterBar
                        focusOption={focusOption}
                        onClear={() => setFocusId(null)}
                      />
                    )}
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
                </>
              )}
            </main>

            {splitMode && (
              <aside
                style={{
                  flex: 1,
                  minWidth: 0,
                  maxWidth: 500,
                  height: "100%",
                  paddingLeft: 16,
                  paddingRight: 8,
                }}
              >
                <ActionPanel
                  task={selected}
                  onClose={() => setSelectedId(null)}
                  onMarkDone={() => markDone(selected.id)}
                />
              </aside>
            )}
          </div>
        </div>
      </div>
    </ChipClickContext.Provider>
  );
}
