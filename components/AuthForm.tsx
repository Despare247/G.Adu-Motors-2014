'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertTriangle, Mail, Lock } from 'lucide-react';
import { supabase } from '@/utils/supabaseClient';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signupDone, setSignupDone] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        setSignupDone(true);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (signupDone) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-gold-300 bg-gold-50 p-6 text-center">
        <p className="font-semibold text-gold-800">Account created!</p>
        <p className="mt-2 text-sm text-ink-700">
          Check <strong>{email}</strong> to confirm your address, then{' '}
          <Link href="/login" className="underline">
            log in
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500">
          Email
        </label>
        <div className="flex items-center rounded-lg border border-ink-200 bg-white px-3">
          <Mail className="h-4 w-4 text-ink-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-transparent px-3 py-2.5 text-sm text-ink-900 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500">
          Password
        </label>
        <div className="flex items-center rounded-lg border border-ink-200 bg-white px-3">
          <Lock className="h-4 w-4 text-ink-400" />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-transparent px-3 py-2.5 text-sm text-ink-900 outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-danger-500/20 bg-danger-500/5 p-3 text-xs font-medium text-danger-600">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold-500 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-gold-600 disabled:opacity-60 cursor-pointer"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {mode === 'login' ? 'Log In' : 'Create Account'}
      </button>

      <p className="text-center text-sm text-ink-500">
        {mode === 'login' ? (
          <>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-gold-600 hover:underline">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-gold-600 hover:underline">
              Log in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
