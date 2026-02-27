'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/app/lib/supabaseClient"
import Link from "next/link"

interface Post {
  id: number
  title: string
  content: string
  created_at: string
}

export default function NewsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  async function loadPosts() {
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false })
    if (data) setPosts(data)
    setLoading(false)
  }

  useEffect(() => { loadPosts() }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-ZA', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  function readTime(content: string) {
    const words = content.trim().split(/\s+/).length
    return `${Math.max(1, Math.ceil(words / 200))} min read`
  }

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div style={{
          width: 48, height: 48,
          border: '3px solid rgba(220,38,38,0.3)',
          borderTop: '3px solid #dc2626',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }} />
        <p style={{ fontFamily: 'Archivo, sans-serif', opacity: 0.7 }}>Loading news...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div className="page">

      {/* Navbar */}
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <Link href="/" className="logo">
            <div className="logo-badge">
              <div className="logo-icon">
                <img src="/assets/ctvf_logo.PNG" alt="CTVF Logo" />
              </div>
              <div className="logo-text-wrapper">
                <span className="logo-text">CTVF</span>
                <span className="logo-subtitle">Cape Town Volleyball</span>
              </div>
            </div>
          </Link>

          <nav className="nav-links">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/news" className="nav-link active">News</Link>
            <Link href="/fixtures" className="nav-link">Fixtures</Link>
            <Link href="/log" className="nav-link">Logs</Link>
            <Link href="/admin/login" className="nav-link admin-link">
              <span>Admin</span>
            </Link>
          </nav>

          <button
            className={`menu-toggle ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <nav className="mobile-nav">
          <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/news" onClick={() => setMenuOpen(false)}>News</Link>
          <Link href="/fixtures" onClick={() => setMenuOpen(false)}>Fixtures</Link>
          <Link href="/log" onClick={() => setMenuOpen(false)}>Logs</Link>
          <Link href="/admin/login" onClick={() => setMenuOpen(false)} className="admin">Admin Login</Link>
        </nav>
      </div>

      {/* Hero */}
      <div className="hero-section">
        <div className="hero-background" />
        <div className="hero-overlay" />
        <div className="grain-overlay" />
        <div className="hero-decoration">
          <div className="decoration-circle circle-1" />
          <div className="decoration-circle circle-2" />
          <div className="decoration-line line-1" />
          <div className="decoration-line line-2" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">2026 SEASON</div>
          <h1 className="hero-title">
            <span className="title-line">League</span>
            <span className="title-line gradient-text">News</span>
          </h1>
          <p className="hero-description">
            Announcements, updates and news from the Cape Town Volleyball Federation.
          </p>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">{posts.length}</div>
              <div className="stat-label">Notices</div>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <div className="stat-number">{posts.filter(p => {
                const d = new Date(p.created_at)
                const now = new Date()
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
              }).length}</div>
              <div className="stat-label">This Month</div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <main className="main">
        {posts.length === 0 ? (
          <div className="empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" opacity="0.4">
              <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" stroke="white" strokeWidth="1.5"/>
              <path d="M8 10h8M8 14h5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p>No announcements yet.</p>
            <p className="empty-sub">Check back soon for the latest news.</p>
          </div>
        ) : (
          <div className="posts-grid">
            {posts.map((post, idx) => (
              <div
                key={post.id}
                className={`card ${idx === 0 ? 'card-featured' : ''}`}
                style={{ animationDelay: `${idx * 0.06}s` }}
              >
                <div className="card-header">
                  {idx === 0 && (
                    <span className="featured-tag">
                      <span className="featured-dot" />
                      LATEST
                    </span>
                  )}
                  <span className="card-date">{formatDate(post.created_at)}</span>
                </div>
                <h2 className="card-title">{post.title}</h2>
                <p className="card-content">{post.content}</p>
                <div className="card-footer">
                  <div className="footer-info">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    {readTime(post.content)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;900&family=Space+Mono:wght@400;700&display=swap');

        .page {
          min-height: 100vh;
          background: #1e3a8a;
          font-family: 'Archivo', sans-serif;
        }

        /* ── NAVBAR ── */
        .navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          padding: 1.5rem 0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .navbar.scrolled {
          background: rgba(30, 58, 138, 0.95);
          backdrop-filter: blur(20px);
          padding: 1rem 0;
          box-shadow: 0 4px 30px rgba(0,0,0,0.3);
          border-bottom: 2px solid rgba(220,38,38,0.3);
        }
        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo { text-decoration: none; }
        .logo-badge {
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: transform 0.3s ease;
        }
        .logo-badge:hover { transform: translateY(-2px); }
        .logo-icon {
          width: 50px; height: 50px;
          display: flex; align-items: center; justify-content: center;
          filter: drop-shadow(0 0 10px rgba(220,38,38,0.5));
        }
        .logo-icon img { width: 100%; height: 100%; object-fit: contain; }
        .logo-text-wrapper { display: flex; flex-direction: column; gap: 0.1rem; }
        .logo-text {
          font-family: 'Archivo', sans-serif;
          font-size: 1.75rem; font-weight: 900;
          letter-spacing: -0.02em; color: #fff;
        }
        .logo-subtitle {
          font-family: 'Space Mono', monospace;
          font-size: 0.65rem; letter-spacing: 0.15em;
          text-transform: uppercase; color: rgba(255,255,255,0.7);
        }
        .nav-links { display: flex; gap: 3rem; align-items: center; }
        .nav-link {
          font-family: 'Archivo', sans-serif;
          font-size: 0.95rem; font-weight: 500;
          color: rgba(255,255,255,0.9);
          text-decoration: none;
          position: relative;
          transition: color 0.3s ease;
          letter-spacing: 0.02em;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -8px; left: 0;
          width: 0; height: 2px;
          background: linear-gradient(90deg, #DC2626, #EF4444);
          transition: width 0.3s ease;
        }
        .nav-link:hover, .nav-link.active { color: #fff; }
        .nav-link:hover::after, .nav-link.active::after { width: 100%; }
        .admin-link {
          padding: 0.6rem 1.5rem;
          background: rgba(220,38,38,0.15);
          border: 1px solid rgba(220,38,38,0.4);
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        .admin-link::after { display: none; }
        .admin-link:hover {
          background: rgba(220,38,38,0.25);
          border-color: #DC2626;
          transform: translateY(-2px);
        }
        .menu-toggle {
          display: none;
          flex-direction: column;
          gap: 6px;
          background: none; border: none;
          cursor: pointer; padding: 0.5rem; z-index: 101;
        }
        .menu-toggle span {
          width: 28px; height: 2px;
          background: #fff;
          transition: all 0.3s ease;
          border-radius: 2px;
        }
        .menu-toggle.open span:nth-child(1) { transform: rotate(45deg) translate(8px, 8px); }
        .menu-toggle.open span:nth-child(2) { opacity: 0; }
        .menu-toggle.open span:nth-child(3) { transform: rotate(-45deg) translate(7px, -7px); }
        .mobile-menu {
          position: fixed;
          top: 0; right: -100%;
          width: 100%; max-width: 400px;
          height: 100vh;
          background: rgba(30,58,138,0.98);
          backdrop-filter: blur(20px);
          z-index: 99;
          transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 6rem 2rem 2rem;
          border-left: 2px solid rgba(220,38,38,0.3);
        }
        .mobile-menu.open { right: 0; }
        .mobile-nav { display: flex; flex-direction: column; gap: 2rem; }
        .mobile-nav a {
          font-family: 'Archivo', sans-serif;
          font-size: 1.5rem; font-weight: 600;
          color: rgba(255,255,255,0.9);
          text-decoration: none;
          transition: all 0.3s ease;
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .mobile-nav a:hover, .mobile-nav a.admin { color: #DC2626; }

        /* ── HERO ── */
        .hero-section {
          position: relative;
          min-height: 70vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hero-background {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%);
          z-index: 1;
        }
        .hero-overlay {
          position: absolute; inset: 0;
          background: radial-gradient(circle at 50% 50%,
            rgba(220,38,38,0.2) 0%,
            rgba(30,58,138,0.85) 50%,
            rgba(30,58,138,0.95) 100%
          );
          z-index: 2;
        }
        .grain-overlay {
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.03; z-index: 3; pointer-events: none;
        }
        .hero-decoration {
          position: absolute; inset: 0;
          z-index: 1; pointer-events: none; overflow: hidden;
        }
        .decoration-circle {
          position: absolute;
          border: 1px solid rgba(220,38,38,0.15);
          border-radius: 50%;
          animation: rotate 20s linear infinite;
        }
        .circle-1 { width: 400px; height: 400px; top: -200px; right: -200px; }
        .circle-2 { width: 600px; height: 600px; bottom: -300px; left: -300px; animation-direction: reverse; animation-duration: 30s; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .decoration-line {
          position: absolute; width: 1px; height: 100%;
          background: linear-gradient(180deg, transparent 0%, rgba(220,38,38,0.1) 50%, transparent 100%);
        }
        .line-1 { left: 20%; }
        .line-2 { right: 20%; }

        .hero-content {
          position: relative; z-index: 10;
          text-align: center;
          max-width: 1200px; padding: 8rem 2rem 4rem;
          animation: fadeInUp 1s ease-out;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-badge {
          display: inline-block;
          font-family: 'Space Mono', monospace;
          font-size: 0.75rem; letter-spacing: 0.2em;
          text-transform: uppercase; color: #fff;
          padding: 0.5rem 1.5rem;
          border: 1px solid rgba(220,38,38,0.5);
          border-radius: 50px;
          margin-bottom: 2rem;
          background: rgba(220,38,38,0.15);
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.4); }
          50% { box-shadow: 0 0 0 10px rgba(220,38,38,0); }
        }
        .hero-title {
          font-family: 'Archivo', sans-serif;
          font-size: clamp(3rem, 10vw, 7rem);
          font-weight: 900; line-height: 1;
          margin: 0 0 2rem; letter-spacing: -0.03em;
        }
        .title-line {
          display: block;
          animation: slideIn 0.8s ease-out backwards;
        }
        .title-line:nth-child(1) { animation-delay: 0.2s; color: #fff; }
        .title-line:nth-child(2) { animation-delay: 0.4s; }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .gradient-text {
          background: linear-gradient(135deg, #DC2626 0%, #EF4444 50%, #F87171 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 20px rgba(220,38,38,0.5));
        }
        .hero-description {
          font-family: 'Archivo', sans-serif;
          font-size: clamp(1rem, 2vw, 1.25rem);
          line-height: 1.6; color: rgba(255,255,255,0.9);
          max-width: 700px; margin: 0 auto 3rem;
          font-weight: 400;
          animation: fadeIn 1s ease-out 0.8s backwards;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .hero-stats {
          display: flex; justify-content: center; align-items: center;
          gap: 2rem; margin: 3rem 0;
          animation: fadeIn 1s ease-out 1s backwards;
        }
        .stat { text-align: center; }
        .stat-number {
          font-family: 'Archivo', sans-serif;
          font-size: 2.5rem; font-weight: 900;
          background: linear-gradient(135deg, #fff 0%, #DC2626 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1; margin-bottom: 0.5rem;
        }
        .stat-label {
          font-family: 'Space Mono', monospace;
          font-size: 0.75rem; letter-spacing: 0.1em;
          text-transform: uppercase; color: rgba(255,255,255,0.7);
        }
        .stat-divider {
          width: 1px; height: 50px;
          background: linear-gradient(180deg, transparent 0%, rgba(220,38,38,0.6) 50%, transparent 100%);
        }

        /* ── MAIN ── */
        .main {
          background: linear-gradient(180deg, #1e3a8a 0%, #1a2f7a 100%);
          min-height: 50vh;
          padding: 3rem 2rem 5rem;
        }

        .empty {
          max-width: 1400px; margin: 0 auto;
          text-align: center; padding: 5rem 2rem;
          color: rgba(255,255,255,0.35);
          display: flex; flex-direction: column;
          align-items: center; gap: 1rem;
          font-family: 'Archivo', sans-serif;
          font-size: 1rem;
        }
        .empty-sub { font-size: 0.85rem; color: rgba(255,255,255,0.2); }

        .posts-grid {
          max-width: 1400px; margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 1.5rem;
        }

        /* Cards */
        .card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 1.75rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: cardIn 0.5s ease backwards;
          display: flex; flex-direction: column; gap: 0.875rem;
          position: relative; overflow: hidden;
        }
        .card::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.05), transparent);
          opacity: 0; transition: opacity 0.3s ease;
        }
        .card:hover::before { opacity: 1; }
        .card:hover {
          border-color: rgba(220,38,38,0.3);
          background: rgba(255,255,255,0.08);
          transform: translateY(-4px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Featured card — spans full width if alone, or 2 cols */
        .card-featured {
          grid-column: 1 / -1;
          background: rgba(220,38,38,0.08);
          border-color: rgba(220,38,38,0.25);
          padding: 2.5rem;
        }
        .card-featured:hover {
          border-color: rgba(220,38,38,0.5);
          background: rgba(220,38,38,0.12);
        }
        .card-featured .card-title {
          font-size: clamp(1.5rem, 3vw, 2.25rem);
        }
        .card-featured .card-content {
          font-size: 1.05rem; max-width: 800px;
        }

        .card-header {
          display: flex; align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }
        .featured-tag {
          display: inline-flex; align-items: center; gap: 0.4rem;
          font-family: 'Space Mono', monospace;
          font-size: 0.65rem; letter-spacing: 0.15em;
          color: #EF4444;
        }
        .featured-dot {
          width: 6px; height: 6px;
          background: #EF4444; border-radius: 50%;
          animation: blink 2s ease-in-out infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        .card-date {
          font-family: 'Space Mono', monospace;
          font-size: 0.65rem; letter-spacing: 0.08em;
          color: rgba(255,255,255,0.4);
          margin-left: auto;
        }
        .card-title {
          font-family: 'Archivo', sans-serif;
          font-size: 1.3rem; font-weight: 700;
          color: #fff; line-height: 1.25;
          letter-spacing: -0.01em;
          margin: 0;
        }
        .card-content {
          font-family: 'Archivo', sans-serif;
          font-size: 0.95rem; line-height: 1.7;
          color: rgba(255,255,255,0.7);
          flex: 1; margin: 0;
        }
        .card-footer {
          display: flex; align-items: center; gap: 1rem;
          padding-top: 0.875rem;
          border-top: 1px solid rgba(255,255,255,0.07);
          margin-top: auto;
        }
        .footer-info {
          display: flex; align-items: center; gap: 0.4rem;
          font-family: 'Space Mono', monospace;
          font-size: 0.65rem; letter-spacing: 0.05em;
          color: rgba(255,255,255,0.4);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .nav-links { display: none; }
          .menu-toggle { display: flex; }
        }
        @media (max-width: 768px) {
          .posts-grid { grid-template-columns: 1fr; }
          .card-featured { padding: 1.75rem; }
          .hero-stats { gap: 1rem; }
          .stat-divider { display: none; }
          .logo-icon { width: 40px; height: 40px; }
          .logo-text { font-size: 1.5rem; }
        }
      `}</style>
    </div>
  )
}