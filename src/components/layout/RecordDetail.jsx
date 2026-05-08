import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Chip, ColorAvatar, chipBase } from "../common/Primitives";
import { relativeTime } from "../../utils/time";
import { MARCUS_TASKS } from "../../data/Tasks";
import { COMPANIES, OPPORTUNITIES, PEOPLE, NOTES } from "../../data/Graph";
import { useIsMobile } from "../../utils/useIsMobile";

// Type metadata --------------------------------------------------------------

const TYPE_META = {
  Task: {
    icon: "ti-checkbox",
    plural: "Tasks",
    tone: "green",
    tabs: ["Note", "Timeline", "Files"],
  },
  Opportunity: {
    icon: "ti-target",
    plural: "Opportunities",
    tone: "red",
    tabs: ["Timeline", "Tasks", "Notes", "Files", "Emails", "Calendar"],
  },
  Company: {
    icon: "ti-building",
    plural: "Companies",
    tone: "blue",
    tabs: ["Timeline", "Tasks", "Notes", "Files"],
  },
  Person: {
    icon: "ti-user",
    plural: "People",
    tone: "purple",
    tabs: ["Timeline", "Tasks", "Notes", "Files", "Emails"],
  },
  User: {
    icon: "ti-user-circle",
    plural: "Users",
    tone: "gray",
    tabs: ["Timeline"],
  },
  Note: {
    icon: "ti-file-text",
    plural: "Notes",
    tone: "green",
    tabs: ["Note", "Timeline", "Files"],
  },
  System: {
    icon: "ti-settings",
    plural: "System",
    tone: "gray",
    tabs: ["Timeline"],
  },
};

const TAB_ICON = {
  Home: "ti-home",
  Timeline: "ti-device-desktop",
  Tasks: "ti-checkbox",
  Notes: "ti-file-text",
  Note: "ti-file-text",
  Files: "ti-paperclip",
  Emails: "ti-mail",
  Calendar: "ti-calendar",
};

// Lookup ---------------------------------------------------------------------

function lookupRecord({ objectType, objectId }) {
  switch (objectType) {
    case "Task":
      return MARCUS_TASKS.find((t) => t.id === objectId) || null;
    case "Opportunity":
      return OPPORTUNITIES.find((o) => o.id === objectId) || null;
    case "Company":
      return COMPANIES.find((c) => c.id === objectId) || null;
    case "Person":
      return PEOPLE.find((p) => p.id === objectId) || null;
    case "Note":
      return NOTES.find((n) => n.id === objectId) || null;
    case "User":
      return objectId === "user_marcus"
        ? { id: "user_marcus", name: "Marcus" }
        : null;
    default:
      return null;
  }
}

const ref = (objectType, objectId, objectName) => ({
  objectType,
  objectId,
  objectName,
});

// Tasks use `title`; every other entity uses `name`. Prefer `name` first so a
// Person's `title` (their job title) doesn't get used as the record header.
const recordName = (record, fallback) =>
  record?.name || record?.title || fallback || "Record";

// Render `<Chip>` chips, or null when the list is empty so FieldEntry can fall
// back to its placeholder. (Returning <ChipList> from JSX produces a truthy
// React element regardless of its contents, which would suppress the
// placeholder — hence the inline check.)
const chips = (entities) =>
  entities && entities.length > 0 ? <ChipList entities={entities} /> : null;

// Field primitives -----------------------------------------------------------

function FieldEntry({ icon, label, value }) {
  return (
    <div className="flex items-baseline gap-3 items-center min-h-[28px] py-1 text-[0.92em]">
      <span className="flex items-center gap-2 text-[var(--font-color-secondary)]">
        <span className="w-4 inline-flex justify-center text-[var(--font-color-tertiary)]">
          {icon}
        </span>
        <span className="w-[90px]">{label}</span>
      </span>
      <span className="min-w-0 flex-1">
        {value ?? (
          <span className="text-[var(--font-color-tertiary)]">{label}</span>
        )}
      </span>
    </div>
  );
}

function CollapsibleGroup({ title, children }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between text-[12px] text-[var(--font-color-secondary)] font-medium py-1">
        <span>{title}</span>
        <i className="ti ti-chevron-up text-[10px] text-[var(--font-color-tertiary)]" />
      </div>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

function ChipList({ entities }) {
  return (
    <div className="flex flex-wrap gap-1">
      {entities.map((e) => (
        <Chip key={e.objectId} entity={e} />
      ))}
    </div>
  );
}

function Pill({ children }) {
  return <span className={`${chipBase} text-[12px]`}>{children}</span>;
}

function formatCurrency(n) {
  if (typeof n !== "number") return null;
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusPill({ status }) {
  const tone =
    status === "done"
      ? "bg-[var(--color-green-soft)] text-[var(--color-green)]"
      : status === "dismissed"
        ? "bg-[var(--background-quaternary)] text-[var(--font-color-tertiary)]"
        : "bg-[var(--color-red-soft)] text-[var(--color-red)]";
  return (
    <span className={`px-1.5 py-0.5 rounded text-[12px] capitalize ${tone}`}>
      {status}
    </span>
  );
}

function LinkedSection({ title, entities, actions }) {
  return (
    <div className="border-t border-[var(--border-color-medium)] pt-3 pb-2">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-[14px]">{title}</span>
        <div className="flex items-center gap-2 text-[var(--font-color-tertiary)] text-[12px]">
          {actions || <i className="ti ti-edit text-[12px]" />}
        </div>
      </div>
      {entities && entities.length > 0 && <ChipList entities={entities} />}
    </div>
  );
}

const linkedActions = {
  edit: <i className="ti ti-edit text-[12px]" />,
  openAdd: (
    <>
      <i className="ti ti-arrow-up-right text-[12px]" />
      <i className="ti ti-plus text-[12px]" />
    </>
  ),
};

// Per-type field renderers ---------------------------------------------------

function SystemFields({ record }) {
  return (
    <CollapsibleGroup title="System">
      <FieldEntry
        icon={<i className="ti ti-calendar" />}
        label="Creation date"
        value={record?.createdAt ? relativeTime(record.createdAt) : null}
      />
      <FieldEntry
        icon={<i className="ti ti-target" />}
        label="Created by"
        value={record?.createdBy ? <Chip entity={record.createdBy} /> : null}
      />
    </CollapsibleGroup>
  );
}

function TaskFields({ record }) {
  const assignee =
    record?.assigneeId === "user_marcus"
      ? ref("User", "user_marcus", "Marcus")
      : null;
  return (
    <>
      <CollapsibleGroup title="General">
        <FieldEntry
          icon={<i className="ti ti-calendar" />}
          label="Due Date"
          value={record?.dueDate ? relativeTime(record.dueDate) : null}
        />
        <FieldEntry
          icon={<i className="ti ti-check" />}
          label="Status"
          value={record?.status ? <StatusPill status={record.status} /> : null}
        />
        <FieldEntry
          icon={<i className="ti ti-user-circle" />}
          label="Assignee"
          value={assignee ? <Chip entity={assignee} /> : null}
        />
        <FieldEntry icon={<i className="ti ti-edit" />} label="Body" />
        <FieldEntry
          icon={<i className="ti ti-arrow-up-right" />}
          label="Relations"
          value={chips(record?.relations)}
        />
      </CollapsibleGroup>
      <SystemFields record={record} />
    </>
  );
}

function OpportunityFields({ record }) {
  const companies = (record?.companyIds || [])
    .map((id) => COMPANIES.find((c) => c.id === id))
    .filter(Boolean)
    .map((c) => ref("Company", c.id, c.name));
  return (
    <>
      <CollapsibleGroup title="Deal">
        <FieldEntry
          icon={<i className="ti ti-currency-dollar" />}
          label="Amount"
          value={formatCurrency(record?.amount)}
        />
        <FieldEntry
          icon={<i className="ti ti-circle-dot" />}
          label="Stage"
          value={
            record?.stage ? (
              <span className="px-1.5 py-0.5 rounded bg-[var(--color-red-soft)] text-[var(--color-red)] text-[12px]">
                {record.stage}
              </span>
            ) : null
          }
        />
        <FieldEntry
          icon={<i className="ti ti-calendar" />}
          label="Close date"
          value={formatDate(record?.closeDate)}
        />
      </CollapsibleGroup>
      <CollapsibleGroup title="Relations">
        <FieldEntry
          icon={<i className="ti ti-building" />}
          label="Company"
          value={chips(companies)}
        />
        <FieldEntry icon={<i className="ti ti-user" />} label="Point of ..." />
        <FieldEntry icon={<i className="ti ti-user-circle" />} label="Owner" />
      </CollapsibleGroup>
      <SystemFields record={record} />
      <LinkedSection title="Point of Contact" actions={linkedActions.edit} />
      <LinkedSection
        title="Company"
        entities={companies}
        actions={linkedActions.edit}
      />
      <LinkedSection title="Owner" actions={linkedActions.edit} />
    </>
  );
}

function PersonFields({ record }) {
  const employer = COMPANIES.find((c) => c.id === record?.employerId);
  const employerChip = employer
    ? [ref("Company", employer.id, employer.name)]
    : [];
  const opportunities = (record?.opportunityIds || [])
    .map((id) => OPPORTUNITIES.find((o) => o.id === id))
    .filter(Boolean)
    .map((o) => ref("Opportunity", o.id, o.name));
  return (
    <>
      <CollapsibleGroup title="General">
        <FieldEntry
          icon={<i className="ti ti-mail" />}
          label="Emails"
          value={record?.email ? <Pill>{record.email}</Pill> : null}
        />
        <FieldEntry
          icon={<i className="ti ti-phone" />}
          label="Phones"
          value={record?.phone ? <Pill>{record.phone}</Pill> : null}
        />
        <FieldEntry
          icon={<i className="ti ti-map" />}
          label="City"
          value={record?.city}
        />
      </CollapsibleGroup>
      <CollapsibleGroup title="Work">
        <FieldEntry
          icon={<i className="ti ti-building" />}
          label="Company"
          value={chips(employerChip)}
        />
        <FieldEntry
          icon={<i className="ti ti-id-badge" />}
          label="Job Title"
          value={record?.title}
        />
      </CollapsibleGroup>
      <CollapsibleGroup title="Social">
        <FieldEntry
          icon={<i className="ti ti-brand-linkedin" />}
          label="Linkedin"
        />
        <FieldEntry icon={<i className="ti ti-brand-x" />} label="X" />
      </CollapsibleGroup>
      <SystemFields record={record} />
      <LinkedSection
        title="Company"
        entities={employerChip}
        actions={linkedActions.edit}
      />
      <LinkedSection
        title="Opportunities"
        entities={opportunities}
        actions={linkedActions.openAdd}
      />
    </>
  );
}

function CompanyFields({ record }) {
  const people = PEOPLE.filter((p) => p.employerId === record?.id).map((p) =>
    ref("Person", p.id, p.name),
  );
  const opportunities = OPPORTUNITIES.filter((o) =>
    o.companyIds?.includes(record?.id),
  ).map((o) => ref("Opportunity", o.id, o.name));
  return (
    <>
      <CollapsibleGroup title="General">
        <FieldEntry
          icon={<i className="ti ti-link" />}
          label="Domain Name"
          value={record?.domain}
        />
        <FieldEntry
          icon={<i className="ti ti-user-circle" />}
          label="Account Owner"
          value={record?.domain}
        />
      </CollapsibleGroup>

      <CollapsibleGroup title="Business">
        <FieldEntry
          icon={<i className="ti ti-moneybag" />}
          label="APR"
          value={null}
        />

        <FieldEntry
          icon={<i className="ti ti-users" />}
          label="Employees"
          value={
            typeof record?.employees === "number"
              ? record.employees.toLocaleString()
              : null
          }
        />
        <FieldEntry
          icon={<i className="ti ti-target" />}
          label="ICP"
          value={
            <>
              <i className="ti ti-x" /> False
            </>
          }
        />
      </CollapsibleGroup>

      <CollapsibleGroup title="Contact">
        <FieldEntry
          icon={<i className="ti ti-map-pin" />}
          label="Address"
          value={record?.city}
        />

        <FieldEntry
          icon={<i className="ti ti-brand-linkedin" />}
          label="Linkedin"
        />
        <FieldEntry icon={<i className="ti ti-brand-x" />} label="X" />
      </CollapsibleGroup>
      <SystemFields record={record} />
      <LinkedSection
        title="People"
        entities={people}
        actions={linkedActions.openAdd}
      />
      <LinkedSection
        title="Opportunities"
        entities={opportunities}
        actions={linkedActions.openAdd}
      />
    </>
  );
}

function NoteFields({ record }) {
  const opps = (record?.taggedOpportunityIds || [])
    .map((id) => OPPORTUNITIES.find((o) => o.id === id))
    .filter(Boolean)
    .map((o) => ref("Opportunity", o.id, o.name));
  const companies = (record?.taggedCompanyIds || [])
    .map((id) => COMPANIES.find((c) => c.id === id))
    .filter(Boolean)
    .map((c) => ref("Company", c.id, c.name));
  const people = (record?.taggedPersonIds || [])
    .map((id) => PEOPLE.find((p) => p.id === id))
    .filter(Boolean)
    .map((p) => ref("Person", p.id, p.name));
  const relations = [...people, ...companies, ...opps];

  const author = PEOPLE.find((p) => p.id === record?.authorId);
  const authorChip = author
    ? ref("Person", author.id, author.name)
    : record?.authorId === "user_marcus"
      ? ref("User", "user_marcus", "Marcus")
      : null;
  // Inject the author as `createdBy` so SystemFields can render it.
  const augmented = { ...record, createdBy: record?.createdBy ?? authorChip };

  return (
    <>
      <CollapsibleGroup title="General">
        <FieldEntry
          icon={<i className="ti ti-edit" />}
          label="Body"
          value={
            record?.body ? (
              <span className="block truncate text-[var(--font-color-primary)]">
                {record.body.split("\n")[0]}
              </span>
            ) : null
          }
        />
        <FieldEntry
          icon={<i className="ti ti-arrow-up-right" />}
          label="Relations"
          value={chips(relations)}
        />
      </CollapsibleGroup>
      <SystemFields record={augmented} />
    </>
  );
}

const FIELDS_BY_TYPE = {
  Task: TaskFields,
  Opportunity: OpportunityFields,
  Company: CompanyFields,
  Person: PersonFields,
  Note: NoteFields,
};

// Tabs / timeline ------------------------------------------------------------

function TabPill({ label, active, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 flex items-center gap-2 cursor-pointer border-0 bg-transparent transition-colors hover:bg-[var(--background-transparent-light)] ${
        active
          ? "border-b-2 border-[var(--font-color-primary)] text-[var(--font-color-primary)] -mb-px"
          : "text-[var(--font-color-secondary)]"
      } ${className}`}
    >
      <i className={`ti ${TAB_ICON[label] || "ti-circle"} text-[12px]`} />
      <span>{label}</span>
    </button>
  );
}

// Render all tabs in a ghost row to measure widths, then keep as many as fit
// in the container — reserving space for a "+N More" trigger when needed.
// The trigger opens a popover listing the overflow tabs.
function Tabs({ tabs, active, onSelect }) {
  const containerRef = useRef(null);
  const measureRefs = useRef([]);
  const moreWrapperRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(tabs.length);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const RESERVE = 90; // approx width of the "+N More" trigger

    function measure() {
      const containerWidth = container.clientWidth;
      const widths = measureRefs.current.map((el) => el?.offsetWidth || 0);
      const total = widths.reduce((a, b) => a + b, 0);
      if (total <= containerWidth) {
        setVisibleCount(tabs.length);
        return;
      }
      let used = 0;
      let count = 0;
      for (let i = 0; i < tabs.length; i++) {
        if (used + widths[i] + RESERVE > containerWidth) break;
        used += widths[i];
        count++;
      }
      setVisibleCount(Math.max(count, 1));
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [tabs]);

  useEffect(() => {
    if (!popoverOpen) return;
    function handleClick(e) {
      if (
        moreWrapperRef.current &&
        !moreWrapperRef.current.contains(e.target)
      ) {
        setPopoverOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [popoverOpen]);

  const visibleTabs = tabs.slice(0, visibleCount);
  const hiddenTabs = tabs.slice(visibleCount);
  const activeHidden = hiddenTabs.includes(active);

  return (
    <div className="border-b border-[var(--border-color-medium)] text-[13px] relative">
      {/* Ghost row — measures full widths, never visible. */}
      <div
        aria-hidden="true"
        className="absolute opacity-0 pointer-events-none flex items-center gap-1"
      >
        {tabs.map((label, i) => (
          <div
            key={label}
            ref={(el) => (measureRefs.current[i] = el)}
            className="px-3 py-2 flex items-center gap-2"
          >
            <i className={`ti ${TAB_ICON[label] || "ti-circle"} text-[12px]`} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div
        ref={containerRef}
        className="flex items-center gap-1 min-w-0 overflow-hidden"
      >
        {visibleTabs.map((label) => (
          <TabPill
            key={label}
            label={label}
            active={label === active}
            onClick={() => onSelect?.(label)}
          />
        ))}
        {hiddenTabs.length > 0 && (
          <span ref={moreWrapperRef} className="relative ml-auto">
            <button
              type="button"
              onClick={() => setPopoverOpen((v) => !v)}
              className={`px-3 py-2 flex items-center gap-1 border-0 cursor-pointer whitespace-nowrap transition-colors ${
                activeHidden
                  ? "border-b-2 border-[var(--font-color-primary)] text-[var(--font-color-primary)] -mb-px"
                  : "text-[var(--font-color-secondary)]"
              } ${
                popoverOpen
                  ? "bg-[var(--background-transparent-medium)]"
                  : "bg-transparent hover:bg-[var(--background-transparent-light)]"
              }`}
            >
              <span>+{hiddenTabs.length} More</span>
              <i className="ti ti-chevron-down text-[10px]" />
            </button>
            <AnimatePresence>
              {popoverOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-1 z-10 min-w-[160px] bg-[var(--background-transparent-primary)] backdrop-blur-md border border-[var(--border-color-light)] rounded shadow-lg py-1 flex flex-col"
                >
                  {hiddenTabs.map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        onSelect?.(label);
                        setPopoverOpen(false);
                      }}
                      className={`w-full text-left flex items-center gap-2 px-3 py-1.5 text-[12px] cursor-pointer border-0 bg-transparent transition-colors hover:bg-[var(--background-transparent-light)] ${
                        label === active
                          ? "text-[var(--color-blue)] font-medium"
                          : "text-[var(--font-color-primary)]"
                      }`}
                    >
                      <i
                        className={`ti ${TAB_ICON[label] || "ti-circle"} text-[12px]`}
                      />
                      <span>{label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </span>
        )}
      </div>
    </div>
  );
}

function EmailMessage({ message }) {
  const from = message.from;
  const senderName =
    (typeof from === "object" ? from?.objectName : from) || "Unknown";
  const senderId =
    (typeof from === "object" ? from?.objectId : from) || senderName;
  return (
    <div className="flex gap-3 items-start">
      <ColorAvatar id={senderId} name={senderName} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline gap-3">
          <span className="font-semibold text-[var(--font-color-primary)]">
            {senderName}
          </span>
          {message.receivedAt && (
            <span className="text-[12px] text-[var(--font-color-tertiary)] shrink-0">
              {relativeTime(message.receivedAt)}
            </span>
          )}
        </div>
        {message.to && (
          <div className="text-[12px] text-[var(--font-color-tertiary)] flex items-center gap-1">
            <span>{message.to}</span>
            <i className="ti ti-chevron-down text-[8px]" />
          </div>
        )}
        {message.snippet && (
          <p className="m-0 mt-3 text-[13px] text-[var(--font-color-primary)] whitespace-pre-wrap leading-relaxed">
            {message.snippet}
          </p>
        )}
      </div>
    </div>
  );
}

function EmailThreadCard({ task }) {
  const c = task.context || {};
  const subject = c.emailSubject || task.title;
  // Older messages first, then the current email at the bottom.
  const messages = [
    ...(c.emailThread || []),
    {
      from: task.createdBy,
      to: c.emailTo,
      receivedAt: c.emailReceivedAt,
      snippet: c.emailSnippet,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-md border border-[var(--border-color-medium)] flex items-center justify-center shrink-0">
          <i className="ti ti-mail text-[var(--font-color-secondary)] text-[14px]" />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-[14px] text-[var(--font-color-primary)]">
            {subject}
          </div>
          <div className="text-[12px] text-[var(--font-color-tertiary)]">
            Email
            {c.emailReceivedAt &&
              ` · Received ${relativeTime(c.emailReceivedAt)}`}
          </div>
        </div>
      </div>
      <div className="ml-3 pl-5 border-l border-[var(--border-color-medium)] flex flex-col gap-6">
        {messages.map((m, i) => (
          <EmailMessage key={i} message={m} />
        ))}
      </div>
    </div>
  );
}

function EmailThread({ entity }) {
  const emails = MARCUS_TASKS.filter(
    (t) =>
      t.trigger === "email_reply" &&
      (t.target?.objectId === entity.objectId ||
        t.createdBy?.objectId === entity.objectId),
  );
  if (emails.length === 0) {
    return (
      <div className="pt-8 text-center text-[12px] text-[var(--font-color-tertiary)]">
        No emails yet.
      </div>
    );
  }
  return (
    <div className="pt-4 flex flex-col gap-8">
      {emails.map((t) => (
        <EmailThreadCard key={t.id} task={t} />
      ))}
    </div>
  );
}

function TimelineEvent({ icon, time, children }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <span className="w-6 h-6 rounded-full bg-[var(--background-quaternary)] inline-flex items-center justify-center text-[var(--font-color-secondary)] mt-0.5">
        {icon}
      </span>
      <div className="flex-1 text-[13px] text-[var(--font-color-primary)]">
        {children}
      </div>
      <span className="text-[12px] text-[var(--font-color-tertiary)]">
        {time}
      </span>
    </div>
  );
}

function Timeline({ name, createdAt, createdBy }) {
  const time = createdAt ? relativeTime(createdAt) : "recently";
  return (
    <div className="pt-4">
      <div className="text-[12px] text-[var(--font-color-tertiary)] py-2 border-b border-[var(--border-color-medium)]">
        Activity
      </div>
      <div className="pt-2">
        <TimelineEvent
          icon={<i className="ti ti-plus text-[10px]" />}
          time={time}
        >
          {name} was created
          {createdBy ? (
            <>
              {" "}
              by{" "}
              <span className="text-[var(--font-color-secondary)]">
                {createdBy.objectName}
              </span>
            </>
          ) : null}
        </TimelineEvent>
      </div>
    </div>
  );
}

// Main -----------------------------------------------------------------------

// Lookup metadata used to render the record's header breadcrumb. Lives here
// because TYPE_META and lookupRecord are private to this module.
export function getRecordMeta(entity) {
  const record = lookupRecord(entity);
  const type = entity.objectType;
  const fallback = {
    icon: "ti-folder",
    plural: type,
    tone: "gray",
    tabs: ["Timeline"],
  };
  const meta = TYPE_META[type] || fallback;
  return {
    icon: meta.icon,
    plural: meta.plural,
    tone: meta.tone || "gray",
    name: recordName(record, entity.objectName),
  };
}

export function RecordDetail({ entity, defaultTab }) {
  const isMobile = useIsMobile();
  const record = lookupRecord(entity);
  const type = entity.objectType;
  const meta = TYPE_META[type] || {
    icon: "ti-folder",
    plural: type,
    tabs: ["Timeline"],
  };
  const name = recordName(record, entity.objectName);
  const letter = name.charAt(0).toUpperCase();
  const Fields = FIELDS_BY_TYPE[type];

  // On mobile, prepend a "Home" tab that hosts the field summary (since the
  // left aside is hidden in that layout).
  const tabs = isMobile ? ["Home", ...meta.tabs] : meta.tabs;
  // Treat "Notes" and "Note" as equivalent so a generic notes-tab request
  // lands on whichever variant the entity type uses.
  const resolveTab = (req) => {
    if (!req) return tabs[0];
    if (tabs.includes(req)) return req;
    if (req === "Notes" && tabs.includes("Note")) return "Note";
    if (req === "Note" && tabs.includes("Notes")) return "Notes";
    return tabs[0];
  };
  const [active, setActive] = useState(() => resolveTab(defaultTab));
  // If the entity changes (different record opened) or the tab list changes
  // (mobile flip adds/removes Home), drop selection that no longer exists.
  useEffect(() => {
    if (!tabs.includes(active)) {
      setActive(resolveTab(defaultTab));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity.objectId, isMobile]);

  const fieldsBody = (
    <>
      <div className="flex flex-col items-center justify-center text-center gap-1 mb-4">
        <span className="w-12 h-12 rounded-full bg-[var(--color-green)] inline-flex items-center justify-center text-[18px] font-semibold mb-2">
          {letter}
        </span>
        <div className="font-semibold text-[15px]">{name}</div>
        {record?.createdAt && (
          <div className="text-[12px] text-[var(--font-color-tertiary)]">
            Added {relativeTime(record.createdAt)}
          </div>
        )}
      </div>
      <div>
        <div className="font-semibold mb-2">Fields</div>
        {Fields ? (
          <Fields record={record} />
        ) : (
          <div className="text-[12px] text-[var(--font-color-tertiary)]">
            No fields available for {type}.
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col text-[var(--font-color-primary)] bg-[var(--background-primary)] text-[13px]">
      <div className="flex-1 min-h-0 overflow-hidden flex">
        <motion.aside
          initial={false}
          animate={{
            width: isMobile ? 0 : 350,
            opacity: isMobile ? 0 : 1,
          }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          style={{ flexShrink: 0, overflowY: "auto", overflowX: "hidden" }}
          className="border-r border-[var(--border-color-medium)]"
        >
          <div className="w-[350px] p-4 flex flex-col gap-4">{fieldsBody}</div>
        </motion.aside>

        <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {/* Tabs strip — stays put, never scrolls. */}
          <div className="shrink-0 px-4 pt-4">
            <Tabs tabs={tabs} active={active} onSelect={setActive} />
          </div>
          {/* Tab content — scrolls both axes; horizontal scrollbar pinned to
           * the bottom of this region rather than the whole record detail. */}
          <div className="flex-1 min-h-0 overflow-auto p-4">
            <div className="md:min-w-[350px]">
              {active === "Home" ? (
                <div>{fieldsBody}</div>
              ) : active === "Note" || active === "Notes" ? (
                <div className="text-[13px]">
                  <div className="text-[var(--font-color-secondary)] font-medium mb-2">
                    {active}
                  </div>
                  {record?.body ? (
                    <div className="min-h-[180px] p-3 rounded border border-[var(--border-color-medium)] text-[var(--font-color-primary)] whitespace-pre-wrap leading-relaxed">
                      {record.body}
                    </div>
                  ) : (
                    <div className="min-h-[180px] p-3 rounded border border-[var(--border-color-medium)] text-[var(--font-color-tertiary)]">
                      Type '/' for commands, '@' for mentions
                    </div>
                  )}
                </div>
              ) : active === "Timeline" ? (
                <Timeline
                  name={name}
                  createdAt={record?.createdAt}
                  createdBy={record?.createdBy}
                />
              ) : active === "Emails" ? (
                <EmailThread entity={entity} />
              ) : (
                <div className="pt-4 text-center text-[12px] text-[var(--font-color-tertiary)]">
                  No {active.toLowerCase()} yet.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
