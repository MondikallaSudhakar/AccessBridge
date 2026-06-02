import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import logoImg from '../assets/logo.jpeg'

const API = 'http://localhost:8081/api'

const COLORS = {
  primary: '#0197B2',
  primaryLight: '#f0f8fc',
  border: '#e0f2fe',
  text: '#1f2937',
  textLight: '#6b7280',
  textLighter: '#9ca3af',
  bg: '#ffffff',
  bgLight: '#f9fafb',
  success: '#5BCB2B',
  warning: '#f59e0b',
  danger: '#ef4444',
}

async function fetchPublic(path) {
  try {
    const res = await fetch(`${API}${path}`)
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

const Icons = {
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  ),
  Home: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-10.5Z" />
    </svg>
  ),
  Network: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="6" cy="8" r="2.5" />
      <circle cx="18" cy="8" r="2.5" />
      <circle cx="12" cy="17" r="2.5" />
      <path d="M8.2 9.2 10.7 15M15.8 9.2 13.3 15M8.5 8h7" />
    </svg>
  ),
  Marketplace: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M4 8h16l-1.3 11.2a1 1 0 0 1-1 .8H6.3a1 1 0 0 1-1-.8L4 8Z" />
      <path d="M8 8V6a4 4 0 0 1 8 0v2" />
    </svg>
  ),
  Messages: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M4 5h16v11H7l-3 3V5Z" />
    </svg>
  ),
  Bell: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M6 10a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
      <path d="M9.5 18a2.5 2.5 0 0 0 5 0" />
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  ),
  Verified: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-3.5 w-3.5">
      <path d="m5 12 4.5 4.5L19 7" />
    </svg>
  ),
  Calendar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
      <circle cx="9" cy="7" r="4" />
      <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.87" />
    </svg>
  ),
}

const PUBLIC_TABS = [
  { id: 'all', label: 'All' },
  { id: 'events', label: 'Events' },
  { id: 'stories', label: 'Stories' },
  { id: 'jobs', label: 'Jobs' },
  { id: 'requirements', label: 'Requirements' },
  { id: 'products', label: 'Products' },
]

const PUBLIC_TAB_IDS = new Set(PUBLIC_TABS.map((tab) => tab.id))

function TopNav({ user, activeTab }) {
  const navItems = user
    ? [
      { label: 'Home', href: '/', Icon: Icons.Home },
      { label: 'My Network', href: '/search', Icon: Icons.Network },
      { label: 'Marketplace', href: '/marketplace', Icon: Icons.Marketplace },
      { label: 'Messaging', href: user.role === 'USER' ? '/messages' : '/ngo/profile?tab=messages', Icon: Icons.Messages },
      { label: 'Notifications', href: '/dashboard', Icon: Icons.Bell },
    ]
    : [
      { label: 'Home', href: '/', Icon: Icons.Home },
      { label: 'Marketplace', href: '/marketplace', Icon: Icons.Marketplace },
      { label: 'Login', href: '/login', Icon: Icons.User },
    ]

  return (
    <header className="sticky top-0 z-50 border-b" style={{ borderColor: COLORS.border, backgroundColor: COLORS.bg }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 md:px-6">
        <div className="flex items-center justify-between gap-3">
          <a href="/" className="flex shrink-0 items-center gap-2">
            <img src={logoImg} alt="KnotneX" className="h-8 w-8 rounded-lg object-cover" />
            <span className="hidden text-lg font-bold tracking-tight md:inline" style={{ color: COLORS.text }}>KnotneX</span>
          </a>
        </div>

        {!user && (
          <nav className="-mx-1 hidden flex-1 justify-center gap-4 px-1 lg:flex">
            {PUBLIC_TABS.map((tab) => {
              const selected = tab.id === activeTab
              const tabHref = tab.id === 'all' ? '/' : `/?tab=${tab.id}`
              return (
                <Link
                  key={tab.id}
                  className="px-3 py-2 text-sm font-medium transition-colors"
                  to={tabHref}
                  style={{
                    color: selected ? COLORS.success : COLORS.textLight,
                    borderBottom: selected ? `2px solid ${COLORS.success}` : 'none',
                  }}
                >
                  {tab.label}
                </Link>
              )
            })}
          </nav>
        )}

        <nav className="flex items-center justify-end gap-4">
          {user ? (
            navItems.map((item) => (
              <Link key={item.label} to={item.href} className="hidden items-center gap-1.5 rounded px-3 py-2 text-sm transition-colors md:flex" style={{ color: COLORS.textLight }}>
                <span>{item.label}</span>
              </Link>
            ))
          ) : (
            <>
              <Link to="/login" className="hidden items-center px-4 py-2 text-sm font-medium rounded transition-colors md:inline-flex" style={{ color: COLORS.text }}>
                Sign In
              </Link>
              <Link to="/register" className="inline-flex items-center rounded px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: COLORS.success }}>
                Join Now
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

function RoleTabs({ activeTab, counts }) {
  const tabs = [
    { id: 'all', label: 'All', count: counts.total },
    { id: 'events', label: 'Events', count: counts.events },
    { id: 'stories', label: 'Stories', count: counts.stories },
    { id: 'jobs', label: 'Jobs', count: counts.jobs },
    { id: 'requirements', label: 'Requirements', count: counts.requirements },
    { id: 'products', label: 'Products', count: counts.products },
  ]

  return (
    <div className="mb-6 border-b" style={{ borderColor: COLORS.border }}>
      <div className="flex flex-wrap gap-6">
        {tabs.map((tab) => {
          const selected = tab.id === activeTab
          const tabHref = tab.id === 'all' ? '/' : `/?tab=${tab.id}`
          return (
            <Link
              key={tab.id}
              className="pb-3 text-sm font-medium transition-colors"
              to={tabHref}
              style={{
                color: selected ? COLORS.success : COLORS.textLight,
                borderBottom: selected ? `2px solid ${COLORS.success}` : 'none',
              }}
            >
              {tab.label} <span style={{ color: COLORS.textLighter }}>({tab.count})</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function EmptyFeed({ activeTab }) {
  return (
    <div className="rounded-lg border py-12 text-center" style={{ borderColor: COLORS.border, backgroundColor: COLORS.bgLight }}>
      <h3 className="text-lg font-semibold" style={{ color: COLORS.text }}>No {activeTab === 'all' ? 'entries' : activeTab} found</h3>
      <p className="mt-2 text-sm" style={{ color: COLORS.textLight }}>Try another tab or upgrade from viewer-only access to an active role.</p>
      <Link to="/register" className="mt-4 inline-flex rounded px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ backgroundColor: COLORS.success }}>
        Upgrade Now
      </Link>
    </div>
  )
}

function formatLocation(item) {
  const cityState = [item.city, item.state].filter(Boolean).join(', ')
  return cityState || item.address || 'Location not specified'
}

function fmtDate(dateStr) {
  if (!dateStr) return null
  try {
    const d = new Date(dateStr)
    if (isNaN(d)) return null
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch { return null }
}

function isDeadlinePassed(dateStr) {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}

/* ── Timeline dot colours by type ── */
const TYPE_DOT = {
  jobs: { dot: '#0197B2', bg: '#f0f8fc', label: 'Job' },
  requirements: { dot: '#0197B2', bg: '#f0f8fc', label: 'Requirement' },
  events: { dot: '#0197B2', bg: '#f0f8fc', label: 'Event' },
  stories: { dot: '#0197B2', bg: '#f0f8fc', label: 'Story' },
  products: { dot: '#0197B2', bg: '#f0f8fc', label: 'Product' },
}

function TimelineItem({ item, index, isLast }) {
  const typeStyle = TYPE_DOT[item.type] || TYPE_DOT.stories
  const openFmt = fmtDate(item.openDate)
  const closeFmt = fmtDate(item.closeDate)
  const expired = isDeadlinePassed(item.closeDate)

  return (
    <div className="flex gap-4 mb-6">
      {/* Left: dot + line */}
      <div className="flex flex-col items-center">
        <div className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: typeStyle.dot }} />
        {!isLast && <div className="mt-1 w-0.5 flex-1" style={{ backgroundColor: COLORS.border }} />}
      </div>

      {/* Right: card */}
      <article className="min-w-0 flex-1 rounded-lg border overflow-hidden" style={{ borderColor: COLORS.border, backgroundColor: COLORS.bg }}>
        {/* Header */}
        <div className="border-b px-5 py-3" style={{ borderColor: COLORS.border, backgroundColor: typeStyle.bg }}>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: typeStyle.dot }}>{typeStyle.label}</span>
            {(item.type === 'jobs' || item.type === 'requirements') && item.closeDate && (
              <span className="text-xs font-medium px-2 py-1 rounded" style={{
                backgroundColor: expired ? '#fee2e2' : '#dcfce7',
                color: expired ? '#dc2626' : '#16a34a',
              }}>
                {expired ? 'Closed' : 'Open'}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex justify-between gap-4 items-start mb-3">
            <div className="flex-1">
              <h3 className="text-base font-semibold" style={{ color: COLORS.text }}>{item.title}</h3>
              <p className="mt-1 text-sm" style={{ color: COLORS.textLight }}>{item.meta}</p>
            </div>
            <Link to={item.href} className="shrink-0 px-3 py-2 rounded text-sm font-medium text-white transition-opacity hover:opacity-90 whitespace-nowrap" style={{ backgroundColor: COLORS.success }}>
              {item.cta}
            </Link>
          </div>

          <p className="text-sm leading-relaxed" style={{ color: COLORS.text }}>{item.subtitle}</p>

          {/* Meta info */}
          {(openFmt || closeFmt) && (
            <div className="mt-4 pt-4 border-t flex flex-wrap gap-4" style={{ borderColor: COLORS.border }}>
              {openFmt && (
                <div className="text-xs">
                  <span style={{ color: COLORS.textLighter }}>Open Date</span>
                  <div className="font-medium" style={{ color: COLORS.text }}>{openFmt}</div>
                </div>
              )}
              {closeFmt && (
                <div className="text-xs">
                  <span style={{ color: COLORS.textLighter }}>Closes</span>
                  <div className="font-medium" style={{ color: expired ? '#dc2626' : COLORS.text }}>{closeFmt}</div>
                </div>
              )}
              {item.applied != null && (
                <div className="text-xs">
                  <span style={{ color: COLORS.textLighter }}>Applied</span>
                  <div className="font-medium" style={{ color: COLORS.text }}>{item.applied} people</div>
                </div>
              )}
            </div>
          )}
        </div>
      </article>
    </div>
  )
}

export default function Home() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [directory, setDirectory] = useState({ products: [], schools: [], ngos: [], jobs: [], requirements: [], events: [], stories: [] })

  const requestedTab = searchParams.get('tab') || 'all'
  const activeTab = PUBLIC_TAB_IDS.has(requestedTab) ? requestedTab : 'all'

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        // Fetch the last 50 recent items from the public feed
        const recentData = await fetchPublic('/public/recent')
        
        // Organize data by type
        const organized = {
          products: [],
          schools: [],
          ngos: [],
          jobs: [],
          requirements: [],
          events: [],
          stories: []
        }
        
        if (Array.isArray(recentData)) {
          recentData.forEach((item) => {
            if (item.type === 'events') {
              organized.events.push(item)
            } else if (item.type === 'jobs') {
              organized.jobs.push(item)
            } else if (item.type === 'requirements') {
              organized.requirements.push(item)
            } else if (item.type === 'products') {
              organized.products.push(item)
            } else if (item.type === 'stories') {
              organized.stories.push(item)
            }
          })
        }
        
        setDirectory(organized)
      } catch (err) {
        console.error('Failed to load recent data:', err)
        setDirectory({ products: [], schools: [], ngos: [], jobs: [], requirements: [], events: [], stories: [] })
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const allFeedItems = useMemo(() => {
    return [...directory.events, ...directory.stories, ...directory.jobs, ...directory.requirements, ...directory.products]
  }, [directory])

  const filteredFeedItems = useMemo(() => {
    let items = allFeedItems
    if (activeTab !== 'all') {
      items = items.filter((item) => item.type === activeTab)
    }
    if (query.trim()) {
      const text = query.toLowerCase()
      items = items.filter((item) => {
        return item.title.toLowerCase().includes(text) || item.subtitle.toLowerCase().includes(text) || item.meta.toLowerCase().includes(text)
      })
    }
    return items
  }, [activeTab, allFeedItems, query])

  const counts = {
    jobs: directory.jobs.length,
    requirements: directory.requirements.length,
    products: directory.products.length,
    events: directory.events.length,
    stories: directory.stories.length,
    total: directory.jobs.length + directory.requirements.length + directory.products.length + directory.events.length + directory.stories.length,
  }

  return (
    <div style={{ backgroundColor: COLORS.bgLight }}>
      <TopNav user={user} activeTab={activeTab} />

      <main className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        {activeTab === 'all' && (
          <>
            {/* Hero Section */}
            <section className="mb-16 mt-12 flex flex-col items-center text-center">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-normal text-yc-black max-w-5xl leading-tight md:leading-tight">
                KnotneX turns members into <em className="italic">formidable changemakers</em><sup className="text-2xl md:text-3xl ml-1 align-super">[1]</sup>
              </h1>
              
              <div className="mt-12 max-w-2xl px-4">
                <p className="text-lg md:text-xl font-serif text-yc-black italic leading-relaxed">
                  [1] "A formidable person is one who seems like they'll get what they want, regardless of whatever obstacles are in the way."
                </p>
                <p className="mt-4 text-sm font-serif text-yc-black text-right pr-8 md:pr-16">
                  — Paul Graham
                </p>
              </div>
              
              <div className="mt-16 mb-8 text-gray-400">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-4">
                <Link to="/register" className="inline-flex rounded-full px-8 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ backgroundColor: COLORS.success }}>
                  Join the Community
                </Link>
                <Link to="/marketplace" className="inline-flex rounded-full px-8 py-3 text-sm font-medium transition-opacity hover:bg-gray-100" style={{ color: COLORS.success, borderColor: COLORS.success, borderWidth: 1, borderStyle: 'solid' }}>
                  Browse Marketplace
                </Link>
              </div>
            </section>

            {/* Search Section */}
            <section className="mb-8">
              <label className="relative block">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  type="text"
                  placeholder="Search opportunities, stories, and products"
                  className="h-11 w-full rounded-lg border px-4 text-sm outline-none transition-colors focus:ring-1"
                  style={{ borderColor: COLORS.border, color: COLORS.text }}
                />
              </label>
            </section>
          </>
        )}

        {/* Filter tabs */}
        {!user && activeTab === 'all' && (
          <section className="mb-6">
            <RoleTabs activeTab={activeTab} counts={counts} />
          </section>
        )}

        {/* ── Timeline feed ── */}
        <section>
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-24 animate-pulse rounded-lg border" style={{ borderColor: COLORS.border, backgroundColor: COLORS.bg }} />
              ))}
            </div>
          )}

          {!loading && filteredFeedItems.length === 0 && <EmptyFeed activeTab={activeTab} />}

          {!loading && filteredFeedItems.length > 0 && (
            <div>
              {filteredFeedItems.map((item, index) => (
                <TimelineItem
                  key={item.id}
                  item={item}
                  index={index}
                  isLast={index === filteredFeedItems.length - 1}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
