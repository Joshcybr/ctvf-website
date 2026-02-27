'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="homepage">
      {/* Hero Section with Static Background */}
      <div className="hero-section">
        {/* Static background (no video error) */}
        <div className="hero-background"></div>

        {/* Animated gradient overlay with brand colors */}
        <div className="hero-overlay" />
        <div className="grain-overlay" />

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
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </header>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
          <nav className="mobile-nav">
            <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link href="/news" onClick={() => setMenuOpen(false)}>News</Link>
            <Link href="/fixtures" onClick={() => setMenuOpen(false)}>Fixtures</Link>
            <Link href="/logs" onClick={() => setMenuOpen(false)}>Logs</Link>
            <Link href="/admin/login" onClick={() => setMenuOpen(false)} className="admin">Admin Login</Link>
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
            <br />development, and community growth.
          </p>

          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">12+</div>
              <div className="stat-label">Active Teams</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <div className="stat-number">200+</div>
              <div className="stat-label">Players</div>
            </div>
            <div className="stat-divider"></div>
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

          {/* Scroll indicator */}
          <div className="scroll-indicator">
            <div className="scroll-line"></div>
            <span>Scroll to explore</span>
          </div>
        </div>

        {/* Floating decoration elements */}
        <div className="hero-decoration">
          <div className="decoration-circle circle-1"></div>
          <div className="decoration-circle circle-2"></div>
          <div className="decoration-line line-1"></div>
          <div className="decoration-line line-2"></div>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;900&family=Space+Mono:wght@400;700&display=swap');

        .homepage {
          min-height: 100vh;
          background: #1e3a8a;
        }

        .hero-section {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Static background instead of video */
        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%);
          z-index: 1;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 50%, 
            rgba(220, 38, 38, 0.2) 0%, 
            rgba(30, 58, 138, 0.85) 50%, 
            rgba(30, 58, 138, 0.95) 100%
          );
          z-index: 2;
        }

        .grain-overlay {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.03;
          z-index: 3;
          pointer-events: none;
        }

        /* Navbar */
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 1.5rem 0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .navbar.scrolled {
          background: rgba(30, 58, 138, 0.95);
          backdrop-filter: blur(20px);
          padding: 1rem 0;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
          border-bottom: 2px solid rgba(220, 38, 38, 0.3);
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          text-decoration: none;
        }

        .logo-badge {
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: transform 0.3s ease;
        }

        .logo-badge:hover {
          transform: translateY(-2px);
        }

        .logo-icon {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 0 10px rgba(220, 38, 38, 0.5));
        }

        /* CRITICAL: Logo image styles */
        .logo-icon img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .logo-text-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
        }

        .logo-text {
          font-family: 'Archivo', sans-serif;
          font-size: 1.75rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          color: #fff;
        }

        .logo-subtitle {
          font-family: 'Space Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.7);
        }

        .nav-links {
          display: flex;
          gap: 3rem;
          align-items: center;
        }

        .nav-link {
          font-family: 'Archivo', sans-serif;
          font-size: 0.95rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          position: relative;
          transition: color 0.3s ease;
          letter-spacing: 0.02em;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #DC2626, #EF4444);
          transition: width 0.3s ease;
        }

        .nav-link:hover,
        .nav-link.active {
          color: #fff;
        }

        .nav-link:hover::after,
        .nav-link.active::after {
          width: 100%;
        }

        .admin-link {
          padding: 0.6rem 1.5rem;
          background: rgba(220, 38, 38, 0.15);
          border: 1px solid rgba(220, 38, 38, 0.4);
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .admin-link::after {
          display: none;
        }

        .admin-link:hover {
          background: rgba(220, 38, 38, 0.25);
          border-color: #DC2626;
          transform: translateY(-2px);
        }

        .menu-toggle {
          display: none;
          flex-direction: column;
          gap: 6px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          z-index: 101;
        }

        .menu-toggle span {
          width: 28px;
          height: 2px;
          background: #fff;
          transition: all 0.3s ease;
          border-radius: 2px;
        }

        .menu-toggle.open span:nth-child(1) {
          transform: rotate(45deg) translate(8px, 8px);
        }

        .menu-toggle.open span:nth-child(2) {
          opacity: 0;
        }

        .menu-toggle.open span:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -7px);
        }

        .mobile-menu {
          position: fixed;
          top: 0;
          right: -100%;
          width: 100%;
          max-width: 400px;
          height: 100vh;
          background: rgba(30, 58, 138, 0.98);
          backdrop-filter: blur(20px);
          z-index: 99;
          transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 6rem 2rem 2rem;
          border-left: 2px solid rgba(220, 38, 38, 0.3);
        }

        .mobile-menu.open {
          right: 0;
        }

        .mobile-nav {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .mobile-nav a {
          font-family: 'Archivo', sans-serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          transition: all 0.3s ease;
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .mobile-nav a:hover,
        .mobile-nav a.admin {
          color: #DC2626;
        }

        /* Hero Content */
        .hero-content {
          position: relative;
          z-index: 10;
          text-align: center;
          max-width: 1200px;
          padding: 0 2rem;
          animation: fadeInUp 1s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-badge {
          display: inline-block;
          font-family: 'Space Mono', monospace;
          font-size: 0.75rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #fff;
          padding: 0.5rem 1.5rem;
          border: 1px solid rgba(220, 38, 38, 0.5);
          border-radius: 50px;
          margin-bottom: 2rem;
          background: rgba(220, 38, 38, 0.15);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(220, 38, 38, 0);
          }
        }

        .hero-title {
          font-family: 'Archivo', sans-serif;
          font-size: clamp(3rem, 10vw, 7rem);
          font-weight: 900;
          line-height: 1;
          margin: 0 0 2rem;
          letter-spacing: -0.03em;
        }

        .title-line {
          display: block;
          animation: slideIn 0.8s ease-out backwards;
        }

        .title-line:nth-child(1) {
          animation-delay: 0.2s;
          color: #fff;
        }

        .title-line:nth-child(2) {
          animation-delay: 0.4s;
        }

        .title-line:nth-child(3) {
          animation-delay: 0.6s;
          color: rgba(255, 255, 255, 0.95);
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .gradient-text {
          background: linear-gradient(135deg, #DC2626 0%, #EF4444 50%, #F87171 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
          filter: drop-shadow(0 0 20px rgba(220, 38, 38, 0.5));
        }

        .hero-description {
          font-family: 'Archivo', sans-serif;
          font-size: clamp(1rem, 2vw, 1.25rem);
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.9);
          max-width: 700px;
          margin: 0 auto 3rem;
          font-weight: 400;
          animation: fadeIn 1s ease-out 0.8s backwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .hero-stats {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 2rem;
          margin: 3rem 0;
          animation: fadeIn 1s ease-out 1s backwards;
        }

        .stat {
          text-align: center;
        }

        .stat-number {
          font-family: 'Archivo', sans-serif;
          font-size: 2.5rem;
          font-weight: 900;
          background: linear-gradient(135deg, #fff 0%, #DC2626 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-family: 'Space Mono', monospace;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.7);
        }

        .stat-divider {
          width: 1px;
          height: 50px;
          background: linear-gradient(180deg, 
            transparent 0%, 
            rgba(220, 38, 38, 0.6) 50%, 
            transparent 100%
          );
        }

        .hero-cta {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 3rem;
          animation: fadeIn 1s ease-out 1.2s backwards;
        }

        .btn {
          font-family: 'Archivo', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          padding: 1rem 2.5rem;
          border-radius: 12px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          letter-spacing: 0.02em;
          position: relative;
          overflow: hidden;
        }

        .btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .btn:hover::before {
          opacity: 1;
        }

        .btn-primary {
          background: linear-gradient(135deg, #DC2626, #EF4444);
          color: #fff;
          box-shadow: 0 10px 30px rgba(220, 38, 38, 0.4);
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(220, 38, 38, 0.5);
        }

        .btn-secondary {
          background: transparent;
          color: #fff;
          border: 2px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
        }

        .btn-secondary:hover {
          border-color: #DC2626;
          background: rgba(220, 38, 38, 0.15);
          transform: translateY(-3px);
        }

        .scroll-indicator {
          position: absolute;
          bottom: 3rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          animation: fadeIn 1s ease-out 1.5s backwards;
        }

        .scroll-line {
          width: 1px;
          height: 60px;
          background: linear-gradient(180deg, #DC2626, transparent);
          animation: scrollLine 2s ease-in-out infinite;
        }

        @keyframes scrollLine {
          0%, 100% {
            transform: translateY(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(20px);
            opacity: 0;
          }
        }

        .scroll-indicator span {
          font-family: 'Space Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.6);
        }

        /* Decorative elements */
        .hero-decoration {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          overflow: hidden;
        }

        .decoration-circle {
          position: absolute;
          border: 1px solid rgba(220, 38, 38, 0.15);
          border-radius: 50%;
          animation: rotate 20s linear infinite;
        }

        .circle-1 {
          width: 400px;
          height: 400px;
          top: -200px;
          right: -200px;
        }

        .circle-2 {
          width: 600px;
          height: 600px;
          bottom: -300px;
          left: -300px;
          animation-direction: reverse;
          animation-duration: 30s;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .decoration-line {
          position: absolute;
          width: 1px;
          height: 100%;
          background: linear-gradient(180deg, 
            transparent 0%, 
            rgba(220, 38, 38, 0.1) 50%, 
            transparent 100%
          );
        }

        .line-1 {
          left: 20%;
        }

        .line-2 {
          right: 20%;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .nav-links {
            display: none;
          }

          .menu-toggle {
            display: flex;
          }

          .hero-stats {
            gap: 1rem;
          }

          .stat-number {
            font-size: 2rem;
          }
        }

        @media (max-width: 768px) {
          .hero-cta {
            flex-direction: column;
            align-items: center;
          }

          .btn {
            width: 100%;
            max-width: 300px;
            justify-content: center;
          }

          .hero-stats {
            flex-wrap: wrap;
          }

          .stat-divider {
            display: none;
          }

          .logo-icon {
            width: 40px;
            height: 40px;
          }

          .logo-text {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}