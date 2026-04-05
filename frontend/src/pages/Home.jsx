import { Link } from "react-router-dom";
import { useInView } from "../hooks/useInView.js";
import MockScorePreview from "../components/MockScorePreview.jsx";

function Reveal({ children, className = "" }) {
  const [ref, visible] = useInView();
  return (
    <div
      ref={ref}
      className={[
        "transition-all duration-700 ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function FeatureCard({ icon, title, body }) {
  return (
    <div className="group glass-panel h-full p-6 ring-1 ring-slate-200/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift dark:ring-slate-700/60">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent transition group-hover:scale-105 dark:bg-blue-950/50 dark:text-blue-300">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{body}</p>
    </div>
  );
}

export default function Home() {
  const scrollToHow = () => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="space-y-24 pb-16">
      <section className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
        <div className="space-y-8">
          <Reveal>
            <p className="inline-flex rounded-full border border-blue-200 bg-accent-soft px-3 py-1 text-xs font-semibold text-blue-800 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-200">
              GPT-4 · Whisper · Structured scoring
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem] dark:text-white">
              <span className="bg-hero-gradient bg-clip-text text-transparent">Ace your next interview</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              GPT-4 generates real FAANG questions, Whisper transcribes your answer, and AI scores you on clarity,
              structure, and filler words — instantly.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/setup"
                className="inline-flex items-center justify-center rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white shadow-lift transition hover:bg-accent-hover hover:shadow-lg active:scale-[0.98]"
              >
                Start Interview
              </Link>
              <button
                type="button"
                onClick={scrollToHow}
                className="inline-flex items-center justify-center rounded-xl border-2 border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-800 transition hover:border-accent hover:text-accent dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-blue-500"
              >
                See how it works
              </button>
            </div>
          </Reveal>
        </div>
        <Reveal className="lg:justify-self-end">
          <MockScorePreview animate />
        </Reveal>
      </section>

      <section>
        <Reveal>
          <h2 className="text-center text-3xl font-extrabold text-slate-900 dark:text-white">Why PrepAI</h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-slate-600 dark:text-slate-400">
            Production-grade practice — not generic flashcards.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <Reveal>
            <FeatureCard
              title="Real FAANG Questions"
              body="Role-aware prompts for SWE, ML, frontend, backend, and full stack — tuned to your interview type."
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 003.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              }
            />
          </Reveal>
          <Reveal>
            <FeatureCard
              title="Voice + Text Input"
              body="Record with your mic or type your answer — both paths run the same scoring pipeline and feedback."
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                  />
                </svg>
              }
            />
          </Reveal>
          <Reveal>
            <FeatureCard
              title="Track Improvement"
              body="Every session is stored with four scoring dimensions so you can see momentum over time."
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              }
            />
          </Reveal>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24">
        <Reveal>
          <h2 className="text-center text-3xl font-extrabold text-slate-900 dark:text-white">How it works</h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-slate-600 dark:text-slate-400">
            Three steps from setup to scored feedback.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { n: "1", t: "Pick your role", d: "Choose interview type and target role — we generate five tailored questions." },
            { n: "2", t: "Answer the question", d: "Record audio or type your response. Whisper handles voice; GPT scores both." },
            { n: "3", t: "Get scored instantly", d: "Glassmorphism score cards, coach notes, and session history for trends." },
          ].map((s) => (
            <Reveal key={s.n}>
              <div className="relative h-full rounded-2xl border border-slate-200 bg-surface p-6 dark:border-slate-800 dark:bg-slate-900/60">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-extrabold text-white">
                  {s.n}
                </span>
                <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal>
        <div className="glass-panel flex flex-wrap items-center justify-center gap-4 border border-slate-200/80 px-4 py-6 sm:gap-8 dark:border-slate-700/80">
          {["GPT-4 Powered", "Whisper Transcription", "4 Scoring Dimensions", "Session History"].map((label) => (
            <span
              key={label}
              className="text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200"
            >
              {label}
            </span>
          ))}
        </div>
      </Reveal>

      <footer className="border-t border-slate-200 pt-12 dark:border-slate-800">
        <p className="text-center text-sm font-semibold text-slate-900 dark:text-white">Built by Aniket Agicha</p>
      </footer>
    </div>
  );
}
