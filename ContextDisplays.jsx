// Trigger-specific context blocks. Each renders null when its data is absent.

import { relativeTime } from "./utils";
import { Chip, Section, ContextBlock, LetterAvatar } from "./Primitives";
import { useChipClick } from "./ChipContext";

export function EmailContext({ task }) {
  const navigate = useChipClick();
  const c = task.context || {};
  if (!c.emailFrom) return null;

  const onOpen =
    navigate && task.target
      ? () => navigate(task.target, { tab: "Emails" })
      : undefined;

  return (
    <Section>
      <ContextBlock onClick={onOpen}>
        <div className="flex justify-between items-baseline gap-3 text-[11px] text-[var(--txt2)]">
          <div className="flex flex-col">
            {task.target && <Chip entity={task.target} />}{" "}
            <span className="text-[var(--txt2)] ml-1">
              {c.emailTo}{" "}
              <i className="fa-regular fa-angle-down text-[0.8em]" />
            </span>
          </div>
          {c.emailReceivedAt && <span>{relativeTime(c.emailReceivedAt)}</span>}
        </div>
        <span className="m-0 text-[13px] text-[var(--txt)] whitespace-pre-wrap">
          {c.emailSnippet}
        </span>
      </ContextBlock>
    </Section>
  );
}

export function WorkflowContext({ task }) {
  const c = task.context || {};
  const has =
    c.workflowName || c.alertSummary || (c.triggerField && c.triggerValue);
  if (!has) return null;

  return (
    <Section>
      <ContextBlock>
        {c.workflowName && (
          <div className="flex items-center gap-2">
            <LetterAvatar name={c.workflowName} />
            <div>{c.workflowName}</div>
          </div>
        )}
        {c.alertSummary && (
          <p className="m-0 whitespace-pre-wrap">{c.alertSummary}</p>
        )}
        {c.triggerField && c.triggerValue && (
          <div className="text-xs text-[var(--txt2)]">
            {c.triggerField} = {c.triggerValue}
          </div>
        )}
      </ContextBlock>
    </Section>
  );
}

export function MentionContext({ task }) {
  const navigate = useChipClick();
  const c = task.context || {};
  if (!c.mentionedBy || !c.noteSnippet) return null;

  const noteRef = task.relations?.find((r) => r.objectType === "Note");
  const onOpen =
    navigate && noteRef ? () => navigate(noteRef) : undefined;

  return (
    <Section>
      <ContextBlock onClick={onOpen}>
        <Chip entity={task.createdBy} />
        <p className="m-0 text-[13px] text-[var(--txt)] whitespace-pre-wrap">
          {c.noteSnippet}
        </p>
      </ContextBlock>
    </Section>
  );
}
