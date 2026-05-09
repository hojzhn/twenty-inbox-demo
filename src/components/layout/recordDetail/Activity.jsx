import { ColorAvatar } from "../../common/Primitives";
import { MARCUS_TASKS } from "../../../data/Tasks";
import { relativeTime } from "../../../utils/time";

function EmailMessage({ message }) {
  const from = message.from;
  const senderName =
    (typeof from === "object" ? from?.objectName : from) || "Unknown";
  const senderId =
    (typeof from === "object" ? from?.objectId : from) || senderName;
  return (
    <div className="flex gap-3 items-start">
      <ColorAvatar id={senderId} name={senderName} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline gap-3">
          <span className="font-semibold text-[var(--font-color-primary)]">
            {senderName}
          </span>
          {message.receivedAt && (
            <span className="text-[12px] text-[var(--font-color-tertiary)] shrink-0">
              {relativeTime(message.receivedAt)}
            </span>
          )}
        </div>
        {message.to && (
          <div className="text-[12px] text-[var(--font-color-tertiary)] flex items-center gap-1">
            <span>{message.to}</span>
            <i className="ti ti-chevron-down text-[8px]" />
          </div>
        )}
        {message.snippet && (
          <p className="m-0 mt-3 text-[13px] text-[var(--font-color-primary)] whitespace-pre-wrap leading-relaxed">
            {message.snippet}
          </p>
        )}
      </div>
    </div>
  );
}

function EmailThreadCard({ task }) {
  const c = task.context || {};
  const subject = c.emailSubject || task.title;
  const messages = [
    ...(c.emailThread || []),
    {
      from: task.createdBy,
      to: c.emailTo,
      receivedAt: c.emailReceivedAt,
      snippet: c.emailSnippet,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-md border border-[var(--border-color-medium)] flex items-center justify-center shrink-0">
          <i className="ti ti-mail text-[var(--font-color-secondary)] text-[14px]" />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-[14px] text-[var(--font-color-primary)]">
            {subject}
          </div>
          <div className="text-[12px] text-[var(--font-color-tertiary)]">
            Email
            {c.emailReceivedAt && (
              <> &middot; Received {relativeTime(c.emailReceivedAt)}</>
            )}
          </div>
        </div>
      </div>
      <div className="ml-3 pl-5 border-l border-[var(--border-color-medium)] flex flex-col gap-6">
        {messages.map((m, i) => (
          <EmailMessage key={i} message={m} />
        ))}
      </div>
    </div>
  );
}

export function EmailThread({ entity }) {
  const emails = MARCUS_TASKS.filter(
    (t) =>
      t.trigger === "email_reply" &&
      (t.target?.objectId === entity.objectId ||
        t.createdBy?.objectId === entity.objectId),
  );
  if (emails.length === 0) {
    return (
      <div className="pt-8 text-center text-[12px] text-[var(--font-color-tertiary)]">
        No emails yet.
      </div>
    );
  }
  return (
    <div className="pt-4 flex flex-col gap-8">
      {emails.map((t) => (
        <EmailThreadCard key={t.id} task={t} />
      ))}
    </div>
  );
}

function TimelineEvent({ icon, time, children }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <span className="w-6 h-6 rounded-full bg-[var(--background-quaternary)] inline-flex items-center justify-center text-[var(--font-color-secondary)] mt-0.5">
        {icon}
      </span>
      <div className="flex-1 text-[13px] text-[var(--font-color-primary)]">
        {children}
      </div>
      <span className="text-[12px] text-[var(--font-color-tertiary)]">
        {time}
      </span>
    </div>
  );
}

export function Timeline({ name, createdAt, createdBy }) {
  const time = createdAt ? relativeTime(createdAt) : "recently";
  return (
    <div className="pt-4">
      <div className="text-[12px] text-[var(--font-color-tertiary)] py-2 border-b border-[var(--border-color-medium)]">
        Activity
      </div>
      <div className="pt-2">
        <TimelineEvent
          icon={<i className="ti ti-plus text-[10px]" />}
          time={time}
        >
          {name} was created
          {createdBy ? (
            <>
              {" "}
              by{" "}
              <span className="text-[var(--font-color-secondary)]">
                {createdBy.objectName}
              </span>
            </>
          ) : null}
        </TimelineEvent>
      </div>
    </div>
  );
}
