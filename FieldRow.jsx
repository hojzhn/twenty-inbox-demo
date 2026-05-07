export function FieldRow({ icon, label, value, placeholder }) {
  const isEmpty =
    value === null ||
    value === undefined ||
    value === "" ||
    (Array.isArray(value) && value.length === 0);

  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 items-baseline min-h-[28px]">
      <div className="flex items-center gap-2 text-[var(--txt2)] text-xs">
        {icon !== undefined && (
          <span className="w-4 inline-flex justify-center text-[var(--txt3)]">
            {icon}
          </span>
        )}
        <span>{label}</span>
      </div>
      <div className="text-xs text-[var(--txt)] min-w-0 flex items-stretch h-full">
        {isEmpty ? (
          <span className="text-[var(--txt3)]">{placeholder ?? label}</span>
        ) : (
          value
        )}
      </div>
    </div>
  );
}
