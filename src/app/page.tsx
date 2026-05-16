'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Post {
  _id: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: string;
  views: number;
  createdAt: string;
  coverImage?: string;
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    fetch('/api/posts')
      .then((r) => r.json())
      .then((data) => {
        setPosts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = ['All', ...Array.from(new Set(posts.map((p) => p.category)))];

  const filtered = posts.filter((p) => {
    const matchCat = category === 'All' || p.category === category;
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const PlaceholderImg = ({ category }: { category: string }) => {
    const colors: Record<string, string> = {
      Technology: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
      Programming: 'linear-gradient(135deg,#f43f5e,#7c3aed)',
      Design: 'linear-gradient(135deg,#f59e0b,#f43f5e)',
      General: 'linear-gradient(135deg,#7c3aed,#a855f7)',
    };
    return (
      <div
        className="post-card-img"
        style={{
          background: colors[category] || colors.General,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
        }}
      >
        {category === 'Technology' ? '💻' : category === 'Programming' ? '🧑‍💻' : category === 'Design' ? '🎨' : '✍️'}
      </div>
    );
  };

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      {/* NAVBAR */}
      <nav className="navbar">
        <Link href="/" className="navbar-brand">DevBlog</Link>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Link href="/" className="nav-link active">Home</Link>
          <Link href="/contact" className="nav-link">Contact</Link>
          <Link href="/admin/login" className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
            SignIn/SignUp
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ textAlign: 'center', padding: '5rem 2rem 4rem', maxWidth: '900px', margin: '0 auto' }}>
        <div className="badge badge-purple" style={{ marginBottom: '1.5rem', fontSize: '0.75rem' }}>
          ✨ Modern Tech Blog
        </div>
        <h1 className="section-title hero-gradient" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1.1, marginBottom: '1.5rem' }}>
          Ideas Worth<br />Reading
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.7, maxWidth: '600px', margin: '0 auto 2.5rem', fontFamily: 'Inter, sans-serif' }}>
          Explore curated articles on technology, programming, design and beyond. Fresh perspectives delivered daily.
        </p>

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto' }}>
          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
          <input
            className="input-field"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem', borderRadius: '999px' }}
          />
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{ padding: '0 2rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cat === category ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.8rem', padding: '0.4rem 1rem', borderRadius: '999px' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* POSTS GRID */}
      <main style={{ padding: '0 2rem 5rem', maxWidth: '1200px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '1.5rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="post-card" style={{ height: '360px' }}>
                <div style={{ height: 200, background: 'rgba(124,58,237,0.1)', animation: 'pulse 1.5s infinite' }} />
                <div className="post-card-body">
                  <div style={{ height: 16, background: 'rgba(255,255,255,0.06)', borderRadius: 8, marginBottom: 12 }} />
                  <div style={{ height: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 8, width: '70%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <p style={{ fontFamily: 'Inter, sans-serif' }}>No articles found. Check back later!</p>
          </div>
        ) : (
          <div className="posts-grid">
            {filtered.map((post, i) => (
              <Link
                key={post._id}
                href={`/blog/${post._id}`}
                className="post-card animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}
              >
                {post.coverImage ? (
                  <img src={post.coverImage} alt={post.title} className="post-card-img" />
                ) : (
                  <PlaceholderImg category={post.category} />
                )}
                <div className="post-card-body">
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-purple">{post.category}</span>
                    {post.tags?.slice(0, 2).map(tag => (
                      <span key={tag} className="badge badge-cyan">{tag}</span>
                    ))}
                  </div>
                  <h2 className="post-card-title">{post.title}</h2>
                  <p className="post-card-excerpt">{post.excerpt}</p>
                  <div className="post-card-meta">
                    <span>✍️ {post.author}</span>
                    <span>•</span>
                    <span>📅 {formatDate(post.createdAt)}</span>
                    <span>•</span>
                    <span>👁️ {post.views}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif' }}>
        <p>© {new Date().getFullYear()} DevBlog. Built with ❤️ using Next.js & MongoDB.</p>
        <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
          <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
          <Link href="/contact" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Contact</Link>
          <Link href="/admin/login" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Admin</Link>
        </div>
      </footer>
    </div>
  );
}
