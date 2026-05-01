import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const GREEN = '#5BCB2B'
const BLUE = '#0197B2'
const NAVY = '#0f172a'

const ICONS = {
  home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6',
  box: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  orders: 'M3 7h18M3 12h18M3 17h18',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  dashboard: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6',
}

function Icon({ name, color = 'currentColor' }) {
  const d = ICONS[name]
  if (!d) return null
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" style={{ display: 'block', flexShrink: 0 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  )
}

function SidebarLink({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      end={to === '/startup/profile'}
      className={({ isActive }) => `mb-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all ${isActive ? 'text-white shadow-sm' : 'text-slate-700'}`}
      style={({ isActive }) => ({ backgroundColor: isActive ? GREEN : 'transparent', fontWeight: isActive ? 700 : 500 })}
    >
      {({ isActive }) => (
        <>
          <Icon name={icon} color={isActive ? '#ffffff' : '#64748b'} />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  )
}

export default function StartupWorkspaceLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <aside className="hidden border-r border-slate-200 bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:flex-col">
        <div className="border-b border-slate-100 px-5 pb-4 pt-6">
          <div className="mb-4 flex cursor-pointer items-center gap-2.5" onClick={() => navigate('/')}>
            <div className="flex items-center">
              <div style={{ width: 14, height: 24, backgroundColor: BLUE, clipPath: 'polygon(0 0,60% 0,100% 50%,60% 100%,0 100%,40% 50%)' }} />
              <div style={{ width: 14, height: 24, marginLeft: -5, backgroundColor: GREEN, clipPath: 'polygon(40% 0,100% 0,100% 100%,40% 100%,0 50%)' }} />
            </div>
            <span className="text-sm font-black tracking-tight" style={{ color: NAVY }}>Inclusive Connect</span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1" style={{ borderColor: `${GREEN}50`, backgroundColor: `${GREEN}12` }}>
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: GREEN }} />
            <span className="text-xs font-bold" style={{ color: GREEN }}>Startup Workspace</span>
          </div>

          <p className="mt-3 truncate text-xs text-slate-500">{user?.email || user?.name || 'Startup Admin'}</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Workspace</p>
          <SidebarLink to="/startup/profile" label="Profile" icon="home" />
          <SidebarLink to="/startup/products" label="Products" icon="box" />
          <SidebarLink to="/startup/events" label="Events" icon="calendar" />
          <SidebarLink to="/startup/orders" label="Orders" icon="orders" />
        </nav>

        <div className="space-y-1.5 border-t border-slate-100 p-3">
          <button type="button" onClick={() => navigate('/dashboard')} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
            <Icon name="dashboard" color="#64748b" />
            Dashboard
          </button>
          <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50">
            <Icon name="logout" color="#e11d48" />
            Logout
          </button>
        </div>
      </aside>

      <section className="min-w-0 flex-1">
        <header className="border-b border-slate-200 bg-white lg:hidden">
          <div className="px-4 py-4 sm:px-6">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{ backgroundColor: `${GREEN}12` }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: GREEN }} />
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: GREEN }}>Startup Workspace</span>
              </div>
            </div>
            <h1 className="mt-2 text-lg font-black text-slate-900">Workspace</h1>
          </div>
          <nav className="flex gap-2 overflow-x-auto px-4 pb-3 sm:px-6">
            <NavLink to="/startup/profile" className={({ isActive }) => `whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${isActive ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'}`}>
              Profile
            </NavLink>
            <NavLink to="/startup/products" className={({ isActive }) => `whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${isActive ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'}`}>
              Products
            </NavLink>
            <NavLink to="/startup/events" className={({ isActive }) => `whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${isActive ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'}`}>
              Events
            </NavLink>
            <NavLink to="/startup/orders" className={({ isActive }) => `whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${isActive ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'}`}>
              Orders
            </NavLink>
          </nav>
        </header>

        <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </section>
    </div>
  )
}