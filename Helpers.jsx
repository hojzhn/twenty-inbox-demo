export const DEFAULT_ACTION_BY_TRIGGER = {
  email_reply: "reply",
  mention: "open_note",
  date_trigger: "null",
  workflow_alert: "null",
  manual: null,
};

export function getDefaultAction(trigger) {
  return DEFAULT_ACTION_BY_TRIGGER[trigger] ?? null;
}
