import { useCountUp } from "../hooks/useCountUp.js";

function Mini({ label, value, enabled }) {
  const v = useCountUp(value, { duration: 1400, enabled });
  return (
    <div className="rounded-xl border border-white/30 bg-white/40 px-3 py-2 backdrop-blur-md dark:border-white/10 dark:bg-slate-800/50">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-lg font-extrabold text-slate-900 dark:text-white">{Math.round(v)}</p>
    </div>
  );
}

export default function MockScorePreview({ animate = true }) {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-4 rounded-3xl bg-hero-gradient opacity-25 blur-2xl dark:opacity-35" />
      <div className="relative glass-panel overflow-hidden p-6 ring-1 ring-blue-500/20 shadow-lift">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Live preview</p>
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Mock interview score</p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Mini label="Clarity" value={8} enabled={animate} />
          <Mini label="Structure" value={9} enabled={animate} />
          <Mini label="Fillers" value={2} enabled={animate} />
        </div>
        <div className="mt-4 rounded-xl border border-slate-200/80 bg-surface/80 p-3 text-xs leading-relaxed text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
          “Tight structure, fewer hedges on tradeoffs — strong signal for senior loop.”
        </div>
      </div>
    </div>
  );
}
