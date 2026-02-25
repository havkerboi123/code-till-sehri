import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-grid min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:py-28">
        <h1 className="text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl">
          Code till Sehri
        </h1>
        <p className="mt-2 text-lg font-medium text-primary-600">by GDG Live Pakistan</p>
        <p className="mt-8 text-xl font-medium text-slate-600 leading-relaxed">
          ab hujaye faisala!
        </p>
        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/submit"
            className="w-full rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-center font-medium text-slate-800 shadow-sm transition hover:border-primary-200 hover:bg-primary-50/50 hover:text-primary-700 sm:w-auto"
          >
            Submit a project
          </Link>
          <Link
            href="/vote"
            className="w-full rounded-xl bg-primary-600 px-6 py-3.5 text-center font-medium text-white shadow-sm transition hover:bg-primary-700 sm:w-auto"
          >
            Vote on projects
          </Link>
        </div>
      </div>
    </div>
  );
}
