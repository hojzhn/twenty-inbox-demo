// Shared building blocks for the wireframe — buttons, chips, layout shells.

import { useChipClick } from "../../context/ChipContext";

const buttonVariant = {
  primary:
    "bg-[var(--color-blue)] text-[var(--font-color-on-accent)] border border-[var(--color-blue)] hover:bg-[var(--accent-10)] hover:border-[var(--accent-10)] active:bg-[var(--accent-11)]",
  secondary:
    "bg-[var(--background-primary)] text-[var(--font-color-primary)] border border-[var(--font-color-tertiary)] hover:bg-[var(--background-secondary)] active:bg-[var(--background-tertiary)]",
  ghost:
    "bg-transparent text-[var(--font-color-secondary)] border border-transparent hover:bg-[var(--background-transparent-light)] active:bg-[var(--background-transparent-medium)]",
};

export function Button({
  variant = "secondary",
  children,
  onClick,
  type = "button",
  disabled,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium leading-snug transition-colors ${
        buttonVariant[variant]
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {children}
    </button>
  );
}

export function IconButton({ children, onClick, ariaLabel, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`shrink-0 aspect-square flex items-center justify-center w-7 h-7 p-0 border border-transparent text-[var(--font-color-secondary)] text-base rounded cursor-pointer transition-colors hover:bg-[var(--background-transparent-light)] active:bg-[var(--background-transparent-medium)] ${
        active ? "bg-[var(--background-transparent-medium)]" : "bg-transparent"
      }`}
    >
      {children}
    </button>
  );
}

export const chipBase =
  "inline-flex items-center w-fit gap-1.5 pl-1 pr-2 py-0.5 rounded text-[var(--font-color-primary)] text-xs leading-relaxed whitespace-nowrap bg-[var(--background-transparent-light)] hover:bg-[var(--background-transparent-medium)] active:bg-[var(--background-transparent-strong)] transition-colors";

const CHIP_AVATAR_PAIRS = [
  { bg: "var(--avatar-blue-bg)", fg: "var(--avatar-blue-fg)" },
  { bg: "var(--avatar-green-bg)", fg: "var(--avatar-green-fg)" },
  { bg: "var(--avatar-orange-bg)", fg: "var(--avatar-orange-fg)" },
  { bg: "var(--avatar-purple-bg)", fg: "var(--avatar-purple-fg)" },
  { bg: "var(--avatar-pink-bg)", fg: "var(--avatar-pink-fg)" },
  { bg: "var(--avatar-turquoise-bg)", fg: "var(--avatar-turquoise-fg)" },
  { bg: "var(--avatar-red-bg)", fg: "var(--avatar-red-fg)" },
  { bg: "var(--avatar-sky-bg)", fg: "var(--avatar-sky-fg)" },
];

function chipAvatarPair(id) {
  let hash = 0;
  const s = id || "";
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) | 0;
  }
  return CHIP_AVATAR_PAIRS[Math.abs(hash) % CHIP_AVATAR_PAIRS.length];
}

function ChipAvatar({ id, name }) {
  const pair = chipAvatarPair(id);
  return (
    <span
      aria-hidden="true"
      className="inline-flex items-center justify-center w-[14px] h-[14px] rounded-full text-[10px] font-medium shrink-0"
      style={{ backgroundColor: pair.bg, color: pair.fg }}
    >
      {(name || "?").charAt(0).toUpperCase()}
    </span>
  );
}

export function Chip({ entity, onClick, className = "" }) {
  const ctxClick = useChipClick();
  const handler = onClick ?? (ctxClick ? () => ctxClick(entity) : undefined);
  const wrapped = handler
    ? (e) => {
        e.stopPropagation();
        handler();
      }
    : undefined;
  return (
    <span
      className={`${chipBase} max-w-full min-w-0 ${
        handler ? "cursor-pointer" : ""
      } ${className}`}
      onClick={wrapped}
      title={entity.objectName}
    >
      <ChipAvatar id={entity.objectId} name={entity.objectName} />
      <span className="min-w-0 truncate">{entity.objectName}</span>
    </span>
  );
}

export function TaskChip({ task, onRemove, onClick, className = "" }) {
  const ctxClick = useChipClick();
  const handler =
    onClick ??
    (ctxClick
      ? () =>
          ctxClick({
            objectType: "Task",
            objectId: task.id,
            objectName: task.title,
          })
      : undefined);
  const wrapped = handler
    ? (e) => {
        e.stopPropagation();
        handler();
      }
    : undefined;
  return (
    <span
      className={`${chipBase} max-w-full min-w-0 ${
        handler ? "cursor-pointer" : ""
      } ${className}`}
      onClick={wrapped}
      title={task.title}
    >
      <ChipAvatar id={task.id} name={task.title} />
      <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
        {task.title}
      </span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove ${task.title}`}
          className="ml-1 p-0 bg-transparent border-0 text-[var(--font-color-secondary)] text-sm leading-none cursor-pointer"
        >
          ×
        </button>
      )}
    </span>
  );
}

export const SectionLabel = ({ children }) => (
  <div className="m-0 mb-2 text-[11px] font-semibold text-[var(--font-color-tertiary)] uppercase tracking-[0.06em]">
    {children}
  </div>
);

export const Caption = ({ children, className = "" }) => (
  <div className={`text-[11px] text-[var(--font-color-tertiary)] ${className}`}>
    {children}
  </div>
);

export const Section = ({ children }) => (
  <section className="flex flex-col gap-3">{children}</section>
);

export const ContextBlock = ({ children, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-[var(--background-secondary)] border border-[var(--border-color-medium)] rounded-md p-3 flex flex-col gap-2 ${
      onClick ? "cursor-pointer hover:border-[var(--font-color-tertiary)]" : ""
    }`}
  >
    {children}
  </div>
);

export function LetterAvatar({ name }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--background-quaternary)] flex-none text-xs"
    >
      {(name || "?").charAt(0).toUpperCase()}
    </span>
  );
}

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-pink-500",
  "bg-amber-500",
  "bg-cyan-500",
  "bg-rose-500",
  "bg-emerald-500",
];

function avatarColor(id) {
  let hash = 0;
  const s = id || "";
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const AVATAR_SIZES = {
  sm: "w-5 h-5 text-[10px]",
  md: "w-7 h-7 text-[11px]",
  lg: "w-9 h-9 text-[14px]",
};

export function ColorAvatar({ id, name, size = "sm" }) {
  const dim = AVATAR_SIZES[size] || AVATAR_SIZES.sm;
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0 ${dim} ${avatarColor(
        id,
      )}`}
    >
      {(name || "?").charAt(0).toUpperCase()}
    </span>
  );
}
