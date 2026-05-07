import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Chip, ColorAvatar, IconButton, chipBase } from "./Primitives";
import { relativeTime } from "./utils";
import { MARCUS_TASKS } from "./Tasks";
import { COMPANIES, OPPORTUNITIES, PEOPLE, NOTES } from "./Graph";

// Type metadata --------------------------------------------------------------

const TYPE_META = {
  Task: {
    icon: "fa-square-check",
    plural: "Tasks",
    tabs: ["Note", "Timeline", "Files"],
  },
  Opportunity: {
    icon: "fa-bullseye",
    plural: "Opportunities",
    tabs: ["Timeline", "Tasks", "Notes", "Files", "Emails", "Calendar"],
  },
  Company: {
    icon: "fa-building",
    plural: "Companies",
    tabs: ["Timeline", "Tasks", "Notes", "Files"],
  },
  Person: {
    icon: "fa-user",
    plural: "People",
    tabs: ["Timeline", "Tasks", "Notes", "Files", "Emails"],
  },
  User: { icon: "fa-circle-user", plural: "Users", tabs: ["Timeline"] },
  Note: {
    icon: "fa-file-lines",
    plural: "Notes",
    tabs: ["Note", "Timeline", "Files"],
  },
  System: { icon: "fa-gear", plural: "System", tabs: ["Timeline"] },
};

const TAB_ICON = {
  Timeline: "fa-desktop",
  Tasks: "fa-square-check",
  Notes: "fa-file-lines",
  Note: "fa-file-lines",
  Files: "fa-paperclip",
  Emails: "fa-envelope",
  Calendar: "fa-calendar",
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
    <div className="grid grid-cols-[110px_1fr] gap-3 items-center min-h-[28px] py-1 text-[13px]">
      <span className="flex items-center gap-2 text-[var(--txt2)]">
        <span className="w-4 inline-flex justify-center text-[var(--txt3)]">
          {icon}
        </span>
        <span>{label}</span>
      </span>
      <span className="min-w-0">
        {value ?? <span className="text-[var(--txt3)]">{label}</span>}
      </span>
    </div>
  );
}

function CollapsibleGroup({ title, children }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between text-[12px] text-[var(--txt2)] font-medium py-1">
        <span>{title}</span>
        <i className="fa-solid fa-chevron-up text-[10px] text-[var(--txt3)]" />
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
      ? "bg-emerald-900/40 text-emerald-300"
      : status === "dismissed"
        ? "bg-gray-800 text-gray-400"
        : "bg-rose-900/40 text-rose-300";
  return (
    <span className={`px-1.5 py-0.5 rounded text-[12px] capitalize ${tone}`}>
      {status}
    </span>
  );
}

function LinkedSection({ title, entities, actions }) {
  return (
    <div className="border-t border-[var(--bg3)] pt-3 pb-2">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-[14px]">{title}</span>
        <div className="flex items-center gap-2 text-[var(--txt3)] text-[12px]">
          {actions || (
            <i className="fa-regular fa-pen-to-square text-[12px]" />
          )}
        </div>
      </div>
      {entities && entities.length > 0 && <ChipList entities={entities} />}
    </div>
  );
}

const linkedActions = {
  edit: <i className="fa-regular fa-pen-to-square text-[12px]" />,
  openAdd: (
    <>
      <i className="fa-solid fa-arrow-up-right text-[12px]" />
      <i className="fa-solid fa-plus text-[12px]" />
    </>
  ),
};

// Per-type field renderers ---------------------------------------------------

function SystemFields({ record }) {
  return (
    <CollapsibleGroup title="System">
      <FieldEntry
        icon={<i className="fa-regular fa-calendar" />}
        label="Creation date"
        value={record?.createdAt ? relativeTime(record.createdAt) : null}
      />
      <FieldEntry
        icon={<i className="fa-solid fa-bullseye" />}
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
          icon={<i className="fa-regular fa-calendar" />}
          label="Due Date"
          value={record?.dueDate ? relativeTime(record.dueDate) : null}
        />
        <FieldEntry
          icon={<i className="fa-solid fa-check" />}
          label="Status"
          value={record?.status ? <StatusPill status={record.status} /> : null}
        />
        <FieldEntry
          icon={<i className="fa-regular fa-circle-user" />}
          label="Assignee"
          value={assignee ? <Chip entity={assignee} /> : null}
        />
        <FieldEntry
          icon={<i className="fa-regular fa-pen-to-square" />}
          label="Body"
        />
        <FieldEntry
          icon={<i className="fa-solid fa-arrow-up-right" />}
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
          icon={<i className="fa-solid fa-dollar-sign" />}
          label="Amount"
          value={formatCurrency(record?.amount)}
        />
        <FieldEntry
          icon={<i className="fa-regular fa-circle-dot" />}
          label="Stage"
          value={
            record?.stage ? (
              <span className="px-1.5 py-0.5 rounded bg-rose-900/40 text-rose-300 text-[12px]">
                {record.stage}
              </span>
            ) : null
          }
        />
        <FieldEntry
          icon={<i className="fa-regular fa-calendar" />}
          label="Close date"
          value={formatDate(record?.closeDate)}
        />
      </CollapsibleGroup>
      <CollapsibleGroup title="Relations">
        <FieldEntry
          icon={<i className="fa-solid fa-building" />}
          label="Company"
          value={chips(companies)}
        />
        <FieldEntry
          icon={<i className="fa-solid fa-user" />}
          label="Point of ..."
        />
        <FieldEntry
          icon={<i className="fa-solid fa-circle-user" />}
          label="Owner"
        />
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
          icon={<i className="fa-regular fa-envelope" />}
          label="Emails"
          value={record?.email ? <Pill>{record.email}</Pill> : null}
        />
        <FieldEntry
          icon={<i className="fa-solid fa-phone" />}
          label="Phones"
          value={record?.phone ? <Pill>{record.phone}</Pill> : null}
        />
        <FieldEntry
          icon={<i className="fa-solid fa-map" />}
          label="City"
          value={record?.city}
        />
      </CollapsibleGroup>
      <CollapsibleGroup title="Work">
        <FieldEntry
          icon={<i className="fa-solid fa-building" />}
          label="Company"
          value={chips(employerChip)}
        />
        <FieldEntry
          icon={<i className="fa-solid fa-id-badge" />}
          label="Job Title"
          value={record?.title}
        />
      </CollapsibleGroup>
      <CollapsibleGroup title="Social">
        <FieldEntry
          icon={<i className="fa-brands fa-linkedin" />}
          label="Linkedin"
        />
        <FieldEntry
          icon={<i className="fa-brands fa-x-twitter" />}
          label="X"
        />
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
          icon={<i className="fa-solid fa-globe" />}
          label="Domain Name"
          value={record?.domain}
        />
        <FieldEntry
          icon={<i className="fa-solid fa-location-dot" />}
          label="Address"
          value={record?.city}
        />
        <FieldEntry
          icon={<i className="fa-solid fa-dollar-sign" />}
          label="Annual Revenue"
          value={
            typeof record?.annualRevenue === "number"
              ? formatCurrency(record.annualRevenue)
              : null
          }
        />
        <FieldEntry
          icon={<i className="fa-solid fa-users" />}
          label="Employees"
          value={
            typeof record?.employees === "number"
              ? record.employees.toLocaleString()
              : null
          }
        />
      </CollapsibleGroup>
      <CollapsibleGroup title="Social">
        <FieldEntry
          icon={<i className="fa-brands fa-linkedin" />}
          label="Linkedin"
        />
        <FieldEntry
          icon={<i className="fa-brands fa-x-twitter" />}
          label="X"
        />
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
          icon={<i className="fa-regular fa-pen-to-square" />}
          label="Body"
          value={
            record?.body ? (
              <span className="block truncate text-[var(--txt)]">
                {record.body.split("\n")[0]}
              </span>
            ) : null
          }
        />
        <FieldEntry
          icon={<i className="fa-solid fa-arrow-up-right" />}
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

function TabPill({ label, active, className = "" }) {
  return (
    <div
      className={`px-3 py-2 flex items-center gap-2 ${
        active
          ? "border-b-2 border-[var(--txt)] text-[var(--txt)] -mb-px"
          : "text-[var(--txt2)]"
      } ${className}`}
    >
      <i className={`fa-solid ${TAB_ICON[label] || "fa-circle"} text-[12px]`} />
      <span>{label}</span>
    </div>
  );
}

// Render all tabs in a ghost row to measure widths, then keep as many as fit
// in the container — reserving space for a "+N More" trigger when needed.
// The trigger opens a popover listing the overflow tabs. The tabs themselves
// remain non-interactive; only the "+N More" button is clickable.
function Tabs({ tabs, active }) {
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
    <div className="border-b border-[var(--bg3)] text-[13px] relative">
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
            <i
              className={`fa-solid ${TAB_ICON[label] || "fa-circle"} text-[12px]`}
            />
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div
        ref={containerRef}
        className="flex items-center gap-1 min-w-0 overflow-hidden"
      >
        {visibleTabs.map((label) => (
          <TabPill key={label} label={label} active={label === active} />
        ))}
        {hiddenTabs.length > 0 && (
          <span ref={moreWrapperRef} className="relative ml-auto">
            <button
              type="button"
              onClick={() => setPopoverOpen((v) => !v)}
              className={`px-3 py-2 flex items-center gap-1 bg-transparent border-0 cursor-pointer ${
                activeHidden
                  ? "border-b-2 border-[var(--txt)] text-[var(--txt)] -mb-px"
                  : "text-[var(--txt2)]"
              }`}
            >
              <span>+{hiddenTabs.length} More</span>
              <i className="fa-solid fa-chevron-down text-[10px]" />
            </button>
            {popoverOpen && (
              <div className="absolute right-0 top-full mt-1 z-10 min-w-[160px] bg-[var(--bg)] border border-[var(--txt3)] rounded shadow-lg py-1 flex flex-col">
                {hiddenTabs.map((label) => (
                  <div
                    key={label}
                    className={`flex items-center gap-2 px-3 py-1.5 text-[12px] ${
                      label === active
                        ? "text-[var(--point)] font-medium"
                        : "text-[var(--txt)]"
                    }`}
                  >
                    <i
                      className={`fa-solid ${TAB_ICON[label] || "fa-circle"} text-[12px]`}
                    />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            )}
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
          <span className="font-semibold text-[var(--txt)]">{senderName}</span>
          {message.receivedAt && (
            <span className="text-[12px] text-[var(--txt3)] shrink-0">
              {relativeTime(message.receivedAt)}
            </span>
          )}
        </div>
        {message.to && (
          <div className="text-[12px] text-[var(--txt3)] flex items-center gap-1">
            <span>{message.to}</span>
            <i className="fa-solid fa-chevron-down text-[8px]" />
          </div>
        )}
        {message.snippet && (
          <p className="m-0 mt-3 text-[13px] text-[var(--txt)] whitespace-pre-wrap leading-relaxed">
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
        <div className="w-9 h-9 rounded-md border border-[var(--bg3)] flex items-center justify-center shrink-0">
          <i className="fa-regular fa-envelope text-[var(--txt2)] text-[14px]" />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-[14px] text-[var(--txt)]">
            {subject}
          </div>
          <div className="text-[12px] text-[var(--txt3)]">
            Email
            {c.emailReceivedAt && ` · Received ${relativeTime(c.emailReceivedAt)}`}
          </div>
        </div>
      </div>
      <div className="ml-3 pl-5 border-l border-[var(--bg3)] flex flex-col gap-6">
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
      <div className="pt-8 text-center text-[12px] text-[var(--txt3)]">
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
      <span className="w-6 h-6 rounded-full bg-[var(--bg3)] inline-flex items-center justify-center text-[var(--txt2)] mt-0.5">
        {icon}
      </span>
      <div className="flex-1 text-[13px] text-[var(--txt)]">{children}</div>
      <span className="text-[12px] text-[var(--txt3)]">{time}</span>
    </div>
  );
}

function Timeline({ name, createdAt, createdBy }) {
  const time = createdAt ? relativeTime(createdAt) : "recently";
  return (
    <div className="pt-4">
      <div className="text-[12px] text-[var(--txt3)] py-2 border-b border-[var(--bg3)]">
        Activity
      </div>
      <div className="pt-2">
        <TimelineEvent
          icon={<i className="fa-solid fa-plus text-[10px]" />}
          time={time}
        >
          {name} was created
          {createdBy ? (
            <>
              {" "}
              by{" "}
              <span className="text-[var(--txt2)]">{createdBy.objectName}</span>
            </>
          ) : null}
        </TimelineEvent>
      </div>
    </div>
  );
}

// Main -----------------------------------------------------------------------

export function RecordDetail({ entity, onClose, defaultTab }) {
  const record = lookupRecord(entity);
  const type = entity.objectType;
  const meta = TYPE_META[type] || {
    icon: "fa-folder",
    plural: type,
    tabs: ["Timeline"],
  };
  const name = recordName(record, entity.objectName);
  const letter = name.charAt(0).toUpperCase();
  const Fields = FIELDS_BY_TYPE[type];

  const active =
    defaultTab && meta.tabs.includes(defaultTab) ? defaultTab : meta.tabs[0];

  return (
    <div className="flex-1 min-h-0 flex flex-col text-[var(--txt)] bg-[var(--bg)] text-[13px]">
      <header className="shrink-0 px-2 py-2 border-b border-[var(--bg3)] flex items-center gap-2">
        <IconButton onClick={onClose} ariaLabel="Close">
          ×
        </IconButton>
        <i className={`fa-solid ${meta.icon} text-[12px] text-[var(--txt3)]`} />
        <span className="text-[var(--txt2)]">{meta.plural}</span>
        <span className="text-[var(--txt3)]">/</span>
        <span className="font-medium">{name}</span>
      </header>

      <div className="flex-1 min-h-0 overflow-hidden flex">
        <aside className="w-[350px] shrink-0 overflow-y-auto p-4 flex flex-col gap-4 border-r border-[var(--bg3)]">
          <div className="flex flex-col items-start gap-1">
            <span className="w-12 h-12 rounded-full bg-emerald-800 inline-flex items-center justify-center text-[18px] font-semibold mb-2">
              {letter}
            </span>
            <div className="font-semibold text-[15px]">{name}</div>
            {record?.createdAt && (
              <div className="text-[12px] text-[var(--txt3)]">
                Added {relativeTime(record.createdAt)}
              </div>
            )}
          </div>

          <div>
            <div className="font-semibold mb-2">Fields</div>
            {Fields ? (
              <Fields record={record} />
            ) : (
              <div className="text-[12px] text-[var(--txt3)]">
                No fields available for {type}.
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-4">
          <Tabs tabs={meta.tabs} active={active} />
          <div className="min-w-[350px]">
            {active === "Note" || active === "Notes" ? (
              <div className="pt-4 text-[13px]">
                <div className="text-[var(--txt2)] font-medium mb-2">
                  {active}
                </div>
                {record?.body ? (
                  <div className="min-h-[180px] p-3 rounded border border-[var(--bg3)] text-[var(--txt)] whitespace-pre-wrap leading-relaxed">
                    {record.body}
                  </div>
                ) : (
                  <div className="min-h-[180px] p-3 rounded border border-[var(--bg3)] text-[var(--txt3)]">
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
              <div className="pt-8 text-center text-[12px] text-[var(--txt3)]">
                No {active.toLowerCase()} yet.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
