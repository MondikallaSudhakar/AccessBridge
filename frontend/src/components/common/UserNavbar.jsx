import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ICONS = {
  home: 'd="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"',
  grid: 'd="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"',
  school: 'd="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"',
  ngo: 'd="M7 11V7a5 5 0 1110 0v4m-8 0h6m-9 0h12l-1 9H7l-1-9z"',
  startup: 'd="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"',
  shield: 'd="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"',
  search: 'd="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"',
  shop: 'd="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"',
  cart: 'd="M3 3h2l.4 2M7 13h10l3-8H6.4M7 13l-1 5h12m-11 0a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2z"',
  check: 'd="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"',
  logout: 'd="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"',
  user: 'd="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"',
  info: 'd="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"',
}

function Ic({ n, s = 16, c = 'currentColor', sw = 1.8, st = {} }) {
  const raw = ICONS[n]
  if (!raw) return null
  const dMatch = raw.match(/d="([^"]+)"/)
  return (
    <svg width={s} height={s} fill="none" stroke={c} strokeWidth={sw} viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0, ...st }}>
      {dMatch && <path strokeLinecap="round" strokeLinejoin="round" d={dMatch[1]} />}
    </svg>
  )
}

function SidebarItem({ item, active, onClick }) {
  const [hov, setHov] = useState(false)

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        width: '100%',
        padding: '9px 10px',
        borderRadius: 9,
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        marginBottom: 1,
        background: active ? '#0d9488' : hov ? '#f8fafc' : 'transparent',
        transition: 'background .15s',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <Ic n={item.icon} s={17} c={active ? '#fff' : '#64748b'} sw={active ? 2 : 1.7} />
      <span style={{ fontSize: 13.5, fontWeight: active ? 700 : 500, color: active ? '#fff' : '#374151' }}>{item.label}</span>
    </button>
  )
}

export default function UserNavbar({
  brandBadgeText,
  brandBadgeColor = '#5BCB2B',
  brandBadgeBackground,
  brandBadgeBorder,
  sections = [],
  footerLabel = 'General User',
  footerEmail,
  onBrandClick,
  onItemClick,
  onLogout,
  isItemActive = () => false,
}) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const handleLogout = onLogout || (() => logout('/login'))
  const handleBrandClick = onBrandClick || (() => navigate('/dashboard'))

  return (
    <aside className="hidden lg:flex" style={{ width: 250, minWidth: 250, background: '#fff', borderRight: '1px solid #e9ecef', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', zIndex: 50 }}>
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, cursor: 'pointer' }} onClick={handleBrandClick}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 16, height: 28, backgroundColor: '#1A8FD1', clipPath: 'polygon(0 0,60% 0,100% 50%,60% 100%,0 100%,40% 50%)' }} />
            <div style={{ width: 16, height: 28, marginLeft: -6, backgroundColor: '#5BBE00', clipPath: 'polygon(40% 0,100% 0,100% 100%,40% 100%,0 50%)' }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>Inclusive Connect</span>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 20, background: brandBadgeBackground || `${brandBadgeColor}12`, border: `1px solid ${brandBadgeBorder || `${brandBadgeColor}30`}` }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: brandBadgeColor, display: 'inline-block' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: brandBadgeColor }}>{brandBadgeText}</span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '14px 12px 8px' }}>
        <p style={{ margin: '0 0 4px 8px', fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.10em', textTransform: 'uppercase' }}>Navigation</p>

        {sections.map((section) => (
          <div key={section.label || 'section'} style={{ marginBottom: 16 }}>
            {section.label ? (
              <p style={{ margin: '0 0 4px 8px', fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.10em', textTransform: 'uppercase' }}>{section.label}</p>
            ) : null}
            {section.items.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                active={Boolean(isItemActive(item))}
                onClick={() => {
                  if (onItemClick) {
                    onItemClick(item)
                    return
                  }
                  if (item.path) navigate(item.path)
                }}
              />
            ))}
          </div>
        ))}
      </nav>

      <div style={{ padding: '8px 12px 20px', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ padding: '10px 10px', borderRadius: 10, background: '#f8fafc', marginBottom: 8 }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{footerEmail || user?.email}</p>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>{footerLabel}</p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '9px 10px', borderRadius: 9, border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'background .15s' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          <Ic n="logout" s={16} c="#ef4444" />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
