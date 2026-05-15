import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { SPECIAL_NAV } from './specialData'

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

function SidebarLink({ item }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/special'}
      className={({ isActive }) => `mb-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-sans transition-all ${isActive ? 'border border-lime-300 bg-lime-200/80 text-lime-950 font-medium shadow-sm shadow-lime-200/60' : 'text-slate-600 hover:bg-lime-50 hover:text-slate-900'}`}
    >
      {({ isActive }) => (
        <>
          <Ic name={NAV_ICON[item.label] || 'home'} size={16} color={isActive ? '#365314' : 'currentColor'} />
          <span>{item.label}</span>
        </>
      )}
    </NavLink>
  )
}

export default function SpecialLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6fbe9_0%,#fbfcf6_35%,#f3f8ef_100%)] lg:flex">
      <aside className="hidden border-r border-lime-100 bg-[linear-gradient(180deg,#fbfef2_0%,#f4fae8_100%)] lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:flex-col">
        <div className="border-b border-lime-100 px-5 pb-4 pt-6">
          <div className="mb-4 flex cursor-pointer items-center gap-2.5" onClick={() => navigate('/') }>
            <div className="grid h-8 w-8 place-items-center rounded bg-lime-500 text-xs font-bold text-white font-sans shadow-sm shadow-lime-200">
              IC
            </div>
            <span className="text-sm font-bold tracking-tight text-lime-950 font-sans">NexInclusion</span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-lime-200 bg-white/80 px-3 py-1 shadow-sm shadow-lime-100/60 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-lime-500" />
            <span className="text-xs font-semibold text-slate-700 font-sans">Specially Abled</span>
          </div>

          <p className="mt-3 truncate text-xs text-slate-500 font-sans">{user?.email || user?.name || 'User'}</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-lime-700 font-sans">Workspace</p>
          {SPECIAL_NAV.map((item) => (
            <SidebarLink key={item.to} item={item} />
          ))}
        </nav>

        <div className="space-y-1.5 border-t border-lime-100 p-3">
          <button type="button" onClick={() => navigate('/dashboard')} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-lime-50 hover:text-slate-900 font-sans">
            <Ic name="home" size={16} color="currentColor" />
            Dashboard
          </button>
          <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-lime-50 hover:text-slate-900 font-sans">
            <Ic name="logout" size={16} color="currentColor" />
            Logout
          </button>
        </div>
      </aside>

      <section className="min-w-0 flex-1">
        <header className="border-b border-lime-100 bg-[linear-gradient(180deg,#fbfff7_0%,#f2fae8_100%)] lg:hidden">
          <div className="px-4 py-4 sm:px-6">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-lime-700 font-sans">Specially Abled Workspace</p>
            <h1 className="mt-2 text-xl font-serif text-lime-950">Dedicated pages for each feature</h1>
          </div>
          <nav className="flex gap-2 overflow-x-auto px-4 pb-3 sm:px-6">
            {SPECIAL_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/special'}
                className={({ isActive }) => `whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors font-sans ${isActive ? 'border-lime-300 bg-lime-200 text-lime-950' : 'border-lime-100 bg-white/80 text-slate-600 hover:border-lime-200 hover:text-slate-900'}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </section>
    </div>
  )
}
