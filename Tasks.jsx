// =============================================================================
// Task object schema for the Twenty Inbox sprint
// =============================================================================
// Aligned with Twenty's Task fields: title, body, dueDate, status, assignee,
// createdBy, createdAt, plus a polymorphic relations[] array.
//
// Custom fields added by Volt's workflow:
//   - trigger: how the task was created (mirrors a Twenty "trigger" concept)
//   - target:  recipient of the action, present only on email_reply tasks
//   - context: data joined from related Email/Note records (not stored on Task)
// =============================================================================

/**
 * @typedef {"email_reply"|"mention"|"date_trigger"|"workflow_alert"|"manual"} Trigger
 *
 * @typedef {"Person"|"Company"|"Opportunity"|"Note"|"System"|"User"} ObjectType
 *
 * @typedef {"open"|"snoozed"|"done"|"dismissed"} TaskStatus
 *
 * @typedef {Object} Ref
 * @property {ObjectType} objectType
 * @property {string} objectId
 * @property {string} objectName
 *
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} [body]
 * @property {Trigger} trigger
 * @property {TaskStatus} status
 * @property {boolean} read
 * @property {string} createdAt           ISO
 * @property {Ref} createdBy
 * @property {string} [dueDate]           ISO
 * @property {string} assigneeId
 * @property {Ref[]} relations
 * @property {Ref} [target]               only on trigger === "email_reply"
 * @property {Object} [context]           joined data (email body, note text, etc.)
 */

export const NOW = "2025-11-04T17:30:00-08:00";
const MARCUS_ID = "user_marcus";

// Common Ref shortcuts
const SYSTEM = {
  objectType: "System",
  objectId: "system",
  objectName: "System",
};
const USER_MARCUS = {
  objectType: "User",
  objectId: "user_marcus",
  objectName: "Marcus",
};
const PRIYA = {
  objectType: "Person",
  objectId: "person_priya",
  objectName: "Priya Patel",
};
const MAYA = {
  objectType: "Person",
  objectId: "person_maya",
  objectName: "Maya Collins",
};
const JORDAN = {
  objectType: "Person",
  objectId: "person_jordan",
  objectName: "Jordan Reyes",
};
const WEI = {
  objectType: "Person",
  objectId: "person_wei",
  objectName: "Wei Lin",
};
const GARRETT = {
  objectType: "Person",
  objectId: "person_garrett",
  objectName: "Garrett Yu",
};
const RECRUITER = {
  objectType: "Person",
  objectId: "person_recruiter_retailflow",
  objectName: "Recruiter at RetailFlow",
};

const OPP_GOPUFF = {
  objectType: "Opportunity",
  objectId: "opp_gopuff_pilot",
  objectName: "Gopuff Pilot",
};
const OPP_SEED = {
  objectType: "Opportunity",
  objectId: "opp_seed_round",
  objectName: "Seed Round · $1.8M",
};
const OPP_MARKETING = {
  objectType: "Opportunity",
  objectId: "opp_marketing_refresh",
  objectName: "Marketing Refresh",
};

const COMPANY_ACME = {
  objectType: "Company",
  objectId: "company_acme",
  objectName: "Acme Corp",
};
const COMPANY_LERER = {
  objectType: "Company",
  objectId: "company_lerer_hippeau",
  objectName: "Lerer Hippeau",
};
const COMPANY_VOLT = {
  objectType: "Company",
  objectId: "company_volt",
  objectName: "Volt",
};
const COMPANY_OFFICE = {
  objectType: "Company",
  objectId: "company_office_supplies",
  objectName: "Office Supplies Co.",
};

const NOTE_WELD = {
  objectType: "Note",
  objectId: "note_weld_failure_qc",
  objectName: "QC: weld failure on enclosure prototype",
};
const NOTE_MARKETING = {
  objectType: "Note",
  objectId: "note_marketing_copy_review",
  objectName: "Marketing copy review · Northstar v3",
};

/** @type {Task[]} */
export const MARCUS_TASKS = [
  {
    id: "task_001",
    title: "Acme Corp: no activity in 30 days",
    trigger: "workflow_alert",
    status: "open",
    read: false,
    createdAt: "2025-11-04T09:30:00-08:00",
    createdBy: SYSTEM,
    assigneeId: MARCUS_ID,
    relations: [COMPANY_ACME],
    context: {
      workflowName: "Account Health",
      alertSummary:
        "No emails, notes, or meetings in 30 days. Account may be going cold.",
    },
  },

  {
    id: "task_002",
    title: "Review note: weld failure on enclosure",
    trigger: "mention",
    status: "open",
    read: false,
    createdAt: "2025-11-04T09:16:00-08:00",
    createdBy: JORDAN,
    assigneeId: MARCUS_ID,
    relations: [NOTE_WELD, OPP_GOPUFF],
    context: {
      mentionedBy: "Jordan Reyes",
      noteSnippet:
        "@marcus weld failure on enclosure prototype, 3rd time this batch. Tooling problem at the CM, not a one-off.",
    },
  },

  {
    id: "task_003",
    title: "Reply to Priya re SOC2",
    trigger: "email_reply",
    status: "open",
    read: false,
    createdAt: "2025-11-04T08:48:00-08:00",
    createdBy: PRIYA,
    target: PRIYA,
    dueDate: "2025-11-04T17:00:00-08:00",
    assigneeId: MARCUS_ID,
    relations: [PRIYA, OPP_GOPUFF],
    context: {
      emailFrom: "priya@gopuff.com",
      emailTo: "to: me",
      emailReceivedAt: "2025-11-04T06:14:00-08:00",
      emailSnippet:
        "Marcus,\n\nNeed the SOC2 timeline and revised delivery date by EOD.\nExec review tomorrow morning and they'll ask.\n\nThanks,\nPriya",
      emailSubject: "Re: SOC2 timeline + delivery date",
      emailThread: [
        {
          from: PRIYA,
          to: "to: marcus@volta.io",
          receivedAt: "2025-11-02T09:30:00-08:00",
          snippet:
            "Hi Marcus,\n\nDo you have an updated SOC2 timeline for the Gopuff pilot? Want to align on delivery dates before exec review.\n\nBest,\nPriya",
        },
        {
          from: USER_MARCUS,
          to: "to: priya@gopuff.com",
          receivedAt: "2025-11-02T14:15:00-08:00",
          snippet:
            "Hey Priya,\n\nType 1 audit kicks off Nov 18, full delivery target end of Q1. Couple of supplier items are still in flight on my side. Will pin them down today and send revised dates as soon as possible.\n\nMarcus",
        },
      ],
    },
  },

  // The buried task. Maya is in relations as a Person, but no Opportunity.
  // Distance to Gopuff Pilot is 2 hops via her employer link in Graph.js.
  {
    id: "task_014",
    title: "Send insurance certificate",
    trigger: "email_reply",
    status: "open",
    read: false,
    createdAt: "2025-11-04T08:48:00-08:00",
    createdBy: MAYA,
    target: MAYA,
    dueDate: "2025-11-10T09:00:00-08:00",
    assigneeId: MARCUS_ID,
    relations: [MAYA],
    context: {
      emailFrom: "maya.collins@gopuff.com",
      emailTo: "to: me, Alexandre",
      emailReceivedAt: "2025-11-04T08:48:00-08:00",
      emailSnippet:
        "Hi Marcus,\n\nApologies for the cold email! My name is Maya and I'm helping coordinate vendor onboarding.\nWhen you have a moment, could you send over your COI naming additional insured? It would help a lot to have it in hand before contract review.\nReally appreciate it and looking forward to working together!\n\nBest,\nMaya",
      emailSubject: "COI for vendor onboarding",
    },
  },

  {
    id: "task_005",
    title: "Review marketing copy from agency",
    trigger: "mention",
    status: "open",
    read: false,
    createdAt: "2025-11-03T16:00:00-08:00",
    createdBy: USER_MARCUS,
    assigneeId: MARCUS_ID,
    relations: [NOTE_MARKETING, OPP_MARKETING],
  },

  {
    id: "task_006",
    title: "Follow up if Priya doesn't reply by Friday",
    trigger: "manual",
    status: "open",
    read: false,
    createdAt: "2025-11-03T13:35:00-08:00",
    createdBy: USER_MARCUS,
    assigneeId: MARCUS_ID,
    relations: [PRIYA, OPP_GOPUFF],
  },

  {
    id: "task_007",
    title: "Follow up: warm intro from Garrett",
    trigger: "manual",
    status: "open",
    read: false,
    createdAt: "2025-11-03T13:30:00-08:00",
    createdBy: USER_MARCUS,
    assigneeId: MARCUS_ID,
    relations: [GARRETT],
  },

  {
    id: "task_008",
    title: "Schedule weekly investor sync",
    trigger: "manual",
    status: "open",
    read: false,
    createdAt: "2025-11-03T13:00:00-08:00",
    createdBy: USER_MARCUS,
    assigneeId: MARCUS_ID,
    relations: [COMPANY_LERER, OPP_SEED],
  },

  {
    id: "task_009",
    title: "Renew domain, expires in 14 days",
    trigger: "date_trigger",
    status: "open",
    read: false,
    createdAt: "2025-11-03T13:00:00-08:00",
    createdBy: SYSTEM,
    assigneeId: MARCUS_ID,
    relations: [COMPANY_VOLT],
    context: {
      triggerField: "domainExpiry",
      triggerValue: "2025-11-18",
    },
  },

  {
    id: "task_010",
    title: "Annual privacy policy review",
    trigger: "date_trigger",
    status: "open",
    read: false,
    createdAt: "2025-11-03T13:00:00-08:00",
    createdBy: SYSTEM,
    assigneeId: MARCUS_ID,
    relations: [COMPANY_VOLT],
    context: {
      triggerField: "privacyPolicyReviewDate",
      triggerValue: "2025-11-15",
    },
  },

  {
    id: "task_011",
    title: "Update Q4 board deck",
    trigger: "manual",
    status: "open",
    read: false,
    createdAt: "2025-11-03T13:00:00-08:00",
    createdBy: USER_MARCUS,
    assigneeId: MARCUS_ID,
    relations: [COMPANY_VOLT],
  },

  {
    id: "task_004",
    title: "Follow up on chip ETA",
    trigger: "manual",
    status: "open",
    read: false,
    createdAt: "2025-11-03T13:00:00-08:00",
    createdBy: USER_MARCUS,
    assigneeId: MARCUS_ID,
    relations: [WEI, OPP_GOPUFF],
  },

  {
    id: "task_012",
    title: "Pay supplier invoice, due Wed",
    trigger: "date_trigger",
    status: "open",
    read: false,
    createdAt: "2025-11-03T12:00:00-08:00",
    createdBy: SYSTEM,
    assigneeId: MARCUS_ID,
    relations: [COMPANY_OFFICE],
    context: {
      triggerField: "invoiceDueDate",
      triggerValue: "2025-11-05",
    },
  },

  {
    id: "task_013",
    title: "Reply to recruiter from RetailFlow",
    trigger: "email_reply",
    status: "open",
    read: false,
    createdAt: "2025-11-03T11:42:00-08:00",
    createdBy: RECRUITER,
    target: RECRUITER,
    assigneeId: MARCUS_ID,
    relations: [RECRUITER],
    context: {
      emailFrom: "recruiter@retailflow.com",
      emailTo: "to: me",
      emailReceivedAt: "2025-11-03T11:42:00-08:00",
      emailSnippet:
        "Hi Marcus,\n\nFollowing up on my note from last week. still exploring some interesting battery-tech roles at our portfolio companies.\n\nAny chance you'd have 15 mins this week to chat?\n\nBest,\nAlex",
      emailSubject: "Re: Battery-tech roles at our portfolio companies",
      emailThread: [
        {
          from: RECRUITER,
          to: "to: marcus@volta.io",
          receivedAt: "2025-10-28T15:20:00-08:00",
          snippet:
            "Hi Marcus,\n\nCame across your work at Volt. Wondering if you'd be open to a quick chat about a few stealth-stage opportunities our portfolio companies are working on?\n\nHappy to share more if it's interesting.\n\nBest,\nAlex",
        },
      ],
    },
  },
];

// =============================================================================
// Trigger → action mapping (UI uses this to render the right panel mode)
// =============================================================================

/** @type {Record<Trigger, { label: string, mode: "reply"|"open"|"decide"|"mark_done" }>} */
export const ACTION_FROM_TRIGGER = {
  email_reply: { label: "Reply", mode: "reply" },
  mention: { label: "Open note", mode: "open" },
  date_trigger: { label: "Decide", mode: "decide" },
  workflow_alert: { label: "Decide", mode: "decide" },
  manual: { label: "Mark done", mode: "mark_done" },
};

/**
 * Default unfocused sort: createdAt desc.
 * @param {Task[]} tasks
 * @returns {Task[]}
 */
export function sortByCreatedDesc(tasks) {
  return [...tasks].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Back-compat alias. */
export function sortInbox(tasks) {
  return sortByCreatedDesc(tasks);
}
