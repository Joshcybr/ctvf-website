'use client'

import { JSX, useEffect, useState } from "react"
import { supabase } from "@/app/lib/supabaseClient"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"

interface Team {
  id: number
  name: string
  division: string
  coach: string
  contact_email: string
  contact_phone: string
  home_venue: string
  wins: number
  losses: number
  draws: number
  points: number
}

const DIVISIONS = ['Mens Premier', 'Women Premier', 'Men First Division', 'Women First Division', 'Mixed']

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

export default function AdminTeams() {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [editing, setEditing] = useState<number | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [filterDiv, setFilterDiv] = useState<string>('All')

  const emptyForm = {
    name: '', division: DIVISIONS[0], coach: '',
    contact_email: '', contact_phone: '', home_venue: '',
    wins: 0, losses: 0, draws: 0, points: 0
  }
  const [form, setForm] = useState(emptyForm)

  async function load() {
    try {
      const { data, error } = await supabase.from('teams').select('*').order('points', { ascending: false })
      if (error) { alert('Failed to load teams.'); return }
      if (data) setTeams(data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function addTeam() {
    if (!form.name || !form.division) { alert("Please fill in required fields"); return }
    const { error } = await supabase.from('teams').insert(form)
    if (error) { alert('Failed to add team.'); return }
    setForm(emptyForm); setShowAddForm(false); await load()
  }

  async function del(id: number) {
    if (!confirm("Delete this team?")) return
    const { error } = await supabase.from('teams').delete().eq('id', id)
    if (error) { alert('Failed to delete team.'); return }
    await load()
  }

  async function save(id: number) {
    const t = teams.find(x => x.id === id); if (!t) return
    const { error } = await supabase.from('teams').update({
      name: t.name, division: t.division, coach: t.coach,
      contact_email: t.contact_email, contact_phone: t.contact_phone,
      home_venue: t.home_venue, wins: t.wins, losses: t.losses,
      draws: t.draws, points: t.points
    }).eq('id', id)
    if (error) { alert('Failed to update team.'); return }
    setEditing(null); await load()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const filteredTeams = filterDiv === 'All'
    ? teams
    : teams.filter(t => t.division === filterDiv)

  const sidebarStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, width: 280, height: '100vh',
    background: 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%)',
    display: 'flex', flexDirection: 'column', zIndex: 50,
    transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform 0.3s cubic-bezier(.4,0,.2,1)',
    boxShadow: '4px 0 30px rgba(0,0,0,0.25)',
    fontFamily: "'Inter', sans-serif", boxSizing: 'border-box',
  }

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
      Loading teams...
    </div>
  )

  return (
    <div className="shell">

      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 40, backdropFilter: 'blur(2px)' }} />
      )}

      <aside style={sidebarStyle}>
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

      <div className="page-wrap">
        <div className="topbar">
          <button className="burger" onClick={() => setSidebarOpen(true)}>
            <span /><span /><span />
          </button>
          <div className="topbar-title">
            <h1>Teams Management</h1>
            <p>{filteredTeams.length} of {teams.length} team{teams.length !== 1 ? 's' : ''}{filterDiv !== 'All' ? ` in ${filterDiv}` : ''}</p>
          </div>
          <button className="btn-add" onClick={() => setShowAddForm(!showAddForm)}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path d="M10 2v16M2 10h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            {showAddForm ? 'Cancel' : 'Add Team'}
          </button>
        </div>

        <div className="content">

          {/* Add team form */}
          {showAddForm && (
            <div className="form-card">
              <h2 className="form-title">Register New Team</h2>
              <div className="form-grid">
                <div className="fg"><label>Team Name <span style={{color:'#ef4444'}}>*</span></label><input placeholder="Enter team name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div className="fg">
                  <label>Division <span style={{color:'#ef4444'}}>*</span></label>
                  <select value={form.division} onChange={e => setForm({ ...form, division: e.target.value })}>
                    {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="fg"><label>Coach</label><input placeholder="Coach name" value={form.coach} onChange={e => setForm({ ...form, coach: e.target.value })} /></div>
                <div className="fg"><label>Email</label><input type="email" placeholder="team@example.com" value={form.contact_email} onChange={e => setForm({ ...form, contact_email: e.target.value })} /></div>
                <div className="fg"><label>Phone</label><input type="tel" placeholder="+27 123 456 7890" value={form.contact_phone} onChange={e => setForm({ ...form, contact_phone: e.target.value })} /></div>
                <div className="fg"><label>Home Venue</label><input placeholder="Enter venue" value={form.home_venue} onChange={e => setForm({ ...form, home_venue: e.target.value })} /></div>
              </div>
              <button onClick={addTeam} className="btn-submit">Register Team</button>
            </div>
          )}

          {/* Division filter bar */}
          <div className="filter-bar">
            {['All', ...DIVISIONS].map(div => (
              <button
                key={div}
                onClick={() => setFilterDiv(div)}
                className={`filter-btn${filterDiv === div ? ' filter-active' : ''}`}
              >
                {div}
                <span className="filter-count">
                  {div === 'All' ? teams.length : teams.filter(t => t.division === div).length}
                </span>
              </button>
            ))}
          </div>

          {/* Teams grid */}
          <div className="teams-grid">
            {filteredTeams.length === 0 ? (
              <div className="empty">
                No teams{filterDiv !== 'All' ? ` in ${filterDiv}` : ''} yet.
              </div>
            ) : (
              filteredTeams.map(t => (
                <div key={t.id} className="team-card">

                  {editing === t.id ? (
                    <div className="card-body">
                      <div className="form-grid-sm">
                        <div className="fg"><label>Team Name</label><input value={t.name} onChange={e => setTeams(teams.map(x => x.id === t.id ? { ...x, name: e.target.value } : x))} /></div>
                        <div className="fg">
                          <label>Division</label>
                          <select value={t.division} onChange={e => setTeams(teams.map(x => x.id === t.id ? { ...x, division: e.target.value } : x))}>
                            {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                        <div className="fg"><label>Coach</label><input value={t.coach} onChange={e => setTeams(teams.map(x => x.id === t.id ? { ...x, coach: e.target.value } : x))} /></div>
                        <div className="fg"><label>Email</label><input type="email" value={t.contact_email} onChange={e => setTeams(teams.map(x => x.id === t.id ? { ...x, contact_email: e.target.value } : x))} /></div>
                        <div className="fg"><label>Phone</label><input type="tel" value={t.contact_phone} onChange={e => setTeams(teams.map(x => x.id === t.id ? { ...x, contact_phone: e.target.value } : x))} /></div>
                        <div className="fg"><label>Venue</label><input value={t.home_venue} onChange={e => setTeams(teams.map(x => x.id === t.id ? { ...x, home_venue: e.target.value } : x))} /></div>
                        <div className="fg"><label>Wins</label><input type="number" value={t.wins} onChange={e => setTeams(teams.map(x => x.id === t.id ? { ...x, wins: Number(e.target.value) } : x))} /></div>
                        <div className="fg"><label>Losses</label><input type="number" value={t.losses} onChange={e => setTeams(teams.map(x => x.id === t.id ? { ...x, losses: Number(e.target.value) } : x))} /></div>
                        <div className="fg"><label>Draws</label><input type="number" value={t.draws} onChange={e => setTeams(teams.map(x => x.id === t.id ? { ...x, draws: Number(e.target.value) } : x))} /></div>
                        <div className="fg"><label>Points</label><input type="number" value={t.points} onChange={e => setTeams(teams.map(x => x.id === t.id ? { ...x, points: Number(e.target.value) } : x))} /></div>
                      </div>
                      <div className="row-btns">
                        <button onClick={() => save(t.id)} className="b-save">Save</button>
                        <button onClick={() => setEditing(null)} className="b-ghost">Cancel</button>
                      </div>
                    </div>

                  ) : (
                    <>
                      <div className="team-collapsed" onClick={() => setExpanded(expanded === t.id ? null : t.id)}>
                        <div className="team-info">
                          <h3 className="team-name">{t.name}</h3>
                          <span className="div-badge">{t.division}</span>
                        </div>
                        <div className="stats-row">
                          <span className="stat-pill">{t.points}<small>PTS</small></span>
                          <span className="stat-pill">{t.wins}<small>W</small></span>
                          <span className="stat-pill">{t.losses}<small>L</small></span>
                          <span className="stat-pill">{t.draws}<small>D</small></span>
                        </div>
                        <svg className={`chevron${expanded === t.id ? ' open' : ''}`} width="18" height="18" viewBox="0 0 20 20" fill="none">
                          <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>

                      {expanded === t.id && (
                        <div className="team-expanded">
                          {(t.coach || t.contact_email || t.contact_phone || t.home_venue) && (
                            <div className="team-details">
                              {t.coach && <div><strong>Coach:</strong> {t.coach}</div>}
                              {t.contact_email && <div><strong>Email:</strong> {t.contact_email}</div>}
                              {t.contact_phone && <div><strong>Phone:</strong> {t.contact_phone}</div>}
                              {t.home_venue && <div><strong>Venue:</strong> {t.home_venue}</div>}
                            </div>
                          )}
                          <div className="row-btns">
                            <button onClick={e => { e.stopPropagation(); setEditing(t.id) }} className="b-ghost">Edit</button>
                            <button onClick={e => { e.stopPropagation(); del(t.id) }} className="b-del">Delete</button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .shell { display: flex; min-height: 100vh; background: #f8fafc; font-family: 'Inter', sans-serif; }
        .page-wrap { flex: 1; display: flex; flex-direction: column; min-width: 0; }

        .topbar { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.5rem; background: white; border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 10; }
        .burger { display: flex; flex-direction: column; justify-content: center; gap: 5px; width: 38px; height: 38px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; padding: 0 9px; flex-shrink: 0; }
        .burger span { display: block; height: 2px; background: #475569; border-radius: 2px; }
        .burger:hover span { background: #1e293b; }
        .topbar-title { flex: 1; }
        .topbar-title h1 { font-size: 1.25rem; font-weight: 800; color: #1e293b; }
        .topbar-title p { font-size: 0.8rem; color: #94a3b8; margin-top: 1px; }
        .btn-add { display: flex; align-items: center; gap: 0.4rem; padding: 0.6rem 1.1rem; background: #1e40af; color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer; white-space: nowrap; font-family: 'Inter', sans-serif; transition: background 0.15s; }
        .btn-add:hover { background: #1e3a8a; }

        .content { padding: 1.25rem 1.5rem; }

        /* Form */
        .form-card { background: white; border-radius: 12px; padding: 1.25rem; margin-bottom: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border-left: 4px solid #1e40af; }
        .form-title { font-size: 1rem; font-weight: 700; color: #0f172a; margin-bottom: 1rem; }
        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.875rem; margin-bottom: 1rem; }
        .form-grid-sm { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; margin-bottom: 1rem; }
        .fg label { display: block; font-size: 0.72rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.35rem; }
        .fg input, .fg select { width: 100%; padding: 0.6rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.875rem; font-family: 'Inter', sans-serif; color: #1e293b; background: white; transition: border-color 0.15s; }
        .fg input:focus, .fg select:focus { outline: none; border-color: #1e40af; box-shadow: 0 0 0 3px rgba(30,64,175,0.08); }
        .btn-submit { width: 100%; padding: 0.75rem; background: #1e40af; color: white; border: none; border-radius: 8px; font-weight: 700; font-size: 0.9rem; cursor: pointer; font-family: 'Inter', sans-serif; transition: background 0.15s; }
        .btn-submit:hover { background: #1e3a8a; }

        /* Filter bar */
        .filter-bar { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.25rem; padding: 0.875rem 1rem; background: white; border-radius: 10px; border: 1px solid #e2e8f0; }
        .filter-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.875rem; border: 1px solid #e2e8f0; background: #f8fafc; color: #475569; border-radius: 50px; font-size: 0.78rem; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.15s; white-space: nowrap; }
        .filter-btn:hover { border-color: #1e40af; color: #1e40af; background: #eff6ff; }
        .filter-active { background: #1e40af; color: white; border-color: #1e40af; }
        .filter-active:hover { background: #1e3a8a; border-color: #1e3a8a; color: white; }
        .filter-count { font-size: 0.65rem; padding: 0.1rem 0.4rem; background: rgba(0,0,0,0.1); border-radius: 50px; font-weight: 700; min-width: 18px; text-align: center; }
        .filter-active .filter-count { background: rgba(255,255,255,0.25); }

        /* Teams grid */
        .teams-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 0.875rem; }

        .team-card { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border-left: 4px solid #1e40af; overflow: hidden; transition: box-shadow 0.2s; }
        .team-card:hover { box-shadow: 0 4px 12px rgba(30,64,175,0.12); }
        .card-body { padding: 1rem; }

        .team-collapsed { padding: 1rem 1.25rem; cursor: pointer; display: flex; align-items: center; gap: 0.875rem; justify-content: space-between; transition: background 0.15s; }
        .team-collapsed:hover { background: #f8fafc; }
        .team-info { flex: 1; min-width: 0; }
        .team-name { font-size: 1rem; font-weight: 700; color: #0f172a; margin-bottom: 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .div-badge { display: inline-block; padding: 0.2rem 0.5rem; border-radius: 5px; font-size: 0.68rem; font-weight: 700; background: #dbeafe; color: #1e40af; }

        .stats-row { display: flex; gap: 0.75rem; align-items: center; flex-shrink: 0; }
        .stat-pill { font-size: 0.95rem; font-weight: 700; color: #0f172a; white-space: nowrap; }
        .stat-pill small { font-size: 0.65rem; color: #64748b; font-weight: 600; margin-left: 1px; }

        .chevron { color: #94a3b8; transition: transform 0.2s; flex-shrink: 0; }
        .chevron.open { transform: rotate(180deg); }

        .team-expanded { padding: 0 1.25rem 1rem; border-top: 1px solid #f1f5f9; animation: slideDown 0.18s ease; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }

        .team-details { padding: 0.875rem; background: #f8fafc; border-radius: 8px; margin: 0.875rem 0; font-size: 0.85rem; line-height: 1.9; color: #1e293b; }
        .team-details strong { color: #334155; font-weight: 600; margin-right: 0.4rem; }

        .row-btns { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .b-ghost { padding: 0.5rem 1rem; background: #f1f5f9; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 7px; font-weight: 600; font-size: 0.8rem; cursor: pointer; font-family: 'Inter', sans-serif; transition: background 0.15s; }
        .b-ghost:hover { background: #e2e8f0; }
        .b-del { padding: 0.5rem 1rem; background: #fee2e2; color: #dc2626; border: none; border-radius: 7px; font-weight: 600; font-size: 0.8rem; cursor: pointer; font-family: 'Inter', sans-serif; transition: background 0.15s; }
        .b-del:hover { background: #fecaca; }
        .b-save { padding: 0.5rem 1rem; background: #16a34a; color: white; border: none; border-radius: 7px; font-weight: 600; font-size: 0.8rem; cursor: pointer; font-family: 'Inter', sans-serif; transition: background 0.15s; }
        .b-save:hover { background: #15803d; }

        .empty { grid-column: 1/-1; text-align: center; padding: 3rem; color: #94a3b8; font-size: 1rem; }

        @media (max-width: 640px) {
          .content { padding: 1rem; }
          .teams-grid { grid-template-columns: 1fr; }
          .topbar { padding: 0.875rem 1rem; }
          .topbar-title p { display: none; }
          .stats-row { gap: 0.5rem; }
        }
      `}</style>
    </div>
  )
}