import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getSession } from "../api/client.js";
import GlassFeedbackCard from "../components/GlassFeedbackCard.jsx";
import { formatInterviewType, formatRole } from "../utils/labels.js";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "full",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function SessionDetail() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await getSession(id);
        if (!cancelled) setSession(s);
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
        {error}
        <div className="mt-4">
          <Link to="/sessions" className="font-bold text-accent dark:text-blue-400">
            Back to history
          </Link>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex justify-center py-16">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent dark:border-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <Link to="/sessions" className="text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400">
          ← All sessions
        </Link>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">Session detail</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">{formatDate(session.created_at)}</p>
        <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
          {formatInterviewType(session.interview_type)} · {formatRole(session.role)}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to={`/summary/${session.id}`}
          className="rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white shadow-lift hover:bg-accent-hover"
        >
          View summary
        </Link>
        <Link
          to={`/interview/${session.id}`}
          className="rounded-xl border-2 border-slate-300 px-4 py-2 text-sm font-bold text-slate-800 dark:border-slate-600 dark:text-slate-100"
        >
          Continue interview
        </Link>
      </div>

      <div className="space-y-8">
        {session.answers
          .slice()
          .sort((a, b) => a.question_order - b.question_order)
          .map((a) => (
            <div key={a.id} className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-surface p-5 dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Question {a.question_order + 1}
                </p>
                <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{a.question_text}</p>
              </div>
              {a.transcript?.trim() ? (
                <div className="glass-panel p-6 ring-1 ring-blue-500/10">
                  <GlassFeedbackCard
                    feedback={{
                      clarity_score: a.clarity_score,
                      structure_score: a.structure_score,
                      filler_word_count: a.filler_word_count,
                      answer_length_words: a.answer_length_words,
                      question_answered: a.question_answered,
                      feedback_summary: a.feedback_summary,
                    }}
                    transcript={a.transcript}
                    enabled={false}
                  />
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 dark:border-slate-600">
                  No answer recorded for this question.
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
