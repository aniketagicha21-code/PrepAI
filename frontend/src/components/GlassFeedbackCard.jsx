import { useCountUp } from "../hooks/useCountUp.js";

function scoreTone(score, type) {
  if (type === "filler") {
    if (score <= 5) return { label: "Strong", ring: "ring-emerald-500/30", dot: "bg-emerald-500" };
    if (score <= 12) return { label: "Okay", ring: "ring-amber-500/30", dot: "bg-amber-500" };
    return { label: "Focus area", ring: "ring-red-500/30", dot: "bg-red-500" };
  }
  if (type === "length") {
    if (score >= 25 && score <= 320)
      return { label: "Balanced", ring: "ring-emerald-500/30", dot: "bg-emerald-500" };
    if (score < 15) return { label: "Brief", ring: "ring-amber-500/30", dot: "bg-amber-500" };
    if (score > 400) return { label: "Verbose", ring: "ring-amber-500/30", dot: "bg-amber-500" };
    return { label: "Okay", ring: "ring-blue-500/20", dot: "bg-blue-500" };
  }
  if (score >= 8) return { label: "Strong", ring: "ring-emerald-500/30", dot: "bg-emerald-500" };
  if (score >= 5) return { label: "Okay", ring: "ring-amber-500/30", dot: "bg-amber-500" };
  return { label: "Focus area", ring: "ring-red-500/30", dot: "bg-red-500" };
}

function ScoreTile({ title, displayValue, rawForTone, toneType, suffix = "", enabled }) {
  const animated = useCountUp(displayValue, { duration: 950, decimals: 0, enabled });
  const n = Number(rawForTone);
  const tone = scoreTone(n, toneType);
  const shown =
    toneType === "clarity" || toneType === "structure"
      ? `${Math.round(animated)}/10`
      : `${Math.round(animated)}${suffix}`;

  return (
    <div
      className={`glass-panel p-4 ring-1 ${tone.ring} transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</p>
        <span className={`h-2 w-2 rounded-full ${tone.dot}`} title={tone.label} />
      </div>
      <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{shown}</p>
      <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{tone.label}</p>
    </div>
  );
}

export default function GlassFeedbackCard({ feedback, transcript, enabled = true, className = "" }) {
  if (!feedback) return null;
  const { clarity_score, structure_score, filler_word_count, answer_length_words, question_answered, feedback_summary } =
    feedback;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Your scores</h3>
        <span
          className={[
            "rounded-full px-3 py-1 text-xs font-semibold ring-1",
            question_answered
              ? "bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-800"
              : "bg-amber-50 text-amber-900 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-100 dark:ring-amber-800",
          ].join(" ")}
        >
          {question_answered ? "On prompt" : "Partial match"}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ScoreTile
          title="Clarity"
          displayValue={clarity_score}
          rawForTone={clarity_score}
          toneType="clarity"
          suffix="/10"
          enabled={enabled}
        />
        <ScoreTile
          title="Structure"
          displayValue={structure_score}
          rawForTone={structure_score}
          toneType="structure"
          suffix="/10"
          enabled={enabled}
        />
        <ScoreTile
          title="Filler words"
          displayValue={filler_word_count}
          rawForTone={filler_word_count}
          toneType="filler"
          enabled={enabled}
        />
        <ScoreTile
          title="Length"
          displayValue={answer_length_words}
          rawForTone={answer_length_words}
          toneType="length"
          suffix=" words"
          enabled={enabled}
        />
      </div>

      <div className="glass-panel p-5 ring-1 ring-blue-500/15">
        <p className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">Coach notes</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{feedback_summary}</p>
      </div>

      {transcript ? (
        <details className="group glass-panel overflow-hidden ring-1 ring-slate-200/60 dark:ring-slate-700/60">
          <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold text-slate-800 dark:text-slate-100 [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-2">
              Transcript
              <span className="text-xs font-medium text-slate-500 transition group-open:rotate-180">▼</span>
            </span>
          </summary>
          <div className="border-t border-slate-200/60 px-5 py-4 text-sm leading-relaxed text-slate-600 dark:border-slate-700/60 dark:text-slate-300">
            {transcript}
          </div>
        </details>
      ) : null}
    </div>
  );
}
