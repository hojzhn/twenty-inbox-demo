import { MARCUS_TASKS } from "../../../data/Tasks";
import { COMPANIES, NOTES, OPPORTUNITIES, PEOPLE } from "../../../data/Graph";

export const TYPE_META = {
  Task: {
    icon: "ti-checkbox",
    plural: "Tasks",
    tone: "green",
    tabs: ["Home", "Timeline", "Files"],
  },
  Opportunity: {
    icon: "ti-target",
    plural: "Opportunities",
    tone: "red",
    tabs: ["Timeline", "Tasks", "Notes", "Files", "Emails", "Calendar"],
  },
  Company: {
    icon: "ti-building",
    plural: "Companies",
    tone: "blue",
    tabs: ["Timeline", "Tasks", "Notes", "Files", "Emails", "Calendar"],
  },
  Person: {
    icon: "ti-user",
    plural: "People",
    tone: "purple",
    tabs: ["Timeline", "Tasks", "Notes", "Files", "Emails", "Calendar"],
  },
  User: {
    icon: "ti-user-circle",
    plural: "Users",
    tone: "gray",
    tabs: ["Timeline"],
  },
  Note: {
    icon: "ti-file-text",
    plural: "Notes",
    tone: "green",
    tabs: ["Note", "Timeline", "Files"],
  },
  System: {
    icon: "ti-settings",
    plural: "System",
    tone: "gray",
    tabs: ["Timeline"],
  },
};

export const TAB_ICON = {
  Home: "ti-home",
  Timeline: "ti-device-desktop",
  Tasks: "ti-checkbox",
  Notes: "ti-file-text",
  Note: "ti-file-text",
  Files: "ti-paperclip",
  Emails: "ti-mail",
  Calendar: "ti-calendar",
};

export const fallbackMeta = (type) => ({
  icon: "ti-folder",
  plural: type,
  tone: "gray",
  tabs: ["Timeline"],
});

export function lookupRecord({ objectType, objectId }) {
  switch (objectType) {
    case "Task":
      return MARCUS_TASKS.find((t) => t.id === objectId) || null;
    case "Opportunity":
      return OPPORTUNITIES.find((o) => o.id === objectId) || null;
    case "Company":
      return COMPANIES.find((c) => c.id === objectId) || null;
    case "Person":
      return PEOPLE.find((p) => p.id === objectId) || null;
    case "Note":
      return NOTES.find((n) => n.id === objectId) || null;
    case "User":
      return objectId === "user_marcus"
        ? { id: "user_marcus", name: "Marcus" }
        : null;
    default:
      return null;
  }
}

export const ref = (objectType, objectId, objectName) => ({
  objectType,
  objectId,
  objectName,
});

// Tasks use `title`; every other entity uses `name`. Prefer `name` first so a
// Person's `title` (their job title) doesn't get used as the record header.
export const recordName = (record, fallback) =>
  record?.name || record?.title || fallback || "Record";
