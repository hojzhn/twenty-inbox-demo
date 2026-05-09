export function MobileNav({
  actionPanelHidden,
  mobileSidebarOpen,
  onToggleActionPanel,
  onToggleSidebar,
  selected,
}) {
  return (
    <div className="shrink-0 z-[60] flex items-center justify-around gap-1 px-2 py-2 bg-[var(--background-secondary)] border-t border-[var(--border-color-medium)]">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label={mobileSidebarOpen ? "Close menu" : "Open menu"}
        className={`flex-1 inline-flex items-center justify-center h-9 rounded transition-colors cursor-pointer border-0 ${
          mobileSidebarOpen
            ? "bg-[var(--background-transparent-medium)] text-[var(--font-color-primary)]"
            : "bg-transparent text-[var(--font-color-secondary)] hover:bg-[var(--background-transparent-light)]"
        }`}
      >
        <i className="ti ti-menu-2 text-[16px]" />
      </button>
      <button
        type="button"
        aria-label="Search"
        className="flex-1 inline-flex items-center justify-center h-9 rounded bg-transparent text-[var(--font-color-secondary)] cursor-default border-0"
      >
        <i className="ti ti-search text-[16px]" />
      </button>
      <button
        type="button"
        aria-label="New chat"
        className="flex-1 inline-flex items-center justify-center h-9 rounded bg-transparent text-[var(--font-color-secondary)] cursor-default border-0"
      >
        <i className="ti ti-message-circle text-[16px]" />
      </button>
      <button
        type="button"
        onClick={onToggleActionPanel}
        disabled={!selected}
        aria-label={actionPanelHidden ? "Show action panel" : "Hide action panel"}
        className={`flex-1 inline-flex items-center justify-center h-9 rounded transition-colors border-0 ${
          !selected
            ? "bg-transparent text-[var(--font-color-extra-light)] cursor-not-allowed"
            : actionPanelHidden
              ? "bg-transparent text-[var(--font-color-secondary)] cursor-pointer hover:bg-[var(--background-transparent-light)]"
              : "bg-[var(--background-transparent-medium)] text-[var(--font-color-primary)] cursor-pointer"
        }`}
      >
        <i
          className={`ti ${
            actionPanelHidden
              ? "ti-layout-sidebar-right"
              : "ti-layout-sidebar-right-collapse"
          } text-[16px]`}
        />
      </button>
    </div>
  );
}
