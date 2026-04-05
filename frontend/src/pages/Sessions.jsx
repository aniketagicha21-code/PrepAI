import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ImprovementChart from "../components/ImprovementChart.jsx";
import { getImprovementSeries, getSession, listSessions } from "../api/client.js";
import { formatInterviewType, formatRole } from "../utils/labels.js";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function avgCombined(s) {
  if (s.avg_clarity == null || s.avg_structure == null) return null;
  return (s.avg_clarity + s.avg_structure) / 2;
}

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [series, setSeries] = useState([]);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [detail, setDetail] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [s, imp] = await Promise.all([listSessions(), getImprovementSeries()]);
        if (!cancelled) {
          setSessions(s);
          setSeries(imp);
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const deltas = useMemo(() => {
    const m = {};
    for (let i = 0; i < sessions.length; i++) {
      const cur = avgCombined(sessions[i]);
      const prev = sessions[i + 1] ? avgCombined(sessions[i + 1]) : null;
      if (cur != null && prev != null) m[sessions[i].id] = cur - prev;
    }
    return m;
  }, [sessions]);

  async function toggleExpand(id) {
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    setExpanded(id);
    if (detail[id]) return;
    setLoadingId(id);
    try {
      const d = await getSession(id);
      setDetail((prev) => ({ ...prev, [id]: d }));
    } catch {
      /* ignore */
    } finally {
      setLoadingId(null);
    }
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">History</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Past sessions, averages, and per-question breakdown.</p>
        </div>
        <Link
          to="/setup"
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-lift transition hover:bg-accent-hover"
        >
          Start Interview
        </Link>
      </div>

      <ImprovementChart points={series} />

      {sessions.length === 0 ? (
        <div className="glass-panel py-16 text-center ring-1 ring-slate-200/80 dark:ring-slate-700/80">
          <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">No sessions yet — start your first interview</p>
          <Link to="/setup" className="mt-4 inline-block font-bold text-accent dark:text-blue-400">
            Configure session →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const d = deltas[s.id];
            const open = expanded === s.id;
            const det = detail[s.id];
            return (
              <div
                key={s.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900/40"
              >
                <button
                  type="button"
                  onClick={() => toggleExpand(s.id)}
                  className="flex w-full flex-col gap-3 p-5 text-left sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{formatDate(s.created_at)}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {formatInterviewType(s.interview_type)} · {formatRole(s.role)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="rounded-lg bg-surface px-3 py-1 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      Avg {(avgCombined(s) ?? 0).toFixed(2)}
                    </span>
                    {d != null ? (
                      <span
                        className={[
                          "rounded-lg px-3 py-1 font-bold",
                          d >= 0
                            ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
                            : "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-200",
                        ].join(" ")}
                      >
                        {d >= 0 ? "+" : ""}
                        {d.toFixed(2)} vs last
                      </span>
                    ) : (
                      <span className="rounded-lg bg-slate-100 px-3 py-1 font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        First session
                      </span>
                    )}
                    <span className="text-slate-400 dark:text-slate-500">{open ? "▲" : "▼"}</span>
                  </div>
                </button>
                {open ? (
                  <div className="border-t border-slate-200 px-5 pb-5 pt-2 dark:border-slate-800">
                    {loadingId === s.id ? (
                      <p className="py-4 text-sm text-slate-500">Loading answers…</p>
                    ) : det ? (
                      <div className="space-y-3">
                        {det.answers
                          .slice()
                          .sort((a, b) => a.question_order - b.question_order)
                          .map((a) => (
                            <div
                              key={a.id}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-surface px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60"
                            >
                              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                Q{a.question_order + 1}
                              </span>
                              {a.transcript?.trim() ? (
                                <span className="text-sm text-slate-600 dark:text-slate-300">
                                  Clarity <strong className="text-slate-900 dark:text-white">{a.clarity_score}</strong> ·
                                  Structure{" "}
                                  <strong className="text-slate-900 dark:text-white">{a.structure_score}</strong> ·
                                  Fillers{" "}
                                  <strong className="text-slate-900 dark:text-white">{a.filler_word_count}</strong>
                                </span>
                              ) : (
                                <span className="text-sm text-slate-400">Skipped / empty</span>
                              )}
                            </div>
                          ))}
                        <Link
                          to={`/sessions/${s.id}`}
                          className="inline-block text-sm font-bold text-accent dark:text-blue-400"
                        >
                          Open full detail →
                        </Link>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">Could not load details.</p>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
