'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/app/lib/supabaseClient"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface DashboardStats {
  totalFixtures: number
  upcomingFixtures: number
  completedFixtures: number
  totalTeams: number
  recentResults: any[]
}

export default function AdminDashboard() {
  const pathname = usePathname()
  const [stats, setStats] = useState<DashboardStats>({
    totalFixtures: 0,
    upcomingFixtures: 0,
    completedFixtures: 0,
    totalTeams: 0,
    recentResults: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    try {
      // Load fixtures
      const { data: fixtures } = await supabase
        .from('fixtures')
        .select('*')
        .order('date', { ascending: false })

      const upcoming = fixtures?.filter(f => f.status === 'upcoming') || []
      const completed = fixtures?.filter(f => f.status === 'completed') || []
      const recent = completed.slice(0, 5)

      setStats({
        totalFixtures: fixtures?.length || 0,
        upcomingFixtures: upcoming.length,
        completedFixtures: completed.length,
        totalTeams: 12, // You can fetch this from a teams table
        recentResults: recent
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar />
        <div className="main-content">
          <div className="loading">Loading dashboard...</div>
        </div>
        <style jsx>{styles}</style>
      </div>
    )
  }

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      
      <div className="main-content">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Welcome back! Here's your overview.</p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2v16M2 10h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Export Report
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-label">Total Fixtures</div>
              <div className="stat-value">{stats.totalFixtures}</div>
              <div className="stat-change positive">+12% from last month</div>
            </div>
          </div>

          <div className="stat-card red">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-label">Upcoming Matches</div>
              <div className="stat-value">{stats.upcomingFixtures}</div>
              <div className="stat-change neutral">Next 30 days</div>
            </div>
          </div>

          <div className="stat-card green">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-label">Completed</div>
              <div className="stat-value">{stats.completedFixtures}</div>
              <div className="stat-change positive">+8 this week</div>
            </div>
          </div>

          <div className="stat-card purple">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-label">Active Teams</div>
              <div className="stat-value">{stats.totalTeams}</div>
              <div className="stat-change positive">Registered teams</div>
            </div>
          </div>
        </div>

        {/* Recent Results */}
        <div className="content-grid">
          <div className="card recent-results">
            <div className="card-header">
              <h2 className="card-title">Recent Results</h2>
              <Link href="/admin/admin-fixtures" className="view-all">View all →</Link>
            </div>
            <div className="results-list">
              {stats.recentResults.map((fixture, idx) => (
                <div key={idx} className="result-item">
                  <div className="result-teams">
                    <div className="team">
                      <span className="team-name">{fixture.team_one}</span>
                      <span className="team-score">{fixture.teamone_score}</span>
                    </div>
                    <div className="vs">VS</div>
                    <div className="team">
                      <span className="team-score">{fixture.teamtwo_score}</span>
                      <span className="team-name">{fixture.team_two}</span>
                    </div>
                  </div>
                  <div className="result-meta">
                    <span className="result-date">{fixture.date}</span>
                    <span className="result-venue">{fixture.venue}</span>
                  </div>
                </div>
              ))}
              {stats.recentResults.length === 0 && (
                <div className="empty-state">No recent results</div>
              )}
            </div>
          </div>

          <div className="card quick-actions">
            <div className="card-header">
              <h2 className="card-title">Quick Actions</h2>
            </div>
            <div className="actions-grid">
              <Link href="/admin/dashboard/admin_fixtures" className="action-btn">
                <div className="action-icon blue">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <span>Add Fixture</span>
              </Link>
              
              <Link href="/admin/dashboard/teams" className="action-btn">
                <div className="action-icon red">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <span>Add Team</span>
              </Link>
              
              <Link href="/admin/dashboard/admin_news" className="action-btn">
                <div className="action-icon purple">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <span>Post News</span>
              </Link>

              <Link href="/admin/dashboard/settings" className="action-btn">
                <div className="action-icon green">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span>Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{styles}</style>
    </div>
  )
}

function Sidebar() {
  const pathname = usePathname()
  
  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { href: '/admin/dashboard/admin_fixtures', label: 'Fixtures', icon: 'calendar' },
    { href: '/admin/dashboard/teams', label: 'Teams', icon: 'team' },
    { href: '/admin/dashboard/admin_news', label: 'News', icon: 'news' },
    { href: '/admin/settings', label: 'Settings', icon: 'settings' },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">
            <img src="/assets/ctvf_logo.png" alt="CTVF Logo" />
          </div>
          <div className="logo-text">
            <div className="logo-title">CTVF</div>
            <div className="logo-subtitle">Admin Panel</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <Link 
            key={item.href}
            href={item.href}
            className={`nav-item ${pathname === item.href ? 'active' : ''}`}
          >
            <NavIcon type={item.icon} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M13 3h3a2 2 0 012 2v10a2 2 0 01-2 2h-3M7 13l-4-4m0 0l4-4m-4 4h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

function NavIcon({ type }: { type: string }) {
  const icons = {
    dashboard: <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    calendar: <><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>,
    team: <><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/><path d="M2 21v-4a3 3 0 013-3h8a3 3 0 013 3v4M18 8a3 3 0 100-6 3 3 0 000 6zM21 21v-3a3 3 0 00-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
    news: <><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
    settings: <><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></>,
  }
  
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      {icons[type as keyof typeof icons]}
    </svg>
  )
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .dashboard-wrapper {
    display: flex;
    min-height: 100vh;
    background: #f8fafc;
    font-family: 'Inter', sans-serif;
  }

  /* Sidebar */
  .sidebar {
    width: 280px;
    background: linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%);
    color: white;
    display: flex;
    flex-direction: column;
    position: fixed;
    height: 100vh;
    left: 0;
    top: 0;
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
  }

  .sidebar-header {
    padding: 2rem 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .logo-icon {
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .logo-icon img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .logo-title {
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  .logo-subtitle {
    font-size: 0.75rem;
    opacity: 0.7;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .sidebar-nav {
    flex: 1;
    padding: 1.5rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.875rem 1rem;
    border-radius: 10px;
    text-decoration: none;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
    font-size: 0.95rem;
    transition: all 0.2s ease;
  }

  .nav-item:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .nav-item.active {
    background: rgba(220, 38, 38, 0.2);
    color: white;
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
  }

  .nav-item svg {
    flex-shrink: 0;
  }

  .sidebar-footer {
    padding: 1.5rem 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .logout-btn {
    display: flex;
    align-items: center;
    gap: 1rem;
    width: 100%;
    padding: 0.875rem 1rem;
    border-radius: 10px;
    background: rgba(220, 38, 38, 0.2);
    border: none;
    color: white;
    font-weight: 500;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .logout-btn:hover {
    background: rgba(220, 38, 38, 0.3);
  }

  /* Main Content */
  .main-content {
    flex: 1;
    margin-left: 280px;
    padding: 2rem;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 2rem;
  }

  .page-title {
    font-size: 2rem;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 0.5rem;
  }

  .page-subtitle {
    color: #64748b;
    font-size: 1rem;
  }

  .header-actions {
    display: flex;
    gap: 1rem;
  }

  .btn-secondary {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    color: #1e293b;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-secondary:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }

  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    display: flex;
    gap: 1rem;
    transition: all 0.3s ease;
    border: 2px solid transparent;
  }

  .stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  .stat-card.blue {
    border-color: #dbeafe;
  }

  .stat-card.blue:hover {
    border-color: #3b82f6;
  }

  .stat-card.red {
    border-color: #fee2e2;
  }

  .stat-card.red:hover {
    border-color: #dc2626;
  }

  .stat-card.green {
    border-color: #dcfce7;
  }

  .stat-card.green:hover {
    border-color: #16a34a;
  }

  .stat-card.purple {
    border-color: #f3e8ff;
  }

  .stat-card.purple:hover {
    border-color: #9333ea;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .stat-card.blue .stat-icon {
    background: #dbeafe;
    color: #1e40af;
  }

  .stat-card.red .stat-icon {
    background: #fee2e2;
    color: #dc2626;
  }

  .stat-card.green .stat-icon {
    background: #dcfce7;
    color: #16a34a;
  }

  .stat-card.purple .stat-icon {
    background: #f3e8ff;
    color: #9333ea;
  }

  .stat-content {
    flex: 1;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #64748b;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 800;
    color: #1e293b;
    line-height: 1;
    margin-bottom: 0.5rem;
  }

  .stat-change {
    font-size: 0.8rem;
    font-weight: 600;
  }

  .stat-change.positive {
    color: #16a34a;
  }

  .stat-change.neutral {
    color: #64748b;
  }

  /* Content Grid */
  .content-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1.5rem;
  }

  .card {
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .card-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
  }

  .view-all {
    color: #dc2626;
    font-weight: 600;
    font-size: 0.95rem;
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .view-all:hover {
    color: #991b1b;
  }

  /* Recent Results */
  .results-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .result-item {
    padding: 1rem;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
  }

  .result-teams {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }

  .team {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .team-name {
    font-weight: 600;
    color: #1e293b;
  }

  .team-score {
    font-size: 1.5rem;
    font-weight: 800;
    color: #dc2626;
  }

  .vs {
    font-size: 0.75rem;
    font-weight: 700;
    color: #94a3b8;
    padding: 0.25rem 0.75rem;
    background: white;
    border-radius: 6px;
  }

  .result-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.875rem;
    color: #64748b;
  }

  /* Quick Actions */
  .actions-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1.5rem 1rem;
    background: #f8fafc;
    border-radius: 12px;
    text-decoration: none;
    color: #1e293b;
    font-weight: 600;
    transition: all 0.2s ease;
    border: 2px solid transparent;
  }

  .action-btn:hover {
    background: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .action-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .action-icon.blue {
    background: #dbeafe;
    color: #1e40af;
  }

  .action-icon.red {
    background: #fee2e2;
    color: #dc2626;
  }

  .action-icon.green {
    background: #dcfce7;
    color: #16a34a;
  }

  .action-icon.purple {
    background: #f3e8ff;
    color: #9333ea;
  }

  .empty-state {
    text-align: center;
    padding: 2rem;
    color: #94a3b8;
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    font-size: 1.25rem;
    color: #64748b;
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .content-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .sidebar {
      width: 100%;
      height: auto;
      position: relative;
    }

    .main-content {
      margin-left: 0;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .actions-grid {
      grid-template-columns: 1fr;
    }
  }
`