import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  Button,
  Section,
  SectionLabel,
  Caption,
  Chip,
  ColorAvatar,
} from "../components/common/Primitives";
import { FieldRow } from "../components/common/FieldRow";
import { SearchPopover } from "../components/common/Popover";

function replySubject(task) {
  const subj = task?.context?.emailSubject;
  if (!subj) return task?.title || "";
  return /^re:\s*/i.test(subj) ? subj : `Re: ${subj}`;
}

function ReplyComposer({ task }) {
  return (
    <div>
      <FieldRow
        icon={<i className="ti ti-mail" />}
        label="From"
        value={
          <div className="flex items-center justify-between w-full">
            <span>marcus@volta.io</span>
            <i className="ti ti-chevron-down text-[10px] text-[var(--font-color-secondary)]" />
          </div>
        }
      />

      <FieldRow
        icon={<i className="ti ti-user" />}
        label="To"
        value={
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex flex-wrap gap-1">
              {task.target ? <Chip entity={task.target} /> : null}
            </div>
            <span className="text-[11px] text-[var(--font-color-secondary)] cursor-pointer shrink-0">
              Cc/Bcc
            </span>
          </div>
        }
      />

      <FieldRow
        icon={<i className="ti ti-quote" />}
        label="Subject"
        value={
          <input
            defaultValue={replySubject(task)}
            placeholder="Subject"
            className="flex-1 h-full min-w-0 bg-transparent border-0 outline-none placeholder:text-[var(--font-color-tertiary)]"
          />
        }
      />

      <textarea
        placeholder='Type something or press "/" to see commands'
        className="w-full min-h-[180px] p-3 box-border border-t border-[var(--font-color-tertiary)] text-[13px] text-[var(--font-color-primary)] placeholder:text-[var(--font-color-tertiary)] leading-relaxed resize-y outline-none bg-transparent"
      />

      <div className="border-t border-[var(--font-color-tertiary)] p-3 flex flex-col gap-2">
        <SectionLabel>Attachments</SectionLabel>
        <button className="w-full py-3 border border-dashed border-[var(--font-color-tertiary)] rounded text-[12px] text-[var(--font-color-secondary)] flex items-center justify-center gap-2 bg-transparent">
          <i className="ti ti-arrow-up" />
          <span>Upload file</span>
        </button>
      </div>
    </div>
  );
}

export function AddNoteComposer({ task }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  return (
    <Section>
      <FieldRow
        icon={<i className="ti ti-letter-t"></i>}
        label="Title"
        value={
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled note"
            className="flex-1 h-full min-w-0 bg-transparent border-0 outline-none placeholder:text-[var(--font-color-tertiary)]"
          />
        }
      />
      <FieldRow
        icon={<i className="ti ti-edit" />}
        label="Body"
        value={
          <input
            id="title"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder='Type something or press "/" to see commands'
            className="flex-1 h-full min-w-0 bg-transparent border-0 outline-none placeholder:text-[var(--font-color-tertiary)]"
          />
        }
      />
      <FieldRow
        icon={<i className="ti ti-arrow-up-right" />}
        label="Relations"
        value={
          task.relations.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {task.relations.map((r) => (
                <Chip key={r.objectId} entity={r} />
              ))}
            </div>
          ) : null
        }
      />
    </Section>
  );
}

export function OpenNoteAction({ task }) {
  const noteRef = task.relations.find((r) => r.objectType === "Note");
  if (!noteRef) {
    return (
      <Section>
        <Caption>No note linked to this task.</Caption>
      </Section>
    );
  }
  return (
    <Section>
      <SectionLabel>Open note</SectionLabel>
      <p className="m-0 text-[13px] text-[var(--font-color-secondary)]">
        {noteRef.objectName}
      </p>
      <div className="flex gap-2 items-center">
        <Button variant="primary">Open full note</Button>
      </div>
    </Section>
  );
}

const DEFAULT_ASSIGNEE = {
  objectType: "User",
  objectId: "user_marcus",
  objectName: "Marcus",
};

// Volt teammates available as reassign targets. Marcus is the current user
// and stays at the top; the rest are seeded so the popover has something
// realistic to show.
const TEAMMATES = [
  { ...DEFAULT_ASSIGNEE, role: "Founder & CEO" },
  {
    objectType: "User",
    objectId: "user_dana",
    objectName: "Dana Singh",
    role: "COO",
  },
  {
    objectType: "User",
    objectId: "user_raj",
    objectName: "Raj Patel",
    role: "Head of Engineering",
  },
  {
    objectType: "User",
    objectId: "user_lin",
    objectName: "Lin Park",
    role: "Operations Lead",
  },
  {
    objectType: "User",
    objectId: "user_jordan_volt",
    objectName: "Jordan Reyes",
    role: "QC Lead",
  },
  {
    objectType: "User",
    objectId: "user_emi",
    objectName: "Emi Watanabe",
    role: "Finance",
  },
];

function AssigneeOption({ teammate, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs bg-transparent border-0 cursor-pointer text-left hover:bg-[var(--background-transparent-light)] transition-colors"
    >
      <ColorAvatar id={teammate.objectId} name={teammate.objectName} />
      <span className="flex-1 min-w-0 flex items-center gap-1 overflow-hidden">
        <span className="truncate text-[var(--font-color-primary)]">
          {teammate.objectName}
        </span>
        {teammate.role && (
          <span className="text-[var(--font-color-tertiary)] shrink-0">
            · {teammate.role}
          </span>
        )}
      </span>
      {selected && (
        <i className="ti ti-check text-[12px] text-[var(--color-blue)] shrink-0" />
      )}
    </button>
  );
}

export function ReassignAction() {
  const [assignee, setAssignee] = useState(DEFAULT_ASSIGNEE);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");

  return (
    <Section>
      <FieldRow
        icon={<i className="ti ti-user" />}
        label="Assignee"
        value={
          <span className="relative inline-flex items-center">
            <Chip entity={assignee} onClick={() => setOpen((v) => !v)} />
            <AnimatePresence>
              {open && (
                <SearchPopover
                  align="left"
                  width={260}
                  items={TEAMMATES}
                  searchPlaceholder="Search teammates"
                  filterFn={(t, q) =>
                    t.objectName.toLowerCase().includes(q) ||
                    (t.role || "").toLowerCase().includes(q)
                  }
                  renderItem={(t) => (
                    <AssigneeOption
                      key={t.objectId}
                      teammate={t}
                      selected={t.objectId === assignee.objectId}
                      onClick={() => {
                        setAssignee(t);
                        setOpen(false);
                      }}
                    />
                  )}
                  onClose={() => setOpen(false)}
                />
              )}
            </AnimatePresence>
          </span>
        }
      />
      <FieldRow
        icon={<i className="ti ti-message-circle" />}
        label="Note"
        value={
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional)"
            className="flex-1 h-full min-w-0 bg-transparent border-0 outline-none placeholder:text-[var(--font-color-tertiary)]"
          />
        }
      />
    </Section>
  );
}

export const ACTIONS = {
  reply: {
    label: "Reply",
    Body: ReplyComposer,
    primary: { label: "Send and clear" },
  },
  add_note: {
    label: "Add note",
    Body: AddNoteComposer,
    primary: { label: "Save and clear" },
  },
  reassign: {
    label: "Reassign",
    Body: ReassignAction,
    primary: { label: "Reassign and clear" },
  },
};

export const ACTION_OPTIONS = Object.entries(ACTIONS).map(([id, a]) => ({
  id,
  label: a.label,
}));
