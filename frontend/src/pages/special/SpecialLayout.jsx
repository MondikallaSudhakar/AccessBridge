import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { SPECIAL_NAV } from './specialData'
import logoImg from '../../assets/logo.jpeg'

const ICONS = {
  home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6',
  user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  briefcase: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  shop: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
  ngo: 'M7 11V7a5 5 0 1110 0v4m-8 0h6m-9 0h12l-1 9H7l-1-9z',
  school: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  shield: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  help: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  star: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915',
  logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3-3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  chevronDown: 'M19 9l-7 7-7-7',
  menu: 'M4 6h16M4 12h16M4 18h16',
  x: 'M6 18L18 6M6 6l12 12',
}

const HOME = {
  primary: '#0197B2',
  primaryLight: '#f0f8fc',
  text: '#1f2937',
}

const NAV_ICON = {
  Home: 'home',
  Profile: 'user',
  Jobs: 'briefcase',
  Marketplace: 'shop',
  Cart: 'shop',
  Orders: 'shop',
  NGOs: 'ngo',
  Training: 'school',
  Events: 'calendar',
  Campaigns: 'shield',
  Schemes: 'star',
  'Request Help': 'help',
  'Request History': 'help',
  Saved: 'star',
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

/* ── Grouped nav items for top bar ── */
const NAV_GROUPS = [
  { label: 'Home', items: ['Home'] },
  { label: 'Profile', items: ['Profile'] },
  { label: 'Opportunities', items: ['Jobs', 'Training', 'Events', 'Campaigns', 'Schemes'] },
  { label: 'Services', items: ['Marketplace', 'Cart', 'Orders', 'NGOs'] },
  { label: 'Support', items: ['Request Help', 'Request History', 'Saved'] },
]

function TopNavDropdown({ group, navItems, currentPath }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const groupNavItems = navItems.filter(item => group.items.includes(item.label))

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (groupNavItems.length === 0) return null

  const hasActive = groupNavItems.some(item => {
    if (item.to === '/special') return currentPath === '/special'
    return currentPath.startsWith(item.to)
  })

  // Single item — render directly
  if (groupNavItems.length === 1) {
    const item = groupNavItems[0]
    const isActive = item.to === '/special' ? currentPath === '/special' : currentPath.startsWith(item.to)
    return (
      <NavLink to={item.to} end={item.to === '/special'}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 8, textDecoration: 'none',
          background: isActive ? HOME.primary : 'transparent',
          color: isActive ? '#fff' : '#374151',
          fontSize: 13, fontWeight: isActive ? 700 : 500,
          transition: 'all .15s', whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f1f5f9' }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = isActive ? HOME.primary : 'transparent' }}
      >
        <Ic name={NAV_ICON[item.label] || 'home'} size={15} color={isActive ? '#fff' : '#64748b'} />
        {item.label}
      </NavLink>
    )
  }

  // Multiple items — dropdown
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
          background: hasActive ? `${HOME.primary}15` : 'transparent',
          color: hasActive ? HOME.primary : '#374151',
          fontSize: 13, fontWeight: hasActive ? 700 : 500,
          transition: 'all .15s', whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => { if (!hasActive) e.currentTarget.style.background = '#f1f5f9' }}
        onMouseLeave={e => { if (!hasActive) e.currentTarget.style.background = hasActive ? `${HOME.primary}15` : 'transparent' }}
      >
        {group.label}
        <Ic name="chevronDown" size={12} color={hasActive ? HOME.primary : '#94a3b8'} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0,
          background: '#fff', borderRadius: 12, border: '1px solid #e9ecef',
          boxShadow: '0 12px 40px rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.06)',
          minWidth: 200, padding: '6px', zIndex: 1000,
          animation: 'specialDropIn .15s ease',
        }}>
          {groupNavItems.map(item => {
            const isActive = item.to === '/special' ? currentPath === '/special' : currentPath.startsWith(item.to)
            return (
              <NavLink key={item.to} to={item.to} end={item.to === '/special'}
                onClick={() => setOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '9px 12px', borderRadius: 8, textDecoration: 'none',
                  background: isActive ? HOME.primary : 'transparent',
                  color: isActive ? '#fff' : '#374151',
                  fontSize: 13, fontWeight: isActive ? 700 : 500,
                  transition: 'background .12s', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f1f5f9' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = isActive ? HOME.primary : 'transparent' }}
              >
                <Ic name={NAV_ICON[item.label] || 'home'} size={15} color={isActive ? '#fff' : '#64748b'} />
                {item.label}
              </NavLink>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function SpecialLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const currentPath = window.location.pathname

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @keyframes specialDropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .special-topnav {
          display: flex; align-items: center; width: 100%;
          background: #fff; border-bottom: 1px solid #e9ecef;
          padding: 0 20px; height: 58px; position: sticky; top: 0;
          z-index: 100; box-shadow: 0 1px 4px rgba(0,0,0,.04);
          gap: 16px; font-family: 'Inter', sans-serif;
        }
        .special-topnav-links { display: flex; align-items: center; gap: 2px; flex: 1; overflow-x: auto; }
        .special-topnav-links::-webkit-scrollbar { display: none; }
        .special-topnav-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
        .special-hamburger { display: none; }
        @media (max-width: 900px) {
          .special-topnav-links { display: none !important; }
          .special-hamburger { display: flex !important; }
        }
      `}</style>

      {/* ── Top Navbar ── */}
      <nav className="special-topnav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 }} onClick={() => navigate('/')}>
          <img src={logoImg} alt="KnotneX" style={{ width: 30, height: 30, borderRadius: 7, objectFit: 'cover' }} />
          <span style={{ fontSize: 14, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>KnotneX</span>
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 20, flexShrink: 0,
          background: `${HOME.primary}12`, border: `1px solid ${HOME.primary}30`,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: HOME.primary, display: 'inline-block' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: HOME.primary, whiteSpace: 'nowrap' }}>Specially Abled</span>
        </div>

        <div className="special-topnav-links">
          {NAV_GROUPS.map(group => (
            <TopNavDropdown key={group.label} group={group} navItems={SPECIAL_NAV} currentPath={currentPath} />
          ))}
        </div>

        {/* Mobile hamburger */}
        <button className="special-hamburger"
          onClick={() => setMobileOpen(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, marginLeft: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Ic name="menu" size={22} color="#374151" />
        </button>

        <div className="special-topnav-right">
          <div style={{ padding: '4px 12px', borderRadius: 8, background: '#f8fafc' }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
              {user?.email || user?.name || 'User'}
            </p>
          </div>
          <button type="button" onClick={() => navigate('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: 'none', background: '#f1f5f9', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#374151', transition: 'background .15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
            onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
          >
            <Ic name="home" size={14} color="#64748b" />
            Dashboard
          </button>
          <button type="button" onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: 'none', background: '#fef2f2', cursor: 'pointer', transition: 'background .15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
            onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}
          >
            <Ic name="logout" size={14} color="#ef4444" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#ef4444' }}>Sign Out</span>
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.3)', zIndex: 9998, backdropFilter: 'blur(2px)' }} />
      )}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 280, maxWidth: '80vw',
        background: '#fff', zIndex: 9999,
        transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform .25s cubic-bezier(.4,0,.2,1)',
        boxShadow: mobileOpen ? '4px 0 30px rgba(0,0,0,.15)' : 'none',
        display: 'flex', flexDirection: 'column', overflowY: 'auto',
      }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Menu</span>
          <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <Ic name="x" size={18} color="#64748b" />
          </button>
        </div>
        <nav style={{ flex: 1, padding: '12px' }}>
          {SPECIAL_NAV.map(item => {
            const isActive = item.to === '/special' ? currentPath === '/special' : currentPath.startsWith(item.to)
            return (
              <NavLink key={item.to} to={item.to} end={item.to === '/special'}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
                  borderRadius: 9, textDecoration: 'none', marginBottom: 1,
                  background: isActive ? HOME.primary : 'transparent',
                  color: isActive ? '#fff' : '#374151',
                  fontSize: 13.5, fontWeight: isActive ? 700 : 500,
                }}
              >
                <Ic name={NAV_ICON[item.label] || 'home'} size={16} color={isActive ? '#fff' : '#64748b'} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
        <div style={{ padding: '12px', borderTop: '1px solid #f1f5f9' }}>
          <button type="button" onClick={() => { navigate('/dashboard'); setMobileOpen(false) }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 10px', borderRadius: 9, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13.5, fontWeight: 500, color: '#374151' }}
          >
            <Ic name="home" size={16} color="#64748b" /> Dashboard
          </button>
          <button type="button" onClick={() => { handleLogout(); setMobileOpen(false) }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 10px', borderRadius: 9, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13.5, fontWeight: 700, color: '#ef4444' }}
          >
            <Ic name="logout" size={16} color="#ef4444" /> Sign Out
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
