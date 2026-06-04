import { Outlet, useLocation } from 'react-router-dom'
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
  const currentPage = PAGE_BY_PATH[location.pathname] || 'marketplace'

  const sections = [
    // ── Main nav links (rendered as flat buttons because label === 'Navigation') ──
    {
      label: 'Navigation',
      items: [
        { id: 'all',          label: 'All',          icon: 'grid', path: '/dashboard' },
        { id: 'events',       label: 'Events',       icon: 'grid', path: '/dashboard' },
        { id: 'stories',      label: 'Stories',      icon: 'info', path: '/dashboard' },
        { id: 'jobs',         label: 'Jobs',         icon: 'grid', path: '/dashboard' },
        { id: 'requirements', label: 'Requirements', icon: 'info', path: '/dashboard' },
        { id: 'marketplace',  label: 'Products',     icon: 'shop', path: '/marketplace' },
      ],
    },
    // ── Dropdown: My Account ──
    {
      label: 'My Account',
      items: [
        { id: 'profile', label: 'Profile',    icon: 'user',  path: '/profile' },
        { id: 'orders',  label: 'My Orders',  icon: 'check', path: '/orders'  },
        { id: 'cart',    label: 'Cart',        icon: 'cart',  path: '/cart'    },
      ],
    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Inter', sans-serif" }}>
      <UserNavbar
        badgeText="Community"
        sections={sections}
        profilePath="/profile"
        isItemActive={(item) => item.id === currentPage}
      />
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  )
}