import { ToneIcon } from "../layout/Sidebar";
import { getRecordMeta } from "../layout/RecordDetail";

function RecordBreadcrumb({ entity, onClose }) {
  const meta = getRecordMeta(entity);

  return (
    <div className="flex items-center gap-2 min-w-0 text-[15px]">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="inline-flex items-center justify-center w-7 h-7 p-0 bg-transparent border-0 text-[var(--font-color-secondary)] text-base rounded cursor-pointer transition-colors hover:bg-[var(--background-transparent-light)]"
      >
        &times;
      </button>
      <ToneIcon tone={meta.tone} size={24} fontSize={14}>
        <i className={`ti ${meta.icon}`} />
      </ToneIcon>
      <span className="text-[var(--font-color-secondary)]">{meta.plural}</span>
      <span className="text-[var(--font-color-tertiary)]">/</span>
      <span className="font-medium truncate">{meta.name}</span>
    </div>
  );
}

function InboxTitle() {
  return (
    <div className="flex items-center gap-2 font-medium">
      <ToneIcon tone="sky" size={22} fontSize={13}>
        <i className="ti ti-inbox" />
      </ToneIcon>
      <div className="text-[13px]">Inbox</div>
    </div>
  );
}

function CommandButton() {
  return (
    <button
      type="button"
      aria-label="Open command menu"
      className="shrink-0 inline-flex items-center rounded border border-[var(--border-color-medium)] bg-[var(--background-secondary)] text-[var(--font-color-secondary)] text-[11px] font-medium cursor-pointer overflow-hidden hover:bg-[var(--background-tertiary)] transition-colors"
    >
      <span className="flex items-center justify-center px-1.5 py-1">
        <i className="ti ti-dots-vertical text-[12px]" />
      </span>
      <span className="text-[0.65em] text-[var(--font-color-tertiary)]">
        |
      </span>
      <span className="px-2 py-1 text-[var(--font-color-tertiary)]">
        Ctrl K
      </span>
    </button>
  );
}

export function AppHeader({ isMobile, view, onCloseView }) {
  return (
    <div
      className="flex items-center justify-between shrink-0 gap-3"
      style={{ marginBottom: 8, marginTop: 4 }}
    >
      {view ? (
        <RecordBreadcrumb entity={view.entity} onClose={onCloseView} />
      ) : (
        <InboxTitle />
      )}
      {!isMobile && <CommandButton />}
    </div>
  );
}
