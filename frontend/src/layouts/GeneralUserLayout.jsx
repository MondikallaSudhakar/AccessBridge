import { Outlet, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import UserNavbar from '../components/common/UserNavbar'

const PAGE_BY_PATH = {
  '/marketplace': 'marketplace',
  '/cart': 'cart',
  '/orders': 'orders',
  '/profile': 'profile',
  '/dashboard/profile': 'profile',
}

export default function GeneralUserLayout() {
  const location = useLocation()
  const { getTotalItems } = useCart()

  const currentPage = PAGE_BY_PATH[location.pathname] || 'marketplace'

  return (
    <div className="min-h-screen bg-slate-50 lg:flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      <UserNavbar currentPage={currentPage} cartCount={getTotalItems()} />
      <main className="min-w-0 flex-1">
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-4 h-7 rounded-sm" style={{ backgroundColor: '#1A8FD1', clipPath: 'polygon(0 0, 60% 0, 100% 50%, 60% 100%, 0 100%, 40% 50%)' }} />
            <div className="w-4 h-7 rounded-sm -ml-1.5" style={{ backgroundColor: '#5BBE00', clipPath: 'polygon(40% 0, 100% 0, 100% 100%, 40% 100%, 0 50%)' }} />
            <span className="font-black tracking-tight text-gray-900 text-lg">Inclusive Connect</span>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  )
}