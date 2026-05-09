import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { MARCUS_TASKS } from "./data/Tasks";
import { FOCUS_OPTIONS } from "./data/Graph";
import { AppHeader } from "./components/app/AppHeader";
import { ActionPanelSlot } from "./components/app/ActionPanelSlot";
import { InboxView } from "./components/app/InboxView";
import { InitialLoader } from "./components/app/InitialLoader";
import { MobileNav } from "./components/app/MobileNav";
import { RecordView } from "./components/app/RecordView";
import { UndoToast } from "./components/app/UndoToast";
import { Sidebar } from "./components/layout/Sidebar";
import { ChipClickContext } from "./context/ChipContext";
import { buildGroups } from "./app/inboxModel";
import { useIsMobile } from "./utils/useIsMobile";

export default function App() {
  const isMobile = useIsMobile();
  const [initialLoading, setInitialLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [actionPanelHidden, setActionPanelHidden] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [taskActionStates, setTaskActionStates] = useState({});
  const [focusId, setFocusId] = useState(null);
  const [doneIds, setDoneIds] = useState(() => new Set());
  const [undoToast, setUndoToast] = useState(null);
  const [view, setView] = useState(null);
  const [readIds, setReadIds] = useState(
    new Set(MARCUS_TASKS.filter((task) => task.read).map((task) => task.id)),
  );
  const undoTimerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 450);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setMobileSidebarOpen(false);
      setActionPanelHidden(false);
    }
  }, [isMobile]);

  useEffect(() => {
    setActionPanelHidden(false);
  }, [selectedId]);

  function clearUndoTimer() {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
  }

  useEffect(() => clearUndoTimer, []);

  const tasks = useMemo(
    () =>
      MARCUS_TASKS.filter((task) => !doneIds.has(task.id)).map((task) => ({
        ...task,
        read: readIds.has(task.id),
      })),
    [readIds, doneIds],
  );
  const groups = useMemo(() => buildGroups(tasks, focusId), [tasks, focusId]);
  const totalShown = groups.reduce((acc, group) => acc + group.items.length, 0);
  const selected = tasks.find((task) => task.id === selectedId);
  const selectedActionState = selected ? taskActionStates[selected.id] : null;
  const focusOption = focusId
    ? FOCUS_OPTIONS.find((option) => option.id === focusId)
    : null;

  function navigate(entity, options = {}) {
    const tab =
      options.tab !== undefined ? options.tab : isMobile ? "Notes" : undefined;
    setView({ entity, tab });
    if (isMobile) setActionPanelHidden(true);
  }

  function closeView() {
    setView(null);
  }

  function pick(id) {
    setSelectedId((prev) => (prev === id ? null : id));
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

  function markDone(primaryId, extraIds = []) {
    const allIds = [primaryId, ...extraIds.filter((id) => id !== primaryId)];
    const doneSet = new Set(allIds);
    const flat = groups.flatMap((group) => group.items);
    const currentIndex = flat.findIndex((task) => task.id === primaryId);
    let nextId = null;

    if (currentIndex !== -1) {
      for (let i = currentIndex - 1; i >= 0; i--) {
        if (!doneSet.has(flat[i].id)) {
          nextId = flat[i].id;
          break;
        }
      }
      if (!nextId) {
        for (let i = currentIndex + 1; i < flat.length; i++) {
          if (!doneSet.has(flat[i].id)) {
            nextId = flat[i].id;
            break;
          }
        }
      }
    }

    const justDone = MARCUS_TASKS.find((task) => task.id === primaryId);

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

  function updateTaskActionState(taskId, patch) {
    setTaskActionStates((prev) => ({
      ...prev,
      [taskId]: {
        ...(prev[taskId] || {}),
        ...patch,
      },
    }));
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {initialLoading ? (
        <InitialLoader />
      ) : (
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
            <AppHeader
              isMobile={isMobile}
              view={view}
              onCloseView={closeView}
            />

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
                <UndoToast
                  toast={undoToast}
                  onUndo={undoMarkDone}
                  onDismiss={dismissUndoToast}
                />
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
                      <RecordView key="record" view={view} />
                    ) : (
                      <InboxView
                        key="inbox"
                        focusId={focusId}
                        focusOption={focusOption}
                        groups={groups}
                        isMobile={isMobile}
                        onFocusChange={setFocusId}
                        onTaskSelect={pick}
                        selectedId={selectedId}
                        totalShown={totalShown}
                      />
                    )}
                  </AnimatePresence>
                </main>
                <AnimatePresence initial={false}>
                  {selected && (
                    <ActionPanelSlot
                      key={
                        isMobile
                          ? "action-panel-mobile"
                          : "action-panel-desktop"
                      }
                      actionPanelHidden={actionPanelHidden}
                      doneIds={doneIds}
                      isMobile={isMobile}
                      selected={selected}
                      savedActionState={selectedActionState}
                      onActionStateChange={(patch) =>
                        updateTaskActionState(selected.id, patch)
                      }
                      onClose={() => setSelectedId(null)}
                      onMarkDone={(extraIds) => markDone(selected.id, extraIds)}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {isMobile && (
          <>
            <MobileNav
              actionPanelHidden={actionPanelHidden}
              mobileSidebarOpen={mobileSidebarOpen}
              selected={selected}
              onToggleActionPanel={() => setActionPanelHidden((prev) => !prev)}
              onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)}
            />
            <UndoToast
              toast={undoToast}
              onUndo={undoMarkDone}
              onDismiss={dismissUndoToast}
              mobile
            />
          </>
        )}
          </div>
        </ChipClickContext.Provider>
      )}
    </AnimatePresence>
  );
}
