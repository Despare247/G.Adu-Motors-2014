import AuthForm from '@/components/AuthForm';

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mx-auto mb-8 max-w-md text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
          Welcome Back
        </span>
        <h1 className="mt-2 font-display text-3xl font-extrabold uppercase text-ink-900">
          Log In
        </h1>
      </div>
      <AuthForm mode="login" />
    </main>
  );
}
