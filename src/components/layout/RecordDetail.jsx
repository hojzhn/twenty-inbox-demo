import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "../../utils/useIsMobile";
import { EmailThread, Timeline } from "./recordDetail/Activity";
import { RecordFieldsSummary } from "./recordDetail/Fields";
import { Tabs } from "./recordDetail/Tabs";
import {
  fallbackMeta,
  lookupRecord,
  recordName,
  TYPE_META,
} from "./recordDetail/model";

function resolveTabRequest(requestedTab, tabs) {
  if (!requestedTab) return tabs[0];
  if (tabs.includes(requestedTab)) return requestedTab;
  if (requestedTab === "Notes" && tabs.includes("Note")) return "Note";
  if (requestedTab === "Note" && tabs.includes("Notes")) return "Notes";
  return tabs[0];
}

function tabsForViewport(meta, isMobile) {
  if (isMobile && !meta.tabs.includes("Home")) {
    return ["Home", ...meta.tabs];
  }
  return meta.tabs;
}

function NoteTab({ record, active }) {
  return (
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
  );
}

function EmptyTab({ active }) {
  return (
    <div className="pt-4 text-center text-[12px] text-[var(--font-color-tertiary)]">
      No {active.toLowerCase()} yet.
    </div>
  );
}

function TabContent({ active, entity, fieldsBody, name, record }) {
  if (active === "Home") return <div>{fieldsBody}</div>;
  if (active === "Note" || active === "Notes") {
    return <NoteTab record={record} active={active} />;
  }
  if (active === "Timeline") {
    return (
      <Timeline
        name={name}
        createdAt={record?.createdAt}
        createdBy={record?.createdBy}
      />
    );
  }
  if (active === "Emails") return <EmailThread entity={entity} />;
  return <EmptyTab active={active} />;
}

// Lookup metadata used to render the record's header breadcrumb.
export function getRecordMeta(entity) {
  const record = lookupRecord(entity);
  const type = entity.objectType;
  const meta = TYPE_META[type] || fallbackMeta(type);
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
  const meta = TYPE_META[type] || fallbackMeta(type);
  const name = recordName(record, entity.objectName);
  const tabs = tabsForViewport(meta, isMobile);
  const [active, setActive] = useState(() =>
    resolveTabRequest(defaultTab, tabs),
  );

  useEffect(() => {
    if (!tabs.includes(active)) {
      setActive(resolveTabRequest(defaultTab, tabs));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity.objectId, isMobile]);

  const fieldsBody = (
    <RecordFieldsSummary
      letter={name.charAt(0).toUpperCase()}
      name={name}
      record={record}
      type={type}
    />
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
          <div className="shrink-0 px-4 pt-4">
            <Tabs tabs={tabs} active={active} onSelect={setActive} />
          </div>
          <div className="flex-1 min-h-0 overflow-auto p-4">
            <div className="md:min-w-[350px]">
              <TabContent
                active={active}
                entity={entity}
                fieldsBody={fieldsBody}
                name={name}
                record={record}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
