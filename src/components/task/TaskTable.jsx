import { relativeTime } from "../../utils/time";
import { Chip } from "../common/Primitives";
import { ToneIcon } from "../layout/Sidebar";

const shortName = (name) => (name || "").split(" · ")[0];

function RelationChip({ entity }) {
  return (
    <Chip entity={{ ...entity, objectName: shortName(entity.objectName) }} />
  );
}

// Per-trigger icon + tone, matching Twenty's notification convention.
const TRIGGER_META = {
  email_reply: { icon: "ti-mail", tone: "blue" },
  mention: { icon: "ti-at", tone: "orange" },
  date_trigger: { icon: "ti-clock", tone: "yellow" },
  workflow_alert: { icon: "ti-alert-circle", tone: "gray" },
  manual: { icon: "ti-checkbox", tone: "green" },
};

function TriggerIcon({ trigger, dimmed }) {
  const meta = TRIGGER_META[trigger] || TRIGGER_META.manual;
  return (
    <span
      style={{ opacity: dimmed ? 0.5 : 1 }}
      className="inline-flex transition-opacity"
    >
      <ToneIcon tone={meta.tone} size={24} fontSize={12}>
        <i className={`ti ${meta.icon}`} />
      </ToneIcon>
    </span>
  );
}

const cellStyle = (width) => ({
  padding: "8px 8px 8px 0",
  verticalAlign: "middle",
  whiteSpace: "nowrap",
  ...(width != null ? { width } : {}),
});

function TaskColumns() {
  return (
    <colgroup>
      <col style={{ width: 16 }} />
      <col style={{ width: 32 }} />
      {/* Notification — no width, gets all leftover space (the largest column). */}
      <col />
      <col style={{ width: 200 }} />
      <col style={{ width: 150 }} />
      <col style={{ width: 100 }} />
    </colgroup>
  );
}

const headerCellStyle = {
  padding: "8px 8px 8px 0",
  textAlign: "left",
  fontWeight: 400,
  color: "var(--font-color-tertiary)",
  borderBottom: "1px solid var(--border-color-medium)",
  fontSize: 12,
  whiteSpace: "nowrap",
};

function TaskHeader({ notificationLabel = "Notification", showBell = true }) {
  return (
    <thead>
      <tr>
        <th style={headerCellStyle} />
        <th style={headerCellStyle} />
        <th style={headerCellStyle}>
          {showBell && <i className="ti ti-bell mr-1" />}
          {notificationLabel}
        </th>
        <th style={headerCellStyle}>
          <i className="ti ti-arrow-up-right mr-1" />
          Relations
        </th>
        <th style={headerCellStyle}>
          <i className="ti ti-user-circle mr-1" />
          Created by
        </th>
        <th style={headerCellStyle} />
      </tr>
    </thead>
  );
}

function TaskRow({ task, selected, onSelect }) {
  const isUnread = !task.read;
  return (
    <tr
      onClick={() => onSelect(task.id)}
      className={`cursor-pointer transition-colors ${
        selected
          ? "bg-[var(--background-quaternary)]"
          : "hover:bg-[var(--background-transparent-light)]"
      }`}
      style={{ borderBottom: "1px solid var(--border-color-medium)" }}
    >
      <td
        style={{ ...cellStyle(16), verticalAlign: "middle" }}
        className="text-[var(--color-blue)] text-[9px]"
      >
        {isUnread ? "●" : "　"}
      </td>
      <td style={{ ...cellStyle(32), verticalAlign: "middle" }}>
        <TriggerIcon trigger={task.trigger} dimmed={!isUnread} />
      </td>
      <td
        style={{
          ...cellStyle(),
          maxWidth: 0,
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}
      >
        <div
          className="text-sm"
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {isUnread ? <strong>{task.title}</strong> : task.title}
        </div>
      </td>
      <td style={{ ...cellStyle(), overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "nowrap",
            gap: 4,
            overflow: "hidden",
            maxWidth: "100%",
            minWidth: 0,
          }}
        >
          {(task.relations || []).map((r) => (
            <div key={r.objectId} style={{ flex: "0 0 auto" }}>
              <RelationChip entity={r} />
            </div>
          ))}
        </div>
      </td>
      <td
        style={{
          ...cellStyle(),
          whiteSpace: "normal",
          width: 150,
          maxWidth: 150,
        }}
      >
        <RelationChip entity={task.createdBy} />
      </td>
      <td
        style={{
          ...cellStyle(),
          textAlign: "right",
          color: "#666",
          width: 100,
          maxWidth: 100,
        }}
      >
        <small>{relativeTime(task.createdAt)}</small>
      </td>
    </tr>
  );
}

const tableStyle = {
  // Fill the scroll container so the notification column gets the leftover
  // space. The 32px subtraction accounts for the table's own mx-4 margin so
  // it doesn't overflow the container by that margin.
  // 16+32+200+150+100 = 498 fixed; remaining (~190px+) goes to notification.
  width: "calc(100% - 32px)",
  minWidth: 688,
  borderCollapse: "collapse",
  tableLayout: "fixed",
};

export function TaskTable({ groups, selectedId, onSelect }) {
  const showBell = groups.length === 1;
  return (
    <>
      {groups.map((group, i) => (
        <table
          key={group.label || i}
          style={{ ...tableStyle, marginTop: i === 0 ? 0 : 24 }}
          className="mx-4"
        >
          <TaskColumns />
          <TaskHeader notificationLabel={group.label} showBell={showBell} />
          <tbody>
            {group.items.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                selected={t.id === selectedId}
                onSelect={onSelect}
              />
            ))}
          </tbody>
        </table>
      ))}
    </>
  );
}
