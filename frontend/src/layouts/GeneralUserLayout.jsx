import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import UserNavbar from '../components/common/UserNavbar'

const PAGE_BY_PATH = {
  '/marketplace': 'marketplace',
  '/cart': 'cart',
  '/orders': 'orders',
  '/profile': 'profile',
  '/dashboard/profile': 'profile',
  '/search': 'search',
  '/messages': 'messages',
  '/dashboard': 'dashboard',
}

export default function GeneralUserLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const currentPage = PAGE_BY_PATH[location.pathname] || 'marketplace'

  const sections = [
    {
      label: 'Navigation',
      items: [
        { id: 'all', label: 'All', icon: 'grid', path: '/dashboard' },
        { id: 'events', label: 'Events', icon: 'grid', path: '/dashboard' },
        { id: 'stories', label: 'Stories', icon: 'info', path: '/dashboard' },
        { id: 'jobs', label: 'Jobs', icon: 'grid', path: '/dashboard' },
        { id: 'requirements', label: 'Requirements', icon: 'info', path: '/dashboard' },
        { id: 'marketplace', label: 'Products', icon: 'shop', path: '/marketplace' },
      ],
    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Inter', sans-serif" }}>
      <UserNavbar
        badgeText="Community"
        sections={sections}
        profilePath="/profile"
        isItemActive={(item) => item.id === currentPage || (item.id === 'marketplace' && currentPage === 'marketplace')}
      />
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  )
}