import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { VOLUNTEER_WORKSPACE_NAV } from './volunteerData'

const TEAL = '#0d9488'
const B = '#1A8FD1'
const NAVY = '#0f172a'

const ICONS = {
  home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6',
  briefcase: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  users: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  school: 'M12 14l9-5-9-5-9 5 9 5m0 0v7',
  heart: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  star: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
  logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
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
      end={item.to === '/volunteer'}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={({ isActive }) => `mb-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-all ${isActive ? 'text-white shadow-sm' : 'text-slate-700'}`}
      style={({ isActive }) => ({
        backgroundColor: isActive ? TEAL : hover ? `${TEAL}08` : 'transparent',
        fontWeight: isActive ? 700 : 500,
      })}
    >
      <Ic name={item.icon} color="currentcolor" />
      <span>{item.label}</span>
    </NavLink>
  )
}

export default function VolunteerLayout() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white p-6 shadow-sm sm:block hidden">
        <div className="mb-10 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">
            <span className="text-xl font-black">C</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">Community</span>
        </div>

        <nav className="space-y-1">
          {VOLUNTEER_WORKSPACE_NAV.map((item) => (
            <SidebarLink key={item.to} item={item} />
          ))}
        </nav>

        <div className="mt-10 border-t border-slate-100 pt-6">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-700"
          >
            <Ic name="logout" color="currentcolor" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <section className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{ backgroundColor: `${TEAL}12` }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: TEAL }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: TEAL }}>Volunteer / Supporter Workspace</span>
                </div>
              </div>
              <h1 className="mt-2 text-lg font-black text-slate-900">Workspace</h1>
            </div>
            <button onClick={handleLogout} title="Logout" className="flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50 sm:hidden">
              <Ic name="logout" size={14} color="#e11d48" />
              <span>Logout</span>
            </button>
          </div>
          <nav className="flex gap-2 overflow-x-auto px-4 pb-3 sm:px-6">
            {VOLUNTEER_WORKSPACE_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/volunteer'}
                className={({ isActive }) => `whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${isActive ? 'border-teal-300 bg-teal-50 text-teal-700' : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'}`}
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
