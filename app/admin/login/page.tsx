'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabaseClient';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push('/admin/dashboard');
  };

  return (
    <div className="page">

      {/* Background */}
      <div className="bg" />
      <div className="overlay" />
      <div className="grain" />

      {/* Decoration */}
      <div className="deco">
        <div className="circle c1" />
        <div className="circle c2" />
        <div className="line l1" />
        <div className="line l2" />
      </div>

      <div className="wrap">

        {/* Logo */}
        <div className="logo-row">
          <img src="/assets/ctvf_logo.PNG" alt="CTVF" className="logo-img" />
          <div>
            <div className="logo-name">CTVF</div>
            <div className="logo-sub">Cape Town Volleyball Federation</div>
          </div>
        </div>

        {/* Warning banner */}
        <div className="warning-banner">
          <div className="warning-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="warning-text">
            <strong>Authorised Personnel Only</strong>
            <span>This area is restricted to CTVF administrators. Unauthorised access attempts are logged and monitored.</span>
          </div>
        </div>

        {/* Card */}
        <div className="card">
          <div className="card-header">
            <div className="lock-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 className="card-title">Admin Sign In</h1>
            <p className="card-sub">Enter your credentials to access the dashboard</p>
          </div>

          {error && (
            <div className="error-box">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="form">
            <div className="field">
              <label>Email address</label>
              <div className="input-wrap">
                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <input
                  type="email"
                  placeholder="admin@ctvf.co.za"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label>Password</label>
              <div className="input-wrap">
                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••••"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? (
                <>
                  <span className="spinner" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Monitoring notice */}
          <div className="monitor-notice">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            All login attempts are recorded with IP address and timestamp
          </div>
        </div>

        <Link href="/" className="back-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to website
        </Link>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;900&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          font-family: 'Archivo', sans-serif;
          padding: 2rem 1rem;
        }

        .bg {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%);
          z-index: 0;
        }
        .overlay {
          position: absolute; inset: 0;
          background: radial-gradient(circle at 50% 50%,
            rgba(220,38,38,0.18) 0%,
            rgba(30,58,138,0.85) 50%,
            rgba(30,58,138,0.97) 100%
          );
          z-index: 1;
        }
        .grain {
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          opacity: 0.03; z-index: 2; pointer-events: none;
        }
        .deco { position: absolute; inset: 0; z-index: 1; pointer-events: none; overflow: hidden; }
        .circle { position: absolute; border: 1px solid rgba(220,38,38,0.12); border-radius: 50%; animation: spin 25s linear infinite; }
        .c1 { width: 500px; height: 500px; top: -250px; right: -250px; }
        .c2 { width: 700px; height: 700px; bottom: -350px; left: -350px; animation-direction: reverse; animation-duration: 35s; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .line { position: absolute; width: 1px; height: 100%; background: linear-gradient(180deg, transparent, rgba(220,38,38,0.08) 50%, transparent); }
        .l1 { left: 25%; } .l2 { right: 25%; }

        /* Content */
        .wrap {
          position: relative; z-index: 10;
          width: 100%; max-width: 440px;
          display: flex; flex-direction: column;
          align-items: center; gap: 1.25rem;
          animation: fadeUp 0.6s ease-out;
        }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }

        /* Logo */
        .logo-row {
          display: flex; align-items: center; gap: 1rem;
          margin-bottom: 0.25rem;
        }
        .logo-img {
          width: 52px; height: 52px; object-fit: contain;
          filter: drop-shadow(0 0 12px rgba(220,38,38,0.4));
        }
        .logo-name {
          font-size: 2rem; font-weight: 900; color: white;
          letter-spacing: -0.03em; line-height: 1;
        }
        .logo-sub {
          font-family: 'Space Mono', monospace;
          font-size: 0.6rem; letter-spacing: 0.15em;
          text-transform: uppercase; color: rgba(255,255,255,0.55);
          margin-top: 2px;
        }

        /* Warning banner */
        .warning-banner {
          width: 100%;
          display: flex; align-items: flex-start; gap: 0.75rem;
          padding: 0.875rem 1rem;
          background: rgba(234,179,8,0.1);
          border: 1px solid rgba(234,179,8,0.35);
          border-radius: 10px;
        }
        .warning-icon {
          color: #fbbf24; flex-shrink: 0; margin-top: 1px;
        }
        .warning-text {
          display: flex; flex-direction: column; gap: 0.2rem;
        }
        .warning-text strong {
          font-size: 0.82rem; font-weight: 700; color: #fde68a;
          letter-spacing: 0.01em;
        }
        .warning-text span {
          font-size: 0.75rem; color: rgba(255,255,255,0.55);
          line-height: 1.5;
        }

        /* Card */
        .card {
          width: 100%;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 20px;
          backdrop-filter: blur(20px);
          overflow: hidden;
        }
        .card-header {
          padding: 2rem 2rem 1.5rem;
          text-align: center;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .lock-icon {
          width: 48px; height: 48px;
          background: rgba(220,38,38,0.15);
          border: 1px solid rgba(220,38,38,0.3);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          color: #ef4444; margin: 0 auto 1rem;
        }
        .card-title {
          font-size: 1.5rem; font-weight: 800;
          color: white; letter-spacing: -0.02em;
          margin-bottom: 0.35rem;
        }
        .card-sub {
          font-size: 0.82rem; color: rgba(255,255,255,0.5);
          line-height: 1.5;
        }

        /* Error */
        .error-box {
          display: flex; align-items: center; gap: 0.5rem;
          margin: 1.25rem 2rem 0;
          padding: 0.75rem 1rem;
          background: rgba(220,38,38,0.12);
          border: 1px solid rgba(220,38,38,0.35);
          border-radius: 10px;
          color: #fca5a5; font-size: 0.82rem;
          font-family: 'Space Mono', monospace;
          letter-spacing: 0.01em;
        }

        /* Form */
        .form {
          padding: 1.5rem 2rem 1.75rem;
          display: flex; flex-direction: column; gap: 1.1rem;
        }
        .field { display: flex; flex-direction: column; gap: 0.4rem; }
        .field label {
          font-size: 0.72rem; font-weight: 600;
          color: rgba(255,255,255,0.6);
          text-transform: uppercase; letter-spacing: 0.1em;
        }
        .input-wrap {
          position: relative; display: flex; align-items: center;
        }
        .input-icon {
          position: absolute; left: 0.875rem;
          color: rgba(255,255,255,0.35); pointer-events: none;
          flex-shrink: 0;
        }
        .input-wrap input {
          width: 100%;
          padding: 0.75rem 0.875rem 0.75rem 2.75rem;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          color: white; font-size: 0.925rem;
          font-family: 'Archivo', sans-serif;
          transition: border-color 0.2s, background 0.2s;
        }
        .input-wrap input::placeholder { color: rgba(255,255,255,0.25); }
        .input-wrap input:focus {
          outline: none;
          border-color: rgba(220,38,38,0.5);
          background: rgba(255,255,255,0.09);
          box-shadow: 0 0 0 3px rgba(220,38,38,0.1);
        }
        .eye-btn {
          position: absolute; right: 0.875rem;
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.35);
          display: flex; align-items: center;
          transition: color 0.2s;
          padding: 0;
        }
        .eye-btn:hover { color: rgba(255,255,255,0.7); }

        /* Submit */
        .submit-btn {
          display: flex; align-items: center; justify-content: center;
          gap: 0.5rem; width: 100%;
          padding: 0.875rem;
          background: linear-gradient(135deg, #dc2626, #ef4444);
          color: white; border: none; border-radius: 10px;
          font-family: 'Archivo', sans-serif;
          font-size: 1rem; font-weight: 700;
          cursor: pointer; margin-top: 0.25rem;
          transition: all 0.2s;
          box-shadow: 0 8px 24px rgba(220,38,38,0.35);
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(220,38,38,0.45);
        }
        .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: rotate 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes rotate { to { transform: rotate(360deg); } }

        /* Monitor notice */
        .monitor-notice {
          display: flex; align-items: center; justify-content: center;
          gap: 0.4rem;
          padding: 0.875rem 2rem;
          border-top: 1px solid rgba(255,255,255,0.07);
          font-family: 'Space Mono', monospace;
          font-size: 0.62rem; color: rgba(255,255,255,0.3);
          letter-spacing: 0.04em; text-align: center;
        }

        /* Back link */
        .back-link {
          display: flex; align-items: center; gap: 0.4rem;
          font-size: 0.8rem; color: rgba(255,255,255,0.45);
          text-decoration: none;
          transition: color 0.2s;
          font-family: 'Space Mono', monospace;
          letter-spacing: 0.05em;
        }
        .back-link:hover { color: rgba(255,255,255,0.8); }

        @media (max-width: 480px) {
          .form { padding: 1.25rem 1.25rem 1.5rem; }
          .card-header { padding: 1.5rem 1.25rem 1.25rem; }
          .error-box { margin: 1rem 1.25rem 0; }
          .monitor-notice { padding: 0.875rem 1.25rem; }
        }
      `}</style>
    </div>
  );
}