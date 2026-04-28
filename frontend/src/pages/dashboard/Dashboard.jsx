import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

/* ── brand tokens ─────────────────────────────────────────────────────── */
const G    = '#5BCB2B'   // brand green
const B    = '#1A8FD1'   // brand blue
const TEAL = '#0d9488'   // sidebar active color (NYSPACE)
const NAVY = '#0f172a'   // dark text

/* ── SVG icon helper ──────────────────────────────────────────────────── */
const ICONS = {
  home:      'd="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"',
  grid:      'd="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"',
  school:    'd="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"',
  ngo:       'd="M7 11V7a5 5 0 1110 0v4m-8 0h6m-9 0h12l-1 9H7l-1-9z"',
  startup:   'd="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"',
  shield:    'd="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"',
  search:    'd="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"',
  shop:      'd="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"',
  check:     'd="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"',
  logout:    'd="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"',
  user:      'd="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"',
  arrowR:    'd="M13 7l5 5m0 0l-5 5m5-5H6"',
  info:      'd="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"',
  globe:     'd="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"',
  menu:      'd="M4 6h16M4 12h16M4 18h16"',
  x:         'd="M6 18L18 6M6 6l12 12"',
}

function Ic({ n, s = 16, c = 'currentColor', sw = 1.8, st = {} }) {
  const raw = ICONS[n]
  if (!raw) return null
  const dMatch = raw.match(/d="([^"]+)"/)
  return (
    <svg width={s} height={s} fill="none" stroke={c} strokeWidth={sw}
      viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0, ...st }}>
      {dMatch && <path strokeLinecap="round" strokeLinejoin="round" d={dMatch[1]} />}
    </svg>
  )
}

/* ── role config ──────────────────────────────────────────────────────── */
const ROLE_MAP = {
  USER:          { label: 'General User', icon: 'user',   color: '#8b5cf6' },
  SPECIAL_ABLED_PERSON: { label: 'Specially Abled', icon: 'info', color: '#0ea5e9' },
  GUARDIAN_CAREGIVER: { label: 'Guardian', icon: 'info', color: '#10b981' },
  SCHOOL_ADMIN:  { label: 'School Admin', icon: 'school', color: G         },
  NGO_ADMIN:     { label: 'NGO Admin',    icon: 'ngo',    color: TEAL      },
  STARTUP_ADMIN: { label: 'Startup Admin',icon: 'startup',color: '#f59e0b' },
  SUPER_ADMIN:   { label: 'Super Admin',  icon: 'shield', color: B         },
}

/* ── sidebar nav groups ───────────────────────────────────────────────── */
const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { id: 'home', label: 'Dashboard', icon: 'home' },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { id: 'school',     label: 'School Dashboard',  icon: 'school',  role: 'SCHOOL_ADMIN',  path: '/school/profile'  },
      { id: 'special',    label: 'Special Workspace', icon: 'info',    role: 'SPECIAL_ABLED_PERSON', path: '/special' },
      { id: 'guardian',   label: 'Guardian Workspace', icon: 'info',   role: 'GUARDIAN_CAREGIVER', path: '/guardian' },
      { id: 'ngo',        label: 'NGO Dashboard',     icon: 'ngo',     role: 'NGO_ADMIN',     path: '/ngo/profile'     },
      { id: 'startup',    label: 'Startup Dashboard', icon: 'startup', role: 'STARTUP_ADMIN', path: '/startup/profile' },
      { id: 'approvals',  label: 'Approvals',         icon: 'check',   role: 'SUPER_ADMIN',   path: '/admin/approvals' },
    ],
  },
  {
    label: 'Community',
    items: [
      { id: 'browse',      label: 'Community Browser',    icon: 'search', path: '/#directory'  },
      { id: 'marketplace', label: 'Product Marketplace',  icon: 'shop',   path: '/marketplace' },
    ],
  },
]

/* ── quick-access cards config ────────────────────────────────────────── */
const CARDS = [
  {
    role: 'SCHOOL_ADMIN',
    title: 'School Dashboard',
    desc: "Update your school's profile, manage requirements, and post achievements.",
    icon: 'school',
    color: G,
    bg: '#f0fdf4',
    path: '/school/profile',
    cta: 'Open Dashboard',
  },
  {
    role: 'SPECIAL_ABLED_PERSON',
    title: 'Specially Abled Workspace',
    desc: 'Manage your accessibility profile, discover jobs, schemes, training, campaigns, and nearby support.',
    icon: 'info',
    color: '#0ea5e9',
    bg: '#ecfeff',
    path: '/special',
    cta: 'Open Workspace',
  },
  {
    role: 'GUARDIAN_CAREGIVER',
    title: 'Guardian Workspace',
    desc: 'Manage dependent profiles, apply for jobs on behalf, book therapy, and track support opportunities.',
    icon: 'info',
    color: '#10b981',
    bg: '#ecfdf5',
    path: '/guardian',
    cta: 'Open Workspace',
  },
  {
    role: 'NGO_ADMIN',
    title: 'NGO Dashboard',
    desc: 'Post requirements, jobs, products, services and achievements.',
    icon: 'ngo',
    color: TEAL,
    bg: '#f0fdfa',
    path: '/ngo/profile',
    cta: 'Open Dashboard',
  },
  {
    role: 'STARTUP_ADMIN',
    title: 'Startup Dashboard',
    desc: 'Manage your startup profile and list assistive products on the marketplace.',
    icon: 'startup',
    color: '#f59e0b',
    bg: '#fffbeb',
    path: '/startup/profile',
    cta: 'Open Dashboard',
  },
  {
    role: 'SUPER_ADMIN',
    title: 'Network Approvals',
    desc: 'Review and approve pending registrations for NGOs, Schools and Startups.',
    icon: 'check',
    color: B,
    bg: '#eff6ff',
    path: '/admin/approvals',
    cta: 'Start Reviewing',
  },
  {
    role: null,  // always show
    title: 'Community Browser',
    desc: 'Explore the full directory of verified schools, NGOs and assistive startups.',
    icon: 'search',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    path: '/#directory',
    cta: 'Explore Hub',
  },
  {
    role: null,  // always show
    title: 'Product Marketplace',
    desc: 'Discover and procure assistive equipment, educational tools and resources.',
    icon: 'shop',
    color: '#f97316',
    bg: '#fff7ed',
    path: '/marketplace',
    cta: 'Browse Marketplace',
  },
]

/* ── Sidebar nav item ─────────────────────────────────────────────────── */
function SidebarItem({ item, active, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 11,
        width: '100%', padding: '9px 10px', borderRadius: 9,
        border: 'none', cursor: 'pointer', textAlign: 'left', marginBottom: 1,
        background: active ? TEAL : hov ? '#f8fafc' : 'transparent',
        transition: 'background .15s',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <Ic n={item.icon} s={17} c={active ? '#fff' : '#64748b'} sw={active ? 2 : 1.7} />
      <span style={{ fontSize: 13.5, fontWeight: active ? 700 : 500, color: active ? '#fff' : '#374151' }}>
        {item.label}
      </span>
    </button>
  )
}

/* ── Quick-access card ────────────────────────────────────────────────── */
function QuickCard({ card, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#fff',
        borderRadius: 16,
        border: `1.5px solid ${hov ? card.color + '50' : '#e9ecef'}`,
        padding: '20px 20px 18px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        boxShadow: hov ? `0 4px 18px ${card.color}22` : '0 1px 4px rgba(0,0,0,.06)',
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all .2s',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative corner */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 80, height: 80,
        background: `radial-gradient(circle at top right, ${card.color}15, transparent 70%)`,
        borderRadius: '0 16px 0 0',
        pointerEvents: 'none',
      }} />
      {/* Icon */}
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: card.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Ic n={card.icon} s={22} c={card.color} sw={1.8} />
      </div>
      {/* Text */}
      <div style={{ flex: 1 }}>
        <p style={{ margin: '0 0 5px', fontSize: 15, fontWeight: 800, color: NAVY, letterSpacing: '-0.01em' }}>
          {card.title}
        </p>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.55 }}>
          {card.desc}
        </p>
      </div>
      {/* CTA */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        fontSize: 12.5, fontWeight: 700, color: card.color,
        paddingTop: 4, borderTop: `1px solid ${card.color}18`,
        marginTop: 2,
      }}>
        {card.cta}
        <Ic n="arrowR" s={13} c={card.color} sw={2.5}
          st={{ transition: 'transform .2s', transform: hov ? 'translateX(3px)' : 'translateX(0)' }} />
      </div>
    </div>
  )
}

/* ── Main Dashboard ───────────────────────────────────────────────────── */
export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeNav, setActiveNav] = useState('home')

  useEffect(() => {
    if (user?.role === 'NGO_ADMIN') navigate('/ngo/profile', { replace: true })
    if (user?.role === 'SPECIAL_ABLED_PERSON') navigate('/special', { replace: true })
    if (user?.role === 'GUARDIAN_CAREGIVER') navigate('/guardian', { replace: true })
  }, [navigate, user])

  const handleLogout = () => { logout(); navigate('/') }

  const roleInfo = ROLE_MAP[user?.role] || { label: user?.role, icon: 'user', color: '#64748b' }

  const visibleCards = CARDS.filter(c => !c.role || c.role === user?.role)

  const handleNavClick = (item) => {
    setActiveNav(item.id)
    setMobileMenuOpen(false)
    if (item.path) navigate(item.path)
  }

  // Flatten nav items for mobile bottom bar (only relevant)
  const bottomNav = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'browse', label: 'Browse', icon: 'globe' },
    { id: 'marketplace', label: 'Market', icon: 'shop' },
    ...(user?.role === 'SCHOOL_ADMIN' ? [{ id: 'school', label: 'School', icon: 'school', path: '/school/profile' }] : []),
    ...(user?.role === 'SPECIAL_ABLED_PERSON' ? [{ id: 'special', label: 'Special', icon: 'info', path: '/special' }] : []),
    ...(user?.role === 'GUARDIAN_CAREGIVER' ? [{ id: 'guardian', label: 'Guardian', icon: 'info', path: '/guardian' }] : []),
    ...(user?.role === 'STARTUP_ADMIN' ? [{ id: 'startup', label: 'Startup', icon: 'startup', path: '/startup/profile' }] : []),
    ...(user?.role === 'SUPER_ADMIN' ? [{ id: 'approvals', label: 'Approvals', icon: 'check', path: '/admin/approvals' }] : []),
    { id: 'profile', label: 'Profile', icon: 'user' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6f8', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-track { background: transparent; }

        /* ── Desktop sidebar: visible ≥ 768px ── */
        .ds-sidebar { display: flex; }
        .ds-main    { flex: 1; min-width: 0; padding-bottom: 0; }
        .ds-bottom-nav { display: none; }

        /* ── Mobile: ≤ 767px ── */
        @media (max-width: 767px) {
          .ds-sidebar    { display: none !important; }
          .ds-main       { padding-bottom: 76px !important; }
          .ds-bottom-nav { display: flex !important; }
          .ds-hero       { border-radius: 18px !important; margin: 12px !important; }
          .ds-content    { padding: 12px 14px 24px !important; }
          .ds-card-grid  { grid-template-columns: 1fr !important; gap: 12px !important; }
          .ds-topbar     { padding: 0 14px !important; }
          .ds-welcome-text h1 { font-size: 22px !important; }
        }

        /* ── Tablet: 768–1023px ── */
        @media (min-width: 768px) and (max-width: 1023px) {
          .ds-card-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }

        /* ── Large: ≥ 1024px ── */
        @media (min-width: 1024px) {
          .ds-card-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn .3s ease forwards; }
      `}</style>

      {/* ══════════════ SIDEBAR (desktop) ══════════════ */}
      <aside className="ds-sidebar" style={{
        width: 250, minWidth: 250, background: '#fff',
        borderRight: '1px solid #e9ecef',
        flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
        overflowY: 'auto', zIndex: 50,
      }}>
        {/* Brand */}
        <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, cursor: 'pointer' }}
            onClick={() => navigate('/')}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: 16, height: 28, backgroundColor: B, clipPath: 'polygon(0 0,60% 0,100% 50%,60% 100%,0 100%,40% 50%)' }} />
              <div style={{ width: 16, height: 28, marginLeft: -6, backgroundColor: G, clipPath: 'polygon(40% 0,100% 0,100% 100%,40% 100%,0 50%)' }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 900, color: NAVY, letterSpacing: '-0.02em' }}>
              Inclusive Connect
            </span>
          </div>

          {/* Role badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 20, background: `${roleInfo.color}12`, border: `1px solid ${roleInfo.color}30` }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: roleInfo.color, display: 'inline-block' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: roleInfo.color }}>{roleInfo.label}</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '14px 12px 8px' }}>
          {NAV_GROUPS.map(group => {
            const visibleItems = group.items.filter(i => !i.role || i.role === user?.role)
            if (visibleItems.length === 0) return null
            return (
              <div key={group.label} style={{ marginBottom: 16 }}>
                <p style={{ margin: '0 0 4px 8px', fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.10em', textTransform: 'uppercase' }}>
                  {group.label}
                </p>
                {visibleItems.map(item => (
                  <SidebarItem
                    key={item.id}
                    item={item}
                    active={activeNav === item.id}
                    onClick={() => handleNavClick(item)}
                  />
                ))}
              </div>
            )
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '8px 12px 20px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ padding: '10px 10px', borderRadius: 10, background: '#f8fafc', marginBottom: 8 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: NAVY, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>{roleInfo.label}</p>
          </div>
          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '9px 10px', borderRadius: 9, border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'background .15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Ic n="logout" s={16} c="#ef4444" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ══════════════ MAIN CONTENT ══════════════ */}
      <main className="ds-main" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

        {/* Top bar */}
        <header style={{ background: '#fff', borderBottom: '1px solid #e9ecef', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,.05)', position: 'sticky', top: 0, zIndex: 40, padding: '0 24px' }} className="ds-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Mobile menu toggle (shown via media query) */}
            <button
              onClick={() => setMobileMenuOpen(o => !o)}
              style={{ display: 'none', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 9, border: 'none', background: '#f8fafc', cursor: 'pointer' }}
              className="mobile-menu-btn"
            >
              <Ic n={mobileMenuOpen ? 'x' : 'menu'} s={18} c="#374151" />
            </button>
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: NAVY }}>Dashboard</p>
              <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>Welcome back, {user?.email?.split('@')[0]}</p>
            </div>
          </div>
          {/* Desktop logout */}
          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: 'none', background: '#fef2f2', color: '#ef4444', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'background .15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
            onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}
          >
            <Ic n="logout" s={14} c="#ef4444" /> Sign Out
          </button>
        </header>

        {/* Scrollable body */}
        <div className="ds-content" style={{ flex: 1, overflowY: 'auto', padding: '28px 28px 48px' }}>

          {/* ── Hero welcome banner ── */}
          <div className="ds-hero fade-in" style={{
            background: `linear-gradient(135deg, ${TEAL} 0%, #0f766e 60%, #134e4a 100%)`,
            borderRadius: 20,
            padding: '28px 28px',
            marginBottom: 28,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: `0 4px 20px ${TEAL}40`,
          }}>
            {/* decorative blobs */}
            <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,.06)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -20, right: 80, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,.04)', pointerEvents: 'none' }} />

            <div className="ds-welcome-text" style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: 'rgba(255,255,255,.15)', marginBottom: 12 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: G, display: 'inline-block' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.9)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{roleInfo.label} Portal</span>
              </div>
              <h1 style={{ margin: '0 0 6px', fontSize: 30, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                Welcome back!
              </h1>
              <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,.65)', fontWeight: 500 }}>
                {user?.email}
              </p>
            </div>

            {/* Role CTA button */}
            {user?.role === 'SCHOOL_ADMIN' && <HeroCta label="Go to School Dashboard" onClick={() => navigate('/school/profile')} />}
            {user?.role === 'SPECIAL_ABLED_PERSON' && <HeroCta label="Open Specially Abled Workspace" onClick={() => navigate('/special')} />}
            {user?.role === 'GUARDIAN_CAREGIVER' && <HeroCta label="Open Guardian Workspace" onClick={() => navigate('/guardian')} />}
            {user?.role === 'STARTUP_ADMIN' && <HeroCta label="Go to Startup Dashboard" onClick={() => navigate('/startup/profile')} />}
            {user?.role === 'SUPER_ADMIN' && <HeroCta label="Review Approvals" onClick={() => navigate('/admin/approvals')} />}
          </div>

          {/* ── Quick access grid ── */}
          <div style={{ marginBottom: 10 }}>
            <p style={{ margin: '0 0 16px', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.09em', textTransform: 'uppercase' }}>
              Quick Access
            </p>
          </div>

          <div className="ds-card-grid fade-in" style={{ display: 'grid', gap: 16 }}>
            {visibleCards.map(card => (
              <QuickCard
                key={card.title}
                card={card}
                onClick={() => navigate(card.path)}
              />
            ))}
          </div>

          {/* ── Info / Support card ── */}
          <div className="fade-in" style={{ marginTop: 24, background: '#fff', borderRadius: 16, border: '1px solid #e9ecef', padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Ic n="info" s={22} c={G} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 700, color: NAVY }}>Need Help?</p>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                Our support team is ready to assist you with any questions or issues.
              </p>
            </div>
            <button
              style={{ padding: '9px 18px', borderRadius: 10, border: `1.5px solid ${G}`, background: '#f0fdf4', color: G, fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .15s', flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.background = G; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.color = G }}
            >
              Contact Support
            </button>
          </div>

        </div>{/* /content */}
      </main>

      {/* ══════════════ BOTTOM NAV (mobile only) ══════════════ */}
      <nav className="ds-bottom-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 60,
        background: '#fff', borderTop: '1px solid #e9ecef',
        boxShadow: '0 -2px 12px rgba(0,0,0,.08)',
        height: 64, alignItems: 'stretch',
        justifyContent: 'space-around',
      }}>
        {bottomNav.map(item => {
          const active = activeNav === item.id
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveNav(item.id)
                if (item.path) navigate(item.path)
              }}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 3, border: 'none', background: 'transparent',
                cursor: 'pointer', padding: '8px 4px',
                borderTop: active ? `3px solid ${TEAL}` : '3px solid transparent',
                transition: 'border-color .15s',
              }}
            >
              <Ic n={item.icon} s={20} c={active ? TEAL : '#94a3b8'} sw={active ? 2.2 : 1.7} />
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? TEAL : '#94a3b8' }}>
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

/* ── Hero CTA button ──────────────────────────────────────────────────── */
function HeroCta({ label, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        marginTop: 18, padding: '10px 20px', borderRadius: 12,
        border: 'none', background: hov ? 'rgba(255,255,255,.95)' : 'rgba(255,255,255,.85)',
        color: TEAL, fontWeight: 800, fontSize: 13, cursor: 'pointer',
        boxShadow: '0 2px 10px rgba(0,0,0,.15)',
        transition: 'all .15s',
        transform: hov ? 'translateY(-1px)' : 'translateY(0)',
        position: 'relative', zIndex: 2,
      }}
    >
      {label}
      <Ic n="arrowR" s={14} c={TEAL} sw={2.5} />
    </button>
  )
}
