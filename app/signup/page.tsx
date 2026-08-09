import AuthForm from '@/components/AuthForm';

export default function SignupPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mx-auto mb-8 max-w-md text-center">
        <span className="text-xs uppercase tracking-[0.2em] text-accent">Join G.Adu Motors</span>
        <h1 className="mt-2">Create account</h1>
      </div>
      <AuthForm mode="signup" />
    </main>
  );
}
