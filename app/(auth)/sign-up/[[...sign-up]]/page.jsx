import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function Page() {
  return (
    <section className="page-shell flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
            Back to home
          </Link>
          <h1 className="mt-6 text-3xl font-semibold leading-tight">Create your PrepForge account</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">Start practicing interviews with AI-generated questions, voice recording, and feedback.</p>
        </div>
        <div className="surface-panel p-5 sm:p-7">
          <SignUp />
        </div>
      </div>
    </section>
  );
}
