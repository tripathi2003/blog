'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { use } from 'react';

interface Post {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: string;
  views: number;
  createdAt: string;
  coverImage?: string;
}

export default function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/posts/${id}`)
      .then((r) => r.json())
      .then((data) => { setPost(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text-secondary)' }}>
      <div>Loading article...</div>
    </div>
  );

  if (!post) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1rem' }}>
      <div style={{ fontSize: '3rem' }}>😕</div>
      <h2 style={{ color: 'var(--text-primary)' }}>Post not found</h2>
      <Link href="/" className="btn-primary">← Back to Home</Link>
    </div>
  );

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      <nav className="navbar">
        <Link href="/" className="navbar-brand">DevBlog</Link>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Link href="/" className="nav-link">← All Articles</Link>
          <Link href="/contact" className="nav-link">Contact</Link>
        </div>
      </nav>

      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 2rem 5rem' }}>
        {/* Header */}
        <div className="animate-fade-in-up" style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span className="badge badge-purple">{post.category}</span>
            {post.tags?.map(tag => <span key={tag} className="badge badge-cyan">{tag}</span>)}
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.2, marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>
            {post.title}
          </h1>
          <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', flexWrap: 'wrap' }}>
            <span>✍️ {post.author}</span>
            <span>📅 {formatDate(post.createdAt)}</span>
            <span>👁️ {post.views} views</span>
          </div>
        </div>

        {/* Cover Image */}
        {post.coverImage ? (
          <img src={post.coverImage} alt={post.title} style={{ width: '100%', borderRadius: '16px', marginBottom: '2.5rem', maxHeight: '400px', objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: '100%',
            height: '250px',
            borderRadius: '16px',
            marginBottom: '2.5rem',
            background: 'linear-gradient(135deg,#7c3aed,#a855f7,#06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '4rem',
          }}>
            {post.category === 'Technology' ? '💻' : post.category === 'Programming' ? '🧑‍💻' : '✍️'}
          </div>
        )}

        {/* Content */}
        <div
          style={{
            color: 'var(--text-secondary)',
            lineHeight: 1.9,
            fontSize: '1.05rem',
            fontFamily: 'Inter, sans-serif',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
          dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }}
        />

        {/* Back button */}
        <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
          <Link href="/" className="btn-secondary">← Back to All Articles</Link>
        </div>
      </article>
    </div>
  );
}
