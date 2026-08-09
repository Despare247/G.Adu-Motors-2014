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
      <div className="mx-auto max-w-md border-l-2 border-accent bg-accent-100 p-6 text-center">
        <p className="font-bold text-accent-800">Account created!</p>
        <p className="mt-2 text-sm text-ink-700">
          Check <strong>{email}</strong> to confirm your address, then{' '}
          <Link href="/login" className="underline">log in</Link>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4">
      <div className="field">
        <label>Email</label>
        <div className="flex items-center gap-2 border border-[color:var(--color-divider)] bg-panel px-2">
          <Mail className="h-4 w-4 shrink-0 text-ink-500" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input border-0 bg-transparent px-1"
          />
        </div>
      </div>

      <div className="field">
        <label>Password</label>
        <div className="flex items-center gap-2 border border-[color:var(--color-divider)] bg-panel px-2">
          <Lock className="h-4 w-4 shrink-0 text-ink-500" />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="input border-0 bg-transparent px-1"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 border-l-2 border-danger-500 bg-[color:color-mix(in_srgb,var(--color-danger-500)_8%,transparent)] p-3 text-xs font-medium text-danger-600">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <button type="submit" disabled={loading} className="btn btn-primary btn-block justify-center">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {mode === 'login' ? 'Log in' : 'Create account'}
      </button>

      <p className="text-center text-sm text-ink-600">
        {mode === 'login' ? (
          <>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-accent hover:underline">Sign up</Link>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-accent hover:underline">Log in</Link>
          </>
        )}
      </p>
    </form>
  );
}
