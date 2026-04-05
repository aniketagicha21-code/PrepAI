import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toPng } from "html-to-image";
import { getSession, getSessionFullSummary } from "../api/client";
import { formatInterviewType, formatRole } from "../utils/labels.js";

export default function SessionSummary() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [sum, det] = await Promise.all([getSessionFullSummary(sessionId), getSession(sessionId)]);
        if (!cancelled) {
          setSummary(sum);
          setSession(det);
        }
      } catch (e) {
        if (!cancelled) setError(e.message || "Could not load summary");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  async function handleShare() {
    const node = cardRef.current;
    if (!node) return;
    setSharing(true);
    try {
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: document.documentElement.classList.contains("dark") ? "#0f172a" : "#ffffff",
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `prepai-session-${sessionId?.slice(0, 8)}.png`;
      a.click();
    } catch {
      setError("Could not generate image. Try again.");
    } finally {
      setSharing(false);
    }
  }

  if (error && !summary) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950/40">
        <p className="font-medium text-red-800 dark:text-red-200">{error}</p>
        <Link to="/sessions" className="mt-4 inline-block font-bold text-accent dark:text-blue-400">
          Back to history
        </Link>
      </div>
    );
  }

  if (!summary || !session) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent dark:border-blue-400" />
      </div>
    );
  }

  const tipsLines = summary.improvement_tips.split(/\n+/).filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Session summary</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {formatInterviewType(session.interview_type)} · {formatRole(session.role)}
        </p>
      </div>

      <div
        ref={cardRef}
        className="glass-panel space-y-6 p-8 ring-1 ring-slate-200/80 dark:ring-slate-700/80"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-accent dark:text-blue-400">PrepAI</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">Interview scorecard</p>
          </div>
          <div className="text-right text-sm font-semibold text-slate-500 dark:text-slate-400">
            {summary.answered_count} answers
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-surface px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60">
            <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Avg clarity</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{summary.avg_clarity}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-surface px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60">
            <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Avg structure</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{summary.avg_structure}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-surface px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60">
            <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Avg filler words</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{summary.avg_filler_words}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-surface px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60">
            <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Avg length</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{summary.avg_length_words} words</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
            Strongest answer
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
            Q{summary.best_question_order + 1}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {summary.best_question_text}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 dark:border-amber-900 dark:bg-amber-950/30">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-900 dark:text-amber-200">
            Focus next time
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
            Q{summary.worst_question_order + 1}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {summary.worst_question_text}
          </p>
        </div>
      </div>

      <div className="glass-panel p-6 ring-1 ring-blue-500/15">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Improvement tips</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {tipsLines.map((line, idx) => (
            <li key={idx}>{line.replace(/^[-•]\s*/, "")}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
        <button
          type="button"
          onClick={() => navigate("/setup")}
          className="rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white shadow-lift transition hover:bg-accent-hover"
        >
          Start new session
        </button>
        <Link
          to="/sessions"
          className="inline-flex items-center justify-center rounded-xl border-2 border-slate-300 px-6 py-3 text-center text-sm font-bold text-slate-800 transition hover:border-accent hover:text-accent dark:border-slate-600 dark:text-slate-100"
        >
          View history
        </Link>
        <button
          type="button"
          disabled={sharing}
          onClick={handleShare}
          className="rounded-xl border-2 border-slate-300 px-6 py-3 text-sm font-bold text-slate-800 transition hover:border-accent hover:text-accent disabled:opacity-50 dark:border-slate-600 dark:text-slate-100"
        >
          {sharing ? "Saving image…" : "Share score card"}
        </button>
      </div>
    </div>
  );
}
