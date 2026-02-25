'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export function Nav() {
  const { user, loading, firebaseReady, authError, clearAuthError, signInWithGoogle, signOut } = useAuth();

  return (
    <div>
      {authError && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-800">
          {authError}
          <button
            type="button"
            onClick={clearAuthError}
            className="ml-2 underline focus:outline-none"
          >
            Dismiss
          </button>
        </div>
      )}
      <nav className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="hover:opacity-90">
            <span className="text-base font-semibold tracking-tight text-slate-800">
              Vibe code till Sheri
              <span className="block text-xs font-normal text-slate-500">by GDG Live Pakistan</span>
            </span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/submit"
            className="text-sm font-medium text-slate-600 transition hover:text-primary-600"
          >
            Submit
          </Link>
          <Link
            href="/vote"
            className="text-sm font-medium text-slate-600 transition hover:text-primary-600"
          >
            Vote
          </Link>
          {!firebaseReady ? (
            <span
              className="text-xs text-amber-600"
              title="Add Firebase config to .env.local"
            >
              Firebase not configured
            </span>
          ) : loading ? (
            <span className="h-8 w-16 animate-pulse rounded-md bg-slate-100" aria-hidden />
          ) : user ? (
            <>
              <span
                className="max-w-[100px] truncate text-xs text-slate-500 sm:max-w-[140px]"
                title={user.email ?? ''}
              >
                {user.displayName ?? user.email}
              </span>
              <button
                type="button"
                onClick={() => signOut()}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => signInWithGoogle()}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700"
            >
              Sign in with Google
            </button>
          )}
          </div>
        </div>
      </nav>
    </div>
  );
}
