// Static navigation panel — visual reference only, not interactive.

function SidebarItem({ icon, iconColor, label, highlighted, hasChevron }) {
  return (
    <div
      className={`flex items-center gap-3 px-2 py-1.5 rounded text-[13px] ${
        highlighted ? "bg-[var(--bg3)] text-[var(--txt)]" : "text-[var(--txt2)]"
      }`}
    >
      <span
        className={`w-5 inline-flex justify-center ${
          iconColor || "text-[var(--txt2)]"
        }`}
      >
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {hasChevron && (
        <i className="fa-solid fa-chevron-right text-[10px] text-[var(--txt3)]" />
      )}
    </div>
  );
}

function SidebarSection({ title, children }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="text-[11px] font-medium text-[var(--txt3)] px-2 mb-1">
        {title}
      </div>
      {children}
    </div>
  );
}

export function Sidebar() {
  return (
    <nav
      aria-hidden="true"
      style={{
        flex: "0 0 220px",
        height: "100%",
        overflowY: "auto",
        pointerEvents: "none",
      }}
      className="flex flex-col gap-4 text-[var(--txt)] text-[13px]"
    >
      <div className="flex items-center justify-between px-2 pt-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-[var(--point)] text-[var(--point2)] text-[11px] font-semibold">
            V
          </span>
          <span className="font-medium">Volt</span>
          <i className="fa-solid fa-chevron-down text-[10px] text-[var(--txt3)]" />
        </div>
        <div className="flex items-center gap-3 text-[var(--txt3)]">
          <i className="fa-solid fa-magnifying-glass text-[12px]" />
          <i className="fa-solid fa-table-columns text-[12px]" />
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-1 p-0.5 rounded bg-[var(--bg2)] border border-[var(--bg3)]">
          <span className="w-6 h-6 rounded bg-[var(--bg3)] inline-flex items-center justify-center">
            <i className="fa-solid fa-house text-[12px]" />
          </span>
          <span className="w-6 h-6 inline-flex items-center justify-center text-[var(--txt2)]">
            <i className="fa-regular fa-comment text-[12px]" />
          </span>
        </div>
        <span className="px-2 py-1 rounded border border-[var(--txt3)] text-xs flex items-center gap-1 text-[var(--txt2)]">
          <i className="fa-regular fa-comment-medical text-[10px]" />
          New chat
        </span>
      </div>

      <SidebarSection title="Workspace">
        <SidebarItem
          icon={<i className="fa-solid fa-building" />}
          iconColor="text-blue-400"
          label="Companies"
        />
        <SidebarItem
          icon={<i className="fa-solid fa-user" />}
          iconColor="text-blue-400"
          label="People"
        />
        <SidebarItem
          icon={<i className="fa-solid fa-bullseye" />}
          iconColor="text-red-400"
          label="Opportunities"
        />
        <SidebarItem
          icon={<i className="fa-solid fa-square-check" />}
          iconColor="text-green-400"
          label="Tasks"
        />
        <SidebarItem
          icon={<i className="fa-regular fa-note-sticky" />}
          iconColor="text-green-400"
          label="Notes"
        />
        <SidebarItem
          icon={<i className="fa-solid fa-table-cells" />}
          iconColor="text-gray-400"
          label="Dashboards"
        />
        <SidebarItem
          icon={<i className="fa-solid fa-gear" />}
          iconColor="text-orange-400"
          label="Workflows"
          hasChevron
        />
      </SidebarSection>

      <SidebarSection title="Other">
        <SidebarItem
          icon={<i className="fa-solid fa-inbox" />}
          label="Inbox"
          highlighted
        />
        <SidebarItem
          icon={<i className="fa-solid fa-gear" />}
          label="Settings"
        />
        <SidebarItem
          icon={<i className="fa-regular fa-circle-question" />}
          label="Documentation"
        />
      </SidebarSection>
    </nav>
  );
}
