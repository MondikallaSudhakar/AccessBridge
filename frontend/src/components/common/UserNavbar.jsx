import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import logoImg from '../../assets/logo.jpeg'

const ICONS = {
  home: 'd="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"',
  grid: 'd="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"',
  school: 'd="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"',
  ngo: 'd="M7 11V7a5 5 0 1110 0v4m-8 0h6m-9 0h12l-1 9H7l-1-9z"',
  startup: 'd="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"',
  shield: 'd="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"',
  search: 'd="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"',
  shop: 'd="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"',
  bag: 'd="M6 8h12l-1 12H7L6 8zm3 0V6a3 3 0 016 0v2"',
  cart: 'd="M3 3h2l.4 2M7 13h10l3-8H6.4M7 13l-1 5h12m-11 0a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2z"',
  check: 'd="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"',
  logout: 'd="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"',
  user: 'd="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"',
  info: 'd="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"',
  chevronDown: 'd="M19 9l-7 7-7-7"',
  menu: 'd="M4 6h16M4 12h16M4 18h16"',
  x: 'd="M6 18L18 6M6 6l12 12"',
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

/* ── Dropdown menu for grouped items ── */
function NavDropdown({ section, onItemClick, isItemActive }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const hasActiveChild = section.items.some((item) => isItemActive(item))

  // If only 1 item, render directly without dropdown
  if (section.items.length === 1) {
    const item = section.items[0]
    const active = isItemActive(item)
    return (
      <button
        onClick={() => onItemClick(item)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
          background: active ? '#0d9488' : 'transparent',
          color: active ? '#fff' : '#374151',
          fontSize: 13, fontWeight: active ? 700 : 500,
          transition: 'all .15s',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f1f5f9' }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
      >
        <Ic n={item.icon} s={15} c={active ? '#fff' : '#64748b'} sw={active ? 2 : 1.7} />
        {item.label}
      </button>
    )
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
          background: hasActiveChild ? '#0d948815' : 'transparent',
          color: hasActiveChild ? '#0d9488' : '#374151',
          fontSize: 13, fontWeight: hasActiveChild ? 700 : 500,
          transition: 'all .15s',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => { if (!hasActiveChild) e.currentTarget.style.background = '#f1f5f9' }}
        onMouseLeave={e => { if (!hasActiveChild) e.currentTarget.style.background = hasActiveChild ? '#0d948815' : 'transparent' }}
      >
        {section.label}
        <Ic n="chevronDown" s={12} c={hasActiveChild ? '#0d9488' : '#94a3b8'} sw={2}
          st={{ transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0,
          background: '#fff', borderRadius: 12, border: '1px solid #e9ecef',
          boxShadow: '0 12px 40px rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.06)',
          minWidth: 200, padding: '6px', zIndex: 1000,
          animation: 'topnavDropIn .15s ease',
        }}>
          {section.items.map((item) => {
            const active = isItemActive(item)
            return (
              <button
                key={item.id}
                onClick={() => { onItemClick(item); setOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  textAlign: 'left',
                  background: active ? '#0d9488' : 'transparent',
                  color: active ? '#fff' : '#374151',
                  fontSize: 13, fontWeight: active ? 700 : 500,
                  transition: 'background .12s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f1f5f9' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? '#0d9488' : 'transparent' }}
              >
                <Ic n={item.icon} s={15} c={active ? '#fff' : '#64748b'} sw={active ? 2 : 1.7} />
                {item.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ── Mobile slide-out drawer ── */
function MobileDrawer({ open, onClose, sections, onItemClick, isItemActive }) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.3)',
            zIndex: 9998, backdropFilter: 'blur(2px)',
          }}
        />
      )}
      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: 280, maxWidth: '80vw',
        background: '#fff', zIndex: 9999,
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform .25s cubic-bezier(.4,0,.2,1)',
        boxShadow: open ? '4px 0 30px rgba(0,0,0,.15)' : 'none',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Menu</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <Ic n="x" s={18} c="#64748b" />
          </button>
        </div>

        <nav style={{ flex: 1, padding: '12px' }}>
          {sections.map((section) => (
            <div key={section.label || 'section'} style={{ marginBottom: 14 }}>
              {section.label && (
                <p style={{ margin: '0 0 4px 8px', fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.10em', textTransform: 'uppercase' }}>
                  {section.label}
                </p>
              )}
              {section.items.map((item) => {
                const active = isItemActive(item)
                return (
                  <button
                    key={item.id}
                    onClick={() => { onItemClick(item); onClose() }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                      padding: '9px 10px', borderRadius: 9, border: 'none', cursor: 'pointer',
                      textAlign: 'left', marginBottom: 1,
                      background: active ? '#0d9488' : 'transparent',
                      transition: 'background .15s',
                      color: active ? '#fff' : '#374151',
                      fontSize: 13.5, fontWeight: active ? 700 : 500,
                    }}
                  >
                    <Ic n={item.icon} s={16} c={active ? '#fff' : '#64748b'} sw={active ? 2 : 1.7} />
                    {item.label}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>
      </div>
    </>
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
  const [mobileOpen, setMobileOpen] = useState(false)

  const defaultItemClick = (item) => {
    if (onItemClick) { onItemClick(item); return }
    if (item.path) navigate(item.path)
  }

  return (
    <>
      <style>{`
        @keyframes topnavDropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .topnav-bar {
          display: flex;
          align-items: center;
          width: 100%;
          background: #fff;
          border-bottom: 1px solid #e9ecef;
          padding: 0 20px;
          height: 58px;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 1px 4px rgba(0,0,0,.04);
          gap: 16px;
          font-family: 'Inter', sans-serif;
        }
        .topnav-links { display: flex; align-items: center; gap: 2px; flex: 1; overflow-x: auto; }
        .topnav-links::-webkit-scrollbar { display: none; }
        .topnav-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }

        .topnav-hamburger { display: none; }

        @media (max-width: 900px) {
          .topnav-links { display: none !important; }
          .topnav-hamburger { display: flex !important; }
        }
      `}</style>

      <nav className="topnav-bar">
        {/* Brand */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 }}
          onClick={handleBrandClick}
        >
          <img src={logoImg} alt="KnotneX" style={{ width: 30, height: 30, borderRadius: 7, objectFit: 'cover' }} />
          <span style={{ fontSize: 14, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>KnotneX</span>
        </div>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 20, flexShrink: 0,
          background: brandBadgeBackground || `${brandBadgeColor}12`,
          border: `1px solid ${brandBadgeBorder || `${brandBadgeColor}30`}`,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: brandBadgeColor, display: 'inline-block' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: brandBadgeColor, whiteSpace: 'nowrap' }}>{brandBadgeText}</span>
        </div>

        {/* Desktop nav links */}
        <div className="topnav-links">
          {sections.map((section) => (
            <NavDropdown
              key={section.label || 'section'}
              section={section}
              onItemClick={defaultItemClick}
              isItemActive={(item) => Boolean(isItemActive(item))}
            />
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="topnav-hamburger"
          onClick={() => setMobileOpen(true)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 6, marginLeft: 'auto',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Ic n="menu" s={22} c="#374151" />
        </button>

        {/* Right side - user info + logout */}
        <div className="topnav-right">
          <div style={{ padding: '4px 12px', borderRadius: 8, background: '#f8fafc' }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
              {footerEmail || user?.email}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 8, border: 'none',
              background: '#fef2f2', cursor: 'pointer',
              transition: 'background .15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2' }}
          >
            <Ic n="logout" s={14} c="#ef4444" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#ef4444' }}>Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sections={sections}
        onItemClick={defaultItemClick}
        isItemActive={(item) => Boolean(isItemActive(item))}
      />
    </>
  )
}
