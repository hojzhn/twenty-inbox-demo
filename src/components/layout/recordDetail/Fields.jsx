import { Chip, chipBase } from "../../common/Primitives";
import { relativeTime } from "../../../utils/time";
import { COMPANIES, OPPORTUNITIES, PEOPLE } from "../../../data/Graph";
import { ref } from "./model";

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

function chips(entities) {
  return entities && entities.length > 0 ? <ChipList entities={entities} /> : null;
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

export const FIELDS_BY_TYPE = {
  Task: TaskFields,
  Opportunity: OpportunityFields,
  Company: CompanyFields,
  Person: PersonFields,
  Note: NoteFields,
};

export function RecordFieldsSummary({ letter, name, record, type }) {
  const Fields = FIELDS_BY_TYPE[type];

  return (
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
}
