import { Outlet, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import UserNavbar from '../components/common/UserNavbar'

const PAGE_BY_PATH = {
  '/dashboard': 'dashboard',
  '/marketplace': 'marketplace',
  '/cart': 'cart',
  '/orders': 'orders',
  '/profile': 'profile',
  '/dashboard/profile': 'profile',
  '/search': 'dashboard',
  '/messages': 'dashboard',
}

export default function GeneralUserLayout() {
  const location = useLocation()
  const { getTotalItems } = useCart()

  const currentPage = PAGE_BY_PATH[location.pathname] || 'marketplace'

  return (
    <div className="min-h-screen bg-slate-50 lg:flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      <UserNavbar currentPage={currentPage} cartCount={getTotalItems()} />
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  )
}