'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        // Successfully logged in
        router.push('/admin/dashboard');
      } else {
        setError(data.error || 'Login failed. Please check your credentials.');
      }
    } catch {
      setError('Connection failed. Please check your internet and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      zIndex: 1,
    }}>
      <div className="card animate-fade-in-up" style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" className="navbar-brand" style={{ display: 'inline-block', fontSize: '2rem', marginBottom: '0.5rem' }}>
            DevBlog
          </Link>
          <div className="badge badge-amber" style={{ display: 'block', margin: '0 auto', width: 'fit-content' }}>
            🔐 Secure Access
          </div>
        </div>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', marginBottom: '0.25rem', textAlign: 'center' }}>
          Welcome back
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center', marginBottom: '2rem', fontFamily: 'Inter, sans-serif' }}>
          Sign in to access your dashboard
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label className="label" htmlFor="username">Username or Email</label>
            <input
              id="username"
              className="input-field"
              placeholder="username / email"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(244,63,94,0.15)',
              border: '1px solid rgba(244,63,94,0.3)',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              color: '#fb7185',
            }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ justifyContent: 'center', padding: '0.85rem', marginTop: '0.5rem' }}>
            {loading ? '⏳ Verifying...' : '🔐 Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', marginBottom: '1rem' }}>
            Don't have an account?{' '}
            <Link href="/admin/signup" style={{ color: 'var(--accent-secondary)', textDecoration: 'none', fontWeight: '600' }}>
              Create one here
            </Link>
          </p>
          <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'none', fontFamily: 'Inter, sans-serif' }}>
            ← Back to Blog
          </Link>
        </div>
      </div>
    </div>
  );
}
