import { Link, NavLink, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";

function SunIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v2m0 14v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M3 12h2m14 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41M12 8a4 4 0 100 8 4 4 0 000-8z"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
      />
    </svg>
  );
}

const navCls = ({ isActive }) =>
  [
    "rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200",
    isActive
      ? "bg-accent-soft text-accent dark:bg-blue-950/50 dark:text-blue-300"
      : "text-slate-600 hover:bg-surface hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white",
  ].join(" ");

export default function Layout({ children }) {
  const { dark, toggle } = useTheme();
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <div className="min-h-screen flex flex-col bg-white bg-mesh-light transition-colors duration-300 dark:bg-slate-950 dark:bg-mesh-dark">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-sm font-extrabold text-white shadow-lift">
              P
            </span>
            <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">PrepAI</span>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
            <NavLink to="/" end className={navCls}>
              Home
            </NavLink>
            <NavLink to="/setup" className={navCls}>
              Start Interview
            </NavLink>
            <NavLink to="/sessions" className={navCls}>
              History
            </NavLink>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <nav className="flex items-center gap-1 md:hidden">
              <NavLink
                to="/setup"
                className="rounded-lg px-2 py-2 text-xs font-semibold text-accent dark:text-blue-400"
              >
                Start
              </NavLink>
              <NavLink
                to="/sessions"
                className="rounded-lg px-2 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                History
              </NavLink>
            </nav>
            <button
              type="button"
              onClick={toggle}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-surface text-slate-700 transition hover:border-accent hover:text-accent dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500"
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">{children}</main>

      {!isHome ? (
        <footer className="border-t border-slate-200 py-8 dark:border-slate-800">
          <p className="mx-auto max-w-6xl px-4 text-center text-sm text-slate-500 dark:text-slate-400 sm:px-6">
            Built by Aniket Agicha
          </p>
        </footer>
      ) : null}
    </div>
  );
}
