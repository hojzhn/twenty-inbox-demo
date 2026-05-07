// Shared building blocks for the wireframe — buttons, chips, layout shells.

import { useChipClick } from "./ChipContext";

const buttonVariant = {
  primary:
    "bg-[var(--point)] text-[var(--point2)] border border-[var(--point)]",
  secondary: "bg-[var(--bg)] text-[var(--txt)] border border-[var(--txt3)]",
  ghost: "bg-transparent text-[var(--txt2)] border border-transparent",
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
      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium leading-snug ${
        buttonVariant[variant]
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {children}
    </button>
  );
}

export function IconButton({ children, onClick, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="inline-flex items-center justify-center w-7 h-7 p-0 bg-transparent border border-transparent text-[var(--txt2)] text-base rounded cursor-pointer"
    >
      {children}
    </button>
  );
}

export const chipBase =
  "inline-flex items-center w-fit px-2 py-0.5 rounded border border-[var(--txt3)] bg-[var(--bg)] text-[var(--txt)] text-xs leading-relaxed whitespace-nowrap";

const TYPE_PREFIX = { Opportunity: "O", User: "U" };
const typePrefix = (t) =>
  TYPE_PREFIX[t] || (t ? t.charAt(0).toUpperCase() : "");

export function Chip({ entity, onClick }) {
  const ctxClick = useChipClick();
  const handler = onClick ?? (ctxClick ? () => ctxClick(entity) : undefined);
  const wrapped = handler
    ? (e) => {
        e.stopPropagation();
        handler();
      }
    : undefined;
  const prefix = typePrefix(entity.objectType);
  return (
    <span
      className={`${chipBase} ${handler ? "cursor-pointer" : ""}`}
      onClick={wrapped}
    >
      {prefix && (
        <span className="opacity-[0.45] mr-1 font-medium">{prefix}</span>
      )}
      {entity.objectName}
    </span>
  );
}

export function TaskChip({ task, onRemove, onClick }) {
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
      className={`${chipBase} max-w-[280px] overflow-hidden ${
        handler ? "cursor-pointer" : ""
      }`}
      onClick={wrapped}
    >
      <span className="opacity-[0.45] mr-1 font-medium">T</span>
      <span className="overflow-hidden text-ellipsis whitespace-nowrap">
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
          className="ml-1 p-0 bg-transparent border-0 text-[var(--txt2)] text-sm leading-none cursor-pointer"
        >
          ×
        </button>
      )}
    </span>
  );
}

export const SectionLabel = ({ children }) => (
  <div className="m-0 mb-2 text-[11px] font-semibold text-[var(--txt3)] uppercase tracking-[0.06em]">
    {children}
  </div>
);

export const Caption = ({ children, className = "" }) => (
  <div className={`text-[11px] text-[var(--txt3)] ${className}`}>
    {children}
  </div>
);

export const Section = ({ children }) => (
  <section className="flex flex-col gap-3">{children}</section>
);

export const ContextBlock = ({ children, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-[var(--bg2)] border border-[var(--bg3)] rounded-md p-3 flex flex-col gap-2 ${
      onClick ? "cursor-pointer hover:border-[var(--txt3)]" : ""
    }`}
  >
    {children}
  </div>
);

export function LetterAvatar({ name }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--bg3)] flex-none text-xs"
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
