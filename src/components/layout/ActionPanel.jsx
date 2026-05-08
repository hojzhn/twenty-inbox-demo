import { useState, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { relativeTime } from "../../utils/time";
import { MARCUS_TASKS } from "../../data/Tasks";
import { taskDistance } from "../../data/Graph";
import { FieldRow } from "../common/FieldRow";
import { ACTIONS } from "../../actions/Actions";
import ActionSelector from "../task/ActionSelector";
import { getDefaultAction } from "../../utils/helpers";
import { SearchPopover } from "../common/Popover";
import {
  Button,
  IconButton,
  Chip,
  TaskChip,
  Caption,
  ColorAvatar,
} from "../common/Primitives";
import {
  EmailContext,
  WorkflowContext,
  MentionContext,
} from "../common/ContextDisplays";

// Co-resolve state ----------------------------------------------------------

function useCoResolve(task, doneIds) {
  const [ids, setIds] = useState(() => new Set());

  useEffect(() => {
    setIds(new Set());
  }, [task.id]);

  const candidates = useMemo(() => {
    const primary = task.target || task.relations?.[0] || task.createdBy;
    return MARCUS_TASKS.filter(
      (t) =>
        t.id !== task.id &&
        t.status !== "done" &&
        t.status !== "dismissed" &&
        !doneIds?.has(t.id),
    )
      .map((t) => ({
        task: t,
        dist: primary ? taskDistance(t, primary.objectId) : Infinity,
      }))
      .sort((a, b) => a.dist - b.dist);
  }, [task, doneIds]);

  const tasks = useMemo(
    () =>
      [...ids]
        .map((id) => MARCUS_TASKS.find((t) => t.id === id))
        .filter(Boolean),
    [ids],
  );

  const update = (mut) => (id) =>
    setIds((prev) => {
      const next = new Set(prev);
      mut(next, id);
      return next;
    });

  return {
    tasks,
    candidates,
    add: update((s, id) => s.add(id)),
    remove: update((s, id) => s.delete(id)),
  };
}

// Resolve field -------------------------------------------------------------

const HOP_LABELS = ["Direct", "1 hop away", "2 hops away"];

function buildHopSections(candidates) {
  const buckets = [[], [], [], []]; // 0, 1, 2, Infinity / other
  for (const c of candidates) {
    if (c.dist === 0) buckets[0].push(c);
    else if (c.dist === 1) buckets[1].push(c);
    else if (c.dist === 2) buckets[2].push(c);
    else buckets[3].push(c);
  }
  return buckets
    .map((items, i) => ({
      label:
        items.length === 0
          ? null
          : i < 3
            ? `${HOP_LABELS[i]} (${items.length})`
            : `Other (${items.length})`,
      items,
    }))
    .filter((s) => s.items.length > 0);
}

function CandidateItem({ task, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs bg-transparent border-0 cursor-pointer text-left"
    >
      <span
        className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded border shrink-0 ${
          selected
            ? "bg-[var(--color-blue)] border-[var(--color-blue)]"
            : "border-[var(--font-color-tertiary)] bg-transparent"
        }`}
      >
        {selected && (
          <i className="ti ti-check text-[8px] text-[var(--font-color-on-accent)]" />
        )}
      </span>
      <ColorAvatar id={task.id} name={task.title} />
      <span className="flex-1 min-w-0 truncate text-[var(--font-color-primary)]">
        {task.title}
      </span>
    </button>
  );
}

function ResolveField({ task, coResolve }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const sections = useMemo(
    () => buildHopSections(coResolve.candidates),
    [coResolve.candidates],
  );
  const isSelected = (id) => coResolve.tasks.some((t) => t.id === id);

  return (
    <>
      <FieldRow
        icon={<i className="ti ti-check" />}
        label="Resolve"
        value={
          <>
            <div className="flex items-center justify-between gap-2 w-full">
              <TaskChip task={task} className="flex-shrink-1" />
              <IconButton
                onClick={() => setExpanded((v) => !v)}
                ariaLabel={expanded ? "Hide resolve with" : "Show resolve with"}
              >
                {expanded ? "×" : "+"}
              </IconButton>
            </div>
          </>
        }
      />
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="resolve-with"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <FieldRow
              icon={<i className="ti ti-checks" />}
              label="Resolve with"
              value={
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setPickerOpen((v) => !v)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setPickerOpen((v) => !v);
                    }
                  }}
                  className={`relative flex flex-wrap gap-1 items-center min-h-[24px] -mx-1 px-1 py-0.5 rounded cursor-pointer transition-colors ${
                    pickerOpen
                      ? "bg-[var(--background-transparent-medium)]"
                      : "hover:bg-[var(--background-transparent-light)]"
                  }`}
                >
                  {coResolve.tasks.length === 0 ? (
                    <span className="text-[var(--font-color-tertiary)] text-xs px-1">
                      + Add task
                    </span>
                  ) : (
                    coResolve.tasks.map((t) => (
                      <TaskChip
                        key={t.id}
                        task={t}
                        onRemove={() => coResolve.remove(t.id)}
                      />
                    ))
                  )}
                  <AnimatePresence>
                    {pickerOpen && (
                      <SearchPopover
                        sections={sections}
                        filterFn={({ task: t }, q) =>
                          t.title.toLowerCase().includes(q)
                        }
                        emptyMessage="No other tasks."
                        renderItem={({ task: t }) => (
                          <CandidateItem
                            key={t.id}
                            task={t}
                            selected={isSelected(t.id)}
                            onClick={() =>
                              isSelected(t.id)
                                ? coResolve.remove(t.id)
                                : coResolve.add(t.id)
                            }
                          />
                        )}
                        onClose={() => setPickerOpen(false)}
                      />
                    )}
                  </AnimatePresence>
                </div>
              }
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Panel ---------------------------------------------------------------------

export default function ActionPanel({ task, onClose, onMarkDone, doneIds }) {
  const [actionId, setActionId] = useState(() =>
    getDefaultAction(task.trigger),
  );
  useEffect(() => {
    setActionId(getDefaultAction(task.trigger));
  }, [task.id, task.trigger]);

  const coResolve = useCoResolve(task, doneIds);
  const action = actionId ? ACTIONS[actionId] : null;

  return (
    <div className="h-full flex flex-col rounded-lg border border-[var(--border-color-medium)] text-[var(--font-color-primary)] bg-[var(--background-primary)] text-[13px] leading-relaxed">
      <header className="shrink-0 bg-[var(--background-secondary)] pt-4 pb-3 px-4 md:px-0 border-b border-[var(--border-color-medium)] flex flex-col gap-2 relative">
        <div className="flex justify-start items-center gap-3">
          <span className="hidden md:inline-flex  ml-4">
            <IconButton onClick={onClose} ariaLabel="Close">
              ×
            </IconButton>
          </span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.14, ease: "easeOut" }}
              className="flex items-center gap-3 min-w-0"
            >
              <TaskChip task={task} />
              <Caption>{relativeTime(task.createdAt)}</Caption>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="md:hidden absolute top-3 right-3">
          <IconButton onClick={onClose} ariaLabel="Close">
            ×
          </IconButton>
        </div>
      </header>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={task.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.14, ease: "easeOut" }}
          className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-6"
        >
          <div>
            <FieldRow
              icon={<i className="ti ti-alert-circle" />}
              label="Trigger"
              value={task.trigger}
            />
            <FieldRow
              icon={<i className="ti ti-arrow-up-right" />}
              label="Relations"
              value={
                <div className="flex flex-wrap gap-1  w-full">
                  {task.relations.map((r) => (
                    <Chip key={r.objectId} entity={r} />
                  ))}
                </div>
              }
            />
            <ResolveField task={task} coResolve={coResolve} />
          </div>

          <EmailContext task={task} />
          <WorkflowContext task={task} />
          <MentionContext task={task} />
          <ActionSelector
            task={task}
            actionId={actionId}
            setActionId={setActionId}
          />
        </motion.div>
      </AnimatePresence>

      <footer className="shrink-0 px-4 py-3 border-t bg-[var(--background-secondary)] border-[var(--border-color-medium)] flex justify-end items-center gap-2">
        <Button>
          Options{" "}
          <span className="ml-2 text-[var(--font-color-tertiary)]">Ctrl O</span>
        </Button>
        <motion.button
          layout
          type="button"
          onClick={() => onMarkDone(coResolve.tasks.map((t) => t.id))}
          transition={{ layout: { duration: 0.2, ease: "easeOut" } }}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium leading-snug transition-colors bg-[var(--color-blue)] text-[var(--font-color-on-accent)] border border-[var(--color-blue)] hover:bg-[var(--accent-10)] hover:border-[var(--accent-10)] active:bg-[var(--accent-11)] cursor-pointer overflow-hidden"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={action?.primary?.label || "Mark Done"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.14, ease: "easeOut" }}
              className="inline-block whitespace-nowrap"
            >
              {action?.primary?.label || "Mark Done"}
            </motion.span>
          </AnimatePresence>
          <span className="ml-2 opacity-75">Ctrl ↵</span>
        </motion.button>
      </footer>
    </div>
  );
}
