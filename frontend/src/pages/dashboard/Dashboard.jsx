import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../../services/api'
import SidebarNav from '../../components/common/UserNavbar'

/* ── brand tokens ─────────────────────────────────────────────────────── */
const G    = '#5BCB2B'   // brand green
const B    = '#1A8FD1'   // brand blue
const TEAL = '#0d9488'   // sidebar active color (NYSPACE)
const NAVY = '#0f172a'   // dark text

// Super Admin constants
const SUPER_ADMIN_TEAL = '#0197B2'
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081/api'

/* ── SVG icon helper ──────────────────────────────────────────────────── */
const ICONS = {
  home:      'd="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"',
  grid:      'd="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"',
  school:    'd="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"',
  ngo:       'd="M7 11V7a5 5 0 1110 0v4m-8 0h6m-9 0h12l-1 9H7l-1-9z"',
  startup:   'd="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"',
  shield:    'd="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"',
  search:    'd="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"',
  shop:      'd="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"',
  bag:       'd="M6 8h12l-1 12H7L6 8zm3 0V6a3 3 0 016 0v2"',
  cart:      'd="M3 3h2l.4 2M7 13h10l3-8H6.4M7 13l-1 5h12m-11 0a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2z"',
  check:     'd="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"',
  logout:    'd="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"',
  user:      'd="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"',
  arrowR:    'd="M13 7l5 5m0 0l-5 5m5-5H6"',
  info:      'd="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"',
  globe:     'd="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"',
  menu:      'd="M4 6h16M4 12h16M4 18h16"',
  x:         'd="M6 18L18 6M6 6l12 12"',
}

function Ic({ n, s = 16, c = 'currentColor', sw = 1.8, st = {} }) {
  const raw = ICONS[n]
  if (!raw) return null
  const dMatch = raw.match(/d="([^"]+)"/)
  return (
    <svg width={s} height={s} fill="none" stroke={c} strokeWidth={sw}
      viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0, ...st }}>
      {dMatch && <path strokeLinecap="round" strokeLinejoin="round" d={dMatch[1]} />}
    </svg>
  )
}

/* ── role config ──────────────────────────────────────────────────────── */
const ROLE_MAP = {
  USER:          { label: 'General User', icon: 'user',   color: '#8b5cf6' },
  SPECIAL_ABLED_PERSON: { label: 'Specially Abled', icon: 'info', color: '#0ea5e9' },
  GUARDIAN_CAREGIVER: { label: 'Guardian', icon: 'info', color: '#10b981' },
  SCHOOL_ADMIN:  { label: 'School Admin', icon: 'school', color: G         },
  NGO_ADMIN:     { label: 'NGO Admin',    icon: 'ngo',    color: TEAL      },
  STARTUP_ADMIN: { label: 'Startup Admin',icon: 'startup',color: '#f59e0b' },
  SUPER_ADMIN:   { label: 'Super Admin',  icon: 'shield', color: B         },
}

// Super Admin role colors for user distribution cards
const roleColors = {
  SCHOOL_ADMIN: { bg: '#f0fdf4', text: '#5BCB2B' },
  NGO_ADMIN: { bg: '#f0fdfa', text: SUPER_ADMIN_TEAL },
  STARTUP_ADMIN: { bg: '#fffbeb', text: '#f59e0b' },
  VOLUNTEER: { bg: '#fef2f2', text: '#ef4444' },
  SPECIAL_ABLED_PERSON: { bg: '#ecfdf5', text: '#10b981' },
  GUARDIAN_CAREGIVER: { bg: '#ecfef6', text: '#0ea5e9' },
}

const roleLabel = {
  SCHOOL_ADMIN: 'School',
  NGO_ADMIN: 'NGO',
  STARTUP_ADMIN: 'Startup',
  VOLUNTEER: 'Volunteer',
  SPECIAL_ABLED_PERSON: 'Special Abled',
  GUARDIAN_CAREGIVER: 'Guardian',
}

const USER_NAV_ITEMS = [
  { id: 'home', label: 'Dashboard', icon: 'home', path: '/dashboard' },
  { id: 'profile', label: 'Profile', icon: 'user', path: '/profile' },
  { id: 'marketplace', label: 'Marketplace', icon: 'shop', path: '/marketplace' },
  { id: 'orders', label: 'Orders', icon: 'shop', path: '/orders' },
  { id: 'cart', label: 'Cart', icon: 'shop', path: '/cart' },
]

const GENERAL_USER_NAV_GROUP = [
  {
    label: 'Navigation',
    items: USER_NAV_ITEMS,
  },
]

// Fetch org by email helper
async function fetchOrgByEmail(email, role) {
  try {
    const type = role === 'SCHOOL_ADMIN' ? 'schools' : role === 'NGO_ADMIN' ? 'ngos' : 'startups'
    const encoded = encodeURIComponent(email)
    const res = await fetch(`${BASE}/${type}/email/${encoded}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    return res.ok ? res.json() : null
  } catch { return null }
}

/* ── sidebar nav groups ───────────────────────────────────────────────── */
const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { id: 'home', label: 'Dashboard', icon: 'home' },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { id: 'school',     label: 'School Dashboard',  icon: 'school',  role: 'SCHOOL_ADMIN',  path: '/school/profile'  },
      { id: 'special',    label: 'Special Workspace', icon: 'info',    role: 'SPECIAL_ABLED_PERSON', path: '/special' },
      { id: 'guardian',   label: 'Guardian Workspace', icon: 'info',   role: 'GUARDIAN_CAREGIVER', path: '/guardian' },
      { id: 'ngo',        label: 'NGO Dashboard',     icon: 'ngo',     role: 'NGO_ADMIN',     path: '/ngo/profile'     },
      { id: 'startup',    label: 'Startup Dashboard', icon: 'startup', role: 'STARTUP_ADMIN', path: '/startup/profile' },
    ],
  },
  {
    label: 'Admin Tools',
    role: 'SUPER_ADMIN',
    items: [
      { id: 'admin-overview', label: 'Overview', icon: 'grid', tabId: 'overview' },
      { id: 'admin-approvals', label: 'Approvals', icon: 'check', tabId: 'approvals' },
      { id: 'admin-jobs', label: 'Jobs', icon: 'search', tabId: 'jobs' },
      { id: 'admin-products', label: 'Products', icon: 'shop', tabId: 'products' },
      { id: 'admin-events', label: 'Events', icon: 'grid', tabId: 'events' },
      { id: 'admin-campaigns', label: 'Campaigns', icon: 'search', tabId: 'campaigns' },
      { id: 'admin-needs', label: 'Requirements', icon: 'info', tabId: 'needs' },
      { id: 'admin-support', label: 'Support', icon: 'shield', tabId: 'support' },
      { id: 'admin-donations', label: 'Donations', icon: 'shop', tabId: 'donations' },
      { id: 'admin-payouts', label: 'Payout Requests', icon: 'bag', tabId: 'payouts' },
      { id: 'admin-ngos', label: 'NGOs', icon: 'ngo', tabId: 'ngos' },
      { id: 'admin-startups', label: 'Startups', icon: 'startup', tabId: 'startups' },
    ],
  },
  {
    label: 'Community',
    items: [
      { id: 'browse',      label: 'Community Browser',    icon: 'search', path: '/#directory'  },
      { id: 'marketplace', label: 'Product Marketplace',  icon: 'shop',   path: '/marketplace' },
    ],
  },
]

/* ── quick-access cards config ────────────────────────────────────────── */
const CARDS = [
  {
    role: 'SCHOOL_ADMIN',
    title: 'School Dashboard',
    desc: "Update your school's profile, manage requirements, and post achievements.",
    icon: 'school',
    color: G,
    bg: '#f0fdf4',
    path: '/school/profile',
    cta: 'Open Dashboard',
  },
  {
    role: 'SPECIAL_ABLED_PERSON',
    title: 'Specially Abled Workspace',
    desc: 'Manage your accessibility profile, discover jobs, schemes, training, campaigns, and nearby support.',
    icon: 'info',
    color: '#0ea5e9',
    bg: '#ecfeff',
    path: '/special',
    cta: 'Open Workspace',
  },
  {
    role: 'GUARDIAN_CAREGIVER',
    title: 'Guardian Workspace',
    desc: 'Manage dependent profiles, apply for jobs on behalf, book therapy, and track support opportunities.',
    icon: 'info',
    color: '#10b981',
    bg: '#ecfdf5',
    path: '/guardian',
    cta: 'Open Workspace',
  },
  {
    role: 'NGO_ADMIN',
    title: 'NGO Dashboard',
    desc: 'Post requirements, jobs, products, services and achievements.',
    icon: 'ngo',
    color: TEAL,
    bg: '#f0fdfa',
    path: '/ngo/profile',
    cta: 'Open Dashboard',
  },
  {
    role: 'STARTUP_ADMIN',
    title: 'Startup Dashboard',
    desc: 'Manage your startup profile and list assistive products on the marketplace.',
    icon: 'startup',
    color: '#f59e0b',
    bg: '#fffbeb',
    path: '/startup/profile',
    cta: 'Open Dashboard',
  },
  {
    role: 'SUPER_ADMIN',
    title: 'Network Approvals',
    desc: 'Review and approve pending registrations for NGOs, Schools and Startups.',
    icon: 'check',
    color: B,
    bg: '#eff6ff',
    path: '/admin/approvals',
    cta: 'Start Reviewing',
  },
  {
    role: null,  // always show
    title: 'Community Browser',
    desc: 'Explore the full directory of verified schools, NGOs and assistive startups.',
    icon: 'search',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    path: '/#directory',
    cta: 'Explore Hub',
  },
  {
    role: null,  // always show
    title: 'Product Marketplace',
    desc: 'Discover and procure assistive equipment, educational tools and resources.',
    icon: 'shop',
    color: '#f97316',
    bg: '#fff7ed',
    path: '/marketplace',
    cta: 'Browse Marketplace',
  },
]

/* ── Quick-access card ────────────────────────────────────────────────── */
function QuickCard({ card, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#fff',
        borderRadius: 16,
        border: `1.5px solid ${hov ? card.color + '50' : '#e9ecef'}`,
        padding: '20px 20px 18px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        boxShadow: hov ? `0 4px 18px ${card.color}22` : '0 1px 4px rgba(0,0,0,.06)',
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all .2s',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative corner */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 80, height: 80,
        background: `radial-gradient(circle at top right, ${card.color}15, transparent 70%)`,
        borderRadius: '0 16px 0 0',
        pointerEvents: 'none',
      }} />
      {/* Icon */}
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: card.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Ic n={card.icon} s={22} c={card.color} sw={1.8} />
      </div>
      {/* Text */}
      <div style={{ flex: 1 }}>
        <p style={{ margin: '0 0 5px', fontSize: 15, fontWeight: 800, color: NAVY, letterSpacing: '-0.01em' }}>
          {card.title}
        </p>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.55 }}>
          {card.desc}
        </p>
      </div>
      {/* CTA */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        fontSize: 12.5, fontWeight: 700, color: card.color,
        paddingTop: 4, borderTop: `1px solid ${card.color}18`,
        marginTop: 2,
      }}>
        {card.cta}
        <Ic n="arrowR" s={13} c={card.color} sw={2.5}
          st={{ transition: 'transform .2s', transform: hov ? 'translateX(3px)' : 'translateX(0)' }} />
      </div>
    </div>
  )
}

/* ── Main Dashboard ───────────────────────────────────────────────────── */
export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeNav, setActiveNav] = useState('home')

  // Super Admin state
  const [tab, setTab] = useState(() => new URLSearchParams(location.search).get('tab') || 'overview')
  const [stats, setStats] = useState(null)
  const [pendingUsers, setPendingUsers] = useState([])
  const [courses, setCourses] = useState([])
  const [products, setProducts] = useState([])
  const [orgDetails, setOrgDetails] = useState({})
  const [expanded, setExpanded] = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [pendingLoading, setPendingLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState({})
  const [error, setError] = useState('')
  const [jobsMap, setJobsMap] = useState({})
  const [allJobs, setAllJobs] = useState([])
  const [allEvents, setAllEvents] = useState([])
  const [allCampaigns, setAllCampaigns] = useState([])
  const [allNeeds, setAllNeeds] = useState([])
  const [allSupport, setAllSupport] = useState([])
  const [allDonations, setAllDonations] = useState([])
  const [allPayoutRequests, setAllPayoutRequests] = useState([])
  const [allNGOs, setAllNGOs] = useState([])
  const [allStartups, setAllStartups] = useState([])
  const [payoutSourceFilter, setPayoutSourceFilter] = useState('ALL')
  const [resourceLoading, setResourceLoading] = useState({})
  
  // Detail modal states
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedNGO, setSelectedNGO] = useState(null)
  const [selectedStartup, setSelectedStartup] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    if (user?.role === 'NGO_ADMIN') navigate('/ngo/profile', { replace: true })
    if (user?.role === 'SPECIAL_ABLED_PERSON') navigate('/special', { replace: true })
    if (user?.role === 'GUARDIAN_CAREGIVER') navigate('/guardian', { replace: true })
  }, [navigate, user])

  useEffect(() => {
    const tabParam = new URLSearchParams(location.search).get('tab')
    if (tabParam) {
      setTab(tabParam)
    }
  }, [location.search])

  const handleLogout = () => { logout(); navigate('/') }

  const roleInfo = ROLE_MAP[user?.role] || { label: user?.role, icon: 'user', color: '#64748b' }

  const visibleCards = CARDS.filter(c => !c.role || c.role === user?.role)

  const sidebarSections = user?.role === 'USER'
    ? GENERAL_USER_NAV_GROUP
    : NAV_GROUPS
    .map((group) => {
      if (group.role && group.role !== user?.role) return null
      const visibleItems = group.items.filter((item) => !item.role || item.role === user?.role)
      if (visibleItems.length === 0) return null
      return { label: group.label, items: visibleItems }
    })
    .filter(Boolean)

  const handleNavClick = (item) => {
    setActiveNav(item.id)
    setMobileMenuOpen(false)
    // If the item has a tabId, switch to that tab instead of navigating
    if (item.tabId) {
      setTab(item.tabId)
      navigate(`/dashboard?tab=${encodeURIComponent(item.tabId)}`)
      return
    }
    if (item.path) navigate(item.path)
  }

  // Super Admin fetch functions
  const fetchStats = async () => {
    try {
      setStatsLoading(true)
      const res = await api.get('/admin/stats')
      setStats(res)
    } catch (e) {
      setError('Failed to load statistics')
      console.error(e)
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      // backend exposes a consolidated courses list under /api/schools/courses/all
      const res = await api.get('/schools/courses/all')
      setCourses(Array.isArray(res) ? res.slice(0, 5) : (res?.content || []).slice(0,5))
    } catch (e) {
      console.error(e)
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products')
      setProducts(Array.isArray(res) ? res.slice(0, 5) : (res?.content || []).slice(0,5))
    } catch (e) {
      console.error(e)
    }
  }

  const fetchPendingUsers = async () => {
    try {
      setPendingLoading(true)
      const res = await api.get('/admin/pending')
      const users = Array.isArray(res) ? res : (res?.content || [])
      setPendingUsers(users)
      const details = {}
      for (const user of users) {
        details[user.email] = await fetchOrgByEmail(user.email, user.role)
      }
      setOrgDetails(details)
    } catch (e) {
      setError('Failed to load pending approvals')
      console.error(e)
    } finally {
      setPendingLoading(false)
    }
  }

  const handleAction = async (userId, action) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: action }))
      await api.post(`/admin/${action}/${userId}`)
      setPendingUsers(prev => prev.filter(u => u.id !== userId))
      setExpanded(null)
    } catch (e) {
      setError(`Failed to ${action} account`)
      console.error(e)
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: null }))
    }
  }

  const fetchAllJobs = async () => {
    setResourceLoading(prev => ({ ...prev, jobs: true }))
    try {
      const data = await api.get('/ngos/jobs/all')
      setAllJobs(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load all jobs:', err)
    } finally {
      setResourceLoading(prev => ({ ...prev, jobs: false }))
    }
  }

  const fetchAllEvents = async () => {
    setResourceLoading(prev => ({ ...prev, events: true }))
    try {
      const data = await api.get('/events/public')
      setAllEvents(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load all events:', err)
    } finally {
      setResourceLoading(prev => ({ ...prev, events: false }))
    }
  }

  const fetchAllNeeds = async () => {
    setResourceLoading(prev => ({ ...prev, needs: true }))
    try {
      const data = await api.get('/ngos/volunteer-needs')
      setAllNeeds(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load all needs:', err)
    } finally {
      setResourceLoading(prev => ({ ...prev, needs: false }))
    }
  }

  const fetchAllDonations = async () => {
    setResourceLoading(prev => ({ ...prev, donations: true }))
    try {
      const data = await api.get('/donations')
      setAllDonations(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load all donations:', err)
    } finally {
      setResourceLoading(prev => ({ ...prev, donations: false }))
    }
  }

  const fetchAllPayoutRequests = async () => {
    setResourceLoading(prev => ({ ...prev, payouts: true }))
    try {
      const data = await api.get('/ngos/payout-requests/all')
      setAllPayoutRequests(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load payout requests:', err)
      setError('Failed to load payout requests')
    } finally {
      setResourceLoading(prev => ({ ...prev, payouts: false }))
    }
  }

  const updatePayoutRequestStatus = async (requestId, status) => {
    setActionLoading(prev => ({ ...prev, [`payout-${requestId}`]: status }))
    try {
      await api.patch(`/ngos/payout-requests/${requestId}/status`, { status })
      await fetchAllPayoutRequests()
    } catch (err) {
      console.error('Failed to update payout request:', err)
      setError(err.message || 'Failed to update payout request')
    } finally {
      setActionLoading(prev => ({ ...prev, [`payout-${requestId}`]: null }))
    }
  }

  const fetchAllNGOs = async () => {
    setResourceLoading(prev => ({ ...prev, ngos: true }))
    try {
      const data = await api.get('/ngos')
      setAllNGOs(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load all NGOs:', err)
    } finally {
      setResourceLoading(prev => ({ ...prev, ngos: false }))
    }
  }

  const fetchAllStartups = async () => {
    setResourceLoading(prev => ({ ...prev, startups: true }))
    try {
      const data = await api.get('/startups')
      setAllStartups(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load all startups:', err)
    } finally {
      setResourceLoading(prev => ({ ...prev, startups: false }))
    }
  }

  const fetchNGODetails = async (ngoId) => {
    setDetailLoading(true)
    try {
      const data = await api.get(`/ngos/${ngoId}`)
      setSelectedNGO(data)
      setShowDetailModal(true)
    } catch (err) {
      console.error('Failed to load NGO details:', err)
      alert('Failed to load full details')
    } finally {
      setDetailLoading(false)
    }
  }

  const fetchStartupDetails = async (startupId) => {
    setDetailLoading(true)
    try {
      const data = await api.get(`/startups/${startupId}`)
      setSelectedStartup(data)
      setShowDetailModal(true)
    } catch (err) {
      console.error('Failed to load Startup details:', err)
      alert('Failed to load full details')
    } finally {
      setDetailLoading(false)
    }
  }

  const updateNGOStatus = async (ngoId, newStatus) => {
    setUpdatingStatus(true)
    try {
      // Backend only has /verify endpoint which sets verified to true
      if (newStatus === 'VERIFIED') {
        await api.patch(`/ngos/${ngoId}/verify`)
        setAllNGOs(allNGOs.map(ngo => ngo.id === ngoId ? { ...ngo, verified: true } : ngo))
        if (selectedNGO?.id === ngoId) {
          setSelectedNGO({ ...selectedNGO, verified: true })
        }
      }
      alert('Status updated successfully!')
    } catch (err) {
      console.error('Failed to update NGO status:', err)
      alert('Failed to update status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const updateStartupStatus = async (startupId, newStatus) => {
    setUpdatingStatus(true)
    try {
      // Backend only has /verify endpoint which sets verified to true
      if (newStatus === 'VERIFIED') {
        await api.patch(`/startups/${startupId}/verify`)
        setAllStartups(allStartups.map(startup => startup.id === startupId ? { ...startup, verified: true } : startup))
        if (selectedStartup?.id === startupId) {
          setSelectedStartup({ ...selectedStartup, verified: true })
        }
      }
      alert('Status updated successfully!')
    } catch (err) {
      console.error('Failed to update Startup status:', err)
      alert('Failed to update status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  // Modify useEffect to load super admin data
  useEffect(() => {
    if (user?.role === 'NGO_ADMIN') navigate('/ngo/profile', { replace: true })
    if (user?.role === 'SPECIAL_ABLED_PERSON') navigate('/special', { replace: true })
    if (user?.role === 'GUARDIAN_CAREGIVER') navigate('/guardian', { replace: true })

    if (user?.role === 'SUPER_ADMIN') {
      fetchStats()
      fetchCourses()
      fetchProducts()
      fetchPendingUsers()
      // Load all resource data
      fetchAllJobs()
      fetchAllEvents()
      fetchAllNeeds()
      fetchAllDonations()
      fetchAllPayoutRequests()
      fetchAllNGOs()
      fetchAllStartups()
    }
  }, [navigate, user])

  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN' && tab === 'payouts' && allPayoutRequests.length === 0) {
      fetchAllPayoutRequests()
    }
  }, [tab, user?.role, allPayoutRequests.length])

  // Flatten nav items for mobile bottom bar (only relevant)
  const bottomNav = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'browse', label: 'Browse', icon: 'globe' },
    { id: 'marketplace', label: 'Market', icon: 'shop' },
    ...(user?.role === 'SCHOOL_ADMIN' ? [{ id: 'school', label: 'School', icon: 'school', path: '/school/profile' }] : []),
    ...(user?.role === 'SPECIAL_ABLED_PERSON' ? [{ id: 'special', label: 'Special', icon: 'info', path: '/special' }] : []),
    ...(user?.role === 'GUARDIAN_CAREGIVER' ? [{ id: 'guardian', label: 'Guardian', icon: 'info', path: '/guardian' }] : []),
    ...(user?.role === 'STARTUP_ADMIN' ? [{ id: 'startup', label: 'Startup', icon: 'startup', path: '/startup/profile' }] : []),
    ...(user?.role === 'SUPER_ADMIN' ? [{ id: 'approvals', label: 'Approvals', icon: 'check', path: '/admin/approvals' }] : []),
    { id: 'profile', label: 'Profile', icon: 'user', path: '/profile' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f4f6f8', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-track { background: transparent; }

        .ds-main    { flex: 1; min-width: 0; padding-bottom: 0; }

        /* ── Mobile: ≤ 767px ── */
        @media (max-width: 767px) {
          .ds-hero       { border-radius: 18px !important; margin: 12px !important; }
          .ds-content    { padding: 12px 14px 24px !important; }
          .ds-card-grid  { grid-template-columns: 1fr !important; gap: 12px !important; }
          .ds-welcome-text h1 { font-size: 22px !important; }
        }

        /* ── Tablet: 768–1023px ── */
        @media (min-width: 768px) and (max-width: 1023px) {
          .ds-card-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }

        /* ── Large: ≥ 1024px ── */
        @media (min-width: 1024px) {
          .ds-card-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn .3s ease forwards; }
      `}</style>

      <SidebarNav
        badgeText={user?.role === 'USER' ? 'Community Marketplace' : roleInfo.label}
        sections={sidebarSections}
        footerEmail={user?.email}
        onBrandClick={() => navigate('/')}
        onLogout={handleLogout}
        isItemActive={(item) => (user?.role === 'USER' ? activeNav === item.id : activeNav === item.id || tab === item.tabId)}
        onItemClick={(item) => handleNavClick(item)}
      />

      {/* ══════════════ MAIN CONTENT ══════════════ */}
      <main className="ds-main" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

        {/* Scrollable body */}
        <div className="ds-content" style={{ flex: 1, overflowY: 'auto', padding: '28px 28px 48px' }}>

          {user?.role === 'SUPER_ADMIN' ? (
            // SUPER ADMIN DASHBOARD
            <div>
              <div style={{ marginBottom: '28px' }}>
                <p style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.05em', marginBottom: '8px', color: SUPER_ADMIN_TEAL, textTransform: 'uppercase' }}>Super Admin</p>
                <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', marginBottom: '8px', margin: 0 }}>Platform Dashboard</h2>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Monitor all platform activity, approvals, users, and content.</p>
              </div>

              {error && <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>{error}</div>}

              {tab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  {statsLoading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                      {[1, 2, 3, 4].map(i => <div key={i} style={{ height: '96px', background: '#e2e8f0', borderRadius: '16px' }} />)}
                    </div>
                  ) : stats && (
                    <>
                      <div>
                        <h3 style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.05em', marginBottom: '16px', color: '#64748b', textTransform: 'uppercase', margin: 0 }}>Key Metrics</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '16px' }}>
                          <StatCard label="Total Users" value={stats.totalUsers || 0} color="#3b82f6" />
                          <StatCard label="Active Organizations" value={stats.totalActiveOrganizations || 0} color="#8b5cf6" />
                          <StatCard label="Total Courses" value={stats.totalCourses || 0} color="#ec4899" />
                          <StatCard label="Total Products" value={stats.totalProducts || 0} color="#f59e0b" />
                          <StatCard label="NGO Subscriptions" value={stats.totalNGOSubscriptions || 0} color="#0f766e" />
                          <StatCard label="NGO Subscription Amount" value={`₹${Number(stats.totalNGOSubscriptionAmount || 0).toLocaleString('en-IN')}`} color="#14b8a6" />
                          <StatCard label="Startup Subscriptions" value={stats.totalStartupSubscriptions || 0} color="#b45309" />
                          <StatCard label="Startup Subscription Amount" value={`₹${Number(stats.totalStartupSubscriptionAmount || 0).toLocaleString('en-IN')}`} color="#f97316" />
                        </div>
                      </div>

                      <div>
                        <h3 style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.05em', marginBottom: '16px', color: '#64748b', textTransform: 'uppercase', margin: 0 }}>User Distribution</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginTop: '16px' }}>
                          <RoleSummaryCard role="SCHOOL_ADMIN" count={stats.totalSchools || 0} color={roleColors.SCHOOL_ADMIN} />
                          <RoleSummaryCard role="NGO_ADMIN" count={stats.totalNGOs || 0} color={roleColors.NGO_ADMIN} />
                          <RoleSummaryCard role="STARTUP_ADMIN" count={stats.totalStartups || 0} color={roleColors.STARTUP_ADMIN} />
                          <RoleSummaryCard role="VOLUNTEER" count={stats.totalVolunteers || 0} color={roleColors.VOLUNTEER} />
                          <RoleSummaryCard role="SPECIAL_ABLED_PERSON" count={stats.totalSpecialAbled || 0} color={roleColors.SPECIAL_ABLED_PERSON} />
                          <RoleSummaryCard role="GUARDIAN_CAREGIVER" count={stats.totalGuardians || 0} color={roleColors.GUARDIAN_CAREGIVER} />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {tab === 'approvals' && (
                <div>
                  {pendingLoading ? (
                    <div>Loading...</div>
                  ) : pendingUsers.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '64px 32px', textAlign: 'center' }}>
                      <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>No pending approvals</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {pendingUsers.map((item) => (
                        <div key={item.id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div>
                              <p style={{ margin: 0, fontWeight: 'bold', color: '#0f172a' }}>{item.name}</p>
                              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>{item.email}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => handleAction(item.id, 'reject')}
                                style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fff', color: '#ef4444', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => handleAction(item.id, 'approve')}
                                style={{ padding: '6px 16px', borderRadius: '8px', background: '#5BCB2B', color: '#fff', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                              >
                                Approve
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === 'courses' && (
                <div>
                  {courses.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '48px 32px', textAlign: 'center' }}>
                      <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>No courses available</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                      {courses.map(course => (
                        <div key={course.id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
                          <h4 style={{ margin: '0 0 8px', fontWeight: 'bold', color: '#0f172a', fontSize: '14px' }}>{course.name}</h4>
                          <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#64748b' }}>{course.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === 'products' && (
                <div>
                  {products.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '48px 32px', textAlign: 'center' }}>
                      <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>No products available</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                      {products.map(product => (
                        <div key={product.id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                          {product.imageUrl && <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '128px', objectFit: 'cover' }} />}
                          <div style={{ padding: '16px' }}>
                            <h4 style={{ margin: '0 0 4px', fontWeight: 'bold', color: '#0f172a', fontSize: '14px' }}>{product.name}</h4>
                            <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#64748b' }}>{product.description}</p>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>₹{product.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === 'jobs' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', margin: 0, textTransform: 'uppercase' }}>All Jobs</h3>
                    <button onClick={fetchAllJobs} style={{ fontSize: '12px', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', color: SUPER_ADMIN_TEAL }}>Refresh</button>
                  </div>
                  {resourceLoading.jobs ? <p>Loading jobs...</p> : allJobs.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '48px 32px', textAlign: 'center' }}>
                      <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>No jobs available</p>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                        <thead><tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}><th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600 }}>Title</th><th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600 }}>Location</th><th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600 }}>Type</th><th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600 }}>Salary</th></tr></thead>
                        <tbody>{allJobs.map(job => <tr key={job.id} style={{ borderBottom: '1px solid #e2e8f0' }}><td style={{ padding: '12px 16px' }}>{job.title}</td><td style={{ padding: '12px 16px' }}>{job.location}</td><td style={{ padding: '12px 16px' }}>{job.employmentType}</td><td style={{ padding: '12px 16px' }}>₹{job.salaryRange || '—'}</td></tr>)}</tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {tab === 'events' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', margin: 0, textTransform: 'uppercase' }}>All Events</h3>
                    <button onClick={fetchAllEvents} style={{ fontSize: '12px', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', color: SUPER_ADMIN_TEAL }}>Refresh</button>
                  </div>
                  {resourceLoading.events ? <p>Loading events...</p> : allEvents.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '48px 32px', textAlign: 'center' }}>
                      <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>No events available</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                      {allEvents.map(event => (
                        <div key={event.id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px' }}>
                          <h4 style={{ margin: '0 0 4px', fontWeight: 'bold', color: '#0f172a', fontSize: '13px' }}>{event.title || event.name}</h4>
                          <p style={{ margin: '0 0 8px', fontSize: '11px', color: '#64748b' }}>{event.eventDate || event.date}</p>
                          <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>{event.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === 'campaigns' && (
                <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '48px 32px', textAlign: 'center' }}>
                  <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Campaigns are managed at the organization level. View individual NGOs to see their campaigns.</p>
                </div>
              )}

              {tab === 'needs' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', margin: 0, textTransform: 'uppercase' }}>All Requirements</h3>
                    <button onClick={fetchAllNeeds} style={{ fontSize: '12px', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', color: SUPER_ADMIN_TEAL }}>Refresh</button>
                  </div>
                  {resourceLoading.needs ? <p>Loading needs...</p> : allNeeds.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '48px 32px', textAlign: 'center' }}>
                      <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>No needs posted</p>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                        <thead><tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}><th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600 }}>Title</th><th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600 }}>Category</th><th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600 }}>Status</th><th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600 }}>Urgent</th></tr></thead>
                        <tbody>{allNeeds.map(need => <tr key={need.id} style={{ borderBottom: '1px solid #e2e8f0' }}><td style={{ padding: '12px 16px' }}>{need.title}</td><td style={{ padding: '12px 16px' }}>{need.category}</td><td style={{ padding: '12px 16px' }}>{need.status}</td><td style={{ padding: '12px 16px' }}>{need.isUrgent ? 'Yes' : 'No'}</td></tr>)}</tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {tab === 'support' && (
                <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '48px 32px', textAlign: 'center' }}>
                  <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Support requests are managed at the organization level. View individual NGOs to see their support tickets.</p>
                </div>
              )}

              {tab === 'donations' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', margin: 0, textTransform: 'uppercase' }}>All Donations</h3>
                    <button onClick={fetchAllDonations} style={{ fontSize: '12px', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', color: SUPER_ADMIN_TEAL }}>Refresh</button>
                  </div>
                  {resourceLoading.donations ? <p>Loading donations...</p> : allDonations.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '48px 32px', textAlign: 'center' }}>
                      <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>No donations yet</p>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                        <thead><tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}><th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600 }}>Amount</th><th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600 }}>Donor</th><th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600 }}>Status</th><th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600 }}>Date</th></tr></thead>
                        <tbody>{allDonations.map(donation => <tr key={donation.id} style={{ borderBottom: '1px solid #e2e8f0' }}><td style={{ padding: '12px 16px', fontWeight: 'bold' }}>₹{donation.amount}</td><td style={{ padding: '12px 16px' }}>{donation.donorName || 'Anonymous'}</td><td style={{ padding: '12px 16px' }}>{donation.status}</td><td style={{ padding: '12px 16px', fontSize: '11px' }}>{donation.createdAt?.split('T')[0]}</td></tr>)}</tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {tab === 'payouts' && (() => {
                const PSTATUS = {
                  PENDING:   { bg: '#fef9c3', color: '#854d0e', dot: '#f59e0b', label: 'Pending'   },
                  SENT:      { bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6', label: 'Sent'       },
                  SETTLED:   { bg: '#dcfce7', color: '#166534', dot: '#22c55e', label: 'Settled'   },
                  CANCELLED: { bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444', label: 'Cancelled' },
                  DECLINED:  { bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444', label: 'Declined'  },
                }
                const pst = (s) => PSTATUS[String(s || 'PENDING').toUpperCase()] || PSTATUS.PENDING
                const pmoney = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`
                const pfmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

                const sourceLabel = (request) => {
                  if (request?.startupId) return `Startup #${request.startupId}`
                  if (request?.ngoId) return `NGO #${request.ngoId}`
                  return 'Unknown source'
                }

                const filteredPayoutRequests = allPayoutRequests.filter((request) => {
                  if (payoutSourceFilter === 'ALL') return true
                  if (payoutSourceFilter === 'NGO') return Boolean(request.ngoId) && !request.startupId
                  if (payoutSourceFilter === 'STARTUP') return Boolean(request.startupId)
                  return true
                })

                // compute counts
                const statusKeys = ['PENDING', 'SENT', 'SETTLED', 'CANCELLED', 'DECLINED']
                const pCounts = statusKeys.reduce((a, s) => {
                  a[s] = filteredPayoutRequests.filter(r => String(r.status || 'PENDING').toUpperCase() === s).length; return a
                }, {})
                const pTotals = filteredPayoutRequests.reduce((a, r) => {
                  const s = String(r.status || 'PENDING').toUpperCase()
                  const amt = Number(r.amount || 0)
                  if (s === 'PENDING')  a.pending  += amt
                  if (s === 'SENT')     a.sent     += amt
                  if (s === 'SETTLED')  a.settled  += amt
                  return a
                }, { pending: 0, sent: 0, settled: 0 })

                const sourceCounts = {
                  ALL: allPayoutRequests.length,
                  NGO: allPayoutRequests.filter(r => Boolean(r.ngoId) && !r.startupId).length,
                  STARTUP: allPayoutRequests.filter(r => Boolean(r.startupId)).length,
                }

                return (
                  <div style={{ fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', gap: 18 }}>

                    {/* header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#0f172a' }}>Payout Requests</h3>
                        <p style={{ margin: '3px 0 0', fontSize: 12, color: '#64748b' }}>
                          {filteredPayoutRequests.length} total request{filteredPayoutRequests.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <button
                        onClick={fetchAllPayoutRequests}
                        style={{
                          padding: '8px 16px', borderRadius: 10, border: `1.5px solid ${SUPER_ADMIN_TEAL}`,
                          background: '#fff', color: SUPER_ADMIN_TEAL, fontWeight: 700, fontSize: 12,
                          cursor: 'pointer', transition: 'all .15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = SUPER_ADMIN_TEAL; e.currentTarget.style.color = '#fff' }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = SUPER_ADMIN_TEAL }}
                      >
                        Refresh
                      </button>
                    </div>

                    {/* source tabs */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {[
                        { id: 'ALL', label: 'All Requests' },
                        { id: 'NGO', label: 'NGO Requests' },
                        { id: 'STARTUP', label: 'Startup Requests' },
                      ].map(source => {
                        const active = payoutSourceFilter === source.id
                        return (
                          <button
                            key={source.id}
                            onClick={() => setPayoutSourceFilter(source.id)}
                            style={{
                              padding: '6px 13px', borderRadius: 20,
                              border: `1.5px solid ${active ? SUPER_ADMIN_TEAL : '#e2e8f0'}`,
                              background: active ? `${SUPER_ADMIN_TEAL}15` : '#fff',
                              color: active ? SUPER_ADMIN_TEAL : '#64748b',
                              fontWeight: active ? 700 : 500, fontSize: 12, cursor: 'pointer',
                              display: 'inline-flex', alignItems: 'center', gap: 5, transition: 'all .15s',
                            }}
                          >
                            {source.label}
                            <span style={{
                              fontSize: 10, fontWeight: 800, borderRadius: 10, padding: '1px 5px',
                              background: active ? SUPER_ADMIN_TEAL : '#f1f5f9',
                              color: active ? '#fff' : '#64748b',
                            }}>{sourceCounts[source.id]}</span>
                          </button>
                        )
                      })}
                    </div>

                    {/* stat chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                      {[
                        { label: 'Pending',  value: pmoney(pTotals.pending), sub: `${pCounts.PENDING || 0} requests`, accent: '#f59e0b' },
                        { label: 'Sent',     value: pmoney(pTotals.sent),    sub: `${pCounts.SENT || 0} requests`,    accent: '#3b82f6' },
                        { label: 'Settled',  value: pmoney(pTotals.settled), sub: `${pCounts.SETTLED || 0} settled`,  accent: '#22c55e' },
                      ].map(chip => (
                        <div key={chip.label} style={{
                          flex: '1 1 130px', minWidth: 120,
                          background: '#fff', border: `1.5px solid ${chip.accent}30`,
                          borderRadius: 14, padding: '13px 16px',
                          boxShadow: `0 2px 8px ${chip.accent}10`,
                        }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: chip.accent, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{chip.label}</div>
                          <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>{chip.value}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{chip.sub}</div>
                        </div>
                      ))}
                    </div>

                    {/* loading */}
                    {resourceLoading.payouts && (
                      <div style={{ textAlign: 'center', padding: '32px 0', color: '#64748b', fontSize: 13 }}>Loading payout requests…</div>
                    )}

                    {/* filter tabs */}
                    {!resourceLoading.payouts && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {['ALL', ...statusKeys].map(s => {
                          const cnt = s === 'ALL' ? allPayoutRequests.length : (pCounts[s] || 0)
                          const active = (window.__payoutFilterState?.[0] || 'ALL') === s
                          return (
                            <button key={s} onClick={() => {
                              if (!window.__payoutFilterState) window.__payoutFilterState = ['ALL', () => {}]
                              window.__payoutFilterState[0] = s
                              // force re-render by toggling a state
                              fetchAllPayoutRequests()
                            }} style={{
                              padding: '6px 13px', borderRadius: 20,
                              border: `1.5px solid ${active ? SUPER_ADMIN_TEAL : '#e2e8f0'}`,
                              background: active ? `${SUPER_ADMIN_TEAL}15` : '#fff',
                              color: active ? SUPER_ADMIN_TEAL : '#64748b',
                              fontWeight: active ? 700 : 500, fontSize: 12, cursor: 'pointer',
                              display: 'inline-flex', alignItems: 'center', gap: 5, transition: 'all .15s',
                            }}>
                              {s === 'ALL' ? 'All' : s[0] + s.slice(1).toLowerCase()}
                              <span style={{
                                fontSize: 10, fontWeight: 800, borderRadius: 10, padding: '1px 5px',
                                background: active ? SUPER_ADMIN_TEAL : '#f1f5f9',
                                color: active ? '#fff' : '#64748b',
                              }}>{cnt}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* empty state */}
                    {!resourceLoading.payouts && filteredPayoutRequests.length === 0 && (
                      <div style={{
                        textAlign: 'center', padding: '48px 24px',
                        border: '1.5px dashed #e2e8f0', borderRadius: 14, background: '#fafbfc',
                      }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#334155' }}>No payout requests yet</p>
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>
                          {payoutSourceFilter === 'STARTUP'
                            ? 'Startup payout requests will appear here once submitted.'
                            : payoutSourceFilter === 'NGO'
                            ? 'NGO payout requests will appear here once submitted.'
                            : 'Payout requests will appear here once submitted.'}
                        </p>
                      </div>
                    )}

                    {/* request cards */}
                    {!resourceLoading.payouts && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {filteredPayoutRequests.map(request => {
                          const s = pst(request.status)
                          const status = String(request.status || 'PENDING').toUpperCase()
                          const source = sourceLabel(request)
                          return (
                            <div key={request.id} style={{
                              background: '#fff', border: '1.5px solid #e9ecef',
                              borderRadius: 14, padding: '16px 18px', transition: 'border-color .15s, box-shadow .15s',
                            }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = `${SUPER_ADMIN_TEAL}50`; e.currentTarget.style.boxShadow = `0 2px 12px ${SUPER_ADMIN_TEAL}10` }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e9ecef'; e.currentTarget.style.boxShadow = 'none' }}
                            >
                              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                                {/* left info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                                    <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                                      {request.reference || `PR-${request.id}`}
                                    </span>
                                    <span style={{
                                      fontSize: 10, fontWeight: 700, borderRadius: 20, padding: '2px 9px',
                                      background: s.bg, color: s.color,
                                      display: 'inline-flex', alignItems: 'center', gap: 4,
                                    }}>
                                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
                                      {s.label}
                                    </span>
                                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{source}</span>
                                  </div>
                                  <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>{pmoney(request.amount)}</div>
                                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{pfmtDate(request.createdAt)}</div>
                                  {(request.notes || request.note) && (
                                    <div style={{ marginTop: 6, fontSize: 12, color: '#64748b', background: '#f8fafc', borderRadius: 8, padding: '5px 10px' }}>
                                      {request.notes || request.note}
                                    </div>
                                  )}
                                </div>
                                {/* action buttons */}
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                                  {status === 'PENDING' && (
                                    <button onClick={() => updatePayoutRequestStatus(request.id, 'SENT')} style={{
                                      fontSize: 11, fontWeight: 700, borderRadius: 20, cursor: 'pointer',
                                      padding: '5px 12px', border: 'none',
                                      background: SUPER_ADMIN_TEAL, color: '#fff', whiteSpace: 'nowrap',
                                    }}>Mark Sent</button>
                                  )}
                                  {status === 'SENT' && (
                                    <button onClick={() => updatePayoutRequestStatus(request.id, 'SETTLED')} style={{
                                      fontSize: 11, fontWeight: 700, borderRadius: 20, cursor: 'pointer',
                                      padding: '5px 12px', border: 'none',
                                      background: '#22c55e', color: '#fff', whiteSpace: 'nowrap',
                                    }}>Mark Settled</button>
                                  )}
                                  {status !== 'SETTLED' && status !== 'CANCELLED' && status !== 'DECLINED' && (
                                    <button onClick={() => updatePayoutRequestStatus(request.id, 'DECLINED')} style={{
                                      fontSize: 11, fontWeight: 700, borderRadius: 20, cursor: 'pointer',
                                      padding: '5px 12px', border: '1.5px solid #ef4444',
                                      background: 'transparent', color: '#ef4444', whiteSpace: 'nowrap',
                                    }}>Decline</button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })()}

              {tab === 'ngos' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', margin: 0, textTransform: 'uppercase' }}>All NGOs</h3>
                    <button onClick={fetchAllNGOs} style={{ fontSize: '12px', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', color: SUPER_ADMIN_TEAL }}>Refresh</button>
                  </div>
                  {resourceLoading.ngos ? <p>Loading NGOs...</p> : allNGOs.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '48px 32px', textAlign: 'center' }}>
                      <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>No NGOs registered</p>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                        <thead><tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}><th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600 }}>Name</th><th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600 }}>Email</th><th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600 }}>City</th><th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600 }}>Status</th><th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600 }}>Action</th></tr></thead>
                        <tbody>{allNGOs.map(org => <tr key={org.id} style={{ borderBottom: '1px solid #e2e8f0', cursor: 'pointer', hover: '#f8fafc' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}><td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{org.name}</td><td style={{ padding: '12px 16px', fontSize: '11px' }}>{org.email}</td><td style={{ padding: '12px 16px' }}>{org.city}</td><td style={{ padding: '12px 16px' }}><span style={{ background: org.verified ? '#d1fae5' : '#fef3c7', color: org.verified ? '#065f46' : '#92400e', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>{org.verified ? 'Verified' : 'Pending'}</span></td><td style={{ padding: '12px 16px' }}><button onClick={() => fetchNGODetails(org.id)} style={{ background: SUPER_ADMIN_TEAL, color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}>View Details</button></td></tr>)}</tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {tab === 'startups' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', margin: 0, textTransform: 'uppercase' }}>All Startups</h3>
                    <button onClick={fetchAllStartups} style={{ fontSize: '12px', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', color: SUPER_ADMIN_TEAL }}>Refresh</button>
                  </div>
                  {resourceLoading.startups ? <p>Loading startups...</p> : allStartups.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '48px 32px', textAlign: 'center' }}>
                      <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>No startups registered</p>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                        <thead><tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}><th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600 }}>Name</th><th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600 }}>Email</th><th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600 }}>Industry</th><th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600 }}>Status</th><th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600 }}>Action</th></tr></thead>
                        <tbody>{allStartups.map(org => <tr key={org.id} style={{ borderBottom: '1px solid #e2e8f0', cursor: 'pointer', hover: '#f8fafc' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}><td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{org.name}</td><td style={{ padding: '12px 16px', fontSize: '11px' }}>{org.email}</td><td style={{ padding: '12px 16px' }}>{org.industry}</td><td style={{ padding: '12px 16px' }}><span style={{ background: org.verified ? '#d1fae5' : '#fef3c7', color: org.verified ? '#065f46' : '#92400e', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>{org.verified ? 'Verified' : 'Pending'}</span></td><td style={{ padding: '12px 16px' }}><button onClick={() => fetchStartupDetails(org.id)} style={{ background: SUPER_ADMIN_TEAL, color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}>View Details</button></td></tr>)}</tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Detail Modal for NGO/Startup */}
              {showDetailModal && (selectedNGO || selectedStartup) && (
                <div style={{
                  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                  background: 'rgba(0,0,0,0.5)', zIndex: 50,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} onClick={() => { setShowDetailModal(false); setSelectedNGO(null); setSelectedStartup(null) }}>
                  <div style={{
                    background: '#fff', borderRadius: '12px', maxWidth: '600px',
                    maxHeight: '80vh', overflowY: 'auto', padding: '32px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                  }} onClick={(e) => e.stopPropagation()}>
                    {detailLoading ? (
                      <p style={{ textAlign: 'center', color: '#64748b' }}>Loading details...</p>
                    ) : selectedNGO ? (
                      <div>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', marginTop: 0, marginBottom: '20px' }}>{selectedNGO.name}</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px', fontSize: '13px' }}>
                          <div><p style={{ color: '#64748b', margin: '0 0 4px' }}>Email</p><p style={{ fontWeight: 600, margin: 0, color: '#0f172a' }}>{selectedNGO.email}</p></div>
                          <div><p style={{ color: '#64748b', margin: '0 0 4px' }}>Phone</p><p style={{ fontWeight: 600, margin: 0, color: '#0f172a' }}>{selectedNGO.phone || 'N/A'}</p></div>
                          <div><p style={{ color: '#64748b', margin: '0 0 4px' }}>City</p><p style={{ fontWeight: 600, margin: 0, color: '#0f172a' }}>{selectedNGO.city}</p></div>
                          <div><p style={{ color: '#64748b', margin: '0 0 4px' }}>State</p><p style={{ fontWeight: 600, margin: 0, color: '#0f172a' }}>{selectedNGO.state}</p></div>
                          <div><p style={{ color: '#64748b', margin: '0 0 4px' }}>Registration Number</p><p style={{ fontWeight: 600, margin: 0, color: '#0f172a' }}>{selectedNGO.registrationNumber}</p></div>
                          <div><p style={{ color: '#64748b', margin: '0 0 4px' }}>Founded Year</p><p style={{ fontWeight: 600, margin: 0, color: '#0f172a' }}>{selectedNGO.foundedYear}</p></div>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                          <p style={{ color: '#64748b', margin: '0 0 4px', fontSize: '13px' }}>Description</p>
                          <p style={{ fontWeight: 500, margin: 0, color: '#0f172a', fontSize: '13px', lineHeight: 1.6 }}>{selectedNGO.description}</p>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                          <label style={{ display: 'block', color: '#64748b', fontSize: '13px', marginBottom: '8px', fontWeight: 600 }}>Status</label>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 500 }}>
                              {selectedNGO.verified ? '✓ Verified' : '○ Pending'}
                            </span>
                            {!selectedNGO.verified && (
                              <button
                                onClick={() => updateNGOStatus(selectedNGO.id, 'VERIFIED')}
                                disabled={updatingStatus}
                                style={{
                                  padding: '6px 12px', background: '#10b981',
                                  color: '#fff', border: 'none', borderRadius: '4px',
                                  cursor: updatingStatus ? 'not-allowed' : 'pointer',
                                  fontSize: '12px', fontWeight: 600, opacity: updatingStatus ? 0.6 : 1
                                }}
                              >
                                {updatingStatus ? 'Updating...' : 'Verify'}
                              </button>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => { setShowDetailModal(false); setSelectedNGO(null) }}
                          style={{
                            width: '100%', padding: '12px', background: SUPER_ADMIN_TEAL,
                            color: '#fff', border: 'none', borderRadius: '6px',
                            fontSize: '13px', fontWeight: 600, cursor: 'pointer'
                          }}
                        >
                          Close
                        </button>
                      </div>
                    ) : selectedStartup ? (
                      <div>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', marginTop: 0, marginBottom: '20px' }}>{selectedStartup.name}</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px', fontSize: '13px' }}>
                          <div><p style={{ color: '#64748b', margin: '0 0 4px' }}>Email</p><p style={{ fontWeight: 600, margin: 0, color: '#0f172a' }}>{selectedStartup.email}</p></div>
                          <div><p style={{ color: '#64748b', margin: '0 0 4px' }}>Phone</p><p style={{ fontWeight: 600, margin: 0, color: '#0f172a' }}>{selectedStartup.phone || 'N/A'}</p></div>
                          <div><p style={{ color: '#64748b', margin: '0 0 4px' }}>Industry</p><p style={{ fontWeight: 600, margin: 0, color: '#0f172a' }}>{selectedStartup.industry}</p></div>
                          <div><p style={{ color: '#64748b', margin: '0 0 4px' }}>Founded Year</p><p style={{ fontWeight: 600, margin: 0, color: '#0f172a' }}>{selectedStartup.foundedYear}</p></div>
                          <div><p style={{ color: '#64748b', margin: '0 0 4px' }}>Location</p><p style={{ fontWeight: 600, margin: 0, color: '#0f172a' }}>{selectedStartup.location}</p></div>
                          <div><p style={{ color: '#64748b', margin: '0 0 4px' }}>Website</p><p style={{ fontWeight: 600, margin: 0, color: '#0f172a' }}>{selectedStartup.website || 'N/A'}</p></div>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                          <p style={{ color: '#64748b', margin: '0 0 4px', fontSize: '13px' }}>Description</p>
                          <p style={{ fontWeight: 500, margin: 0, color: '#0f172a', fontSize: '13px', lineHeight: 1.6 }}>{selectedStartup.description}</p>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                          <label style={{ display: 'block', color: '#64748b', fontSize: '13px', marginBottom: '8px', fontWeight: 600 }}>Status</label>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 500 }}>
                              {selectedStartup.verified ? '✓ Verified' : '○ Pending'}
                            </span>
                            {!selectedStartup.verified && (
                              <button
                                onClick={() => updateStartupStatus(selectedStartup.id, 'VERIFIED')}
                                disabled={updatingStatus}
                                style={{
                                  padding: '6px 12px', background: '#10b981',
                                  color: '#fff', border: 'none', borderRadius: '4px',
                                  cursor: updatingStatus ? 'not-allowed' : 'pointer',
                                  fontSize: '12px', fontWeight: 600, opacity: updatingStatus ? 0.6 : 1
                                }}
                              >
                                {updatingStatus ? 'Updating...' : 'Verify'}
                              </button>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => { setShowDetailModal(false); setSelectedStartup(null) }}
                          style={{
                            width: '100%', padding: '12px', background: SUPER_ADMIN_TEAL,
                            color: '#fff', border: 'none', borderRadius: '6px',
                            fontSize: '13px', fontWeight: 600, cursor: 'pointer'
                          }}
                        >
                          Close
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // REGULAR USER DASHBOARD
            <div>

          {/* ── Hero welcome banner ── */}
          <div className="ds-hero fade-in" style={{
            background: `linear-gradient(135deg, ${TEAL} 0%, #0f766e 60%, #134e4a 100%)`,
            borderRadius: 20,
            padding: '28px 28px',
            marginBottom: 28,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: `0 4px 20px ${TEAL}40`,
          }}>
            {/* decorative blobs */}
            <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,.06)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -20, right: 80, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,.04)', pointerEvents: 'none' }} />

            <div className="ds-welcome-text" style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: 'rgba(255,255,255,.15)', marginBottom: 12 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: G, display: 'inline-block' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.9)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{roleInfo.label} Portal</span>
              </div>
              <h1 style={{ margin: '0 0 6px', fontSize: 30, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                Welcome back!
              </h1>
              <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,.65)', fontWeight: 500 }}>
                {user?.email}
              </p>
            </div>

            {/* Role CTA button */}
            {user?.role === 'SCHOOL_ADMIN' && <HeroCta label="Go to School Dashboard" onClick={() => navigate('/school/profile')} />}
            {user?.role === 'USER' && <HeroCta label="Update Address" onClick={() => navigate('/profile')} />}
            {user?.role === 'SPECIAL_ABLED_PERSON' && <HeroCta label="Open Specially Abled Workspace" onClick={() => navigate('/special')} />}
            {user?.role === 'GUARDIAN_CAREGIVER' && <HeroCta label="Open Guardian Workspace" onClick={() => navigate('/guardian')} />}
            {user?.role === 'STARTUP_ADMIN' && <HeroCta label="Go to Startup Dashboard" onClick={() => navigate('/startup/profile')} />}
            {user?.role === 'SUPER_ADMIN' && <HeroCta label="Review Approvals" onClick={() => { setActiveNav('approvals'); setTab('approvals'); navigate('/dashboard?tab=approvals') }} />}
          </div>

          {/* ── Quick access grid ── */}
          <div style={{ marginBottom: 10 }}>
            <p style={{ margin: '0 0 16px', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.09em', textTransform: 'uppercase' }}>
              Quick Access
            </p>
          </div>

          <div className="ds-card-grid fade-in" style={{ display: 'grid', gap: 16 }}>
            {visibleCards.map(card => (
              <QuickCard
                key={card.title}
                card={card}
                onClick={() => {
                  // If this card is the Network Approvals card, open approvals tab inside Dashboard
                  if (card.path === '/admin/approvals' && user?.role === 'SUPER_ADMIN') {
                    setActiveNav('approvals')
                    setTab('approvals')
                    navigate('/dashboard?tab=approvals')
                    setMobileMenuOpen(false)
                    return
                  }
                  if (card.path) navigate(card.path)
                }}
              />
            ))}
            {user?.role === 'USER' && (
              <QuickCard
                card={{
                  title: 'My Profile',
                  desc: 'Update your delivery address, phone number, and contact details for faster checkout.',
                  icon: 'user',
                  color: '#8b5cf6',
                  bg: '#f5f3ff',
                  path: '/profile',
                  cta: 'Edit Profile',
                }}
                onClick={() => navigate('/profile')}
              />
            )}
          </div>

          {/* ── Info / Support card ── */}
          <div className="fade-in" style={{ marginTop: 24, background: '#fff', borderRadius: 16, border: '1px solid #e9ecef', padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Ic n="info" s={22} c={G} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 700, color: NAVY }}>Need Help?</p>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                Our support team is ready to assist you with any questions or issues.
              </p>
            </div>
            <button
              style={{ padding: '9px 18px', borderRadius: 10, border: `1.5px solid ${G}`, background: '#f0fdf4', color: G, fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .15s', flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.background = G; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.color = G }}
            >
              Contact Support
            </button>
          </div>

            </div>
          )}
        </div>{/* /content */}
      </main>
    </div>
  )
}

/* ── Hero CTA button ──────────────────────────────────────────────────── */
function StatCard({ label, value, icon, color }) {
  return (
    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
        <p style={{ margin: 0, marginTop: '4px', fontSize: '28px', fontWeight: '900', color: color }}>{value}</p>
      </div>
    </div>
  )
}

function RoleSummaryCard({ role, count, color }) {
  return (
    <div style={{ background: color.bg, borderRadius: '12px', border: '1px solid ' + color.text + '20', padding: '16px', textAlign: 'center' }}>
      <p style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: color.text }}>{count}</p>
      <p style={{ margin: '4px 0 0', fontSize: '12px', fontWeight: '600', color: color.text }}>{roleLabel[role]}</p>
    </div>
  )
}

/* ── Hero CTA button ──────────────────────────────────────────────────── */
function HeroCta({ label, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        marginTop: 18, padding: '10px 20px', borderRadius: 12,
        border: 'none', background: hov ? 'rgba(255,255,255,.95)' : 'rgba(255,255,255,.85)',
        color: TEAL, fontWeight: 800, fontSize: 13, cursor: 'pointer',
        boxShadow: '0 2px 10px rgba(0,0,0,.15)',
        transition: 'all .15s',
        transform: hov ? 'translateY(-1px)' : 'translateY(0)',
        position: 'relative', zIndex: 2,
      }}
    >
      {label}
      <Ic n="arrowR" s={14} c={TEAL} sw={2.5} />
    </button>
  )
}
