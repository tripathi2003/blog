'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Post {
  _id: string;
  title: string;
  category: string;
  published: boolean;
  views: number;
  createdAt: string;
  author: string;
}

interface Contact {
  _id: string;
  name: string;
  email: string;
  subject: string;
  status: 'new' | 'read' | 'replied';
  createdAt: string;
}

interface PostForm {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string;
  author: string;
  published: boolean;
  coverImage: string;
}

const EMPTY_FORM: PostForm = {
  title: '', excerpt: '', content: '', category: 'Technology',
  tags: '', author: 'Admin', published: false, coverImage: '',
};

const fetchDashboardData = async () => {
  const [pRes, cRes] = await Promise.all([
    fetch('/api/posts?all=true'),
    fetch('/api/contact'),
  ]);

  if (pRes.status === 401 || cRes.status === 401) {
    return { unauthorized: true, posts: [], contacts: [] };
  }

  const pData = await pRes.json();
  const cData = await cRes.json();

  return {
    unauthorized: false,
    posts: Array.isArray(pData) ? pData : [],
    contacts: Array.isArray(cData) ? cData : [],
  };
};

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'contacts' | 'new-post'>('overview');
  const [posts, setPosts] = useState<Post[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [form, setForm] = useState<PostForm>(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { unauthorized, posts: nextPosts, contacts: nextContacts } = await fetchDashboardData();
      if (unauthorized) { router.push('/admin/login'); return; }
      setPosts(nextPosts);
      setContacts(nextContacts);
    } catch { showToast('Failed to load data', 'error'); }
    setLoading(false);
  }, [router, showToast]);

  useEffect(() => {
    let isActive = true;

    const loadInitialData = async () => {
      try {
        const { unauthorized, posts: nextPosts, contacts: nextContacts } = await fetchDashboardData();
        if (!isActive) return;
        if (unauthorized) { router.push('/admin/login'); return; }
        setPosts(nextPosts);
        setContacts(nextContacts);
      } catch {
        if (isActive) showToast('Failed to load data', 'error');
      }
      if (isActive) setLoading(false);
    };

    void loadInitialData();

    return () => { isActive = false; };
  }, [router, showToast]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
    const url = editId ? `/api/posts/${editId}` : '/api/posts';
    const method = editId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        showToast(editId ? 'Post updated!' : 'Post created!');
        setForm(EMPTY_FORM);
        setEditId(null);
        setActiveTab('posts');
        loadData();
      } else {
        const d = await res.json();
        showToast(d.error || 'Failed to save', 'error');
      }
    } catch { showToast('Network error', 'error'); }
    setSaving(false);
  };

  const handleDeletePost = async (id: string) => {
    const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    if (res.ok) { showToast('Post deleted'); loadData(); }
    setDeleteConfirm(null);
  };

  const handleEditPost = (post: Post) => {
    setEditId(post._id);
    setForm({
      title: post.title,
      excerpt: '',
      content: '',
      category: post.category,
      tags: '',
      author: post.author,
      published: post.published,
      coverImage: '',
    });
    // Fetch full post data
    fetch(`/api/posts/${post._id}`).then(r => r.json()).then(data => {
      setForm({
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        category: data.category,
        tags: (data.tags || []).join(', '),
        author: data.author,
        published: data.published,
        coverImage: data.coverImage || '',
      });
    });
    setActiveTab('new-post');
  };

  const handleContactStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/contact/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) { showToast('Status updated'); loadData(); }
  };

  const handleDeleteContact = async (id: string) => {
    const res = await fetch(`/api/contact/${id}`, { method: 'DELETE' });
    if (res.ok) { showToast('Contact deleted'); loadData(); }
    setDeleteConfirm(null);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.published).length,
    draft: posts.filter(p => !p.published).length,
    views: posts.reduce((a, p) => a + p.views, 0),
    newContacts: contacts.filter(c => c.status === 'new').length,
  };

  const TABS = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'posts', label: 'Posts', icon: '📝' },
    { id: 'contacts', label: `Messages ${stats.newContacts > 0 ? `(${stats.newContacts})` : ''}`, icon: '📬' },
    { id: 'new-post', label: editId ? 'Edit Post' : 'New Post', icon: '✏️' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/" className="navbar-brand" style={{ fontSize: '1.3rem' }}>DevBlog</Link>
        </div>

        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => { setActiveTab(tab.id as typeof activeTab); if (tab.id !== 'new-post') { setEditId(null); setForm(EMPTY_FORM); } }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}

        <div style={{ marginTop: 'auto' }}>
          <Link href="/" className="sidebar-item">
            <span>🌐</span><span>View Blog</span>
          </Link>
          <button className="sidebar-item" onClick={handleLogout} style={{ width: '100%', color: '#f87171' }}>
            <span>🚪</span><span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="admin-content">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem' }}>
              {TABS.find(t => t.id === activeTab)?.icon} {TABS.find(t => t.id === activeTab)?.label}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={() => { setEditId(null); setForm(EMPTY_FORM); setActiveTab('new-post'); }}
          >
            ✏️ New Post
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading...</div>
        ) : (
          <>
            {/* ===== OVERVIEW ===== */}
            {activeTab === 'overview' && (
              <div className="animate-fade-in">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  {[
                    { icon: '📝', label: 'Total Posts', value: stats.total, color: 'rgba(124,58,237,0.2)', iconBg: '#7c3aed' },
                    { icon: '✅', label: 'Published', value: stats.published, color: 'rgba(34,197,94,0.15)', iconBg: '#22c55e' },
                    { icon: '📄', label: 'Drafts', value: stats.draft, color: 'rgba(245,158,11,0.15)', iconBg: '#f59e0b' },
                    { icon: '👁️', label: 'Total Views', value: stats.views.toLocaleString(), color: 'rgba(6,182,212,0.15)', iconBg: '#06b6d4' },
                    { icon: '📬', label: 'New Messages', value: stats.newContacts, color: 'rgba(244,63,94,0.15)', iconBg: '#f43f5e' },
                  ].map(stat => (
                    <div key={stat.label} className="stat-card" style={{ background: stat.color }}>
                      <div className="stat-icon" style={{ background: `${stat.iconBg}22`, color: stat.iconBg }}>
                        {stat.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{stat.label}</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>{stat.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  {/* Recent Posts */}
                  <div className="card">
                    <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontFamily: "'Playfair Display', serif" }}>📝 Recent Posts</h3>
                    {posts.slice(0, 5).map(p => (
                      <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{p.title}</span>
                        <span className={`badge ${p.published ? 'badge-green' : 'badge-amber'}`} style={{ marginLeft: '0.5rem', flexShrink: 0 }}>
                          {p.published ? 'Live' : 'Draft'}
                        </span>
                      </div>
                    ))}
                    {posts.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>No posts yet.</p>}
                  </div>
                  {/* Recent Messages */}
                  <div className="card">
                    <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontFamily: "'Playfair Display', serif" }}>📬 Recent Messages</h3>
                    {contacts.slice(0, 5).map(c => (
                      <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.85rem' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{c.name}</span>
                          <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem', fontSize: '0.75rem' }}>{c.subject}</span>
                        </div>
                        <span className={`badge ${c.status === 'new' ? 'badge-rose' : c.status === 'read' ? 'badge-amber' : 'badge-green'}`} style={{ marginLeft: '0.5rem', flexShrink: 0 }}>
                          {c.status}
                        </span>
                      </div>
                    ))}
                    {contacts.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>No messages yet.</p>}
                  </div>
                </div>
              </div>
            )}

            {/* ===== POSTS ===== */}
            {activeTab === 'posts' && (
              <div className="card animate-fade-in" style={{ overflow: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Views</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map(post => (
                      <tr key={post._id}>
                        <td style={{ color: 'var(--text-primary)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {post.title}
                        </td>
                        <td><span className="badge badge-purple">{post.category}</span></td>
                        <td>
                          <span className={`badge ${post.published ? 'badge-green' : 'badge-amber'}`}>
                            {post.published ? '✅ Published' : '📄 Draft'}
                          </span>
                        </td>
                        <td>👁️ {post.views}</td>
                        <td>{formatDate(post.createdAt)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => handleEditPost(post)} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>Edit</button>
                            <Link href={`/blog/${post._id}`} target="_blank" className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>View</Link>
                            <button onClick={() => setDeleteConfirm(post._id)} className="btn-danger" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {posts.length === 0 && (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No posts yet. Create your first post!</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ===== CONTACTS ===== */}
            {activeTab === 'contacts' && (
              <div className="card animate-fade-in" style={{ overflow: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Subject</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map(c => (
                      <tr key={c._id}>
                        <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{c.name}</td>
                        <td style={{ color: 'var(--accent-secondary)' }}>{c.email}</td>
                        <td>{(c as { phone?: string }).phone || '—'}</td>
                        <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.subject}</td>
                        <td>
                          <select
                            value={c.status}
                            onChange={(e) => handleContactStatus(c._id, e.target.value)}
                            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.25rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}
                          >
                            <option value="new">🔴 New</option>
                            <option value="read">🟡 Read</option>
                            <option value="replied">🟢 Replied</option>
                          </select>
                        </td>
                        <td>{formatDate(c.createdAt)}</td>
                        <td>
                          <button onClick={() => setDeleteConfirm(`contact-${c._id}`)} className="btn-danger" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {contacts.length === 0 && (
                      <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No messages yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ===== NEW / EDIT POST ===== */}
            {activeTab === 'new-post' && (
              <form onSubmit={handleSavePost} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label className="label">Post Title *</label>
                    <input className="input-field" placeholder="Enter post title..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required style={{ fontSize: '1.1rem' }} />
                  </div>
                  <div>
                    <label className="label">Category</label>
                    <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                      {['Technology', 'Programming', 'Design', 'General', 'Tutorial', 'News'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Author</label>
                    <input className="input-field" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Tags (comma separated)</label>
                    <input className="input-field" placeholder="react, javascript, web" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Cover Image URL</label>
                    <input className="input-field" placeholder="https://..." value={form.coverImage} onChange={e => setForm({ ...form, coverImage: e.target.value })} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label className="label">Excerpt (Short Description) *</label>
                    <textarea className="input-field" placeholder="Brief description of the post..." value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} rows={3} required />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label className="label">Content *</label>
                    <textarea className="input-field" placeholder="Write your post content here..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={14} required style={{ fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: 1.6 }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                      <div
                        onClick={() => setForm({ ...form, published: !form.published })}
                        style={{
                          width: 48, height: 26, borderRadius: 999,
                          background: form.published ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                          position: 'relative', transition: 'all 0.3s', cursor: 'pointer',
                        }}
                      >
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%', background: 'white',
                          position: 'absolute', top: 3, left: form.published ? 25 : 3, transition: 'all 0.3s',
                        }} />
                      </div>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {form.published ? '✅ Publish immediately' : '📄 Save as draft'}
                      </span>
                    </label>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn-primary" disabled={saving} style={{ padding: '0.85rem 2rem' }}>
                    {saving ? '⏳ Saving...' : editId ? '💾 Update Post' : '🚀 Publish Post'}
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => { setForm(EMPTY_FORM); setEditId(null); setActiveTab('posts'); }}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </main>

      {/* DELETE CONFIRM MODAL */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Confirm Delete</h3>
            <p style={{ color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', marginBottom: '2rem', fontSize: '0.9rem' }}>
              This action cannot be undone. Are you sure?
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button
                className="btn-danger"
                onClick={() => {
                  if (deleteConfirm.startsWith('contact-')) handleDeleteContact(deleteConfirm.replace('contact-', ''));
                  else handleDeletePost(deleteConfirm);
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}
    </div>
  );
}
