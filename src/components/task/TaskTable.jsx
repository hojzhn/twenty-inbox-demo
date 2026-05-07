import { relativeTime } from "../../utils/time";
import { Chip } from "../common/Primitives";

const shortName = (name) => (name || "").split(" · ")[0];

function RelationChip({ entity }) {
  return (
    <Chip entity={{ ...entity, objectName: shortName(entity.objectName) }} />
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
      <col style={{ width: 300 }} />
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
  width: "max-content",
  // Subtract the table's own horizontal margin (mx-2 = 16px total) so the table
  // doesn't overflow the scroll container when its content already fits.
  minWidth: "calc(100% - 32px)",
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
