import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { SCHOOL_WORKSPACE_NAV } from './schoolWorkspaceData'

const G = '#5BCB2B'
const B = '#1A8FD1'
const AMBER = '#d97706'
const NAVY = '#0f172a'

const ICONS = {
  home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6',
  users: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  book: 'M12 6.253v13m0-13C10.832 5.483 9.246 5 7.5 5 4.462 5 2 6.79 2 9v11c0-2.21 2.462-4 5.5-4 1.746 0 3.332.483 4.5 1.253m0-13C13.168 5.483 14.754 5 16.5 5c3.038 0 5.5 1.79 5.5 4v11c0 2.21-2.462 4-5.5 4-1.746 0-3.332-.483-4.5-1.253',
  user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  clipboard: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  heart: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  star: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
  building: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  chat: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  school: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
  logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
}

const NAV_ICON = {
  Home: 'home',
  Students: 'users',
  Programs: 'book',
  Staff: 'user',
  Admissions: 'clipboard',
  'Therapy & Support': 'heart',
  Events: 'calendar',
  Achievements: 'star',
  'NGO Partners': 'building',
  Messages: 'chat',
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

function SidebarLink({ item }) {
  const [hover, setHover] = useState(false)

  return (
    <NavLink
      to={item.to}
      end={item.to === '/school-workspace'}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={({ isActive }) => `mb-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-all ${isActive ? 'text-white shadow-sm' : 'text-slate-700'}`}
      style={({ isActive }) => ({
        backgroundColor: isActive ? AMBER : hover ? '#fef3c7' : 'transparent',
        fontWeight: isActive ? 700 : 500,
      })}
    >
      {({ isActive }) => (
        <>
          <Ic name={NAV_ICON[item.label] || 'home'} size={16} color={isActive ? '#ffffff' : '#64748b'} />
          <span>{item.label}</span>
        </>
      )}
    </NavLink>
  )
}

export default function SchoolWorkspaceLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      {/* ── Sidebar ── */}
      <aside className="hidden border-r border-slate-200 bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:flex-col">
        {/* Brand */}
        <div className="border-b border-slate-100 px-5 pb-4 pt-6">
          <div className="mb-4 flex cursor-pointer items-center gap-2.5" onClick={() => navigate('/')}>
            <div className="flex items-center">
              <div style={{ width: 14, height: 24, backgroundColor: B, clipPath: 'polygon(0 0,60% 0,100% 50%,60% 100%,0 100%,40% 50%)' }} />
              <div style={{ width: 14, height: 24, marginLeft: -5, backgroundColor: G, clipPath: 'polygon(40% 0,100% 0,100% 100%,40% 100%,0 50%)' }} />
            </div>
            <span className="text-sm font-black tracking-tight" style={{ color: NAVY }}>Inclusive Connect</span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1" style={{ borderColor: `${AMBER}50`, backgroundColor: `${AMBER}18` }}>
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: AMBER }} />
            <span className="text-xs font-bold" style={{ color: AMBER }}>School / Training Center</span>
          </div>

          <p className="mt-3 truncate text-xs text-slate-500">{user?.email || user?.name || 'School Admin'}</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Workspace</p>
          {SCHOOL_WORKSPACE_NAV.map((item) => (
            <SidebarLink key={item.to} item={item} />
          ))}
        </nav>

        <div className="space-y-1.5 border-t border-slate-100 p-3">
          <button type="button" onClick={() => navigate('/school/profile')} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
            <Ic name="school" size={16} color="#64748b" />
            School Profile
          </button>
          <button type="button" onClick={() => navigate('/dashboard')} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
            <Ic name="home" size={16} color="#64748b" />
            Dashboard
          </button>
          <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50">
            <Ic name="logout" size={16} color="#e11d48" />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <section className="min-w-0 flex-1">
        {/* Mobile top-bar */}
        <header className="border-b border-slate-200 bg-white lg:hidden">
          <div className="px-4 py-4 sm:px-6">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{ backgroundColor: `${AMBER}18` }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: AMBER }} />
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: AMBER }}>Special Schools / Training Centers</span>
              </div>
            </div>
            <h1 className="mt-2 text-lg font-black text-slate-900">Workspace</h1>
          </div>
          <nav className="flex gap-2 overflow-x-auto px-4 pb-3 sm:px-6">
            {SCHOOL_WORKSPACE_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/school-workspace'}
                className={({ isActive }) => `whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${isActive ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </section>
    </div>
  )
}
