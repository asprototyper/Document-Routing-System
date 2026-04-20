/* ══════════════════════════════════════════════
   STAGE DEFINITIONS — pipeline phases + tracks
   ══════════════════════════════════════════════ */

export const PHASE1A = [
  {
    key: "p1a_eng_accept",
    label: "Accept Application and Provide copy to the Client",
    hint: "Engineer",
  },
];

export const PHASE2 = [
  { key: "p2_cdo_scan",  label: "Record Acceptance and Scan Documents", hint: "CDO II" },
  { key: "p2_cdo_route", label: "Route Application", hint: "CDO II — unlocks Phase 3" },
];

export const PHASE1B = [
  {
    key: "p1b_return",
    label: "Return Application — Record Date & Time Returned",
    hint: "Stamp the exact date and time the application was returned to the applicant.",
  },
];

export const PHASE3_LEGAL = [
  { key: "p3_legal_recv", label: "Received by Legal Branch",   hint: "For legal evaluation and findings" },
  { key: "p3_legal_back", label: "Received from Legal Branch", hint: "" },
];

export const PHASE3_TECH = [
  { key: "p3_tech_recv", label: "Received by SID — Technical", hint: "For technical evaluation and findings" },
  { key: "p3_tech_back", label: "Received from SID",           hint: "Technical track" },
];

export const PHASE3_FIN = [
  { key: "p3_fin_recv", label: "Received by SID — Financial", hint: "For financial evaluation and findings" },
  { key: "p3_fin_back", label: "Received from SID",           hint: "Financial track" },
];

export const PHASE3A = [
  { key: "p3a_endorse", label: "Application Endorsed to SID", hint: "All compliant — no NOD" },
];

export const PHASE3B = [
  { key: "p3b_nod",     label: "Notice of Deficiency Issued",            hint: "" },
  { key: "p3b_endorse", label: "Application and Nod endorsed to SID",    hint: "" },
];

export const PHASE4A = [
  { key: "p4a_cdo_accept",   label: "Record Receipt of Documents",                                     hint: "CDO II" },
  { key: "p4a_eng_briefer",  label: "Received by Engineer — Briefer prep & Certificate drafting",      hint: "Engineer" },
  { key: "p4a_chief_review", label: "Received by Chief-SID for Review",                                hint: "Chief-SID" },
  { key: "p4a_dir_rec",      label: "Received by Director-RB — Recommendation",                        hint: "Director-RB" },
  { key: "p4a_odc",          label: "Received by ODC", hint: "", isApproval: true },
];

export const PHASE4B = [
  { key: "p4b_cdo_accept", label: "Record Receipt of Documents", hint: "CDO II" },
];

export const PHASE5 = [
  {
    key: "p5_receipt",
    label: "Record Receipt of Approval/Disapproval",
    hint: "CDO II",
    isCertDecision: true,
  },
];

export const PHASE5A = [
  { key: "p5a_eng_soa",   label: "Received by Engineer — Prepare SOA",      hint: "Engineer" },
  { key: "p5a_chief_soa", label: "Received by Chief-SID — Review SOA",      hint: "Chief-SID" },
  { key: "p5a_dir_soa",   label: "Received by Director-RB — Approval of SOA", hint: "Director-RB" },
];

export const PHASE5B = [
  { key: "p5b_chief_nod",  label: "Received by Chief-SID — Draft Notice of Disapproval",  hint: "Chief-SID" },
  { key: "p5b_dir_review", label: "Received by Director-RB — Review Notice",              hint: "Director-RB" },
  { key: "p5b_odc_issue",  label: "Received by ODC — Issue Notice of Disapproval",        hint: "ODC" },
];

export const PHASE6A = [
  { key: "p6a_recv_dir", label: "Received Application from Director-RB", hint: "CDO II" },
];

export const PHASE6B = [
  { key: "p6b_recv_odc", label: "Received Application from ODC", hint: "CDO II" },
];

export const PHASE7 = [{ key: "p7_payment", label: "Payment Stage", hint: "Client" }];

export const PHASE8 = [
  { key: "p8_recv_client", label: "Received Application from Client",  hint: "CDO II" },
  { key: "p8_release",     label: "Release Certificate to Applicant",   hint: "CDO II" },
  { key: "p8_scan",        label: "Record Release and Scan Documents",  hint: "CDO II" },
];

export const ALL_STAGES = [
  ...PHASE1A,
  ...PHASE1B,
  ...PHASE2,
  ...PHASE3_LEGAL,
  ...PHASE3_TECH,
  ...PHASE3_FIN,
  ...PHASE3A,
  ...PHASE3B,
  ...PHASE4A,
  ...PHASE4B,
  ...PHASE5,
  ...PHASE5A,
  ...PHASE5B,
  ...PHASE6A,
  ...PHASE6B,
  ...PHASE7,
  ...PHASE8,
];

export const TRACK_MAP = {
  p1a: PHASE1A,
  p1b: PHASE1B,
  p2: PHASE2,
  p3_legal: PHASE3_LEGAL,
  p3_tech: PHASE3_TECH,
  p3_fin: PHASE3_FIN,
  p3a: PHASE3A,
  p3b: PHASE3B,
  p4a: PHASE4A,
  p4b: PHASE4B,
  p5: PHASE5,
  p5a: PHASE5A,
  p5b: PHASE5B,
  p6a: PHASE6A,
  p6b: PHASE6B,
  p7: PHASE7,
  p8: PHASE8,
};
