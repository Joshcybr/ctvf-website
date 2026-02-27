'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <div className="homepage">
      <div className="hero-section">
        <div className="hero-background" />
        <div className="hero-overlay" />
        <div className="grain-overlay" />

        {/* Navbar */}
        <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
          <div className="nav-container">
            <Link href="/" className="logo">
              <div className="logo-badge">
                <div className="logo-icon">
                  <img src="/assets/ctvf_logo.png" alt="CTVF Logo" />
                </div>
                <div className="logo-text-wrapper">
                  <span className="logo-text">CTVF</span>
                  <span className="logo-subtitle">Cape Town Volleyball</span>
                </div>
              </div>
            </Link>

            <nav className="nav-links">
              <Link href="/" className="nav-link active">Home</Link>
              <Link href="/news" className="nav-link">News</Link>
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
              <span />
              <span />
              <span />
            </button>
          </div>
        </header>

        {/* Backdrop */}
        <div
          className={`mobile-backdrop ${menuOpen ? 'visible' : ''}`}
          onClick={() => setMenuOpen(false)}
        />

        {/* Mobile Menu */}
        <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
          <div className="mobile-header">
            <div className="mobile-logo">
              <img src="/assets/ctvf_logo.png" alt="CTVF" />
              <span>CTVF</span>
            </div>
            <button className="mobile-close" onClick={() => setMenuOpen(false)}>×</button>
          </div>

          <nav className="mobile-nav">
            <Link href="/" onClick={() => setMenuOpen(false)} className="mobile-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Home
            </Link>
            <Link href="/news" onClick={() => setMenuOpen(false)} className="mobile-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              News
            </Link>
            <Link href="/fixtures" onClick={() => setMenuOpen(false)} className="mobile-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Fixtures
            </Link>
            <Link href="/log" onClick={() => setMenuOpen(false)} className="mobile-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Logs
            </Link>
            <Link href="/admin/login" onClick={() => setMenuOpen(false)} className="mobile-link mobile-admin">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Admin Login
            </Link>
          </nav>
        </div>

        {/* Hero Content */}
        <div className="hero-content">
          <div className="hero-badge">EST. 2024</div>

          <h1 className="hero-title">
            <span className="title-line">Cape Town</span>
            <span className="title-line gradient-text">Volleyball</span>
            <span className="title-line">Federation</span>
          </h1>

          <p className="hero-description">
            Building volleyball excellence across Cape Town — leagues, teams, fixtures,
            development, and community growth.
          </p>

          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">12+</div>
              <div className="stat-label">Active Teams</div>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <div className="stat-number">200+</div>
              <div className="stat-label">Players</div>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <div className="stat-number">50+</div>
              <div className="stat-label">Matches</div>
            </div>
          </div>

          <div className="hero-cta">
            <Link href="/fixtures" className="btn btn-primary">
              <span>View Fixtures</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M1 8h14M9 1l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link href="/news" className="btn btn-secondary">
              <span>Latest News</span>
            </Link>
          </div>

          <div className="scroll-indicator">
            <div className="scroll-line" />
            <span>Scroll to explore</span>
          </div>
        </div>

        <div className="hero-decoration">
          <div className="decoration-circle circle-1" />
          <div className="decoration-circle circle-2" />
          <div className="decoration-line line-1" />
          <div className="decoration-line line-2" />
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;900&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .homepage { min-height: 100vh; background: #1e3a8a; }
        .hero-section { position: relative; min-height: 100vh; overflow: hidden; display: flex; align-items: center; justify-content: center; }

        .hero-background { position: absolute; inset: 0; background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%); z-index: 1; }
        .hero-overlay { position: absolute; inset: 0; background: radial-gradient(circle at 50% 50%, rgba(220,38,38,0.2) 0%, rgba(30,58,138,0.85) 50%, rgba(30,58,138,0.95) 100%); z-index: 2; }
        .grain-overlay { position: absolute; inset: 0; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); opacity: 0.03; z-index: 3; pointer-events: none; }

        /* NAVBAR — z-index 200 so it's always on top */
        .navbar { position: fixed; top: 0; left: 0; right: 0; z-index: 200; padding: 1.5rem 0; transition: all 0.4s cubic-bezier(0.4,0,0.2,1); }
        .navbar.scrolled { background: rgba(30,58,138,0.95); backdrop-filter: blur(20px); padding: 1rem 0; box-shadow: 0 4px 30px rgba(0,0,0,0.3); border-bottom: 2px solid rgba(220,38,38,0.3); }
        .nav-container { max-width: 1400px; margin: 0 auto; padding: 0 1.5rem; display: flex; justify-content: space-between; align-items: center; }
        .logo { text-decoration: none; }
        .logo-badge { display: flex; align-items: center; gap: 0.875rem; transition: transform 0.3s ease; }
        .logo-badge:hover { transform: translateY(-2px); }
        .logo-icon { width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 0 10px rgba(220,38,38,0.5)); }
        .logo-icon img { width: 100%; height: 100%; object-fit: contain; }
        .logo-text-wrapper { display: flex; flex-direction: column; gap: 0.1rem; }
        .logo-text { font-family: 'Archivo', sans-serif; font-size: 1.75rem; font-weight: 900; letter-spacing: -0.02em; color: #fff; }
        .logo-subtitle { font-family: 'Space Mono', monospace; font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.7); }
        .nav-links { display: flex; gap: 3rem; align-items: center; }
        .nav-link { font-family: 'Archivo', sans-serif; font-size: 0.95rem; font-weight: 500; color: rgba(255,255,255,0.9); text-decoration: none; position: relative; transition: color 0.3s ease; letter-spacing: 0.02em; }
        .nav-link::after { content: ''; position: absolute; bottom: -8px; left: 0; width: 0; height: 2px; background: linear-gradient(90deg, #DC2626, #EF4444); transition: width 0.3s ease; }
        .nav-link:hover, .nav-link.active { color: #fff; }
        .nav-link:hover::after, .nav-link.active::after { width: 100%; }
        .admin-link { padding: 0.6rem 1.5rem; background: rgba(220,38,38,0.15); border: 1px solid rgba(220,38,38,0.4); border-radius: 8px; transition: all 0.3s ease; }
        .admin-link::after { display: none; }
        .admin-link:hover { background: rgba(220,38,38,0.25); border-color: #DC2626; transform: translateY(-2px); }

        /* BURGER — z-index 300 so it's above the mobile menu */
        .menu-toggle {
          display: none; flex-direction: column; justify-content: center; gap: 5px;
          width: 44px; height: 44px;
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
          border-radius: 10px; cursor: pointer; padding: 0 11px;
          z-index: 300; transition: background 0.2s; flex-shrink: 0;
        }
        .menu-toggle:hover { background: rgba(255,255,255,0.18); }
        .menu-toggle span { display: block; width: 22px; height: 2px; background: #fff; border-radius: 2px; transition: all 0.3s ease; }
        .menu-toggle.open span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
        .menu-toggle.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .menu-toggle.open span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }

        /* BACKDROP — z-index 250, between navbar and menu */
        .mobile-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.65); backdrop-filter: blur(3px); z-index: 250; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; }
        .mobile-backdrop.visible { opacity: 1; pointer-events: all; }

        /* MOBILE MENU — z-index 300, slides in from right */
        .mobile-menu {
          position: fixed; top: 0; right: 0;
          width: min(80vw, 320px); height: 100vh;
          background: linear-gradient(180deg, #1e3a8a 0%, #1a3080 100%);
          border-left: 1px solid rgba(220,38,38,0.3);
          z-index: 300;
          padding: 1.25rem;
          display: flex; flex-direction: column; gap: 1.5rem;
          transform: translateX(100%);
          transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
          box-shadow: -8px 0 40px rgba(0,0,0,0.4);
          overflow-y: auto;
        }
        .mobile-menu.open { transform: translateX(0); }

        .mobile-header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .mobile-logo { display: flex; align-items: center; gap: 0.75rem; }
        .mobile-logo img { width: 36px; height: 36px; object-fit: contain; filter: drop-shadow(0 0 8px rgba(220,38,38,0.4)); }
        .mobile-logo span { font-family: 'Archivo', sans-serif; font-size: 1.3rem; font-weight: 900; color: white; letter-spacing: -0.02em; }
        .mobile-close { width: 36px; height: 36px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: white; font-size: 1.4rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
        .mobile-close:hover { background: rgba(220,38,38,0.2); }

        .mobile-nav { display: flex; flex-direction: column; gap: 0.25rem; flex: 1; }
        .mobile-link { display: flex; align-items: center; gap: 0.875rem; font-family: 'Archivo', sans-serif; font-size: 1rem; font-weight: 600; color: rgba(255,255,255,0.75); text-decoration: none; padding: 0.875rem 1rem; border-radius: 10px; border: 1px solid transparent; transition: all 0.2s ease; }
        .mobile-link:hover { color: white; background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.1); transform: translateX(4px); }
        .mobile-admin { margin-top: 0.5rem; color: #fca5a5; background: rgba(220,38,38,0.08); border-color: rgba(220,38,38,0.2) !important; }
        .mobile-admin:hover { background: rgba(220,38,38,0.18) !important; border-color: rgba(220,38,38,0.4) !important; color: #fca5a5 !important; }

        /* HERO */
        .hero-content { position: relative; z-index: 10; text-align: center; max-width: 1200px; padding: 6rem 1.5rem 2rem; animation: fadeInUp 1s ease-out; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

        .hero-badge { display: inline-block; font-family: 'Space Mono', monospace; font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase; color: #fff; padding: 0.5rem 1.5rem; border: 1px solid rgba(220,38,38,0.5); border-radius: 50px; margin-bottom: 2rem; background: rgba(220,38,38,0.15); animation: pulse 2s ease-in-out infinite; }
        @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.4); } 50% { box-shadow: 0 0 0 10px rgba(220,38,38,0); } }

        .hero-title { font-family: 'Archivo', sans-serif; font-size: clamp(3rem, 10vw, 7rem); font-weight: 900; line-height: 1; margin: 0 0 2rem; letter-spacing: -0.03em; }
        .title-line { display: block; animation: slideIn 0.8s ease-out backwards; }
        .title-line:nth-child(1) { animation-delay: 0.2s; color: #fff; }
        .title-line:nth-child(2) { animation-delay: 0.4s; }
        .title-line:nth-child(3) { animation-delay: 0.6s; color: rgba(255,255,255,0.95); }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-50px); } to { opacity: 1; transform: translateX(0); } }
        .gradient-text { background: linear-gradient(135deg, #DC2626 0%, #EF4444 50%, #F87171 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; filter: drop-shadow(0 0 20px rgba(220,38,38,0.5)); }

        .hero-description { font-family: 'Archivo', sans-serif; font-size: clamp(0.95rem, 2vw, 1.25rem); line-height: 1.6; color: rgba(255,255,255,0.9); max-width: 700px; margin: 0 auto 3rem; font-weight: 400; animation: fadeIn 1s ease-out 0.8s backwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .hero-stats { display: flex; justify-content: center; align-items: center; gap: 2rem; margin: 3rem 0; animation: fadeIn 1s ease-out 1s backwards; }
        .stat { text-align: center; }
        .stat-number { font-family: 'Archivo', sans-serif; font-size: 2.5rem; font-weight: 900; background: linear-gradient(135deg, #fff 0%, #DC2626 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1; margin-bottom: 0.5rem; }
        .stat-label { font-family: 'Space Mono', monospace; font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.7); }
        .stat-divider { width: 1px; height: 50px; background: linear-gradient(180deg, transparent, rgba(220,38,38,0.6) 50%, transparent); }

        .hero-cta { display: flex; gap: 1rem; justify-content: center; margin-top: 3rem; animation: fadeIn 1s ease-out 1.2s backwards; }
        .btn { font-family: 'Archivo', sans-serif; font-size: 1rem; font-weight: 600; padding: 1rem 2.5rem; border-radius: 12px; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; transition: all 0.3s cubic-bezier(0.4,0,0.2,1); letter-spacing: 0.02em; position: relative; overflow: hidden; }
        .btn::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent); opacity: 0; transition: opacity 0.3s ease; }
        .btn:hover::before { opacity: 1; }
        .btn-primary { background: linear-gradient(135deg, #DC2626, #EF4444); color: #fff; box-shadow: 0 10px 30px rgba(220,38,38,0.4); }
        .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(220,38,38,0.5); }
        .btn-secondary { background: transparent; color: #fff; border: 2px solid rgba(255,255,255,0.3); backdrop-filter: blur(10px); }
        .btn-secondary:hover { border-color: #DC2626; background: rgba(220,38,38,0.15); transform: translateY(-3px); }

        .scroll-indicator { position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 0.75rem; animation: fadeIn 1s ease-out 1.5s backwards; }
        .scroll-line { width: 1px; height: 50px; background: linear-gradient(180deg, #DC2626, transparent); animation: scrollAnim 2s ease-in-out infinite; }
        @keyframes scrollAnim { 0%,100% { opacity: 0; transform: translateY(0); } 50% { opacity: 1; } 100% { transform: translateY(15px); } }
        .scroll-indicator span { font-family: 'Space Mono', monospace; font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.5); }

        .hero-decoration { position: absolute; inset: 0; z-index: 1; pointer-events: none; overflow: hidden; }
        .decoration-circle { position: absolute; border: 1px solid rgba(220,38,38,0.15); border-radius: 50%; animation: rotate 20s linear infinite; }
        .circle-1 { width: 400px; height: 400px; top: -200px; right: -200px; }
        .circle-2 { width: 600px; height: 600px; bottom: -300px; left: -300px; animation-direction: reverse; animation-duration: 30s; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .decoration-line { position: absolute; width: 1px; height: 100%; background: linear-gradient(180deg, transparent, rgba(220,38,38,0.1) 50%, transparent); }
        .line-1 { left: 20%; } .line-2 { right: 20%; }

        /* RESPONSIVE */
        @media (max-width: 1024px) {
          .nav-links { display: none; }
          .menu-toggle { display: flex; }
        }
        @media (max-width: 768px) {
          .hero-cta { flex-direction: column; align-items: center; }
          .btn { width: 100%; max-width: 280px; justify-content: center; }
          .hero-stats { gap: 1.25rem; }
          .stat-number { font-size: 2rem; }
          .stat-divider { display: none; }
          .logo-icon { width: 40px; height: 40px; }
          .logo-text { font-size: 1.4rem; }
          .logo-subtitle { display: none; }
          .scroll-indicator { display: none; }
        }
      `}</style>
    </div>
  );
}