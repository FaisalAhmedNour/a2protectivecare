'use client';
import { useState } from 'react';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { useRouter } from 'next/navigation';
export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError('');
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.get('email'), password: data.get('password') }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(result.error || 'Unable to sign in.');
      } else {
        router.push('/admin/');
      }
    } catch {
      setError('Unable to sign in. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }
  return <main className="admin-login"><div className="admin-login-card"><span className="admin-kicker"><LockKeyhole size={16} /> A2 Protective Care</span><h1>Admin sign in</h1><p>Manage catalog content, inquiries, and gallery media.</p><form onSubmit={submit}><label>Email<input name="email" type="email" autoComplete="username" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label>{error && <p className="admin-error" role="alert">{error}</p>}<button className="button button-primary" disabled={loading}>{loading ? 'Signing in…' : <>Sign in <ArrowRight size={18} /></>}</button></form><small>Use the environment-seeded administrator account.</small></div></main>;
}
