export const DEFAULT_ACTION_BY_TRIGGER = {
  email_reply: "reply",
  mention: "draft_email",
  date_trigger: "draft_email",
  workflow_alert: "draft_email",
  manual: "draft_email",
};

export function getDefaultAction(trigger) {
  return DEFAULT_ACTION_BY_TRIGGER[trigger] ?? null;
}
