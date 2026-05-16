'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setErrMsg(data.error || 'Something went wrong');
        setStatus('error');
      }
    } catch {
      setErrMsg('Network error. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      {/* NAVBAR */}
      <nav className="navbar">
        <Link href="/" className="navbar-brand">DevBlog</Link>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/contact" className="nav-link active">Contact</Link>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '4rem 2rem 6rem', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '3rem', alignItems: 'start' }}>
        
        {/* LEFT: Info */}
        <div className="animate-fade-in-up">
          <div className="badge badge-purple" style={{ marginBottom: '1rem' }}>📬 Get in Touch</div>
          <h1 className="section-title" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '1rem' }}>
            We&apos;d love to<br />
            <span className="hero-gradient">hear from you</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif', lineHeight: 1.8, marginBottom: '2.5rem' }}>
            Have a question, feedback, or just want to say hello? Fill out the form and we&apos;ll get back to you as soon as possible.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              { icon: '📧', label: 'Email', value: 'hello@devblog.com' },
              { icon: '💬', label: 'Response Time', value: 'Within 24 hours' },
              { icon: '🌍', label: 'Location', value: 'India' },
            ].map(item => (
              <div key={item.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
                <div style={{ fontSize: '1.75rem' }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>{item.label}</div>
                  <div style={{ color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Form */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
          {status === 'success' ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Message Sent!</h3>
              <p style={{ color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif', marginBottom: '2rem' }}>
                Thanks for reaching out. We&apos;ll get back to you soon.
              </p>
              <button onClick={() => setStatus('idle')} className="btn-primary">Send Another Message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', marginBottom: '0.5rem' }}>Send a Message</h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="label" htmlFor="name">Full Name *</label>
                  <input id="name" name="name" className="input-field" placeholder="John Doe" value={form.name} onChange={handleChange} required />
                </div>
                <div>
                  <label className="label" htmlFor="email">Email *</label>
                  <input id="email" name="email" type="email" className="input-field" placeholder="john@example.com" value={form.email} onChange={handleChange} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="label" htmlFor="phone">Phone (Optional)</label>
                  <input id="phone" name="phone" type="tel" className="input-field" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} />
                </div>
                <div>
                  <label className="label" htmlFor="subject">Subject *</label>
                  <select id="subject" name="subject" className="input-field" value={form.subject} onChange={handleChange} required style={{ cursor: 'pointer' }}>
                    <option value="">Select a subject</option>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Guest Post">Guest Post Request</option>
                    <option value="Collaboration">Collaboration</option>
                    <option value="Feedback">Feedback</option>
                    <option value="Bug Report">Bug Report</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label" htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  className="input-field"
                  placeholder="Write your message here..."
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  style={{ resize: 'vertical', minHeight: '140px' }}
                />
              </div>

              {status === 'error' && (
                <div className="toast-error" style={{ padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.875rem' }}>
                  ⚠️ {errMsg}
                </div>
              )}

              <button type="submit" className="btn-primary" disabled={status === 'loading'} style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}>
                {status === 'loading' ? '⏳ Sending...' : '🚀 Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: '1fr 1.5fr'"] { grid-template-columns: 1fr !important; }
          div[style*="gridTemplateColumns: '1fr 1fr'"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
