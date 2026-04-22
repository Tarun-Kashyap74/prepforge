import Header from "./dashboard/_components/Header";
import Link from "next/link";

export default function Home() {
  return (
    <div className="page-shell min-h-screen">
      <Header />
      <section className="page-frame flex flex-col gap-12 pb-20 pt-10 lg:pt-14">
        <div className="grid items-center gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="glass-card interactive-card relative overflow-hidden p-8 sm:p-10 lg:p-12">
            <div className="hero-orb left-[-58px] top-[-42px] h-36 w-36 bg-indigo-400/35" />
            <div className="hero-orb right-[-24px] top-20 h-28 w-28 bg-cyan-300/35 animate-pulse-glow" />
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-300" />
            <span className="eyebrow">
              AI Mock Interviews
            </span>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-[3.65rem]">
              A cleaner way to practice interviews and actually improve.
            </h1>
            <p className="mt-5 max-w-2xl text-[16px] leading-8 text-slate-600 sm:text-lg">
              Generate role-based mock interviews, answer them with your voice, and review sharper feedback in a layout that feels simple and guided.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard" className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(59,130,246,0.28)] transition hover:-translate-y-0.5">
                Start Free Interview
              </Link>
              <Link href="/sign-in" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50">
                Sign In
              </Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3 stagger-in">
              <div className="metric-tile interactive-card">
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Role-based</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Tailored prompts for the job you want.</p>
              </div>
              <div className="metric-tile interactive-card">
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Voice-first</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Practice spoken answers, not just typed notes.</p>
              </div>
              <div className="metric-tile interactive-card">
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Actionable</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">See your answer, a better answer, and feedback.</p>
              </div>
            </div>
          </div>

          <div className="surface-panel interactive-card p-6 sm:p-8">
            <div className="animate-float-gentle rounded-[28px] bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.18),transparent_28%),linear-gradient(135deg,#0f172a,#172554_48%,#0f766e)] p-7 text-white shadow-2xl shadow-slate-300/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-cyan-200">Interview Preview</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Frontend Developer</h2>
                </div>
                <div className="rounded-full bg-white/10 px-3 py-1 text-xs text-cyan-100">Live Practice</div>
              </div>
              <div className="mt-6 rounded-3xl bg-white/5 p-5 ring-1 ring-white/10">
                <p className="text-sm text-slate-300">Question 1</p>
                <p className="mt-3 text-lg font-medium text-white">
                  Tell me about a project where you improved performance or usability for end users.
                </p>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-cyan-500/10 p-4 ring-1 ring-cyan-300/20">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Response</p>
                  <p className="mt-2 text-sm text-slate-200">Record your spoken answer with mic and camera enabled.</p>
                </div>
                <div className="rounded-2xl bg-emerald-500/10 p-4 ring-1 ring-emerald-300/20">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Feedback</p>
                  <p className="mt-2 text-sm text-slate-200">See your answer, rating, and a stronger sample answer.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3 stagger-in">
          <div className="glass-card interactive-card p-6">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">01</span>
            <h3 className="mt-4 text-2xl font-semibold">Create a realistic mock interview</h3>
            <p className="mt-3 section-copy">Add the role, stack, and experience level. PrepForge prepares a focused interview set instantly.</p>
          </div>
          <div className="glass-card interactive-card p-6">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">02</span>
            <h3 className="mt-4 text-2xl font-semibold">Speak your answer naturally</h3>
            <p className="mt-3 section-copy">Practice like a real session with your voice, camera preview, and a clear question-by-question flow.</p>
          </div>
          <div className="glass-card interactive-card p-6">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">03</span>
            <h3 className="mt-4 text-2xl font-semibold">Review and improve quickly</h3>
            <p className="mt-3 section-copy">See your answer, a stronger answer, and direct guidance so the next attempt feels better.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
