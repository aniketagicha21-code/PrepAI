const PRODUCTION_API_FALLBACK = "https://prepai-iru2.onrender.com";

/** Render cold start + OpenAI can exceed 60s; browsers default to no limit → feels stuck forever */
const HEALTH_TIMEOUT_MS = 120_000;
const CREATE_SESSION_TIMEOUT_MS = 180_000;

function normalizeBase(url) {
  if (url == null || String(url).trim() === "") return "";
  return String(url).trim().replace(/\/+$/, "");
}

function getBase() {
  const fromEnv = normalizeBase(import.meta.env.VITE_API_URL);
  if (fromEnv) return fromEnv;
  if (typeof window === "undefined") return "";
  const h = window.location.hostname;
  if (h === "localhost" || h === "127.0.0.1") return "";
  return PRODUCTION_API_FALLBACK;
}

export function apiUrl(path) {
  const base = getBase();
  if (!path.startsWith("/")) {
    return `${base}/${path}`;
  }
  return `${base}${path}`;
}

async function fetchWithTimeout(url, options = {}, timeoutMs) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
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

function isAbort(e) {
  return e?.name === "AbortError";
}

function isLikelyNetwork(e) {
  return (
    isAbort(e) ||
    e?.message === "Failed to fetch" ||
    e?.message === "Load failed" ||
    (typeof e?.message === "string" && e.message.includes("NetworkError"))
  );
}

/**
 * Warms a sleeping Render instance before POST (cheap GET; same cold start path).
 */
export async function pingHealth() {
  const res = await fetchWithTimeout(apiUrl("/health"), { method: "GET" }, HEALTH_TIMEOUT_MS);
  if (!res.ok) throw new Error(`Server returned ${res.status}`);
}

export async function createSession(payload) {
  const body = JSON.stringify(payload);
  const url = apiUrl("/api/sessions");
  const opts = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  };

  let lastErr;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetchWithTimeout(url, opts, CREATE_SESSION_TIMEOUT_MS);
      if (!res.ok) throw new Error(await parseError(res));
      return res.json();
    } catch (e) {
      lastErr = e;
      if (attempt === 0 && isLikelyNetwork(e)) {
        await new Promise((r) => setTimeout(r, 2500));
        continue;
      }
      break;
    }
  }

  if (isAbort(lastErr)) {
    throw new Error(
      "Request timed out. The API may be waking up (first click after idle can take 1–2 minutes on free hosting). Try again."
    );
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

export async function submitAnswer(sessionId, questionOrder, audioBlob, filename = "answer.webm") {
  const fd = new FormData();
  fd.append("question_order", String(questionOrder));
  fd.append("audio", audioBlob, filename);
  const res = await fetchWithTimeout(
    apiUrl(`/api/sessions/${sessionId}/answers`),
    { method: "POST", body: fd },
    240_000
  );
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function submitAnswerText(sessionId, questionOrder, transcript) {
  const res = await fetchWithTimeout(
    apiUrl(`/api/sessions/${sessionId}/answers-text`),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question_order: questionOrder, transcript }),
    },
    180_000
  );
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function listSessions() {
  const res = await fetchWithTimeout(apiUrl("/api/sessions"), { method: "GET" }, HEALTH_TIMEOUT_MS);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getSession(sessionId) {
  const res = await fetchWithTimeout(apiUrl(`/api/sessions/${sessionId}`), { method: "GET" }, HEALTH_TIMEOUT_MS);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getSessionFullSummary(sessionId) {
  const res = await fetchWithTimeout(
    apiUrl(`/api/sessions/${sessionId}/summary`),
    { method: "GET" },
    180_000
  );
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getImprovementSeries() {
  const res = await fetchWithTimeout(
    apiUrl("/api/sessions/improvement-series"),
    { method: "GET" },
    HEALTH_TIMEOUT_MS
  );
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}
