import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function Brand({ onClick }) {
  return (
    <div className="flex items-center gap-3 cursor-pointer" onClick={onClick}>
      <div className="w-4 h-7 rounded-sm" style={{ backgroundColor: '#1A8FD1', clipPath: 'polygon(0 0, 60% 0, 100% 50%, 60% 100%, 0 100%, 40% 50%)' }}></div>
      <div className="w-4 h-7 rounded-sm -ml-1.5" style={{ backgroundColor: '#5BBE00', clipPath: 'polygon(40% 0, 100% 0, 100% 100%, 40% 100%, 0 50%)' }}></div>
      <span className="font-black tracking-tight text-gray-900 text-lg">Inclusive Connect</span>
    </div>
  )
}

function NavButton({ active, children, onClick, tone = 'neutral', badge }) {
  const baseStyles = 'relative w-full text-sm font-bold px-4 py-3 rounded-xl transition-colors flex items-center gap-3 text-left'
  const toneStyles = {
    neutral: active ? 'bg-teal-600 text-white shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700 border border-transparent',
    brand: active ? 'bg-teal-600 text-white shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700 border border-transparent',
  }

  return (
    <button onClick={onClick} className={`${baseStyles} ${toneStyles[tone]}`}>
      {children}
      {badge != null && badge > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  )
}

export default function UserNavbar({ currentPage = 'marketplace', cartCount = 0 }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-slate-200 bg-white shadow-sm lg:flex">
      <div className="border-b border-slate-100 px-5 pb-5 pt-6">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <Brand />
        </div>

        <div className="mt-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5" style={{ borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' }}>
          <span className="h-2.5 w-2.5 rounded-full bg-lime-500" />
          <span className="text-xs font-bold tracking-wide text-lime-700">Community Marketplace</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-5">
        <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Navigation</p>

        <div className="space-y-1">
          <NavButton
            active={currentPage === 'dashboard'}
            onClick={() => navigate('/dashboard')}
            tone={currentPage === 'dashboard' ? 'brand' : 'neutral'}
          >
            Dashboard
          </NavButton>

          <NavButton
            active={currentPage === 'profile'}
            onClick={() => navigate('/profile')}
            tone={currentPage === 'profile' ? 'brand' : 'neutral'}
          >
            Profile
          </NavButton>

          <NavButton
            active={currentPage === 'marketplace'}
            onClick={() => navigate('/marketplace')}
            tone={currentPage === 'marketplace' ? 'brand' : 'neutral'}
          >
            Marketplace
          </NavButton>

          <NavButton
            active={currentPage === 'orders'}
            onClick={() => navigate('/orders')}
            tone={currentPage === 'orders' ? 'brand' : 'neutral'}
          >
            Orders
          </NavButton>

          <NavButton
            active={currentPage === 'cart'}
            onClick={() => navigate('/cart')}
            tone={currentPage === 'cart' ? 'brand' : 'neutral'}
            badge={cartCount}
          >
            Cart
          </NavButton>
        </div>
      </nav>

      <div className="border-t border-slate-100 p-4">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-bold text-slate-900">{user?.email || 'General User'}</p>
          <p className="mt-1 text-xs text-slate-500">{user?.role === 'USER' ? 'General User' : user?.role || 'Guest'}</p>
        </div>

        <button
          type="button"
          onClick={() => logout('/login')}
          className="mt-4 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold text-red-500 transition-colors hover:bg-red-50"
        >
          <span className="text-base">↪</span>
          Sign Out
        </button>
      </div>
    </aside>
  )
}