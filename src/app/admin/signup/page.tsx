'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/login');
        }, 2000);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch {
      setError('Network error. Please try again.');
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
          <div className="badge badge-purple" style={{ display: 'block', margin: '0 auto', width: 'fit-content' }}>
            ✨ Create Account
          </div>
        </div>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', marginBottom: '0.25rem', textAlign: 'center' }}>
          Join the community
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center', marginBottom: '2rem', fontFamily: 'Inter, sans-serif' }}>
          Create your account to start writing
        </p>

        {success ? (
          <div className="animate-fade-in" style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ fontSize: '1.25rem', color: '#4ade80', marginBottom: '0.5rem' }}>Registration Successful!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label className="label" htmlFor="username">Username</label>
              <input
                id="username"
                className="input-field"
                placeholder="johndoe"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
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
              {loading ? '⏳ Creating account...' : '🚀 Sign Up'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>
            Already have an account?{' '}
            <Link href="/admin/login" style={{ color: 'var(--accent-secondary)', textDecoration: 'none', fontWeight: '600' }}>
              Login here
            </Link>
          </p>
          <div style={{ marginTop: '1rem' }}>
            <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'none', fontFamily: 'Inter, sans-serif' }}>
              ← Back to Blog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
