import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import logoImg from '../../assets/logo.jpeg'

const NAVY = '#0f172a'
const GREEN = '#16a34a'

const ICONS = {
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  bell: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  chevronDown: 'M19 9l-7 7-7-7',
  menu: 'M4 6h16M4 12h16M4 18h16',
  x: 'M6 18L18 6M6 6l12 12',
  logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6',
  user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  students: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  courses: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  certificate: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
  partnership: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  volunteer: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  enrollment: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
}

function Ic({ name, size = 16, color = 'currentColor' }) {
  const d = ICONS[name]
  if (!d) return null
  return (
    <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  )
}

// Tab config: label -> tab value + icon
const SCHOOL_TABS = [
  { label: 'Overview',       tab: 'overview',       icon: 'user' },
  { label: 'Students',       tab: 'students',       icon: 'students' },
  { label: 'Courses',        tab: 'courses',        icon: 'courses' },
  { label: 'Enrollments',    tab: 'enrollments',    icon: 'enrollment' },
  { label: 'Certifications', tab: 'certifications', icon: 'certificate' },
  { label: 'Partnerships',   tab: 'partnerships',   icon: 'partnership' },
  { label: 'Volunteers',     tab: 'volunteers',     icon: 'volunteer' },
]

export default function SchoolProfileLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')

  // Derive active tab from URL search param
  const searchParams = new URLSearchParams(location.search)
  const activeTab = searchParams.get('tab') || 'overview'

  const handleLogout = () => { logout(); navigate('/login') }
  const userName = user?.name || user?.email || 'School Admin'
  const initials = userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const navigateTab = (tab) => {
    navigate(`/school/profile${tab !== 'overview' ? `?tab=${tab}` : ''}`)
    setMobileOpen(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes scDropIn { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:translateY(0) } }
        .sc-topnav { display:flex; align-items:center; width:100%; background:#fff; border-bottom:1.5px solid #f1f5f9; padding:0 28px; height:56px; position:sticky; top:0; z-index:100; gap:0; }
        .sc-nav-tabs { display:flex; align-items:center; gap:4px; margin-left:32px; }
        .sc-nav-search { display:flex; align-items:center; flex:1; justify-content:center; margin:0 24px; }
        .sc-nav-right { display:flex; align-items:center; gap:16px; margin-left:auto; flex-shrink:0; }
        .sc-hamburger { display:none; }
        .sc-tab-btn { display:flex; align-items:center; gap:5px; padding:6px 10px; background:none; border:none; cursor:pointer; font-size:13.5px; font-weight:500; color:#4b5563; border-bottom:2px solid transparent; transition:all .15s; text-decoration:none; white-space:nowrap; }
        .sc-tab-btn:hover { color:${NAVY}; }
        .sc-tab-btn.active { font-weight:700; color:${NAVY}; border-bottom:2px solid ${GREEN}; }
        @media(max-width:900px) {
          .sc-nav-tabs { display:none!important; }
          .sc-nav-search { display:none!important; }
          .sc-hamburger { display:flex!important; }
        }
      `}</style>

      {/* Top Navbar */}
      <nav className="sc-topnav">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flexShrink: 0 }} onClick={() => navigate('/')}>
          <img src={logoImg} alt="KnotneX" style={{ width: 30, height: 30, borderRadius: 7, objectFit: 'cover' }} />
          <span style={{ fontSize: 18, fontWeight: 900, color: NAVY, letterSpacing: '-0.03em' }}>KnotneX</span>
        </div>

        {/* Tab Navigation */}
        <div className="sc-nav-tabs">
          {SCHOOL_TABS.map(({ label, tab, icon }) => (
            <button
              key={tab}
              className={`sc-tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => navigateTab(tab)}
            >
              <Ic name={icon} size={14} color={activeTab === tab ? NAVY : '#64748b'} />
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="sc-nav-search">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '8px 16px', width: '100%', maxWidth: 320 }}>
            <Ic name="search" size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: '#374151', width: '100%', fontFamily: "'Inter', sans-serif" }}
            />
          </div>
        </div>

        {/* Hamburger */}
        <button className="sc-hamburger" onClick={() => setMobileOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, marginLeft: 'auto' }}>
          <Ic name="menu" size={22} color="#374151" />
        </button>

        {/* Right side */}
        <div className="sc-nav-right">
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, position: 'relative' }}>
            <Ic name="bell" size={20} color="#6b7280" />
            <span style={{ position: 'absolute', top: 2, right: 2, width: 7, height: 7, borderRadius: '50%', background: GREEN, border: '1.5px solid #fff' }} />
          </button>
          <div style={{ width: 1, height: 28, background: '#e5e7eb' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigateTab('overview')}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: NAVY, lineHeight: 1.2 }}>School</span>
              <span style={{ display: 'block', fontSize: 11, color: '#94a3b8', lineHeight: 1.2 }}>Admin</span>
            </div>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg, ${GREEN}, #22c55e)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', border: '2px solid #e5e7eb', flexShrink: 0 }}>
              {initials}
            </div>
          </div>
          <div style={{ width: 1, height: 28, background: '#e5e7eb' }} />
          <button
            onClick={handleLogout}
            title="Logout"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11d48', transition: 'color .15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#be123c'}
            onMouseLeave={e => e.currentTarget.style.color = '#e11d48'}
          >
            <Ic name="logout" size={20} color="currentColor" />
          </button>
        </div>
      </nav>

      {/* Green gradient accent line */}
      <div style={{ height: 2, background: `linear-gradient(90deg, ${GREEN}, #22c55e, transparent 70%)` }} />

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.3)', zIndex: 9998, backdropFilter: 'blur(2px)' }} />
      )}

      {/* Mobile Drawer */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 290, maxWidth: '82vw',
        background: '#fff', zIndex: 9999,
        transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform .25s cubic-bezier(.4,0,.2,1)',
        boxShadow: mobileOpen ? '4px 0 30px rgba(0,0,0,.15)' : 'none',
        display: 'flex', flexDirection: 'column', overflowY: 'auto'
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 16, fontWeight: 900, color: NAVY }}>KnotneX</span>
          <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <Ic name="x" size={20} color="#64748b" />
          </button>
        </div>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #f8fafc' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: `${GREEN}10`, border: `1px solid ${GREEN}30` }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: GREEN, display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: GREEN }}>School Admin</span>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '4px 12px' }}>
          {SCHOOL_TABS.map(({ label, tab, icon }) => {
            const isActive = activeTab === tab
            return (
              <button
                key={tab}
                onClick={() => navigateTab(tab)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  borderRadius: 10, textDecoration: 'none', marginBottom: 1, width: '100%',
                  background: isActive ? '#f0fdf4' : 'transparent',
                  color: isActive ? GREEN : '#374151',
                  fontSize: 13.5, fontWeight: isActive ? 700 : 500,
                  borderLeft: isActive ? `3px solid ${GREEN}` : '3px solid transparent',
                  border: 'none', cursor: 'pointer',
                }}
              >
                <Ic name={icon} size={16} color={isActive ? GREEN : '#64748b'} />
                {label}
              </button>
            )
          })}
        </nav>
        <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9' }}>
          <button
            type="button"
            onClick={() => { navigate('/dashboard'); setMobileOpen(false) }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13.5, fontWeight: 500, color: '#374151' }}
          >
            <Ic name="home" size={16} color="#64748b" />Dashboard
          </button>
          <button
            type="button"
            onClick={() => { handleLogout(); setMobileOpen(false) }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13.5, fontWeight: 700, color: '#ef4444' }}
          >
            <Ic name="logout" size={16} color="#ef4444" />Sign Out
          </button>
        </div>
      </div>

      {/* Page Content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
        <Outlet />
      </main>
    </div>
  )
}
