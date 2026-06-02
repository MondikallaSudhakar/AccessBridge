import { Outlet, useLocation } from 'react-router-dom'
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

  const currentPage = PAGE_BY_PATH[location.pathname] || 'marketplace'

  const sections = [
    {
      label: 'Navigation',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'home', path: '/dashboard' },
        { id: 'profile', label: 'Profile', icon: 'user', path: '/profile' },
        { id: 'marketplace', label: 'Marketplace', icon: 'shop', path: '/marketplace' },
        { id: 'orders', label: 'Orders', icon: 'shop', path: '/orders' },
        { id: 'cart', label: 'Cart', icon: 'cart', path: '/cart' },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <UserNavbar
        brandBadgeText="Community Marketplace"
        brandBadgeColor="#5BCB2B"
        sections={sections}
        footerLabel="General User"
        isItemActive={(item) => item.id === currentPage}
      />
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  )
}