export default function ImprovementChart({ points }) {
  if (!points?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-surface/50 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/30 dark:text-slate-400">
        Complete answers across sessions to see your trend line.
      </div>
    );
  }

  const clarities = points.map((p) => p.avg_clarity ?? 0);
  const structures = points.map((p) => p.avg_structure ?? 0);
  const maxVal = 10;
  const w = 560;
  const h = 200;
  const pad = 28;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;

  const xFor = (i) => pad + (innerW * i) / Math.max(points.length - 1, 1);
  const yFor = (v) => pad + innerH - (innerH * v) / maxVal;

  const linePath = (values) =>
    values
      .map((v, i) => `${i === 0 ? "M" : "L"} ${xFor(i).toFixed(1)} ${yFor(v).toFixed(1)}`)
      .join(" ");

  return (
    <div className="glass-panel p-6 ring-1 ring-slate-200/80 dark:ring-slate-700/80">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Progress over time</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Session averages — clarity vs structure</p>
        </div>
        <div className="flex gap-4 text-xs font-semibold">
          <span className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <span className="h-0.5 w-6 rounded-full bg-accent dark:bg-blue-400" /> Clarity
          </span>
          <span className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <span className="h-0.5 w-6 rounded-full bg-indigo-500" /> Structure
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full min-w-[300px]" role="img" aria-label="Improvement chart">
          {[0, 2.5, 5, 7.5, 10].map((tick) => {
            const y = yFor(tick);
            return (
              <g key={tick}>
                <line
                  x1={pad}
                  y1={y}
                  x2={w - pad}
                  y2={y}
                  className="stroke-slate-200 dark:stroke-slate-700"
                  strokeWidth="1"
                />
                <text x={4} y={y + 4} fill="#94a3b8" fontSize="10">
                  {tick}
                </text>
              </g>
            );
          })}
          <path
            d={linePath(clarities)}
            fill="none"
            stroke="#2563EB"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={linePath(structures)}
            fill="none"
            stroke="#6366F1"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.map((p, i) => (
            <g key={p.session_id}>
              <circle cx={xFor(i)} cy={yFor(clarities[i])} r="4" fill="white" stroke="#2563EB" strokeWidth="2" />
              <circle cx={xFor(i)} cy={yFor(structures[i])} r="4" fill="white" stroke="#6366F1" strokeWidth="2" />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
