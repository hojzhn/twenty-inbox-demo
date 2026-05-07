// Static navigation panel — visual reference only, not interactive.

import { useEffect, useState } from "react";

function ThemeToggle() {
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute("data-theme") || "light",
  );
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{ pointerEvents: "auto" }}
      className="mx-2 mb-2 mt-auto flex items-center gap-2 px-2 py-1.5 rounded text-[13px] text-[var(--font-color-secondary)] hover:bg-[var(--background-secondary)] cursor-pointer bg-transparent border-0"
    >
      <span className="w-5 inline-flex justify-center">
        <i className={`ti ${isDark ? "ti-sun" : "ti-moon"}`} />
      </span>
      <span className="flex-1 text-left">
        {isDark ? "Light mode" : "Dark mode"}
      </span>
    </button>
  );
}

// Tinted icon-square pairs (step3 bg + step11 fg) — matches Twenty's tag palette.
const TONE_PAIRS = {
  blue: { bg: "var(--avatar-blue-bg)", fg: "var(--avatar-blue-fg)" },
  green: { bg: "var(--avatar-green-bg)", fg: "var(--avatar-green-fg)" },
  red: { bg: "var(--avatar-red-bg)", fg: "var(--avatar-red-fg)" },
  orange: { bg: "var(--avatar-orange-bg)", fg: "var(--avatar-orange-fg)" },
  purple: { bg: "var(--avatar-purple-bg)", fg: "var(--avatar-purple-fg)" },
  pink: { bg: "var(--avatar-pink-bg)", fg: "var(--avatar-pink-fg)" },
  turquoise: {
    bg: "var(--avatar-turquoise-bg)",
    fg: "var(--avatar-turquoise-fg)",
  },
  sky: { bg: "var(--avatar-sky-bg)", fg: "var(--avatar-sky-fg)" },
  gray: {
    bg: "var(--background-quaternary)",
    fg: "var(--font-color-secondary)",
  },
};

export function ToneIcon({
  tone = "gray",
  size = 22,
  fontSize = 14,
  children,
}) {
  const pair = TONE_PAIRS[tone] || TONE_PAIRS.gray;
  return (
    <span
      className="inline-flex items-center justify-center rounded-[5px] shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: pair.bg,
        color: pair.fg,
        fontSize,
      }}
    >
      {children}
    </span>
  );
}

function SidebarItem({ icon, tone, label, highlighted, hasChevron }) {
  return (
    <div
      className={`flex items-center gap-2 px-2 py-1 rounded text-[13px] cursor-pointer transition-colors ${
        highlighted
          ? "bg-[var(--background-quaternary)] text-[var(--font-color-primary)]"
          : "text-[var(--font-color-secondary)] hover:bg-[var(--background-transparent-light)]"
      }`}
    >
      <ToneIcon tone={tone} size={22} fontSize={13}>
        {icon}
      </ToneIcon>
      <span className="flex-1">{label}</span>
      {hasChevron && (
        <i className="ti ti-chevron-right text-[10px] text-[var(--font-color-tertiary)]" />
      )}
    </div>
  );
}

function SidebarSection({ title, children }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="text-[11px] font-medium text-[var(--font-color-tertiary)] px-2 mb-1">
        {title}
      </div>
      {children}
    </div>
  );
}

export function Sidebar() {
  return (
    <nav
      style={{
        flex: "0 0 220px",
        height: "100%",
        overflowY: "auto",
      }}
      className="flex flex-col gap-4 text-[var(--font-color-primary)] text-[13px]"
    >
      <div className="flex items-center justify-between px-2 pt-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-[var(--color-blue)] text-[var(--font-color-on-accent)] text-[11px] font-semibold">
            V
          </span>
          <span className="font-medium">Volt</span>
          <i className="ti ti-chevron-down text-[10px] text-[var(--font-color-tertiary)]" />
        </div>
        <div className="flex items-center gap-3 text-[var(--font-color-tertiary)]">
          <i className="ti ti-search text-[12px]" />
          <i className="ti ti-layout-columns text-[12px]" />
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-1 p-0.5 rounded bg-[var(--background-secondary)] border border-[var(--border-color-medium)]">
          <span className="w-6 h-6 rounded bg-[var(--background-quaternary)] inline-flex items-center justify-center">
            <i className="ti ti-home text-[12px]" />
          </span>
          <span className="w-6 h-6 inline-flex items-center justify-center text-[var(--font-color-secondary)]">
            <i className="ti ti-message text-[12px]" />
          </span>
        </div>
        <span className="px-2 py-1 rounded border border-[var(--font-color-tertiary)] text-xs flex items-center gap-1 text-[var(--font-color-secondary)]">
          <i className="ti ti-message-2-plus text-[10px]" />
          New chat
        </span>
      </div>

      <SidebarSection title="Workspace">
        <SidebarItem
          icon={<i className="ti ti-building" />}
          tone="blue"
          label="Companies"
        />
        <SidebarItem
          icon={<i className="ti ti-user" />}
          tone="purple"
          label="People"
        />
        <SidebarItem
          icon={<i className="ti ti-target" />}
          tone="red"
          label="Opportunities"
        />
        <SidebarItem
          icon={<i className="ti ti-checkbox" />}
          tone="green"
          label="Tasks"
        />
        <SidebarItem
          icon={<i className="ti ti-notes" />}
          tone="green"
          label="Notes"
        />
        <SidebarItem
          icon={<i className="ti ti-table" />}
          tone="gray"
          label="Dashboards"
        />
        <SidebarItem
          icon={<i className="ti ti-settings" />}
          tone="orange"
          label="Workflows"
          hasChevron
        />
      </SidebarSection>

      <SidebarSection title="Other">
        <SidebarItem
          icon={<i className="ti ti-inbox" />}
          tone="sky"
          label="Inbox"
          highlighted
        />
        <SidebarItem
          icon={<i className="ti ti-settings" />}
          tone="gray"
          label="Settings"
        />
        <SidebarItem
          icon={<i className="ti ti-help-circle" />}
          tone="gray"
          label="Documentation"
        />
      </SidebarSection>

      <ThemeToggle />
    </nav>
  );
}
