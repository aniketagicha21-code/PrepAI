import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { getSession, submitAnswer, submitAnswerText } from "../api/client";
import GlassFeedbackCard from "../components/GlassFeedbackCard.jsx";
import { formatInterviewType, formatRole } from "../utils/labels.js";

function pickMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) || "";
}

export default function Interview() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const navState = location.state;

  const [questions, setQuestions] = useState(() =>
    (navState?.questions || []).slice().sort((a, b) => a.order - b.order)
  );
  const [meta, setMeta] = useState(() => ({
    interview_type: navState?.interview_type,
    role: navState?.role,
  }));
  const [index, setIndex] = useState(0);
  const [inputMode, setInputMode] = useState("record");
  const [typedText, setTypedText] = useState("");
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState(null);
  const [error, setError] = useState(null);
  const [lastFeedback, setLastFeedback] = useState(null);
  const [lastTranscript, setLastTranscript] = useState("");

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const phaseTimerRef = useRef(null);

  const hydrate = useCallback(async () => {
    try {
      const s = await getSession(sessionId);
      setMeta({ interview_type: s.interview_type, role: s.role });
      const qs = s.answers
        .slice()
        .sort((a, b) => a.question_order - b.question_order)
        .map((a) => ({ order: a.question_order, text: a.question_text }));
      setQuestions(qs);
    } catch (e) {
      setError(e.message || "Could not load session");
    }
  }, [sessionId]);

  useEffect(() => {
    if (!questions.length) hydrate();
  }, [questions.length, hydrate]);

  useEffect(() => {
    return () => {
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const current = questions[index];
  const progressPct = questions.length ? ((index + 1) / questions.length) * 100 : 0;

  function resetQuestionUi() {
    setLastFeedback(null);
    setLastTranscript("");
    setTypedText("");
    setError(null);
  }

  useEffect(() => {
    resetQuestionUi();
    setRecording(false);
  }, [index]);

  async function startRecording() {
    setError(null);
    setLastFeedback(null);
    setLastTranscript("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const mime = pickMimeType();
      const mr = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      mr.start();
      setRecording(true);
    } catch (e) {
      setError(e.message || "Microphone access denied or unavailable.");
    }
  }

  async function stopRecording() {
    const mr = mediaRecorderRef.current;
    if (!mr || mr.state === "inactive") return;
    setBusy(true);
    setBusyLabel("Transcribing…");
    setError(null);
    phaseTimerRef.current = setTimeout(() => setBusyLabel("Analyzing…"), 1600);

    const blob = await new Promise((resolve, reject) => {
      mr.onstop = () => {
        const mime = mr.mimeType || "audio/webm";
        resolve(new Blob(chunksRef.current, { type: mime }));
      };
      mr.onerror = (ev) => reject(ev.error || new Error("Recording failed"));
      mr.stop();
    });

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;
    setRecording(false);

    const ext = blob.type.includes("mp4") ? "m4a" : "webm";
    const filename = `answer.${ext}`;

    try {
      const res = await submitAnswer(sessionId, index, blob, filename);
      setLastTranscript(res.transcript);
      setLastFeedback(res.feedback);
    } catch (e) {
      setError(e.message || "Upload or scoring failed");
    } finally {
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
      setBusy(false);
      setBusyLabel(null);
    }
  }

  async function submitTyped() {
    const t = typedText.trim();
    if (!t) {
      setError("Please type your answer first.");
      return;
    }
    setBusy(true);
    setBusyLabel("Analyzing…");
    setError(null);
    try {
      const res = await submitAnswerText(sessionId, index, t);
      setLastTranscript(res.transcript);
      setLastFeedback(res.feedback);
    } catch (e) {
      setError(e.message || "Scoring failed");
    } finally {
      setBusy(false);
      setBusyLabel(null);
    }
  }

  function skipQuestion() {
    if (window.confirm("Skip this question? No score will be saved for it.")) {
      if (index >= questions.length - 1) {
        navigate(`/summary/${sessionId}`);
        return;
      }
      setIndex((i) => i + 1);
    }
  }

  function endSession() {
    if (window.confirm("End this session? You can resume later from History.")) {
      navigate("/sessions");
    }
  }

  function nextQuestion() {
    if (index >= questions.length - 1) {
      navigate(`/summary/${sessionId}`);
      return;
    }
    setIndex((i) => i + 1);
  }

  if (error && !questions.length) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
        <p>{error}</p>
        <Link to="/setup" className="mt-4 inline-block font-semibold text-accent dark:text-blue-400">
          Back to setup
        </Link>
      </div>
    );
  }

  if (!current) {
    return <p className="text-slate-500 dark:text-slate-400">Loading session…</p>;
  }

  const modeBtn =
    "flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-bold transition-all duration-200";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="text-sm font-semibold text-slate-500 transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
        >
          ← Home
        </button>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={skipQuestion}
            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline dark:text-slate-400 dark:hover:text-white"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={endSession}
            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-red-600 hover:text-red-700 dark:text-red-400"
          >
            End session
          </button>
        </div>
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <span>
            Question {index + 1} of {questions.length}
          </span>
          <span className="text-slate-400 dark:text-slate-500">
            {formatInterviewType(meta.interview_type)} · {formatRole(meta.role)}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500 dark:bg-blue-500"
            style={{ width: `${Math.min(100, progressPct)}%` }}
          />
        </div>
      </div>

      <div className="glass-panel p-8 ring-1 ring-slate-200/80 dark:ring-slate-700/80">
        <h2 className="text-center text-xl font-bold leading-snug text-slate-900 sm:text-2xl dark:text-white">
          {current.text}
        </h2>

        <div className="mt-8 flex gap-2 rounded-2xl border border-slate-200 bg-surface p-1 dark:border-slate-700 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={() => {
              setInputMode("record");
              setError(null);
            }}
            className={[
              modeBtn,
              inputMode === "record"
                ? "border-accent bg-white text-accent shadow-sm dark:border-blue-500 dark:bg-slate-800 dark:text-blue-300"
                : "border-transparent bg-transparent text-slate-600 hover:bg-white/80 dark:text-slate-400 dark:hover:bg-slate-800/80",
            ].join(" ")}
          >
            <span aria-hidden>🎙️</span>
            Record answer
          </button>
          <button
            type="button"
            onClick={() => {
              setInputMode("type");
              setError(null);
            }}
            className={[
              modeBtn,
              inputMode === "type"
                ? "border-accent bg-white text-accent shadow-sm dark:border-blue-500 dark:bg-slate-800 dark:text-blue-300"
                : "border-transparent bg-transparent text-slate-600 hover:bg-white/80 dark:text-slate-400 dark:hover:bg-slate-800/80",
            ].join(" ")}
          >
            <span aria-hidden>⌨️</span>
            Type answer
          </button>
        </div>

        <div className="mt-6">
          {inputMode === "record" ? (
            <div className="flex flex-col items-center gap-4">
              {!recording ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={startRecording}
                  className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-sm font-bold text-white shadow-lift transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-10"
                >
                  Start recording
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={stopRecording}
                  className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-red-600 py-3.5 text-sm font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-10"
                >
                  Stop &amp; submit
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                rows={6}
                placeholder="Type your answer here…"
                className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none ring-0 transition placeholder:text-slate-400 focus:border-accent focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
              />
              <button
                type="button"
                disabled={busy}
                onClick={submitTyped}
                className="w-full rounded-xl bg-accent py-3 text-sm font-bold text-white shadow-lift transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
              >
                Submit typed answer
              </button>
            </div>
          )}
        </div>

        {busy ? (
          <div className="mt-6 flex items-center justify-center gap-3 rounded-xl border border-blue-100 bg-accent-soft px-4 py-4 dark:border-blue-900 dark:bg-blue-950/40">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent dark:border-blue-400" />
            <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">{busyLabel || "Working…"}</span>
          </div>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            {error}
          </p>
        ) : null}
      </div>

      {lastFeedback ? (
        <div className="space-y-6">
          <div className="glass-panel p-6 ring-1 ring-blue-500/15">
            <GlassFeedbackCard feedback={lastFeedback} transcript={lastTranscript} enabled />
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={nextQuestion}
              className="rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white shadow-lift transition hover:bg-accent-hover"
            >
              {index >= questions.length - 1 ? "View session summary" : "Next question"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
