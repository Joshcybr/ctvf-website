'use client'

import { JSX, useEffect, useState } from "react"
import { supabase } from "@/app/lib/supabaseClient"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"

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

interface Team {
  id: number
  name: string
  division: string
}

interface SetScore { t1: string; t2: string }

function getDivisionRules(division: string) {
  const isPremier = division.toLowerCase().includes('premier') || division.toLowerCase() === 'men' || division.toLowerCase() === 'women'
  return isPremier ? { maxSets: 5, winsNeeded: 3 } : { maxSets: 3, winsNeeded: 2 }
}

function getSetTarget(setIndex: number, maxSets: number) {
  return setIndex + 1 === maxSets ? 15 : 25
}

function isSetValid(t1: number, t2: number, target: number) {
  if (t1 < 0 || t2 < 0) return false
  const winner = Math.max(t1, t2), loser = Math.min(t1, t2)
  if (winner < target) return false
  if (winner === target && loser <= target - 2) return true
  if (winner > target && winner - loser === 2) return true
  return false
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

export default function AdminFixtures() {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [allTeams, setAllTeams] = useState<Team[]>([])
  const [editing, setEditing] = useState<number | null>(null)
  const [addingResults, setAddingResults] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [sets, setSets] = useState<SetScore[]>([{ t1: '', t2: '' }])
  const [savingResults, setSavingResults] = useState(false)

  const emptyForm = { team_one: '', team_two: '', date: '', time: '', venue: '', division: 'Mens Premier' }
  const [form, setForm] = useState(emptyForm)

  // Teams filtered by the currently selected division in the add form
  const teamsInFormDivision = allTeams.filter(t => t.division === form.division)

  // Teams filtered by division for a specific fixture being edited
  function teamsInDivision(division: string) {
    return allTeams.filter(t => t.division === division)
  }

  async function load() {
    try {
      const [{ data: fixtureData }, { data: teamData }] = await Promise.all([
        supabase.from('fixtures').select('*').order('date', { ascending: true }),
        supabase.from('teams').select('id, name, division').order('name'),
      ])
      if (fixtureData) setFixtures(fixtureData)
      if (teamData) setAllTeams(teamData)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])
  useEffect(() => { const i = setInterval(load, 10000); return () => clearInterval(i) }, [])

  // When division changes in the add form, reset team selections
  function handleFormDivisionChange(division: string) {
    setForm({ ...form, division, team_one: '', team_two: '' })
  }

  // When division changes in edit mode, reset team selections for that fixture
  function handleEditDivisionChange(fixtureId: number, division: string) {
    setFixtures(fixtures.map(x => x.id === fixtureId ? { ...x, division, team_one: '', team_two: '' } : x))
  }

  function openAddResults(fixture: Fixture) {
    setAddingResults(fixture.id)
    const existing = fixture.sets_detail ? JSON.parse(fixture.sets_detail) : []
    setSets(existing.length > 0
      ? existing.map((s: { t1: number; t2: number }) => ({ t1: String(s.t1), t2: String(s.t2) }))
      : [{ t1: '', t2: '' }])
  }

  function addSet(fixture: Fixture) {
    const rules = getDivisionRules(fixture.division)
    if (sets.length >= rules.maxSets) return
    setSets([...sets, { t1: '', t2: '' }])
  }

  function removeSet(idx: number) {
    if (sets.length === 1) return
    setSets(sets.filter((_, i) => i !== idx))
  }

  function updateSet(idx: number, field: 't1' | 't2', value: string) {
    setSets(sets.map((s, i) => i === idx ? { ...s, [field]: value } : s))
  }

  async function saveResults(fixture: Fixture, isLive: boolean) {
    setSavingResults(true)
    const rules = getDivisionRules(fixture.division)
    const parsedSets: { t1: number; t2: number }[] = []
    for (let i = 0; i < sets.length; i++) {
      const t1 = parseInt(sets[i].t1), t2 = parseInt(sets[i].t2)
      if (isNaN(t1) || isNaN(t2)) { if (!isLive) { alert(`Set ${i + 1} invalid`); setSavingResults(false); return } continue }
      const target = getSetTarget(i, rules.maxSets)
      if (!isLive && !isSetValid(t1, t2, target)) { alert(`Set ${i + 1} invalid per FIVB rules. Must reach ${target}, win by 2.`); setSavingResults(false); return }
      parsedSets.push({ t1, t2 })
    }
    let t1wins = 0, t2wins = 0
    parsedSets.forEach(s => { if (s.t1 > s.t2) t1wins++; else if (s.t2 > s.t1) t2wins++ })
    const isCompleted = !isLive && (t1wins === rules.winsNeeded || t2wins === rules.winsNeeded)
    const { error } = await supabase.from('fixtures').update({
      teamone_score: t1wins, teamtwo_score: t2wins, sets_detail: JSON.stringify(parsedSets),
      is_live: isLive, status: isCompleted ? 'completed' : isLive ? 'live' : 'upcoming'
    }).eq('id', fixture.id)
    setSavingResults(false)
    if (error) { alert('Failed to save results.'); return }
    setAddingResults(null); await load()
  }

  async function addFixture() {
    if (!form.team_one || !form.team_two || !form.date) { alert("Fill in required fields including both teams"); return }
    if (form.team_one === form.team_two) { alert("Team One and Team Two must be different"); return }
    const { error } = await supabase.from('fixtures').insert({ ...form, status: 'upcoming', is_live: false })
    if (error) { alert('Failed to add fixture.'); return }
    setForm(emptyForm); setShowAddForm(false); await load()
  }

  async function del(id: number) {
    if (!confirm("Delete this fixture?")) return
    const { error } = await supabase.from('fixtures').delete().eq('id', id)
    if (error) { alert('Failed to delete.'); return }
    await load()
  }

  async function save(id: number) {
    const f = fixtures.find(x => x.id === id); if (!f) return
    const status = f.teamone_score !== null && f.teamtwo_score !== null ? "completed" : "upcoming"
    const { error } = await supabase.from('fixtures').update({
      team_one: f.team_one, team_two: f.team_two, venue: f.venue,
      division: f.division, teamone_score: f.teamone_score, teamtwo_score: f.teamtwo_score, status
    }).eq('id', id)
    if (error) { alert('Failed to update.'); return }
    setEditing(null); await load()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const sidebarStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, width: 280, height: '100vh',
    background: 'linear-gradient(180deg,#1e3a8a 0%,#1e40af 100%)',
    display: 'flex', flexDirection: 'column', zIndex: 50,
    transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform 0.3s cubic-bezier(.4,0,.2,1)',
    boxShadow: '4px 0 30px rgba(0,0,0,0.25)',
    fontFamily: "'Inter',sans-serif", boxSizing: 'border-box',
  }

  const navItemStyle = (isActive: boolean, isHovered: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '0.875rem',
    padding: '0.875rem 1rem', borderRadius: 10,
    textDecoration: 'none', color: 'white',
    opacity: isActive || isHovered ? 1 : 0.75,
    fontWeight: isActive ? 600 : 500, fontSize: '0.95rem',
    background: isActive ? 'rgba(220,38,38,0.25)' : isHovered ? 'rgba(255,255,255,0.1)' : 'transparent',
    boxShadow: isActive ? '0 4px 12px rgba(220,38,38,0.2)' : 'none',
    transition: 'all 0.15s', fontFamily: "'Inter',sans-serif",
  })

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f1f5f9', fontFamily: 'Inter,sans-serif', color: '#64748b', fontSize: '1.1rem' }}>
      Loading fixtures...
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9', fontFamily: "'Inter',sans-serif" }}>

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 40, backdropFilter: 'blur(2px)' }} />}

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
          <button onClick={() => setSidebarOpen(false)} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white', fontSize: '1.4rem', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        <nav style={{ flex: 1, padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto' }}>
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href
            const isHovered = hoveredNav === item.href
            return (
              <Link key={item.href} href={item.href} style={navItemStyle(isActive, isHovered)}
                onMouseEnter={() => setHoveredNav(item.href)} onMouseLeave={() => setHoveredNav(null)}
                onClick={() => setSidebarOpen(false)}>
                {NAV_ICONS[item.label]}<span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '1.25rem 1rem', borderTop: '1px solid rgba(255,255,255,0.12)', flexShrink: 0 }}>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', width: '100%', padding: '0.875rem 1rem', borderRadius: 10, background: 'rgba(220,38,38,0.2)', border: 'none', color: 'white', fontWeight: 500, fontSize: '0.95rem', cursor: 'pointer', fontFamily: "'Inter',sans-serif" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 3h3a2 2 0 012 2v10a2 2 0 01-2 2h-3M7 13l-4-4m0 0l4-4m-4 4h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Logout
          </button>
        </div>
      </aside>

      <div className="page-wrap">
        <div className="topbar">
          <button className="burger" onClick={() => setSidebarOpen(true)}><span /><span /><span /></button>
          <div className="topbar-title">
            <h1>Fixtures Management</h1>
            <p>Manage all matches and schedules</p>
          </div>
          <button className="btn-add" onClick={() => setShowAddForm(!showAddForm)}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M10 2v16M2 10h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
            {showAddForm ? 'Cancel' : 'Add Fixture'}
          </button>
        </div>

        <div className="content">

          {/* ── ADD FIXTURE FORM ── */}
          {showAddForm && (
            <div className="form-card">
              <h2 className="form-title">Create New Fixture</h2>

              {/* Step 1: Pick division first */}
              <div className="form-grid">
                <div className="fg" style={{ gridColumn: '1 / -1' }}>
                  <label>Division <span style={{ color: '#ef4444' }}>*</span></label>
                  <select value={form.division} onChange={e => handleFormDivisionChange(e.target.value)}>
                    {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {teamsInFormDivision.length === 0 && (
                    <p className="hint-warn">⚠ No teams registered in <strong>{form.division}</strong> yet. <Link href="/admin/dashboard/teams" style={{ color: '#1e40af' }}>Add teams first →</Link></p>
                  )}
                </div>

                {/* Team One dropdown — filtered by division */}
                <div className="fg">
                  <label>Team One <span style={{ color: '#ef4444' }}>*</span></label>
                  <select value={form.team_one} onChange={e => setForm({ ...form, team_one: e.target.value })} disabled={teamsInFormDivision.length === 0}>
                    <option value="">— Select team —</option>
                    {teamsInFormDivision.filter(t => t.name !== form.team_two).map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {/* Team Two dropdown — filtered by division, excludes team one */}
                <div className="fg">
                  <label>Team Two <span style={{ color: '#ef4444' }}>*</span></label>
                  <select value={form.team_two} onChange={e => setForm({ ...form, team_two: e.target.value })} disabled={teamsInFormDivision.length === 0}>
                    <option value="">— Select team —</option>
                    {teamsInFormDivision.filter(t => t.name !== form.team_one).map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="fg"><label>Date <span style={{ color: '#ef4444' }}>*</span></label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
                <div className="fg"><label>Time</label><input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} /></div>
                <div className="fg"><label>Venue</label><input placeholder="Venue" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} /></div>
              </div>

              <button onClick={addFixture} className="btn-submit">Create Fixture</button>
            </div>
          )}

          {/* ── FIXTURE GRID ── */}
          <div className="fixture-grid">
            {fixtures.map(f => {
              const rules = getDivisionRules(f.division)
              const parsedSets: { t1: number; t2: number }[] = f.sets_detail ? JSON.parse(f.sets_detail) : []
              const divTeams = teamsInDivision(f.division)

              return (
                <div key={f.id} className={`fx-card${f.is_live ? ' fx-live' : ''}`}>
                  {f.is_live && <div className="live-pip"><span className="pip-dot" /> LIVE</div>}

                  {/* Edit mode */}
                  {editing === f.id ? (
                    <div className="card-body">
                      <div className="form-grid-sm">
                        {/* Division first in edit too */}
                        <div className="fg" style={{ gridColumn: '1 / -1' }}>
                          <label>Division</label>
                          <select value={f.division} onChange={e => handleEditDivisionChange(f.id, e.target.value)}>
                            {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                        <div className="fg">
                          <label>Team One</label>
                          <select value={f.team_one} onChange={e => setFixtures(fixtures.map(x => x.id === f.id ? { ...x, team_one: e.target.value } : x))}>
                            <option value="">— Select team —</option>
                            {divTeams.filter(t => t.name !== f.team_two).map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                          </select>
                        </div>
                        <div className="fg">
                          <label>Team Two</label>
                          <select value={f.team_two} onChange={e => setFixtures(fixtures.map(x => x.id === f.id ? { ...x, team_two: e.target.value } : x))}>
                            <option value="">— Select team —</option>
                            {divTeams.filter(t => t.name !== f.team_one).map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                          </select>
                        </div>
                        <div className="fg"><label>Venue</label><input value={f.venue} onChange={e => setFixtures(fixtures.map(x => x.id === f.id ? { ...x, venue: e.target.value } : x))} /></div>
                      </div>
                      <div className="row-btns">
                        <button onClick={() => save(f.id)} className="b-save">Save</button>
                        <button onClick={() => setEditing(null)} className="b-ghost">Cancel</button>
                      </div>
                    </div>

                  ) : addingResults === f.id ? (
                    <div className="card-body">
                      <div className="res-head">
                        <span className="res-title">Enter Results</span>
                        <span className="rules-tag">{rules.maxSets === 5 ? 'BO5 · 1-4→25, 5→15' : 'BO3 · 1-2→25, 3→15'}</span>
                      </div>
                      <div className="matchup-bar">
                        <span>{f.team_one}</span><span className="mu-vs">vs</span><span>{f.team_two}</span>
                      </div>
                      <div className="sets-stack">
                        {sets.map((s, idx) => {
                          const target = getSetTarget(idx, rules.maxSets)
                          const t1n = parseInt(s.t1), t2n = parseInt(s.t2)
                          const hasVals = s.t1 !== '' && s.t2 !== ''
                          const valid = hasVals && !isNaN(t1n) && !isNaN(t2n) && isSetValid(t1n, t2n, target)
                          return (
                            <div key={idx} className={`set-row${hasVals ? (valid ? ' sv' : ' si') : ''}`}>
                              <div className="set-lbl">S{idx + 1}<span className="set-to">/{target}</span></div>
                              <input type="number" min="0" placeholder="0" value={s.t1} onChange={e => updateSet(idx, 't1', e.target.value)} className="si-inp" />
                              <span className="si-dash">—</span>
                              <input type="number" min="0" placeholder="0" value={s.t2} onChange={e => updateSet(idx, 't2', e.target.value)} className="si-inp" />
                              {hasVals && <span className={`si-tick${valid ? ' ok' : ' no'}`}>{valid ? '✓' : '✗'}</span>}
                              {sets.length > 1 && <button onClick={() => removeSet(idx)} className="si-rm">×</button>}
                            </div>
                          )
                        })}
                      </div>
                      {sets.some(s => s.t1 !== '' && s.t2 !== '') && (() => {
                        let t1w = 0, t2w = 0
                        sets.forEach(s => { const a = parseInt(s.t1), b = parseInt(s.t2); if (!isNaN(a) && !isNaN(b)) { if (a > b) t1w++; else if (b > a) t2w++ } })
                        return (
                          <div className="preview-bar">
                            <span className={t1w > t2w ? 'pw' : 'pl'}>{f.team_one}</span>
                            <span className="preview-score">{t1w} — {t2w}</span>
                            <span className={t2w > t1w ? 'pw' : 'pl'}>{f.team_two}</span>
                          </div>
                        )
                      })()}
                      {sets.length < rules.maxSets && <button onClick={() => addSet(f)} className="b-add-set">+ Set {sets.length + 1}</button>}
                      <div className="row-btns" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                        <button onClick={() => saveResults(f, true)} className="b-live" disabled={savingResults}><span className="pip-dot-sm" /> Live</button>
                        <button onClick={() => saveResults(f, false)} className="b-save" disabled={savingResults}>{savingResults ? 'Saving…' : 'Final'}</button>
                        <button onClick={() => setAddingResults(null)} className="b-ghost">Cancel</button>
                      </div>
                    </div>

                  ) : (
                    <div className="card-body">
                      <div className="fx-top">
                        <div className="fx-teams">
                          <span className="fx-t">{f.team_one}</span>
                          <span className="fx-vs">VS</span>
                          <span className="fx-t">{f.team_two}</span>
                        </div>
                        <div className="fx-badges">
                          <span className={`badge b-${f.status}`}>{f.status === 'completed' ? 'Done' : f.status === 'live' ? '🔴 Live' : 'Soon'}</span>
                          <span className="badge b-div">{f.division}</span>
                        </div>
                      </div>
                      <div className="fx-meta">{f.date}{f.time ? ` · ${f.time}` : ''}{f.venue ? ` · ${f.venue}` : ''}</div>
                      {(f.status === 'completed' || f.status === 'live') && parsedSets.length > 0 && (
                        <div className="fx-result">
                          <span className={f.teamone_score! > f.teamtwo_score! ? 'rw' : 'rl'}>{f.teamone_score}</span>
                          <span className="r-sep">—</span>
                          <span className={f.teamtwo_score! > f.teamone_score! ? 'rw' : 'rl'}>{f.teamtwo_score}</span>
                          <div className="set-chips">{parsedSets.map((s, i) => <span key={i} className="chip">{s.t1}:{s.t2}</span>)}</div>
                        </div>
                      )}
                      <div className="fx-actions">
                        <button onClick={() => openAddResults(f)} className="b-results">
                          <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                          Results
                        </button>
                        <button onClick={() => setEditing(f.id)} className="b-ghost">Edit</button>
                        <button onClick={() => del(f.id)} className="b-del">Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .page-wrap { flex: 1; display: flex; flex-direction: column; min-width: 0; }

        .topbar { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.5rem; background: white; border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 10; }
        .burger { display: flex; flex-direction: column; justify-content: center; gap: 5px; width: 38px; height: 38px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; padding: 0 9px; flex-shrink: 0; }
        .burger span { display: block; height: 2px; background: #475569; border-radius: 2px; }
        .burger:hover span { background: #1e293b; }
        .topbar-title { flex: 1; }
        .topbar-title h1 { font-size: 1.25rem; font-weight: 800; color: #1e293b; }
        .topbar-title p { font-size: 0.8rem; color: #94a3b8; margin-top: 1px; }
        .btn-add { display: flex; align-items: center; gap: 0.4rem; padding: 0.6rem 1.1rem; background: #1e293b; color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer; white-space: nowrap; font-family: 'Inter', sans-serif; }
        .btn-add:hover { background: #0f172a; }

        .content { padding: 1.25rem 1.5rem; }

        .form-card { background: white; border-radius: 12px; padding: 1.25rem; margin-bottom: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
        .form-title { font-size: 1rem; font-weight: 700; color: #1e293b; margin-bottom: 1rem; }
        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.875rem; margin-bottom: 1rem; }
        .form-grid-sm { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; margin-bottom: 1rem; }

        .fg label { display: block; font-size: 0.72rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.35rem; }
        .fg input, .fg select { width: 100%; padding: 0.6rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.875rem; font-family: 'Inter', sans-serif; color: #1e293b; background: white; transition: border-color 0.15s; }
        .fg input:focus, .fg select:focus { outline: none; border-color: #3b82f6; }
        .fg select:disabled { background: #f8fafc; color: #94a3b8; cursor: not-allowed; }

        .hint-warn { font-size: 0.78rem; color: #92400e; background: #fef3c7; border: 1px solid #fde68a; border-radius: 6px; padding: 0.4rem 0.65rem; margin-top: 0.4rem; }

        .btn-submit { width: 100%; padding: 0.75rem; background: #dc2626; color: white; border: none; border-radius: 8px; font-weight: 700; font-size: 0.9rem; cursor: pointer; font-family: 'Inter', sans-serif; }
        .btn-submit:hover { background: #b91c1c; }

        .fixture-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 0.875rem; }

        .fx-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1.5px solid transparent; position: relative; transition: box-shadow 0.2s; }
        .fx-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.09); }
        .fx-live { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,0.08); }
        .card-body { padding: 1rem; }

        .live-pip { position: absolute; top: 0.6rem; right: 0.6rem; display: flex; align-items: center; gap: 0.3rem; background: #ef4444; color: white; font-size: 0.65rem; font-weight: 800; padding: 0.2rem 0.5rem; border-radius: 20px; letter-spacing: 0.05em; z-index: 2; }
        .pip-dot { width: 5px; height: 5px; background: white; border-radius: 50%; display: inline-block; animation: blink 1s infinite; }
        .pip-dot-sm { width: 7px; height: 7px; background: white; border-radius: 50%; display: inline-block; animation: blink 1s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.25} }

        .fx-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.35rem; }
        .fx-teams { display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; }
        .fx-t { font-size: 0.9rem; font-weight: 700; color: #1e293b; }
        .fx-vs { font-size: 0.7rem; font-weight: 800; color: #dc2626; }
        .fx-badges { display: flex; gap: 0.3rem; flex-wrap: wrap; flex-shrink: 0; }
        .badge { padding: 0.2rem 0.5rem; border-radius: 5px; font-size: 0.68rem; font-weight: 700; }
        .b-completed { background: #dcfce7; color: #166534; }
        .b-upcoming { background: #fef3c7; color: #92400e; }
        .b-live { background: #fee2e2; color: #dc2626; }
        .b-div { background: #dbeafe; color: #1e40af; }
        .fx-meta { font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.75rem; }

        .fx-result { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.75rem; padding: 0.5rem 0.75rem; background: #f8fafc; border-radius: 8px; }
        .rw { font-size: 1.4rem; font-weight: 800; color: #16a34a; }
        .rl { font-size: 1.4rem; font-weight: 800; color: #cbd5e1; }
        .r-sep { color: #cbd5e1; font-weight: 700; }
        .set-chips { display: flex; flex-wrap: wrap; gap: 0.3rem; margin-left: auto; }
        .chip { background: #e2e8f0; color: #475569; font-size: 0.7rem; font-weight: 600; padding: 0.15rem 0.45rem; border-radius: 4px; }

        .fx-actions { display: flex; gap: 0.5rem; border-top: 1px solid #f1f5f9; padding-top: 0.75rem; }

        .res-head { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
        .res-title { font-size: 0.9rem; font-weight: 700; color: #1e293b; }
        .rules-tag { font-size: 0.68rem; font-weight: 600; background: #f0f9ff; color: #0369a1; padding: 0.2rem 0.55rem; border-radius: 20px; border: 1px solid #bae6fd; }
        .matchup-bar { display: flex; align-items: center; justify-content: space-between; background: #f8fafc; border-radius: 8px; padding: 0.6rem 0.875rem; margin-bottom: 0.75rem; font-size: 0.85rem; font-weight: 700; color: #1e293b; }
        .mu-vs { color: #dc2626; font-size: 0.75rem; font-weight: 800; }

        .sets-stack { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.75rem; }
        .set-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; border-radius: 8px; border: 1.5px solid #e2e8f0; }
        .set-row.sv { border-color: #22c55e; background: #f0fdf4; }
        .set-row.si { border-color: #ef4444; background: #fef2f2; }
        .set-lbl { font-size: 0.8rem; font-weight: 700; color: #475569; width: 42px; flex-shrink: 0; }
        .set-to { font-size: 0.65rem; color: #94a3b8; font-weight: 400; }
        .si-inp { width: 58px; padding: 0.4rem 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.95rem; font-weight: 700; text-align: center; font-family: 'Inter', sans-serif; }
        .si-inp:focus { outline: none; border-color: #3b82f6; }
        .si-dash { color: #94a3b8; font-weight: 600; }
        .si-tick { font-size: 0.9rem; font-weight: 700; margin-left: auto; }
        .si-tick.ok { color: #16a34a; }
        .si-tick.no { color: #dc2626; }
        .si-rm { background: none; border: none; color: #94a3b8; font-size: 1.1rem; cursor: pointer; padding: 0 2px; line-height: 1; }
        .si-rm:hover { color: #ef4444; }

        .preview-bar { display: flex; align-items: center; justify-content: center; gap: 0.75rem; padding: 0.6rem 0.75rem; background: #1e293b; border-radius: 8px; margin-bottom: 0.6rem; font-size: 0.85rem; font-weight: 600; color: white; }
        .preview-score { font-size: 1.5rem; font-weight: 800; color: #dc2626; }
        .pw { color: #4ade80; }
        .pl { color: #94a3b8; }

        .b-add-set { width: 100%; padding: 0.55rem; background: #f8fafc; border: 1.5px dashed #cbd5e1; border-radius: 8px; color: #64748b; font-weight: 600; font-size: 0.8rem; cursor: pointer; margin-bottom: 0.5rem; font-family: 'Inter', sans-serif; }
        .b-add-set:hover { border-color: #94a3b8; color: #1e293b; }

        .row-btns { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .b-results { display: flex; align-items: center; gap: 0.35rem; padding: 0.5rem 0.875rem; background: #1e293b; color: white; border: none; border-radius: 7px; font-weight: 600; font-size: 0.8rem; cursor: pointer; font-family: 'Inter', sans-serif; }
        .b-results:hover { background: #0f172a; }
        .b-ghost { padding: 0.5rem 0.875rem; background: white; color: #475569; border: 1px solid #e2e8f0; border-radius: 7px; font-weight: 600; font-size: 0.8rem; cursor: pointer; font-family: 'Inter', sans-serif; }
        .b-ghost:hover { background: #f8fafc; }
        .b-del { padding: 0.5rem 0.875rem; background: #fee2e2; color: #dc2626; border: none; border-radius: 7px; font-weight: 600; font-size: 0.8rem; cursor: pointer; font-family: 'Inter', sans-serif; }
        .b-del:hover { background: #fecaca; }
        .b-save { padding: 0.5rem 0.875rem; background: #16a34a; color: white; border: none; border-radius: 7px; font-weight: 600; font-size: 0.8rem; cursor: pointer; font-family: 'Inter', sans-serif; }
        .b-save:hover { background: #15803d; }
        .b-save:disabled { opacity: 0.6; cursor: not-allowed; }
        .b-live { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 0.875rem; background: #ef4444; color: white; border: none; border-radius: 7px; font-weight: 600; font-size: 0.8rem; cursor: pointer; font-family: 'Inter', sans-serif; }
        .b-live:hover { background: #dc2626; }
        .b-live:disabled { opacity: 0.6; cursor: not-allowed; }

        @media (max-width: 640px) {
          .content { padding: 1rem; }
          .fixture-grid { grid-template-columns: 1fr; }
          .topbar { padding: 0.875rem 1rem; }
          .topbar-title p { display: none; }
        }
      `}</style>
    </div>
  )
}