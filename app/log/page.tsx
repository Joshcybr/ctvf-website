'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface Fixture {
  id: number
  date: string
  time: string
  team_one: string
  team_two: string
  venue: string
  division: string
  status: string
  teamone_score: number | null
  teamtwo_score: number | null
  sets_detail: string | null
  is_live: boolean
}

interface TeamStanding {
  position: number
  team: string
  played: number
  won: number
  lost: number
  setsWon: number
  setsLost: number
  points: number
  form: Array<'W' | 'L'>
}

type DivisionKey = 'mensPremier' | 'womensPremier' | 'mensFirst' | 'womensFirst' | 'mixed'

const DIVISION_LABELS: Record<DivisionKey, string> = {
  mensPremier: "Men's Premier",
  womensPremier: "Women's Premier",
  mensFirst: "Men First Division",
  womensFirst: "Women First Division",
  mixed: "Mixed",
}

const DIVISION_MAP: Record<DivisionKey, string[]> = {
  mensPremier: ['Mens Premier', "Men's Premier"],
  womensPremier: ['Women Premier', "Women's Premier"],
  mensFirst: ['Men First Division'],
  womensFirst: ['Women First Division'],
  mixed: ['Mixed'],
}

function buildStandings(fixtures: Fixture[], divKey: DivisionKey): TeamStanding[] {
  const allowed = DIVISION_MAP[divKey]
  const completed = fixtures.filter(f => f.status === 'completed' && allowed.some(d => f.division === d))
  const teams: Record<string, { won: number; lost: number; played: number; setsWon: number; setsLost: number; form: Array<'W' | 'L'> }> = {}

  function ensureTeam(name: string) {
    if (!teams[name]) teams[name] = { won: 0, lost: 0, played: 0, setsWon: 0, setsLost: 0, form: [] }
  }

  for (const f of completed) {
    if (f.teamone_score === null || f.teamtwo_score === null) continue
    ensureTeam(f.team_one)
    ensureTeam(f.team_two)
    teams[f.team_one].played++
    teams[f.team_two].played++
    if (f.teamone_score > f.teamtwo_score) {
      teams[f.team_one].won++; teams[f.team_two].lost++
      teams[f.team_one].form.push('W'); teams[f.team_two].form.push('L')
    } else {
      teams[f.team_two].won++; teams[f.team_one].lost++
      teams[f.team_two].form.push('W'); teams[f.team_one].form.push('L')
    }
    if (f.sets_detail) {
      const sets: { t1: number; t2: number }[] = JSON.parse(f.sets_detail)
      for (const s of sets) {
        teams[f.team_one].setsWon += s.t1; teams[f.team_one].setsLost += s.t2
        teams[f.team_two].setsWon += s.t2; teams[f.team_two].setsLost += s.t1
      }
    }
  }

  return Object.entries(teams)
    .map(([team, stats]) => ({ team, ...stats, points: stats.won * 3 }))
    .sort((a, b) => b.points - a.points || (b.setsWon - b.setsLost) - (a.setsWon - a.setsLost))
    .map((t, i) => ({
      position: i + 1, team: t.team, played: t.played,
      won: t.won, lost: t.lost, setsWon: t.setsWon, setsLost: t.setsLost,
      points: t.points, form: t.form.slice(-5) as Array<'W' | 'L'>
    }))
}

export default function Logs() {
  const [activeDivision, setActiveDivision] = useState<DivisionKey>('mensPremier')
  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [loading, setLoading] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  async function fetchFixtures() {
    try {
      const { supabase } = await import('@/app/lib/supabaseClient')
      const { data } = await supabase.from('fixtures').select('*').order('date', { ascending: false })
      if (data) setFixtures(data)
    } catch (e) {
      console.error('Error fetching fixtures:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFixtures()
    const interval = setInterval(fetchFixtures, 15000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const liveFixtures = fixtures.filter(f => f.is_live)
  const recentResults = fixtures.filter(f => f.status === 'completed').slice(0, 6)
  const standings = buildStandings(fixtures, activeDivision)
  const topTeam = standings[0]

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
            <Link href="/news" className="nav-link">News</Link>
            <Link href="/fixtures" className="nav-link">Fixtures</Link>
            <Link href="/log" className="nav-link active">Logs</Link>
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
          <div className="hero-badge">2026 SEASON</div>
          <h1 className="hero-title">
            <span className="title-line">League</span>
            <span className="title-line gradient-text">Standings</span>
          </h1>
          <p className="hero-description">
            Current rankings and team performance across all divisions.
          </p>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">{standings.length}</div>
              <div className="stat-label">Teams</div>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <div className="stat-number">{liveFixtures.length}</div>
              <div className="stat-label">Live Now</div>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <div className="stat-number">{recentResults.length}</div>
              <div className="stat-label">Recent Results</div>
            </div>
          </div>
        </div>
      </div>

      {/* Live banner */}
      {liveFixtures.length > 0 && (
        <div className="live-banner">
          <div className="live-banner-inner">
            <span className="live-pill"><span className="live-dot" />LIVE NOW</span>
            <div className="live-scores-row">
              {liveFixtures.map(f => {
                const sets: { t1: number; t2: number }[] = f.sets_detail ? JSON.parse(f.sets_detail) : []
                return (
                  <div key={f.id} className="live-score-item">
                    <span className={`ls-team ${(f.teamone_score ?? 0) > (f.teamtwo_score ?? 0) ? 'ls-leading' : ''}`}>{f.team_one}</span>
                    <span className="ls-score">{f.teamone_score ?? 0} — {f.teamtwo_score ?? 0}</span>
                    <span className={`ls-team ${(f.teamtwo_score ?? 0) > (f.teamone_score ?? 0) ? 'ls-leading' : ''}`}>{f.team_two}</span>
                    {sets.length > 0 && (
                      <div className="ls-sets">
                        {sets.map((s, i) => <span key={i} className="ls-set-chip">{s.t1}:{s.t2}</span>)}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Division Tabs */}
      <div className="tabs-wrap">
        <div className="tabs">
          {(Object.keys(DIVISION_LABELS) as DivisionKey[]).map(div => (
            <button
              key={div}
              onClick={() => setActiveDivision(div)}
              className={`tab${activeDivision === div ? ' tab-active' : ''}`}
            >
              {DIVISION_LABELS[div]}
            </button>
          ))}
        </div>
      </div>

      <main className="main">

        {/* Leader card */}
        {topTeam && (
          <div className="leader-card">
            <div className="leader-left">
              <span className="leader-rank">#1</span>
              <div>
                <div className="leader-name">{topTeam.team}</div>
                <div className="leader-sub">
                  {topTeam.won}W – {topTeam.lost}L &nbsp;·&nbsp; {topTeam.points} pts &nbsp;·&nbsp; Sets {topTeam.setsWon}–{topTeam.setsLost}
                </div>
              </div>
            </div>
            <div className="leader-form">
              {topTeam.form.map((r, i) => (
                <span key={i} className={`form-dot ${r === 'W' ? 'form-w' : 'form-l'}`}>{r}</span>
              ))}
            </div>
          </div>
        )}

        {/* Standings table */}
        {loading ? (
          <div className="loading-state">Loading standings...</div>
        ) : standings.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" opacity="0.3">
              <path d="M3 3h18v4H3zM3 10h18v4H3zM3 17h18v4H3z" stroke="white" strokeWidth="1.5"/>
            </svg>
            <p>No completed matches yet for this division.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th className="th-pos">#</th>
                  <th className="th-team">Team</th>
                  <th>P</th>
                  <th>W</th>
                  <th>L</th>
                  <th>Sets</th>
                  <th>Pts</th>
                  <th className="th-form">Form</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((team, idx) => (
                  <tr key={team.team} className={`tr ${team.position <= 3 ? 'tr-top' : ''}`} style={{ animationDelay: `${idx * 0.04}s` }}>
                    <td>
                      <div className={`pos-badge ${team.position === 1 ? 'pos-1' : team.position === 2 ? 'pos-2' : team.position === 3 ? 'pos-3' : 'pos-n'}`}>
                        {team.position}
                      </div>
                    </td>
                    <td>
                      <div className="team-cell">
                        <div className="team-icon">{team.team.charAt(0)}</div>
                        <span className="team-cell-name">{team.team}</span>
                      </div>
                    </td>
                    <td className="td-num">{team.played}</td>
                    <td className="td-num td-w">{team.won}</td>
                    <td className="td-num td-l">{team.lost}</td>
                    <td className="td-num">{team.setsWon}–{team.setsLost}</td>
                    <td className="td-num td-pts">{team.points}</td>
                    <td>
                      <div className="form-row">
                        {team.form.map((r, i) => (
                          <span key={i} className={`form-dot ${r === 'W' ? 'form-w' : 'form-l'}`} title={r === 'W' ? 'Win' : 'Loss'} />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="table-legend">
              <span>P: Played</span>
              <span>W: Won</span>
              <span>L: Lost</span>
              <span>Sets: Won–Lost</span>
              <span>Pts: Points (3 per win)</span>
            </div>
          </div>
        )}

        {/* Recent results */}
        {recentResults.length > 0 && (
          <div className="results-section">
            <h2 className="results-title">Recent Results</h2>
            <div className="results-grid">
              {recentResults.map(f => {
                const sets: { t1: number; t2: number }[] = f.sets_detail ? JSON.parse(f.sets_detail) : []
                const t1win = (f.teamone_score ?? 0) > (f.teamtwo_score ?? 0)
                return (
                  <div key={f.id} className="result-card">
                    <div className="result-head">
                      <span className="result-div">{f.division}</span>
                      <span className="result-date">{new Date(f.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <div className="result-matchup">
                      <span className={t1win ? 'result-winner' : 'result-loser'}>{f.team_one}</span>
                      <div className="result-score-box">
                        <span className={t1win ? 'result-winner' : 'result-loser'}>{f.teamone_score}</span>
                        <span className="result-sep">—</span>
                        <span className={!t1win ? 'result-winner' : 'result-loser'}>{f.teamtwo_score}</span>
                      </div>
                      <span className={!t1win ? 'result-winner' : 'result-loser'}>{f.team_two}</span>
                    </div>
                    {sets.length > 0 && (
                      <div className="result-sets">
                        {sets.map((s, i) => <span key={i} className="set-chip">{s.t1}:{s.t2}</span>)}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;900&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .page { min-height: 100vh; background: #1e3a8a; font-family: 'Archivo', sans-serif; color: white; }

        /* ── NAVBAR ── */
        .navbar { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 1.5rem 0; transition: all 0.4s cubic-bezier(0.4,0,0.2,1); }
        .navbar.scrolled { background: rgba(30,58,138,0.95); backdrop-filter: blur(20px); padding: 1rem 0; box-shadow: 0 4px 30px rgba(0,0,0,0.3); border-bottom: 2px solid rgba(220,38,38,0.3); }
        .nav-container { max-width: 1400px; margin: 0 auto; padding: 0 2rem; display: flex; justify-content: space-between; align-items: center; }
        .logo { text-decoration: none; }
        .logo-badge { display: flex; align-items: center; gap: 1rem; transition: transform 0.3s ease; }
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
        .menu-toggle { display: none; flex-direction: column; gap: 6px; background: none; border: none; cursor: pointer; padding: 0.5rem; z-index: 101; }
        .menu-toggle span { width: 28px; height: 2px; background: #fff; transition: all 0.3s ease; border-radius: 2px; }
        .menu-toggle.open span:nth-child(1) { transform: rotate(45deg) translate(8px,8px); }
        .menu-toggle.open span:nth-child(2) { opacity: 0; }
        .menu-toggle.open span:nth-child(3) { transform: rotate(-45deg) translate(7px,-7px); }
        .mobile-menu { position: fixed; top: 0; right: -100%; width: 100%; max-width: 400px; height: 100vh; background: rgba(30,58,138,0.98); backdrop-filter: blur(20px); z-index: 99; transition: right 0.4s cubic-bezier(0.4,0,0.2,1); padding: 6rem 2rem 2rem; border-left: 2px solid rgba(220,38,38,0.3); }
        .mobile-menu.open { right: 0; }
        .mobile-nav { display: flex; flex-direction: column; gap: 2rem; }
        .mobile-nav a { font-family: 'Archivo', sans-serif; font-size: 1.5rem; font-weight: 600; color: rgba(255,255,255,0.9); text-decoration: none; transition: all 0.3s ease; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .mobile-nav a:hover, .mobile-nav a.admin { color: #DC2626; }

        /* ── HERO ── */
        .hero-section { position: relative; min-height: 70vh; overflow: hidden; display: flex; align-items: center; justify-content: center; }
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
        .hero-badge { display: inline-block; font-family: 'Space Mono', monospace; font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase; color: #fff; padding: 0.5rem 1.5rem; border: 1px solid rgba(220,38,38,0.5); border-radius: 50px; margin-bottom: 2rem; background: rgba(220,38,38,0.15); animation: pulse 2s ease-in-out infinite; }
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

        /* ── LIVE BANNER ── */
        .live-banner { background: rgba(220,38,38,0.08); border-bottom: 1px solid rgba(220,38,38,0.2); padding: 1rem 2rem; }
        .live-banner-inner { max-width: 1400px; margin: 0 auto; display: flex; align-items: flex-start; gap: 1.5rem; flex-wrap: wrap; }
        .live-pill { display: inline-flex; align-items: center; gap: 0.4rem; font-family: 'Space Mono', monospace; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.12em; color: #EF4444; padding: 0.3rem 0.75rem; border: 1px solid rgba(220,38,38,0.4); border-radius: 50px; background: rgba(220,38,38,0.1); white-space: nowrap; flex-shrink: 0; }
        .live-dot { width: 6px; height: 6px; background: #EF4444; border-radius: 50%; animation: blink 1s infinite; }
        .live-scores-row { display: flex; flex-wrap: wrap; gap: 1rem; }
        .live-score-item { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 0.5rem 0.875rem; }
        .ls-team { font-size: 0.85rem; font-weight: 600; color: rgba(255,255,255,0.6); }
        .ls-leading { color: white; font-weight: 800; }
        .ls-score { font-family: 'Archivo', sans-serif; font-size: 1.1rem; font-weight: 900; color: white; padding: 0 0.25rem; }
        .ls-sets { display: flex; gap: 0.25rem; flex-wrap: wrap; }
        .ls-set-chip { font-family: 'Space Mono', monospace; font-size: 0.6rem; padding: 0.1rem 0.4rem; background: rgba(255,255,255,0.06); border-radius: 4px; color: rgba(255,255,255,0.45); }

        /* ── TABS ── */
        .tabs-wrap { padding: 0 2rem; border-bottom: 1px solid rgba(255,255,255,0.08); background: rgba(30,58,138,0.6); position: sticky; top: 72px; z-index: 30; backdrop-filter: blur(20px); }
        .tabs { max-width: 1400px; margin: 0 auto; display: flex; flex-wrap: wrap; }
        .tab { font-family: 'Archivo', sans-serif; font-size: 0.9rem; font-weight: 600; padding: 1rem 1.5rem; background: transparent; border: none; color: rgba(255,255,255,0.45); cursor: pointer; display: flex; align-items: center; gap: 0.5rem; border-bottom: 2px solid transparent; transition: all 0.2s; position: relative; bottom: -1px; }
        .tab:hover { color: rgba(255,255,255,0.8); }
        .tab-active { color: white; border-bottom-color: #DC2626; }

        /* ── MAIN ── */
        .main { max-width: 1400px; margin: 0 auto; padding: 2rem; }

        /* Leader */
        .leader-card { background: rgba(220,38,38,0.07); border: 1px solid rgba(220,38,38,0.2); border-radius: 16px; padding: 1.5rem 2rem; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap; animation: cardIn 0.4s ease; }
        @keyframes cardIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .leader-left { display: flex; align-items: center; gap: 1.25rem; }
        .leader-rank { font-family: 'Archivo', sans-serif; font-size: 3rem; font-weight: 900; background: linear-gradient(135deg, #DC2626, #EF4444); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1; }
        .leader-name { font-size: 1.4rem; font-weight: 800; color: white; margin-bottom: 0.25rem; }
        .leader-sub { font-family: 'Space Mono', monospace; font-size: 0.7rem; color: rgba(255,255,255,0.5); letter-spacing: 0.05em; }
        .leader-form { display: flex; gap: 0.4rem; align-items: center; }

        /* Table */
        .table-wrap { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; overflow: hidden; margin-bottom: 2rem; }
        .table { width: 100%; border-collapse: collapse; }
        .table thead tr { background: rgba(255,255,255,0.04); border-bottom: 1px solid rgba(255,255,255,0.08); }
        .table th { font-family: 'Space Mono', monospace; font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.4); padding: 0.875rem 1rem; text-align: center; font-weight: 400; }
        .th-pos { width: 60px; }
        .th-team { text-align: left; min-width: 160px; }
        .th-form { min-width: 100px; }
        .tr { border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.2s; animation: rowIn 0.3s ease backwards; }
        @keyframes rowIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
        .tr:hover { background: rgba(255,255,255,0.04); }
        .tr:last-child { border-bottom: none; }
        .tr-top { background: rgba(220,38,38,0.03); }
        .table td { padding: 0.875rem 1rem; text-align: center; }
        .pos-badge { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: 'Space Mono', monospace; font-size: 0.75rem; font-weight: 700; margin: 0 auto; }
        .pos-1 { background: linear-gradient(135deg, #DC2626, #B91C1C); color: white; }
        .pos-2 { background: rgba(220,38,38,0.15); border: 1px solid rgba(220,38,38,0.3); color: #EF4444; }
        .pos-3 { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.7); }
        .pos-n { background: transparent; color: rgba(255,255,255,0.3); }
        .team-cell { display: flex; align-items: center; gap: 0.75rem; }
        .team-icon { width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #1e3a8a, #1e40af); border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 900; color: rgba(255,255,255,0.8); flex-shrink: 0; }
        .team-cell-name { font-size: 0.9rem; font-weight: 600; color: rgba(255,255,255,0.9); text-align: left; }
        .td-num { font-family: 'Space Mono', monospace; font-size: 0.8rem; color: rgba(255,255,255,0.6); }
        .td-w { color: #4ade80; }
        .td-l { color: rgba(255,255,255,0.35); }
        .td-pts { font-family: 'Archivo', sans-serif; font-size: 0.95rem; font-weight: 800; color: white; }
        .form-row { display: flex; gap: 0.3rem; justify-content: center; }
        .form-dot { width: 10px; height: 10px; border-radius: 50%; }
        .form-w { background: #22c55e; }
        .form-l { background: rgba(255,255,255,0.2); }
        .table-legend { display: flex; gap: 1.5rem; flex-wrap: wrap; padding: 0.875rem 1rem; border-top: 1px solid rgba(255,255,255,0.05); font-family: 'Space Mono', monospace; font-size: 0.6rem; color: rgba(255,255,255,0.3); letter-spacing: 0.05em; }

        /* Leader form dots */
        .form-dot.form-w { background: #22c55e; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-family: 'Space Mono', monospace; font-size: 0.65rem; font-weight: 700; color: white; }
        .form-dot.form-l { background: rgba(255,255,255,0.1); border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-family: 'Space Mono', monospace; font-size: 0.65rem; font-weight: 700; color: rgba(255,255,255,0.4); }

        /* Recent results */
        .results-section { margin-top: 2.5rem; }
        .results-title { font-family: 'Archivo', sans-serif; font-size: 1.5rem; font-weight: 800; color: white; margin-bottom: 1.25rem; letter-spacing: -0.01em; }
        .results-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem; }
        .result-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 1.25rem; transition: all 0.2s ease; animation: cardIn 0.4s ease backwards; }
        .result-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(220,38,38,0.25); transform: translateY(-2px); }
        .result-head { display: flex; justify-content: space-between; margin-bottom: 0.75rem; }
        .result-div { font-family: 'Space Mono', monospace; font-size: 0.62rem; letter-spacing: 0.08em; color: rgba(255,255,255,0.4); text-transform: uppercase; }
        .result-date { font-family: 'Space Mono', monospace; font-size: 0.62rem; color: rgba(255,255,255,0.35); }
        .result-matchup { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.5rem; }
        .result-winner { font-size: 0.9rem; font-weight: 700; color: white; }
        .result-loser { font-size: 0.85rem; font-weight: 500; color: rgba(255,255,255,0.4); }
        .result-score-box { display: flex; align-items: center; gap: 0.3rem; font-family: 'Archivo', sans-serif; font-size: 1.4rem; font-weight: 900; }
        .result-sep { color: rgba(255,255,255,0.2); }
        .result-sets { display: flex; flex-wrap: wrap; gap: 0.3rem; margin-top: 0.5rem; }
        .set-chip { font-family: 'Space Mono', monospace; font-size: 0.6rem; padding: 0.15rem 0.4rem; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); border-radius: 4px; color: rgba(255,255,255,0.45); }

        .loading-state, .empty-state { text-align: center; padding: 4rem 2rem; color: rgba(255,255,255,0.35); display: flex; flex-direction: column; align-items: center; gap: 1rem; font-size: 1rem; }

        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }

        @media (max-width: 1024px) { .nav-links { display: none; } .menu-toggle { display: flex; } }
        @media (max-width: 768px) {
          .hero-stats { gap: 1rem; }
          .stat-divider { display: none; }
          .leader-card { flex-direction: column; align-items: flex-start; }
          .table th, .table td { padding: 0.75rem 0.5rem; }
          .team-cell-name { font-size: 0.8rem; }
          .results-grid { grid-template-columns: 1fr; }
          .logo-icon { width: 40px; height: 40px; }
          .logo-text { font-size: 1.5rem; }
          .th-form { display: none; }
          .table td:last-child { display: none; }
        }
      `}</style>
    </div>
  )
}