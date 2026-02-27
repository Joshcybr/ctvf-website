'use client'

import { JSX, useEffect, useState } from "react"
import { supabase } from "@/app/lib/supabaseClient"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

interface Post {
  id: number
  title: string
  content: string
  created_at: string
  division: string | null
}

const DIVISIONS = ['General', 'Mens Premier', 'Women Premier', 'Men First Division', 'Women First Division', 'Mixed']

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/dashboard/admin_fixtures', label: 'Fixtures' },
  { href: '/admin/dashboard/teams', label: 'Teams' },
  { href: '/admin/dashboard/admin_news', label: 'News' },
  { href: '/admin/settings', label: 'Settings' },
]

const NAV_ICONS: Record<string, JSX.Element> = {
  Dashboard: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Fixtures: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  Teams: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/><path d="M2 21v-4a3 3 0 013-3h8a3 3 0 013 3v4M18 8a3 3 0 100-6 3 3 0 000 6zM21 21v-3a3 3 0 00-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  News: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Settings: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
}

const DIVISION_COLORS: Record<string, { bg: string; color: string }> = {
  'General':            { bg: '#e0e7ff', color: '#3730a3' },
  'Mens Premier':       { bg: '#dbeafe', color: '#1e40af' },
  'Women Premier':      { bg: '#fce7f3', color: '#9d174d' },
  'Men First Division': { bg: '#dcfce7', color: '#166534' },
  'Women First Division':{ bg: '#fef9c3', color: '#854d0e' },
  'Mixed':              { bg: '#f3e8ff', color: '#6b21a8' },
}

export default function AdminNews() {
  const pathname = usePathname()
  const router = useRouter()

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [filterDiv, setFilterDiv] = useState<string>('All')

  const emptyForm = { title: '', content: '', division: 'General' }
  const [form, setForm] = useState(emptyForm)

  async function load() {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setPosts(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function addPost() {
    if (!form.title || !form.content) return alert('Fill in all fields')
    const { error } = await supabase.from('announcements').insert(form)
    if (error) return alert('Failed to post')
    setForm(emptyForm)
    setShowForm(false)
    load()
  }

  async function updatePost(id: number) {
    const post = posts.find(p => p.id === id)
    if (!post) return
    const { error } = await supabase
      .from('announcements')
      .update({ title: post.title, content: post.content, division: post.division })
      .eq('id', id)
    if (error) return alert('Update failed')
    setEditing(null)
    load()
  }

  async function del(id: number) {
    if (!confirm('Delete this post?')) return
    await supabase.from('announcements').delete().eq('id', id)
    load()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const filtered = filterDiv === 'All'
    ? posts
    : posts.filter(p => (p.division ?? 'General') === filterDiv)

  const navItemStyle = (isActive: boolean, isHovered: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '0.875rem',
    padding: '0.875rem 1rem', borderRadius: 10,
    textDecoration: 'none', color: 'white',
    opacity: isActive || isHovered ? 1 : 0.75,
    fontWeight: isActive ? 600 : 500, fontSize: '0.95rem',
    background: isActive ? 'rgba(220,38,38,0.25)' : isHovered ? 'rgba(255,255,255,0.1)' : 'transparent',
    boxShadow: isActive ? '0 4px 12px rgba(220,38,38,0.2)' : 'none',
    transition: 'all 0.15s', fontFamily: "'Inter', sans-serif",
  })

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter,sans-serif', color: '#64748b', fontSize: '1.1rem' }}>
      Loading...
    </div>
  )

  return (
    <div className="shell">

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 40, backdropFilter: 'blur(2px)' }} />
      )}

      {/* Sidebar */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, width: 280, height: '100vh',
        background: 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%)',
        display: 'flex', flexDirection: 'column', zIndex: 50,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(.4,0,.2,1)',
        boxShadow: '4px 0 30px rgba(0,0,0,0.25)',
        fontFamily: "'Inter', sans-serif", boxSizing: 'border-box',
      }}>
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
              <img src="/assets/ctvf_logo.png" alt="CTVF" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>CTVF</div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 1 }}>Admin Panel</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)}
            style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white', fontSize: '1.4rem', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ×
          </button>
        </div>

        <nav style={{ flex: 1, padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto' }}>
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href
            const isHovered = hoveredNav === item.href
            return (
              <Link key={item.href} href={item.href}
                style={navItemStyle(isActive, isHovered)}
                onMouseEnter={() => setHoveredNav(item.href)}
                onMouseLeave={() => setHoveredNav(null)}
                onClick={() => setSidebarOpen(false)}>
                {NAV_ICONS[item.label]}<span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '1.25rem 1rem', borderTop: '1px solid rgba(255,255,255,0.12)', flexShrink: 0 }}>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', width: '100%', padding: '0.875rem 1rem', borderRadius: 10, background: 'rgba(220,38,38,0.2)', border: 'none', color: 'white', fontWeight: 500, fontSize: '0.95rem', cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M13 3h3a2 2 0 012 2v10a2 2 0 01-2 2h-3M7 13l-4-4m0 0l4-4m-4 4h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="page-wrap">

        {/* Topbar */}
        <div className="topbar">
          <button className="burger" onClick={() => setSidebarOpen(true)}>
            <span /><span /><span />
          </button>
          <div className="topbar-title">
            <h1>News &amp; Announcements</h1>
            <p>{posts.length} post{posts.length !== 1 ? 's' : ''} total</p>
          </div>
          <button className="btn-add" onClick={() => setShowForm(!showForm)}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path d="M10 2v16M2 10h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            {showForm ? 'Cancel' : 'New Post'}
          </button>
        </div>

        <div className="content">

          {/* Create form */}
          {showForm && (
            <div className="form-card">
              <h2 className="form-title">Create Announcement</h2>
              <div className="form-grid">
                <div className="fg span-2">
                  <label>Title <span className="req">*</span></label>
                  <input placeholder="Announcement title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="fg">
                  <label>Division</label>
                  <select value={form.division} onChange={e => setForm({ ...form, division: e.target.value })}>
                    {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="fg span-2">
                  <label>Content <span className="req">*</span></label>
                  <textarea placeholder="Write your announcement here..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
                </div>
              </div>
              <button className="btn-submit" onClick={addPost}>Post Announcement</button>
            </div>
          )}

          {/* Division filter tabs */}
          <div className="filter-bar">
            {['All', ...DIVISIONS].map(div => (
              <button
                key={div}
                onClick={() => setFilterDiv(div)}
                className={`filter-btn${filterDiv === div ? ' filter-active' : ''}`}
              >
                {div}
                <span className="filter-count">
                  {div === 'All'
                    ? posts.length
                    : posts.filter(p => (p.division ?? 'General') === div).length}
                </span>
              </button>
            ))}
          </div>

          {/* Posts list */}
          {filtered.length === 0 ? (
            <div className="empty">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" opacity="0.3">
                <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" stroke="#94a3b8" strokeWidth="1.5"/>
              </svg>
              No posts {filterDiv !== 'All' ? `in ${filterDiv}` : 'yet'}.
            </div>
          ) : (
            <div className="posts-list">
              {filtered.map(post => {
                const divLabel = post.division ?? 'General'
                const divColor = DIVISION_COLORS[divLabel] ?? DIVISION_COLORS['General']

                return (
                  <div key={post.id} className="post-card">
                    {editing === post.id ? (
                      /* ── EDIT MODE ── */
                      <div className="edit-body">
                        <div className="form-grid">
                          <div className="fg span-2">
                            <label>Title</label>
                            <input value={post.title}
                              onChange={e => setPosts(posts.map(p => p.id === post.id ? { ...p, title: e.target.value } : p))} />
                          </div>
                          <div className="fg">
                            <label>Division</label>
                            <select value={post.division ?? 'General'}
                              onChange={e => setPosts(posts.map(p => p.id === post.id ? { ...p, division: e.target.value } : p))}>
                              {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>
                          <div className="fg span-2">
                            <label>Content</label>
                            <textarea value={post.content}
                              onChange={e => setPosts(posts.map(p => p.id === post.id ? { ...p, content: e.target.value } : p))} />
                          </div>
                        </div>
                        <div className="row-btns">
                          <button className="b-save" onClick={() => updatePost(post.id)}>Save Changes</button>
                          <button className="b-ghost" onClick={() => { setEditing(null); load() }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      /* ── VIEW MODE ── */
                      <>
                        <div className="post-header">
                          <div className="post-meta">
                            <span className="post-div-badge" style={{ background: divColor.bg, color: divColor.color }}>
                              {divLabel}
                            </span>
                            <span className="post-date">
                              {new Date(post.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                        <h3 className="post-title">{post.title}</h3>
                        <p className="post-content">{post.content}</p>
                        <div className="row-btns">
                          <button className="b-ghost" onClick={() => setEditing(post.id)}>
                            <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" fill="currentColor"/>
                            </svg>
                            Edit
                          </button>
                          <button className="b-del" onClick={() => del(post.id)}>
                            <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
                              <path d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" fill="currentColor"/>
                            </svg>
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .shell { display: flex; min-height: 100vh; background: #f8fafc; font-family: 'Inter', sans-serif; }
        .page-wrap { flex: 1; display: flex; flex-direction: column; min-width: 0; }

        /* Topbar */
        .topbar { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.5rem; background: white; border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 10; }
        .burger { display: flex; flex-direction: column; justify-content: center; gap: 5px; width: 38px; height: 38px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; padding: 0 9px; flex-shrink: 0; }
        .burger span { display: block; height: 2px; background: #475569; border-radius: 2px; }
        .burger:hover span { background: #1e293b; }
        .topbar-title { flex: 1; }
        .topbar-title h1 { font-size: 1.25rem; font-weight: 800; color: #1e293b; }
        .topbar-title p { font-size: 0.8rem; color: #94a3b8; margin-top: 1px; }
        .btn-add { display: flex; align-items: center; gap: 0.4rem; padding: 0.6rem 1.1rem; background: #1e40af; color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer; white-space: nowrap; font-family: 'Inter', sans-serif; transition: background 0.15s; }
        .btn-add:hover { background: #1e3a8a; }

        /* Content */
        .content { padding: 1.25rem 1.5rem; }

        /* Form card */
        .form-card { background: white; border-radius: 12px; padding: 1.25rem; margin-bottom: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border-left: 4px solid #1e40af; }
        .form-title { font-size: 1rem; font-weight: 700; color: #0f172a; margin-bottom: 1rem; }
        .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.875rem; margin-bottom: 1rem; }
        .fg { display: flex; flex-direction: column; gap: 0.35rem; }
        .span-2 { grid-column: 1 / -1; }
        .fg label { font-size: 0.72rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
        .req { color: #ef4444; }
        .fg input, .fg select, .fg textarea { width: 100%; padding: 0.6rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.875rem; font-family: 'Inter', sans-serif; color: #1e293b; background: white; transition: border-color 0.15s; }
        .fg input:focus, .fg select:focus, .fg textarea:focus { outline: none; border-color: #1e40af; box-shadow: 0 0 0 3px rgba(30,64,175,0.08); }
        .fg textarea { min-height: 130px; resize: vertical; }
        .btn-submit { width: 100%; padding: 0.75rem; background: #1e40af; color: white; border: none; border-radius: 8px; font-weight: 700; font-size: 0.9rem; cursor: pointer; font-family: 'Inter', sans-serif; transition: background 0.15s; }
        .btn-submit:hover { background: #1e3a8a; }

        /* Filter bar */
        .filter-bar { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.25rem; padding: 0.875rem 1rem; background: white; border-radius: 10px; border: 1px solid #e2e8f0; }
        .filter-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.875rem; border: 1px solid #e2e8f0; background: #f8fafc; color: #475569; border-radius: 50px; font-size: 0.78rem; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.15s; white-space: nowrap; }
        .filter-btn:hover { border-color: #1e40af; color: #1e40af; background: #eff6ff; }
        .filter-active { background: #1e40af; color: white; border-color: #1e40af; }
        .filter-active:hover { background: #1e3a8a; color: white; border-color: #1e3a8a; }
        .filter-count { font-size: 0.65rem; padding: 0.1rem 0.4rem; background: rgba(0,0,0,0.12); border-radius: 50px; font-weight: 700; }
        .filter-active .filter-count { background: rgba(255,255,255,0.25); }

        /* Posts */
        .posts-list { display: flex; flex-direction: column; gap: 0.875rem; }

        .post-card { background: white; border-radius: 12px; padding: 1.25rem 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border-left: 4px solid #e2e8f0; transition: box-shadow 0.2s, border-color 0.2s; }
        .post-card:hover { box-shadow: 0 4px 14px rgba(0,0,0,0.08); border-left-color: #1e40af; }

        .edit-body { display: flex; flex-direction: column; gap: 0; }

        .post-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.625rem; }
        .post-meta { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
        .post-div-badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.02em; }
        .post-date { font-size: 0.75rem; color: #94a3b8; }
        .post-title { font-size: 1.05rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem; line-height: 1.3; }
        .post-content { font-size: 0.875rem; color: #475569; line-height: 1.65; margin-bottom: 1rem; white-space: pre-wrap; }

        /* Buttons */
        .row-btns { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.25rem; }
        .b-ghost { display: flex; align-items: center; gap: 0.35rem; padding: 0.45rem 0.875rem; background: #f1f5f9; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 7px; font-weight: 600; font-size: 0.8rem; cursor: pointer; font-family: 'Inter', sans-serif; transition: background 0.15s; }
        .b-ghost:hover { background: #e2e8f0; }
        .b-del { display: flex; align-items: center; gap: 0.35rem; padding: 0.45rem 0.875rem; background: #fee2e2; color: #dc2626; border: none; border-radius: 7px; font-weight: 600; font-size: 0.8rem; cursor: pointer; font-family: 'Inter', sans-serif; transition: background 0.15s; }
        .b-del:hover { background: #fecaca; }
        .b-save { display: flex; align-items: center; gap: 0.35rem; padding: 0.45rem 0.875rem; background: #16a34a; color: white; border: none; border-radius: 7px; font-weight: 600; font-size: 0.8rem; cursor: pointer; font-family: 'Inter', sans-serif; transition: background 0.15s; }
        .b-save:hover { background: #15803d; }

        .empty { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 4rem 2rem; color: #94a3b8; font-size: 0.95rem; text-align: center; }

        @media (max-width: 640px) {
          .content { padding: 1rem; }
          .topbar { padding: 0.875rem 1rem; }
          .topbar-title p { display: none; }
          .form-grid { grid-template-columns: 1fr; }
          .span-2 { grid-column: 1; }
        }
      `}</style>
    </div>
  )
}