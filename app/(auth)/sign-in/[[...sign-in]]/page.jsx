import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function Page() {
  return (
    <section className="page-shell min-h-screen bg-transparent">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-12">
        <section className="relative flex h-40 items-end overflow-hidden bg-gray-900 lg:col-span-5 lg:h-full xl:col-span-6">
          <img
            alt=""
            src="https://images.unsplash.com/photo-1617195737496-bc30194e3a19?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-indigo-950/70 to-cyan-900/60" />

          <div className="hidden lg:relative lg:block lg:p-12">
            <Link className="block text-white" href="/">
              <span className="sr-only">Home</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shapes"><path d="M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z"/><rect x="3" y="14" width="7" height="7" rx="1"/><circle cx="17.5" cy="17.5" r="3.5"/></svg>
            </Link>

            <h2 className="mt-6 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
              Welcome to PrepForge
            </h2>

            <p className="mt-4 max-w-md leading-relaxed text-white/90">
              Practice with confidence, speak more clearly, and walk into interviews better prepared.
            </p>
          </div>
        </section>

        <main className="flex items-center justify-center px-8 py-10 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6">
          <div className="w-full max-w-xl lg:max-w-3xl">
            <div className="relative -mt-16 block lg:hidden">
              <Link className="inline-flex size-16 items-center justify-center rounded-full bg-white text-blue-600 shadow-lg sm:size-20" href="/">
                <span className="sr-only">Home</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shapes"><path d="M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z"/><rect x="3" y="14" width="7" height="7" rx="1"/><circle cx="17.5" cy="17.5" r="3.5"/></svg>
              </Link>

              <h1 className="mt-4 text-center text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
                Welcome back to PrepForge
              </h1>

              <p className="mb-4 mt-4 text-center leading-relaxed text-gray-500">
                Sign in to continue your interview practice.
              </p>
            </div>

            <div className="surface-panel mx-auto w-full max-w-md p-5 sm:p-7">
              <SignIn />
            </div>
          </div>
        </main>
      </div>
    </section>
  )
}
