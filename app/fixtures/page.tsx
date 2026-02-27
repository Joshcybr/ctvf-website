'use client'

import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import Link from "next/link"

interface Fixture {
  id: number
  date: string
  time: string
  team_one: string
  team_two: string
  venue: string
  division: string
  status: 'upcoming' | 'completed' | 'live'
  teamone_score: number | null
  teamtwo_score: number | null
  sets_detail: string | null
  is_live: boolean
}

const DIVISIONS = ['Mens Premier', 'Women Premier', 'Men First Division', 'Women First Division', 'Mixed']

export default function Fixtures() {
  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDivision, setSelectedDivision] = useState<string>('All')
  const [activeTab, setActiveTab] = useState<'upcoming' | 'results' | 'live'>('upcoming')
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  async function loadFixtures() {
    const { data } = await supabase
      .from('fixtures')
      .select('*')
      .order('date', { ascending: true })
    if (data) setFixtures(data)
    setLoading(false)
  }

  useEffect(() => {
    loadFixtures()
    const channel = supabase
      .channel('live-fixtures')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fixtures' }, loadFixtures)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const divisionFiltered = selectedDivision === 'All'
    ? fixtures
    : fixtures.filter(f => f.division === selectedDivision)

  const liveFixtures = divisionFiltered.filter(f => f.is_live || f.status === 'live')
  const upcoming = divisionFiltered.filter(f => f.status === 'upcoming' && !f.is_live)
  const completed = divisionFiltered.filter(f => f.status === 'completed')
  const tabFixtures = activeTab === 'live' ? liveFixtures : activeTab === 'upcoming' ? upcoming : completed

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  function initials(name: string) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  }

  function divisionShort(div: string) {
    if (div.includes('Mens Premier')) return 'MP'
    if (div.includes('Women Premier')) return 'WP'
    if (div.includes('Men First')) return 'M1'
    if (div.includes('Women First')) return 'W1'
    return 'MX'
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
        <p style={{ fontFamily: 'Archivo, sans-serif', opacity: 0.7 }}>Loading fixtures...</p>
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
                <img src="/assets/ctvf_logo.png" alt="CTVF Logo" />
              </div>
              <div className="logo-text-wrapper">
                <span className="logo-text">CTVF</span>
                <span className="logo-subtitle">Cape Town Volleyball</span>
              </div>
            </div>
          </Link>
          <nav className="nav-links">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/news" className="nav-link">News</Link>
            <Link href="/fixtures" className="nav-link active">Fixtures</Link>
            <Link href="/log" className="nav-link">Logs</Link>
            <Link href="/admin/login" className="nav-link admin-link"><span>Admin</span></Link>
          </nav>
          <button className={`menu-toggle ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
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
          <div className="hero-badge">
            {liveFixtures.length > 0 ? (
              <><span className="badge-live-dot" />{liveFixtures.length} LIVE NOW · </>
            ) : null}
            2026 SEASON
          </div>
          <h1 className="hero-title">
            <span className="title-line">Fixtures</span>
            <span className="title-line gradient-text">&amp; Results</span>
          </h1>
          <p className="hero-description">
            Follow every match across all divisions — live scores, results and upcoming fixtures.
          </p>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">{liveFixtures.length}</div>
              <div className="stat-label">Live</div>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <div className="stat-number">{upcoming.length}</div>
              <div className="stat-label">Upcoming</div>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <div className="stat-number">{completed.length}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Division Filters */}
      <div className="filters-wrap">
        <div className="filters">
          {['All', ...DIVISIONS].map(div => (
            <button
              key={div}
              onClick={() => setSelectedDivision(div)}
              className={`filter-btn${selectedDivision === div ? ' filter-active' : ''}`}
            >
              {div === 'All' ? 'All Divisions' : div}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-wrap">
        <div className="tabs">
          {liveFixtures.length > 0 && (
            <button onClick={() => setActiveTab('live')} className={`tab${activeTab === 'live' ? ' tab-active tab-live' : ''}`}>
              <span className="tab-live-dot" /> Live
              <span className="tab-count">{liveFixtures.length}</span>
            </button>
          )}
          <button onClick={() => setActiveTab('upcoming')} className={`tab${activeTab === 'upcoming' ? ' tab-active' : ''}`}>
            Upcoming <span className="tab-count">{upcoming.length}</span>
          </button>
          <button onClick={() => setActiveTab('results')} className={`tab${activeTab === 'results' ? ' tab-active' : ''}`}>
            Results <span className="tab-count">{completed.length}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="main">
        {tabFixtures.length === 0 ? (
          <div className="empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" opacity="0.3">
              <rect x="3" y="4" width="18" height="16" rx="2" stroke="white" strokeWidth="1.5"/>
              <path d="M3 9h18M8 2v4M16 2v4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p>No {activeTab} fixtures{selectedDivision !== 'All' ? ` in ${selectedDivision}` : ''}</p>
          </div>
        ) : (
          <div className="cards">
            {tabFixtures.map((f, idx) => {
              const parsedSets: {t1:number,t2:number}[] = f.sets_detail ? JSON.parse(f.sets_detail) : []
              const t1Won = (f.teamone_score ?? 0) > (f.teamtwo_score ?? 0)
              const t2Won = (f.teamtwo_score ?? 0) > (f.teamone_score ?? 0)
              const isLiveCard = f.is_live || f.status === 'live'

              return (
                <div key={f.id} className={`card${isLiveCard ? ' card-live' : ''}`} style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className="card-head">
                    <div className="card-head-left">
                      <span className="div-chip">
                        <span className="div-chip-code">{divisionShort(f.division)}</span>
                        {f.division}
                      </span>
                    </div>
                    <div className="card-head-right">
                      {isLiveCard && <span className="live-badge"><span className="live-dot" />LIVE</span>}
                      {f.status === 'completed' && <span className="done-badge">FINAL</span>}
                      {f.status === 'upcoming' && !isLiveCard && <span className="soon-badge">UPCOMING</span>}
                    </div>
                  </div>

                  <div className="matchup">
                    <div className={`team-col${f.status !== 'upcoming' && t1Won ? ' team-winner' : ''}`}>
                      <div className="team-avatar"><span>{initials(f.team_one)}</span></div>
                      <div className="team-name">{f.team_one}</div>
                      {f.status !== 'upcoming' && (
                        <div className={`team-score${t1Won ? ' score-win' : ' score-lose'}`}>{f.teamone_score ?? 0}</div>
                      )}
                    </div>
                    <div className="vs-col">
                      {f.status === 'upcoming' && !isLiveCard ? (
                        <><div className="vs-text">VS</div><div className="vs-time">{f.time || '—'}</div></>
                      ) : (
                        <><div className="vs-sep">—</div>
                          {parsedSets.length > 0 && (
                            <div className="sets-chips">
                              {parsedSets.map((s, i) => <span key={i} className="set-chip">{s.t1}:{s.t2}</span>)}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <div className={`team-col team-right${f.status !== 'upcoming' && t2Won ? ' team-winner' : ''}`}>
                      <div className="team-avatar"><span>{initials(f.team_two)}</span></div>
                      <div className="team-name">{f.team_two}</div>
                      {f.status !== 'upcoming' && (
                        <div className={`team-score${t2Won ? ' score-win' : ' score-lose'}`}>{f.teamtwo_score ?? 0}</div>
                      )}
                    </div>
                  </div>

                  <div className="card-foot">
                    <div className="foot-info">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      {formatDate(f.date)}
                    </div>
                    {f.venue && (
                      <div className="foot-info">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" fill="currentColor" opacity="0.6"/>
                        </svg>
                        {f.venue}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;900&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .page {
          min-height: 100vh;
          background: #1e3a8a;
          font-family: 'Archivo', sans-serif;
          color: white;
        }

        /* ── NAVBAR ── */
        .navbar {
          position: fixed; top: 0; left: 0; right: 0;
          z-index: 100; padding: 1.5rem 0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .navbar.scrolled {
          background: rgba(30,58,138,0.95);
          backdrop-filter: blur(20px);
          padding: 1rem 0;
          box-shadow: 0 4px 30px rgba(0,0,0,0.3);
          border-bottom: 2px solid rgba(220,38,38,0.3);
        }
        .nav-container {
          max-width: 1400px; margin: 0 auto;
          padding: 0 2rem;
          display: flex; justify-content: space-between; align-items: center;
        }
        .logo { text-decoration: none; }
        .logo-badge { display: flex; align-items: center; gap: 1rem; transition: transform 0.3s ease; }
        .logo-badge:hover { transform: translateY(-2px); }
        .logo-icon {
          width: 50px; height: 50px;
          display: flex; align-items: center; justify-content: center;
          filter: drop-shadow(0 0 10px rgba(220,38,38,0.5));
        }
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
        .menu-toggle { display: none; flex-direction: column; gap: 6px; background: none; border: none; cursor: pointer; padding: 0.5rem; z-index: 101; }
        .menu-toggle span { width: 28px; height: 2px; background: #fff; transition: all 0.3s ease; border-radius: 2px; }
        .menu-toggle.open span:nth-child(1) { transform: rotate(45deg) translate(8px, 8px); }
        .menu-toggle.open span:nth-child(2) { opacity: 0; }
        .menu-toggle.open span:nth-child(3) { transform: rotate(-45deg) translate(7px, -7px); }
        .mobile-menu { position: fixed; top: 0; right: -100%; width: 100%; max-width: 400px; height: 100vh; background: rgba(30,58,138,0.98); backdrop-filter: blur(20px); z-index: 99; transition: right 0.4s cubic-bezier(0.4,0,0.2,1); padding: 6rem 2rem 2rem; border-left: 2px solid rgba(220,38,38,0.3); }
        .mobile-menu.open { right: 0; }
        .mobile-nav { display: flex; flex-direction: column; gap: 2rem; }
        .mobile-nav a { font-family: 'Archivo', sans-serif; font-size: 1.5rem; font-weight: 600; color: rgba(255,255,255,0.9); text-decoration: none; transition: all 0.3s ease; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .mobile-nav a:hover, .mobile-nav a.admin { color: #DC2626; }

        /* ── HERO ── */
        .hero-section {
          position: relative; min-height: 70vh; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
        }
        .hero-background { position: absolute; inset: 0; background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%); z-index: 1; }
        .hero-overlay { position: absolute; inset: 0; background: radial-gradient(circle at 50% 50%, rgba(220,38,38,0.2) 0%, rgba(30,58,138,0.85) 50%, rgba(30,58,138,0.95) 100%); z-index: 2; }
        .grain-overlay { position: absolute; inset: 0; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E"); opacity: 0.03; z-index: 3; pointer-events: none; }
        .hero-decoration { position: absolute; inset: 0; z-index: 1; pointer-events: none; overflow: hidden; }
        .decoration-circle { position: absolute; border: 1px solid rgba(220,38,38,0.15); border-radius: 50%; animation: rotate 20s linear infinite; }
        .circle-1 { width: 400px; height: 400px; top: -200px; right: -200px; }
        .circle-2 { width: 600px; height: 600px; bottom: -300px; left: -300px; animation-direction: reverse; animation-duration: 30s; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .decoration-line { position: absolute; width: 1px; height: 100%; background: linear-gradient(180deg, transparent 0%, rgba(220,38,38,0.1) 50%, transparent 100%); }
        .line-1 { left: 20%; } .line-2 { right: 20%; }
        .hero-content { position: relative; z-index: 10; text-align: center; max-width: 1200px; padding: 8rem 2rem 4rem; animation: fadeInUp 1s ease-out; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .hero-badge { display: inline-flex; align-items: center; gap: 0.4rem; font-family: 'Space Mono', monospace; font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase; color: #fff; padding: 0.5rem 1.5rem; border: 1px solid rgba(220,38,38,0.5); border-radius: 50px; margin-bottom: 2rem; background: rgba(220,38,38,0.15); animation: pulse 2s ease-in-out infinite; }
        .badge-live-dot { width: 7px; height: 7px; background: #DC2626; border-radius: 50%; animation: blink 1s infinite; }
        @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.4); } 50% { box-shadow: 0 0 0 10px rgba(220,38,38,0); } }
        .hero-title { font-family: 'Archivo', sans-serif; font-size: clamp(3rem, 10vw, 7rem); font-weight: 900; line-height: 1; margin: 0 0 2rem; letter-spacing: -0.03em; }
        .title-line { display: block; animation: slideIn 0.8s ease-out backwards; }
        .title-line:nth-child(1) { animation-delay: 0.2s; color: #fff; }
        .title-line:nth-child(2) { animation-delay: 0.4s; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-50px); } to { opacity: 1; transform: translateX(0); } }
        .gradient-text { background: linear-gradient(135deg, #DC2626 0%, #EF4444 50%, #F87171 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; filter: drop-shadow(0 0 20px rgba(220,38,38,0.5)); }
        .hero-description { font-family: 'Archivo', sans-serif; font-size: clamp(1rem, 2vw, 1.25rem); line-height: 1.6; color: rgba(255,255,255,0.9); max-width: 700px; margin: 0 auto 3rem; font-weight: 400; animation: fadeIn 1s ease-out 0.8s backwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .hero-stats { display: flex; justify-content: center; align-items: center; gap: 2rem; margin: 3rem 0; animation: fadeIn 1s ease-out 1s backwards; }
        .stat { text-align: center; }
        .stat-number { font-family: 'Archivo', sans-serif; font-size: 2.5rem; font-weight: 900; background: linear-gradient(135deg, #fff 0%, #DC2626 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1; margin-bottom: 0.5rem; }
        .stat-label { font-family: 'Space Mono', monospace; font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.7); }
        .stat-divider { width: 1px; height: 50px; background: linear-gradient(180deg, transparent 0%, rgba(220,38,38,0.6) 50%, transparent 100%); }

        /* ── FILTERS ── */
        .filters-wrap {
          position: sticky; top: 72px; z-index: 30;
          background: rgba(30,58,138,0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(220,38,38,0.15);
          padding: 0.875rem 2rem;
        }
        .filters { max-width: 1400px; margin: 0 auto; display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .filter-btn { font-family: 'Archivo', sans-serif; font-size: 0.8rem; font-weight: 600; padding: 0.5rem 1.1rem; border: 1px solid rgba(255,255,255,0.15); background: transparent; color: rgba(255,255,255,0.55); border-radius: 50px; cursor: pointer; transition: all 0.2s; white-space: nowrap; letter-spacing: 0.02em; }
        .filter-btn:hover { border-color: rgba(220,38,38,0.5); color: rgba(255,255,255,0.9); background: rgba(220,38,38,0.05); }
        .filter-active { background: linear-gradient(135deg, #DC2626, #B91C1C); border-color: transparent; color: white; box-shadow: 0 4px 15px rgba(220,38,38,0.3); }

        /* ── TABS ── */
        .tabs-wrap { padding: 0 2rem; border-bottom: 1px solid rgba(255,255,255,0.08); background: rgba(30,58,138,0.6); }
        .tabs { max-width: 1400px; margin: 0 auto; display: flex; gap: 0; }
        .tab { font-family: 'Archivo', sans-serif; font-size: 0.9rem; font-weight: 600; padding: 1rem 1.5rem; background: transparent; border: none; color: rgba(255,255,255,0.45); cursor: pointer; display: flex; align-items: center; gap: 0.5rem; border-bottom: 2px solid transparent; transition: all 0.2s; position: relative; bottom: -1px; }
        .tab:hover { color: rgba(255,255,255,0.8); }
        .tab-active { color: white; border-bottom-color: #DC2626; }
        .tab-live.tab-active { border-bottom-color: #DC2626; }
        .tab-live-dot { width: 7px; height: 7px; background: #dc2626; border-radius: 50%; display: inline-block; animation: blink 1s infinite; }
        .tab-count { font-family: 'Space Mono', monospace; font-size: 0.65rem; padding: 0.15rem 0.45rem; background: rgba(255,255,255,0.08); border-radius: 50px; color: rgba(255,255,255,0.6); }

        /* ── MAIN ── */
        .main { max-width: 1400px; margin: 0 auto; padding: 2rem; }
        .empty { text-align: center; padding: 5rem 2rem; color: rgba(255,255,255,0.35); display: flex; flex-direction: column; align-items: center; gap: 1rem; font-size: 1rem; }

        /* ── CARDS ── */
        .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 1.25rem; }
        .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden; transition: all 0.3s ease; animation: cardIn 0.4s ease backwards; }
        @keyframes cardIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .card:hover { border-color: rgba(220,38,38,0.3); background: rgba(255,255,255,0.07); transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.3); }
        .card-live { border-color: rgba(220,38,38,0.35) !important; background: rgba(220,38,38,0.04) !important; animation: cardIn 0.4s ease backwards, livePulse 3s ease-in-out infinite; }
        @keyframes livePulse { 0%,100% { box-shadow: 0 0 0 1px rgba(220,38,38,0.15); } 50% { box-shadow: 0 0 0 1px rgba(220,38,38,0.3), 0 8px 30px rgba(220,38,38,0.15); } }
        .card-head { display: flex; justify-content: space-between; align-items: center; padding: 0.875rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .div-chip { display: inline-flex; align-items: center; gap: 0.5rem; font-family: 'Space Mono', monospace; font-size: 0.68rem; letter-spacing: 0.05em; color: rgba(255,255,255,0.6); }
        .div-chip-code { width: 26px; height: 26px; background: linear-gradient(135deg, #1e3a8a, #1e40af); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: 700; color: white; letter-spacing: 0; flex-shrink: 0; }
        .live-badge { display: inline-flex; align-items: center; gap: 0.35rem; font-family: 'Space Mono', monospace; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.1em; padding: 0.25rem 0.65rem; background: rgba(220,38,38,0.15); border: 1px solid rgba(220,38,38,0.4); border-radius: 50px; color: #ef4444; }
        .live-dot { width: 6px; height: 6px; background: #ef4444; border-radius: 50%; animation: blink 1s infinite; }
        .done-badge { font-family: 'Space Mono', monospace; font-size: 0.62rem; letter-spacing: 0.1em; padding: 0.25rem 0.65rem; background: rgba(22,163,74,0.12); border: 1px solid rgba(22,163,74,0.3); border-radius: 50px; color: #4ade80; }
        .soon-badge { font-family: 'Space Mono', monospace; font-size: 0.62rem; letter-spacing: 0.1em; padding: 0.25rem 0.65rem; background: rgba(250,204,21,0.08); border: 1px solid rgba(250,204,21,0.25); border-radius: 50px; color: #fbbf24; }
        .matchup { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 0.75rem; padding: 1.5rem 1.25rem; }
        .team-col { display: flex; flex-direction: column; align-items: center; gap: 0.625rem; text-align: center; transition: all 0.2s; }
        .team-right { align-items: center; }
        .team-winner .team-avatar { border-color: rgba(220,38,38,0.5); background: rgba(220,38,38,0.1); }
        .team-winner .team-name { color: white; }
        .team-avatar { width: 52px; height: 52px; border-radius: 14px; background: rgba(30,64,175,0.15); border: 1.5px solid rgba(30,64,175,0.3); display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: 900; color: rgba(255,255,255,0.7); letter-spacing: -0.02em; transition: all 0.2s; }
        .team-name { font-size: 0.82rem; font-weight: 600; color: rgba(255,255,255,0.75); line-height: 1.3; max-width: 110px; }
        .team-score { font-size: 2rem; font-weight: 900; line-height: 1; letter-spacing: -0.03em; }
        .score-win { color: #dc2626; }
        .score-lose { color: rgba(255,255,255,0.25); }
        .vs-col { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; min-width: 70px; }
        .vs-text { font-family: 'Space Mono', monospace; font-size: 0.75rem; font-weight: 700; color: rgba(255,255,255,0.25); letter-spacing: 0.1em; }
        .vs-time { font-family: 'Space Mono', monospace; font-size: 0.7rem; color: rgba(255,255,255,0.4); }
        .vs-sep { font-size: 1.5rem; font-weight: 300; color: rgba(255,255,255,0.15); }
        .sets-chips { display: flex; flex-direction: column; gap: 0.25rem; align-items: center; }
        .set-chip { font-family: 'Space Mono', monospace; font-size: 0.6rem; padding: 0.15rem 0.45rem; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); border-radius: 4px; color: rgba(255,255,255,0.5); white-space: nowrap; }
        .card-foot { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1.25rem; border-top: 1px solid rgba(255,255,255,0.05); gap: 1rem; flex-wrap: wrap; }
        .foot-info { display: flex; align-items: center; gap: 0.4rem; font-family: 'Space Mono', monospace; font-size: 0.65rem; color: rgba(255,255,255,0.4); letter-spacing: 0.04em; }

        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }

        @media (max-width: 1024px) { .nav-links { display: none; } .menu-toggle { display: flex; } }
        @media (max-width: 768px) {
          .hero-stats { gap: 1rem; }
          .stat-divider { display: none; }
          .filters-wrap { padding: 0.75rem 1rem; top: 60px; }
          .tabs-wrap { padding: 0 1rem; }
          .main { padding: 1.25rem 1rem; }
          .cards { grid-template-columns: 1fr; }
          .card-foot { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
          .logo-icon { width: 40px; height: 40px; }
          .logo-text { font-size: 1.5rem; }
        }
      `}</style>
    </div>
  )
}