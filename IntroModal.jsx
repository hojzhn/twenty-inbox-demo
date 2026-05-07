import { Button } from "./Primitives";

export function IntroModal({ onStart }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-[480px] bg-[var(--bg)] border border-[var(--bg3)] rounded-lg shadow-2xl p-6 flex flex-col gap-4 text-[var(--txt)]">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.06em] text-[var(--txt3)]">
          <i className="fa-solid fa-bullseye" />
          <span>Scenario · Gopuff Pilot</span>
        </div>

        <h2 className="m-0 text-[20px] font-semibold leading-tight">
          Land the Gopuff deal
        </h2>

        <div className="flex flex-col gap-3 text-[13px] leading-relaxed text-[var(--txt2)]">
          <p className="m-0">
            You're <strong className="text-[var(--txt)]">Marcus</strong>, head
            of Ops at <strong className="text-[var(--txt)]">Volt</strong>. The
            Gopuff Pilot is your largest deal in flight. Their procurement lead
            just asked for a SOC2 timeline and revised delivery date before
            tomorrow's exec review.
          </p>
          <p className="m-0">
            Use this notification box to close the loop. Everything you need to
            land the deal is already in here.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="primary" onClick={onStart}>
            Start
          </Button>
        </div>
      </div>
    </div>
  );
}
