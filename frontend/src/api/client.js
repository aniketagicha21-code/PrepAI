const RAW_BASE = import.meta.env.VITE_API_URL ?? "";

export function apiUrl(path) {
  if (!path.startsWith("/")) {
    return `${RAW_BASE}/${path}`;
  }
  return `${RAW_BASE}${path}`;
}

async function parseError(res) {
  try {
    const j = await res.json();
    if (j.detail) {
      return typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail);
    }
  } catch {
    /* ignore */
  }
  return res.statusText || "Request failed";
}

export async function createSession(payload) {
  const res = await fetch(apiUrl("/api/sessions"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function submitAnswer(sessionId, questionOrder, audioBlob, filename = "answer.webm") {
  const fd = new FormData();
  fd.append("question_order", String(questionOrder));
  fd.append("audio", audioBlob, filename);
  const res = await fetch(apiUrl(`/api/sessions/${sessionId}/answers`), {
    method: "POST",
    body: fd,
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function submitAnswerText(sessionId, questionOrder, transcript) {
  const res = await fetch(apiUrl(`/api/sessions/${sessionId}/answers-text`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question_order: questionOrder, transcript }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function listSessions() {
  const res = await fetch(apiUrl("/api/sessions"));
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getSession(sessionId) {
  const res = await fetch(apiUrl(`/api/sessions/${sessionId}`));
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getSessionFullSummary(sessionId) {
  const res = await fetch(apiUrl(`/api/sessions/${sessionId}/summary`));
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getImprovementSeries() {
  const res = await fetch(apiUrl("/api/sessions/improvement-series"));
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}
