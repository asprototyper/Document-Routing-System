import { supabase } from "./supabase.js";

// ── shape translators ─────────────────────────────────────────────────────

function rowToDoc(row, stageRows) {
  const stages = {};
  for (const s of stageRows || []) {
    stages[s.stage_key] = {
      stampedAt: s.stamped_at,
      ...(s.passed_by ? { passedBy: s.passed_by } : {}),
      ...(s.sent_by ? { sentBy: s.sent_by } : {}),
    };
  }
  return {
    id: row.id,
    entity: row.entity,
    contact: row.contact,
    email: row.email,
    emailVerified: row.email_verified,
    remarks: row.remarks ?? "",
    createdAt: row.created_at,
    stages,
    preassess: row.preassess ?? null,
    paTs: row.pa_ts ?? null,
    nod_legal: row.nod_legal ?? false,
    nod_tech: row.nod_tech ?? false,
    nod_fin: row.nod_fin ?? false,
    p3decision: row.p3decision ?? null,
    p3mergeTs: row.p3merge_ts ?? null,
    certOutcome: row.cert_outcome ?? null,
    certDecisionTs: row.cert_decision_ts ?? null,
    p3b_notif_ts: row.p3b_notif_ts ?? null,
    p3b_return_ts: row.p3b_return_ts ?? null,
    p6a_notif_ts: row.p6a_notif_ts ?? null,
    p6b_notif_ts: row.p6b_notif_ts ?? null,
    p6b_return_ts: row.p6b_return_ts ?? null,
    p4b_notif_ts: null,
    p4b_return_ts: null,
    p1b_closed: false,
    email_sent_p3b_notify: row.email_sent_p3b_notify ?? false,
    email_sent_p6a_notify: row.email_sent_p6a_notify ?? false,
    email_sent_p6b_notify: row.email_sent_p6b_notify ?? false,
  };
}

function docToRow(doc) {
  return {
    id: doc.id,
    entity: doc.entity,
    contact: doc.contact,
    email: doc.email,
    email_verified: doc.emailVerified,
    remarks: doc.remarks ?? "",
    preassess: doc.preassess ?? null,
    pa_ts: doc.paTs ?? null,
    nod_legal: doc.nod_legal ?? false,
    nod_tech: doc.nod_tech ?? false,
    nod_fin: doc.nod_fin ?? false,
    p3decision: doc.p3decision ?? null,
    p3merge_ts: doc.p3mergeTs ?? null,
    cert_outcome: doc.certOutcome ?? null,
    cert_decision_ts: doc.certDecisionTs ?? null,
    p3b_notif_ts: doc.p3b_notif_ts ?? null,
    p3b_return_ts: doc.p3b_return_ts ?? null,
    p6a_notif_ts: doc.p6a_notif_ts ?? null,
    p6b_notif_ts: doc.p6b_notif_ts ?? null,
    p6b_return_ts: doc.p6b_return_ts ?? null,
  };
}

const COL_MAP = {
  preassess: "preassess",
  paTs: "pa_ts",
  nod_legal: "nod_legal",
  nod_tech: "nod_tech",
  nod_fin: "nod_fin",
  p3decision: "p3decision",
  p3mergeTs: "p3merge_ts",
  certOutcome: "cert_outcome",
  certDecisionTs: "cert_decision_ts",
  p3b_notif_ts: "p3b_notif_ts",
  p3b_return_ts: "p3b_return_ts",
  p6a_notif_ts: "p6a_notif_ts",
  p6b_notif_ts: "p6b_notif_ts",
  p6b_return_ts: "p6b_return_ts",
  email_sent_p3b_notify: 'email_sent_p3b_notify',
  email_sent_p6a_notify: 'email_sent_p6a_notify',
  email_sent_p6b_notify: 'email_sent_p6b_notify',
  emailVerified: "email_verified",
  
};

// ── public API ────────────────────────────────────────────────────────────

export async function loadAllDocs() {
  const { data: rows, error: docsErr } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });
  if (docsErr) throw docsErr;
  if (!rows.length) return [];

  const { data: stageRows, error: stagesErr } = await supabase
    .from("stages")
    .select("*")
    .in(
      "doc_id",
      rows.map((r) => r.id),
    );
  if (stagesErr) throw stagesErr;

  const byDoc = {};
  for (const s of stageRows) {
    if (!byDoc[s.doc_id]) byDoc[s.doc_id] = [];
    byDoc[s.doc_id].push(s);
  }
  return rows.map((row) => rowToDoc(row, byDoc[row.id] ?? []));
}

export async function createDoc(doc) {
  const { data, error } = await supabase
    .from("documents")
    .insert(docToRow(doc))
    .select()
    .single();
  if (error) throw error;
  return rowToDoc(data, []);
}

export async function updateDoc(docId, changes) {
  const payload = {};
  for (const [k, v] of Object.entries(changes)) {
    const col = COL_MAP[k];
    if (!col) throw new Error(`Unknown field: ${k}`);
    payload[col] = v;
  }
  const { error } = await supabase
    .from("documents")
    .update(payload)
    .eq("id", docId);
  if (error) throw error;
}

export async function stampStage(
  docId,
  stageKey,
  stampedAt,
  { passedBy, sentBy } = {},
) {
  const { error } = await supabase
    .from("stages")
    .upsert(
      {
        doc_id: docId,
        stage_key: stageKey,
        stamped_at: stampedAt,
        passed_by: passedBy ?? null,
        sent_by: sentBy ?? null,
      },
      { onConflict: "doc_id,stage_key" },
    );
  if (error) throw error;
}

export async function redactStage(docId, stageKey, prevValue) {
  const { error } = await supabase
    .from("stages")
    .delete()
    .eq("doc_id", docId)
    .eq("stage_key", stageKey);
  if (error) throw error;
  await supabase.from("audit_log").insert({
    doc_id: docId,
    action: "redact_stage",
    field_key: stageKey,
    prev_value: prevValue ?? null,
  });
}

export async function redactTsField(docId, fieldName, prevValue) {
  await updateDoc(docId, { [fieldName]: null });
  await supabase.from("audit_log").insert({
    doc_id: docId,
    action: "redact_ts",
    field_key: fieldName,
    prev_value: prevValue ? { value: prevValue } : null,
  });
}

export async function deleteDoc(docId) {
  const { error } = await supabase.from("documents").delete().eq("id", docId);
  if (error) throw error;
}

export function subscribeToChanges(onReload) {
  const channel = supabase
    .channel("ntc-tracker-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "documents" },
      onReload,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "stages" },
      onReload,
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}
