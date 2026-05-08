// =============================================================================
// Entity graph for the Twenty Inbox sprint
// =============================================================================
// Edges are id-reference fields on each object. Distance is BFS over the
// undirected adjacency they imply.
// =============================================================================

const SYSTEM_REF = {
  objectType: "System",
  objectId: "system",
  objectName: "System",
};

export const COMPANIES = [
  {
    id: "company_volt",
    name: "Volt",
    domain: "volt.io",
    city: "San Francisco",
    employees: 18,
    annualRevenue: 2400000,
  },
  {
    id: "company_gopuff",
    name: "Gopuff",
    domain: "gopuff.com",
    city: "Philadelphia",
    employees: 4200,
    annualRevenue: 1500000000,
  },
  {
    id: "company_shenzhen_factory",
    name: "Shenzhen Factory",
    domain: "shenzhenfactory.cn",
    city: "Shenzhen",
    employees: 320,
  },
  {
    id: "company_acme",
    name: "Acme Corp",
    domain: "acme.com",
    city: "Brooklyn",
    employees: 86,
  },
  {
    id: "company_lerer_hippeau",
    name: "Lerer Hippeau",
    domain: "lererhippeau.com",
    city: "New York",
    employees: 28,
  },
  {
    id: "company_office_supplies",
    name: "Office Supplies Co.",
    domain: "officesupplies.co",
    city: "Newark",
    employees: 14,
  },
  {
    id: "company_retailflow",
    name: "RetailFlow",
    domain: "retailflow.com",
    city: "Austin",
    employees: 145,
  },
  {
    id: "company_northstar",
    name: "Northstar Creative",
    domain: "northstar.studio",
    city: "Brooklyn",
    employees: 9,
  },
];

export const OPPORTUNITIES = [
  {
    id: "opp_gopuff_pilot",
    name: "Gopuff Pilot",
    companyIds: ["company_gopuff"],
    amount: 480000,
    stage: "Negotiation",
    closeDate: "2025-12-15",
  },
  {
    id: "opp_seed_round",
    name: "Seed Round",
    companyIds: ["company_lerer_hippeau"],
    amount: 1800000,
    stage: "Term sheet",
    closeDate: "2025-11-30",
  },
  {
    id: "opp_marketing_refresh",
    name: "Marketing Refresh",
    companyIds: ["company_northstar"],
    amount: 75000,
    stage: "Proposal",
    closeDate: "2025-11-20",
  },
];

export const PEOPLE = [
  {
    id: "person_priya",
    name: "Priya Patel",
    title: "Director of Procurement",
    employerId: "company_gopuff",
    formerEmployerIds: [],
    opportunityIds: ["opp_gopuff_pilot"],
    email: "priya@gopuff.com",
    phone: "+1 215 555 0142",
    city: "Philadelphia",
  },
  // Buried: works at Gopuff, no opportunity link. Distance to opp = 2.
  // Auto-generated from her inbound email — created by System on the same
  // timestamp the email was received.
  {
    id: "person_maya",
    name: "Maya Collins",
    title: "Procurement Coordinator",
    employerId: "company_gopuff",
    formerEmployerIds: [],
    opportunityIds: [],
    email: "maya.collins@gopuff.com",
    phone: "+1 215 555 0188",
    city: "Philadelphia",
    createdAt: "2025-11-04T08:48:00-08:00",
    createdBy: SYSTEM_REF,
  },
  {
    id: "person_wei",
    name: "Wei Lin",
    title: "Account Manager, Shenzhen Factory",
    employerId: "company_shenzhen_factory",
    formerEmployerIds: [],
    opportunityIds: ["opp_gopuff_pilot"],
    email: "wei.lin@shenzhenfactory.cn",
    phone: "+86 138 0013 8000",
    city: "Shenzhen",
  },
  {
    id: "person_garrett",
    name: "Garrett Yu",
    title: "Advisor (independent)",
    employerId: null,
    formerEmployerIds: [],
    opportunityIds: [],
    email: "garrett@advisor.io",
    city: "Oakland",
  },
  {
    id: "person_recruiter_retailflow",
    name: "Recruiter at RetailFlow",
    title: "Talent Partner",
    employerId: "company_retailflow",
    formerEmployerIds: [],
    opportunityIds: [],
    email: "recruiter@retailflow.com",
    city: "Austin",
  },
  {
    id: "person_office_contact",
    name: "Sam Reyes",
    title: "Accounts, Office Supplies Co.",
    employerId: "company_office_supplies",
    formerEmployerIds: [],
    opportunityIds: [],
    email: "sam@officesupplies.co",
    phone: "+1 973 555 0119",
    city: "Newark",
  },
  {
    id: "person_jordan",
    name: "Jordan Reyes",
    title: "QC Lead, Volt",
    employerId: "company_volt",
    formerEmployerIds: [],
    opportunityIds: [],
    email: "jordan@volt.io",
    phone: "+1 415 555 0177",
    city: "San Francisco",
  },
  {
    id: "person_casey",
    name: "Casey Park",
    title: "Creative Director, Northstar Creative",
    employerId: "company_northstar",
    formerEmployerIds: [],
    opportunityIds: ["opp_marketing_refresh"],
    email: "casey@northstar.studio",
    phone: "+1 718 555 0143",
    city: "Brooklyn",
  },
];

export const NOTES = [
  {
    id: "note_weld_failure_qc",
    name: "QC: weld failure on enclosure prototype",
    authorId: "person_jordan",
    taggedOpportunityIds: ["opp_gopuff_pilot"],
    taggedCompanyIds: ["company_shenzhen_factory"],
    taggedPersonIds: [],
    createdAt: "2025-11-04T08:30:00-08:00",
    body: "@marcus Weld failure on enclosure prototype, 3rd time this batch. Tooling problem at the CM, not a one-off. the jig is probably out of spec.\n\nWe need to flag with Wei before next pour. Recommend pausing the pilot run until QC signs off on a revised fixture since it could push the pilot delivery by 1–2 weeks if we end up retooling.",
  },
  {
    id: "note_seed_pilot_contingency",
    name: "Seed close gated on Gopuff pilot",
    authorId: "user_marcus",
    taggedOpportunityIds: ["opp_seed_round", "opp_gopuff_pilot"],
    taggedCompanyIds: ["company_lerer_hippeau", "company_gopuff"],
    taggedPersonIds: [],
    createdAt: "2025-11-02T10:00:00-08:00",
    body: "Lerer's term sheet bakes in a signed Gopuff pilot as a closing condition. If the pilot slips or falls through  we lose the round AND the revenue.\n\nAnything that pushes the Gopuff timeline (QC, SOC2, COI) is therefore round-risk, not just deal-risk. Treat all three as P0.\n\nIf the pilot dies, expect Lerer to walk; restarting fundraise from scratch with a dead pilot in the deck is not a great look.",
  },
  {
    id: "note_marketing_copy_review",
    name: "Marketing copy review · Northstar v3",
    authorId: "person_casey",
    taggedOpportunityIds: ["opp_marketing_refresh"],
    taggedCompanyIds: ["company_northstar"],
    taggedPersonIds: ["person_casey"],
    createdAt: "2025-11-03T14:00:00-08:00",
    body: "Notes from our v3 copy walkthrough, capturing before I lose it:\n\n• Hero claim (\"Built for what's next\") lands too vague. You wanted something concrete tied to the product: I'll workshop 2–3 options.\n\n• Secondary CTA needs the benchmark numbers from the pilot deck. Could you forward the latest version when you get a sec?\n\n• Subhead pacing is good, no notes there.\n\nI'll have v4 ready by EOD Thursday for sign-off. @marcus flag anything I missed from the call.",
  },
];

// =============================================================================
// Adjacency + distance
// =============================================================================

function buildAdjacency() {
  const adj = new Map();
  const link = (a, b) => {
    if (!a || !b) return;
    if (!adj.has(a)) adj.set(a, new Set());
    if (!adj.has(b)) adj.set(b, new Set());
    adj.get(a).add(b);
    adj.get(b).add(a);
  };

  for (const p of PEOPLE) {
    link(p.id, p.employerId);
    for (const e of p.formerEmployerIds || []) link(p.id, e);
    for (const o of p.opportunityIds || []) link(p.id, o);
  }
  for (const o of OPPORTUNITIES) {
    for (const c of o.companyIds || []) link(o.id, c);
  }
  for (const n of NOTES) {
    link(n.id, n.authorId);
    for (const o of n.taggedOpportunityIds || []) link(n.id, o);
  }
  return adj;
}

const ADJ = buildAdjacency();

/**
 * BFS distance between two object ids.
 */
export function distance(fromId, toId) {
  if (fromId === toId) return 0;
  if (!ADJ.has(fromId) || !ADJ.has(toId)) return Infinity;
  const visited = new Set([fromId]);
  let frontier = [fromId];
  let dist = 0;
  while (frontier.length) {
    dist++;
    const next = [];
    for (const node of frontier) {
      for (const nbr of ADJ.get(node) || []) {
        if (nbr === toId) return dist;
        if (!visited.has(nbr)) {
          visited.add(nbr);
          next.push(nbr);
        }
      }
    }
    frontier = next;
  }
  return Infinity;
}

/**
 * Distance from a task to a focus object. Walks every entity in
 * task.relations[] and returns the minimum distance.
 *
 * @param {{ relations: Array<{objectId: string}> }} task
 * @param {string} focusId
 */
export function taskDistance(task, focusId) {
  const refs = task.relations || [];
  if (refs.length === 0) return Infinity;
  let min = Infinity;
  for (const r of refs) {
    const d = distance(r.objectId, focusId);
    if (d < min) min = d;
  }
  return min;
}

export const FOCUS_OPTIONS = [
  ...OPPORTUNITIES.map((o) => ({
    id: o.id,
    name: o.name,
    type: "Opportunity",
  })),
  ...COMPANIES.map((c) => ({ id: c.id, name: c.name, type: "Company" })),
];
