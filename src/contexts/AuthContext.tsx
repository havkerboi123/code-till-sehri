'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  firebaseReady: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    // Subscribe to auth state first so we don't miss the user when getRedirectResult completes
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u ?? null);
      setLoading(false);
    });
    // Persist session so user stays logged in after redirect
    setPersistence(auth, browserLocalPersistence).then(() => {
      // Process redirect result when returning from Google; auth state updates and listener above will fire
      return getRedirectResult(auth);
    }).catch((err) => {
      const msg = err?.message ?? String(err);
      if (/unauthorized|auth\/unauthorized-domain|authorized.?domains/i.test(msg)) {
        setAuthError(
          'This domain is not allowed. Add it in Firebase Console → Authentication → Settings → Authorized domains.'
        );
      }
    });
    return () => {
      unsub();
    };
  }, []);

  const signInWithGoogle = async () => {
    if (!auth) return;
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    try {
      // Prefer popup so user stays on page and stays logged in; fall back to redirect if popup is blocked
      await signInWithPopup(auth, provider);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const isDomain =
        /unauthorized.?domain|auth\/unauthorized-domain|authorized.?domains/i.test(msg);
      const isPopupBlocked =
        /popup|popup-closed|popup-blocked|cancelled|auth\/cancelled-popup-request/i.test(msg);
      if (isPopupBlocked) {
        try {
          await signInWithRedirect(auth, provider);
        } catch (redirectErr) {
          const redirectMsg = redirectErr instanceof Error ? redirectErr.message : String(redirectErr);
          if (/unauthorized|authorized.?domains/i.test(redirectMsg)) {
            setAuthError(
              'This domain is not allowed. Add it in Firebase Console → Authentication → Settings → Authorized domains.'
            );
          } else {
            setAuthError(`Sign-in failed: ${redirectMsg}`);
          }
        }
      } else if (isDomain) {
        setAuthError(
          'This domain is not allowed. Add it in Firebase Console → Authentication → Settings → Authorized domains.'
        );
      } else {
        setAuthError(`Sign-in failed: ${msg}`);
      }
    }
  };

  const signOut = async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        firebaseReady: !!auth,
        authError,
        clearAuthError: () => setAuthError(null),
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
