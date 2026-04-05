import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSession, pingHealth } from "../api/client.js";
import { useInView } from "../hooks/useInView.js";

const INTERVIEW_TYPES = [
  {
    id: "technical",
    label: "Technical",
    description: "Depth, systems thinking, and problem-solving rigor.",
  },
  {
    id: "behavioral",
    label: "Behavioral",
    description: "STAR-style stories, ownership, and collaboration.",
  },
  {
    id: "mixed",
    label: "Mixed",
    description: "A realistic blend of technical and behavioral prompts.",
  },
];

const ROLES = [
  { id: "swe", label: "SWE" },
  { id: "ml_engineer", label: "ML Engineer" },
  { id: "frontend", label: "Frontend" },
  { id: "backend", label: "Backend" },
  { id: "full_stack", label: "Full Stack" },
];

export default function Setup() {
  const navigate = useNavigate();
  const [interviewType, setInterviewType] = useState("technical");
  const [role, setRole] = useState("swe");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState(null);
  const [error, setError] = useState(null);
  const [headRef, headVis] = useInView();

  const isRemote =
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1";

  async function handleStart() {
    setLoading(true);
    setPhase(null);
    setError(null);
    try {
      if (isRemote) {
        setPhase("wake");
        await pingHealth();
      }
      setPhase("generate");
      const data = await createSession({ interview_type: interviewType, role });
      navigate(`/interview/${data.session_id}`, {
        state: { questions: data.questions, interview_type: data.interview_type, role: data.role },
      });
    } catch (e) {
      setError(e.message || "Failed to start session");
    } finally {
      setLoading(false);
      setPhase(null);
    }
  }

  const loadingLabel =
    phase === "wake"
      ? "Connecting to server… (first load after idle can take up to ~1–2 min on free hosting)"
      : phase === "generate"
        ? "Generating questions with GPT-4…"
        : "Generating questions…";

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div
        ref={headRef}
        className={[
          "transition-all duration-700",
          headVis ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        ].join(" ")}
      >
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Configure your session</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Five tailored questions powered by GPT-4.</p>
      </div>

      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Interview type
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {INTERVIEW_TYPES.map((t) => {
            const active = interviewType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setInterviewType(t.id)}
                className={[
                  "rounded-2xl border-2 p-4 text-left transition-all duration-200 hover:-translate-y-0.5",
                  active
                    ? "border-accent bg-accent-soft shadow-lift dark:border-blue-500 dark:bg-blue-950/40"
                    : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-slate-600",
                ].join(" ")}
              >
                <p className="font-bold text-slate-900 dark:text-white">{t.label}</p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{t.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Role focus</h2>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => {
            const active = role === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={[
                  "rounded-full px-4 py-2 text-sm font-bold transition-all duration-200",
                  active
                    ? "bg-accent text-white shadow-lift dark:bg-blue-600"
                    : "border border-slate-200 bg-surface text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
                ].join(" ")}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <button
        type="button"
        disabled={loading}
        onClick={handleStart}
        className="w-full rounded-xl bg-accent py-3.5 text-sm font-bold text-white shadow-lift transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-10"
      >
        {loading ? loadingLabel : "Generate questions"}
      </button>
    </div>
  );
}
