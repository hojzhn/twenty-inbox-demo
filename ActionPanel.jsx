import { useState, useMemo, useEffect } from "react";
import { relativeTime } from "./utils";
import { MARCUS_TASKS } from "./Tasks";
import { taskDistance } from "./Graph";
import { FieldRow } from "./FieldRow";
import { ACTIONS } from "./Actions";
import ActionSelector from "./ActionSelector";
import { getDefaultAction } from "./Helpers";
import { SearchPopover } from "./Popover";
import {
  Button,
  IconButton,
  Chip,
  TaskChip,
  Caption,
  ColorAvatar,
  chipBase,
} from "./Primitives";
import {
  EmailContext,
  WorkflowContext,
  MentionContext,
} from "./ContextDisplays";

// Co-resolve state ----------------------------------------------------------

function useCoResolve(task) {
  const [ids, setIds] = useState(() => new Set());

  useEffect(() => {
    setIds(new Set());
  }, [task.id]);

  const candidates = useMemo(() => {
    const primary = task.target || task.relations?.[0] || task.createdBy;
    return MARCUS_TASKS.filter(
      (t) =>
        t.id !== task.id && t.status !== "done" && t.status !== "dismissed",
    )
      .map((t) => ({
        task: t,
        dist: primary ? taskDistance(t, primary.objectId) : Infinity,
      }))
      .sort((a, b) => a.dist - b.dist);
  }, [task]);

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
            ? "bg-[var(--point)] border-[var(--point)]"
            : "border-[var(--txt3)] bg-transparent"
        }`}
      >
        {selected && (
          <i className="fa-solid fa-check text-[8px] text-[var(--point2)]" />
        )}
      </span>
      <ColorAvatar id={task.id} name={task.title} />
      <span className="flex-1 min-w-0 truncate text-[var(--txt)]">
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
        icon={<i className="fa-solid fa-check" />}
        label="Resolve"
        value={
          <div className="flex items-center justify-between gap-2 w-full">
            <TaskChip task={task} />
            <IconButton
              onClick={() => setExpanded((v) => !v)}
              ariaLabel={expanded ? "Hide resolve with" : "Show resolve with"}
            >
              {expanded ? "×" : "+"}
            </IconButton>
          </div>
        }
      />
      {expanded && (
        <FieldRow
          icon={<i className="fa-solid fa-check-double" />}
          label="Resolve with"
          value={
            <div className="flex flex-wrap gap-1 items-center">
              {coResolve.tasks.map((t) => (
                <TaskChip
                  key={t.id}
                  task={t}
                  onRemove={() => coResolve.remove(t.id)}
                />
              ))}
              <span className="relative inline-block">
                <button
                  type="button"
                  onClick={() => setPickerOpen((v) => !v)}
                  className={`${chipBase} bg-transparent border-dashed text-[var(--txt2)] cursor-pointer`}
                >
                  + Add task
                </button>
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
              </span>
            </div>
          }
        />
      )}
    </>
  );
}

// Panel ---------------------------------------------------------------------

export default function ActionPanel({ task, onClose, onMarkDone }) {
  const [actionId, setActionId] = useState(() =>
    getDefaultAction(task.trigger),
  );
  useEffect(() => {
    setActionId(getDefaultAction(task.trigger));
  }, [task.id, task.trigger]);

  const coResolve = useCoResolve(task);
  const action = actionId ? ACTIONS[actionId] : null;

  return (
    <div className="h-full flex flex-col text-[var(--txt)] bg-[var(--bg)] text-[13px] leading-relaxed">
      <header className="shrink-0 px-4 pt-4 pb-3 border-b border-[var(--bg3)] flex flex-col gap-2">
        <div className="flex justify-start items-center gap-3">
          <IconButton onClick={onClose} ariaLabel="Close">
            ×
          </IconButton>
          <TaskChip task={task} />
          <Caption>{relativeTime(task.createdAt)}</Caption>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-6">
        <div>
          <FieldRow
            icon={<i className="fa-regular fa-circle-exclamation" />}
            label="Trigger"
            value={task.trigger}
          />
          <FieldRow
            icon={<i className="fa-solid fa-arrow-up-right" />}
            label="Relations"
            value={
              <div className="flex flex-wrap gap-1">
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
      </div>

      <footer className="shrink-0 px-4 py-3 border-t border-[var(--bg3)] flex justify-end items-center gap-2">
        <Button>
          Options <span className="ml-2 text-[var(--txt3)]">Ctrl O</span>
        </Button>
        <Button variant="primary" onClick={onMarkDone}>
          {action?.primary?.label || "Mark Done"}
          <span className="ml-2 opacity-75">Ctrl ↵</span>
        </Button>
      </footer>
    </div>
  );
}
