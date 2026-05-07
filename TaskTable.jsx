import { relativeTime } from "./utils";

const chipBase =
  "inline-flex items-center px-2 py-0.5 rounded border border-[var(--txt3)] bg-[var(--bg)] text-[var(--txt)] text-xs leading-relaxed whitespace-nowrap";

const TYPE_PREFIX = { Opportunity: "O", User: "U" };
const typePrefix = (t) =>
  TYPE_PREFIX[t] || (t ? t.charAt(0).toUpperCase() : "");
const shortName = (name) => (name || "").split(" · ")[0];

function RelationChip({ entity }) {
  return (
    <span className={chipBase}>
      <span style={{ opacity: 0.5, marginRight: 4 }}>
        {typePrefix(entity.objectType)}
      </span>
      {shortName(entity.objectName)}
    </span>
  );
}

const cellStyle = (width) => ({
  padding: "8px 8px 8px 0",
  verticalAlign: "top",
  whiteSpace: "nowrap",
  ...(width != null ? { width } : {}),
});

function TaskColumns() {
  return (
    <colgroup>
      <col style={{ width: 16 }} />
      <col />
      <col />
      <col style={{ width: 150 }} />
      <col style={{ width: 100 }} />
    </colgroup>
  );
}

const headerCellStyle = {
  padding: "8px 8px 8px 0",
  textAlign: "left",
  fontWeight: 400,
  color: "var(--txt3)",
  borderBottom: "1px solid var(--bg3)",
  fontSize: 12,
  whiteSpace: "nowrap",
};

function TaskHeader({ notificationLabel = "Notification", showBell = true }) {
  return (
    <thead>
      <tr>
        <th style={headerCellStyle} />
        <th style={headerCellStyle}>
          {showBell && <i className="fa-regular fa-bell mr-1" />}
          {notificationLabel}
        </th>
        <th style={headerCellStyle}>
          <i className="fa-solid fa-arrow-up-right mr-1" />
          Relations
        </th>
        <th style={headerCellStyle}>
          <i className="fa-regular fa-circle-user mr-1" />
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
      style={{
        background: selected ? "var(--bg3)" : "transparent",
        cursor: "pointer",
        borderBottom: "1px solid var(--bg3)",
      }}
    >
      <td style={cellStyle(16)} className="text-[var(--point)]">
        {isUnread ? "●" : "　"}
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
  width: "100%",
  minWidth: 720,
  tableLayout: "fixed",
  borderCollapse: "collapse",
};

export function TaskTable({ groups, selectedId, onSelect }) {
  const showBell = groups.length === 1;
  return (
    <>
      {groups.map((group, i) => (
        <table
          key={group.label || i}
          style={{ ...tableStyle, marginTop: i === 0 ? 0 : 24 }}
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
