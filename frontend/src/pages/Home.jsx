import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'

const API = 'http://localhost:8081/api'

const COLORS = {
  green: '#0197B2',
  greenSoft: '#f0f8fc',
  greenBorder: '#c8e6f0',
  blue: '#0197B2',
  blueSoft: '#f0f8fc',
  blueBorder: '#c8e6f0',
  blueDark: '#0a4b5a',
  heroGradient: '#0197B2',
  white: '#ffffff',
  slate50: '#f9fafb',
  slate100: '#f3f4f6',
  slate200: '#e5e7eb',
  slate700: '#374151',
  slate900: '#111827',
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

function TopNav({ user, activeTab, setActiveTab, counts }) {
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
    <header className="sticky top-0 z-50 border-b border-black bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 md:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-3 lg:min-w-fit">
          <a href="/" className="flex shrink-0 items-center gap-2">
            <div className="h-8 w-8 rounded-lg border-2 border-black text-sm font-black text-black grid place-items-center bg-transparent">IC</div>
            <span className="hidden text-sm font-extrabold tracking-tight md:inline" style={{ color: COLORS.blue }}>Inclusive Connect</span>
          </a>
        </div>

        {!user && (
          <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-1 lg:justify-center lg:pb-0">
            {PUBLIC_TABS.map((tab) => {
              const selected = tab.id === activeTab
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all ${selected ? 'border-black text-black' : 'border-transparent text-black hover:border-black'}`}
                >
                  {tab.label}
                </button>
              )
            })}
          </nav>
        )}

        <nav className="flex items-center justify-end gap-2">
          {user ? (
            navItems.map((item) => (
              <a key={item.label} href={item.href} className="group hidden items-center gap-1.5 rounded-lg px-2.5 py-2 text-slate-600 transition-colors hover:text-slate-900 md:flex">
                <item.Icon />
                <span className="text-xs font-medium">{item.label}</span>
              </a>
            ))
          ) : (
            <>
              <a href="/login" className="hidden items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 md:inline-flex" style={{ borderColor: COLORS.blueBorder }}>
                <Icons.User />
                <span>Sign In</span>
              </a>
              <a href="/register" className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: COLORS.green }}>
                Join Now
              </a>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

function RoleTabs({ activeTab, setActiveTab, counts }) {
  const tabs = [
    { id: 'all', label: 'All', count: counts.total },
    { id: 'events', label: 'Events', count: counts.events },
    { id: 'stories', label: 'Stories', count: counts.stories },
    { id: 'jobs', label: 'Jobs', count: counts.jobs },
    { id: 'requirements', label: 'Requirements', count: counts.requirements },
    { id: 'products', label: 'Products', count: counts.products },
  ]

  return (
    <div className="mb-4 rounded-2xl border bg-white p-2" style={{ borderColor: COLORS.greenBorder }}>
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const selected = tab.id === activeTab
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="rounded-xl px-4 py-2 text-sm font-semibold transition-all"
              style={{
                backgroundColor: selected ? COLORS.blue : COLORS.blueSoft,
                color: selected ? COLORS.white : COLORS.blue,
              }}
            >
              {tab.label} ({tab.count})
            </button>
          )
        })}
      </div>
    </div>
  )
}

function EmptyFeed({ activeTab }) {
  return (
    <div className="rounded-2xl border border-dashed p-8 text-center" style={{ borderColor: COLORS.greenBorder, backgroundColor: COLORS.white }}>
      <h3 className="text-lg font-bold text-slate-800">No {activeTab === 'all' ? 'entries' : activeTab} found right now.</h3>
      <p className="mt-2 text-sm text-slate-500">Try another tab or upgrade from viewer-only access to an active role.</p>
      <a href="/register" className="mt-4 inline-flex rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: COLORS.green }}>
        Upgrade Now
      </a>
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
  const hasDateMeta = openFmt || closeFmt || item.applied != null

  return (
    <div className="flex gap-4">
      {/* Left: dot + line */}
      <div className="flex flex-col items-center">
        <div
          className="z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-white shadow"
          style={{ backgroundColor: typeStyle.dot }}
        />
        {!isLast && <div className="mt-1 w-0.5 flex-1" style={{ backgroundColor: '#e2e8f0' }} />}
      </div>

      {/* Right: card */}
      <article
        className="mb-4 min-w-0 flex-1 rounded-xl border bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg overflow-hidden"
        style={{ borderColor: COLORS.blueBorder }}
      >
        {/* Header with badges */}
        <div className="border-b px-5 py-3" style={{ borderColor: COLORS.blueBorder, backgroundColor: typeStyle.bg }}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
                style={{ backgroundColor: typeStyle.dot, color: 'white' }}
              >
                <span className="h-2 w-2 rounded-full bg-white"></span>
                {typeStyle.label}
              </span>
              {item.verified && (
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: 'rgba(1, 151, 178, 0.15)', color: COLORS.blue }}>
                  <Icons.Verified /> Verified
                </span>
              )}
            </div>

            {/* Open/Closed badge for jobs & requirements */}
            {(item.type === 'jobs' || item.type === 'requirements') && item.closeDate && (
              <span
                className="rounded-full px-3 py-1 text-xs font-bold"
                style={{
                  backgroundColor: expired ? '#fee2e2' : '#dcfce7',
                  color: expired ? '#dc2626' : '#16a34a',
                }}
              >
                {expired ? '🔒 Closed' : '✓ Open'}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Top section: Title/Meta on left, Buttons on right */}
          <div className="flex gap-4 justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-black text-slate-900 leading-tight">{item.title}</h3>
              <p className="mt-2 text-sm font-semibold text-slate-600 flex items-center gap-2">
                {item.logo ? <img src={item.logo} alt="logo" className="h-5 w-5 rounded object-cover" /> : null} <span>{item.meta}</span>
              </p>
            </div>

            {/* Right side buttons */}
            <div className="flex flex-col gap-2 shrink-0 ml-4">
              <a href={item.href} className="rounded-lg px-4 py-2.5 text-sm font-bold text-white text-center transition-all hover:shadow-md hover:-translate-y-0.5 whitespace-nowrap" style={{ backgroundColor: COLORS.blue }}>
                {item.cta}
              </a>
              <a href="/search" className="rounded-lg border-2 px-4 py-2.5 text-sm font-bold text-center transition-all hover:bg-green-50 hover:-translate-y-0.5 whitespace-nowrap" style={{ borderColor: COLORS.green, color: COLORS.green }}>
                Similar
              </a>
            </div>
          </div>

          {/* Description */}
          <p className="text-base leading-relaxed text-slate-700">{item.subtitle}</p>

          {/* Date + applied strip for jobs & requirements */}
          {hasDateMeta && (item.type === 'jobs' || item.type === 'requirements') && (
            <div className="mt-4 rounded-lg border px-4 py-3" style={{ borderColor: COLORS.blueBorder, backgroundColor: COLORS.slate50 }}>
              <div className="flex flex-wrap items-center gap-5">
                {openFmt && (
                  <div className="flex items-center gap-2">
                    <Icons.Calendar />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Open Date</span>
                      <span className="text-sm font-bold text-slate-800">{openFmt}</span>
                    </div>
                  </div>
                )}
                {closeFmt && (
                  <div className="flex items-center gap-2">
                    <Icons.Calendar />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Last Date</span>
                      <span className={`text-sm font-bold ${expired ? 'text-rose-600' : 'text-slate-800'}`}>{closeFmt}</span>
                    </div>
                  </div>
                )}
                {item.applied != null && (
                  <div className="flex items-center gap-2">
                    <Icons.Users />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Applied</span>
                      <span className="text-sm font-bold text-slate-800">{item.applied} people</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </article>
    </div>
  )
}

export default function Home() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(true)
  const [directory, setDirectory] = useState({ products: [], schools: [], ngos: [], jobs: [], requirements: [], events: [], stories: [] })

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [schools, ngos] = await Promise.all([
        fetchPublic('/schools'),
        fetchPublic('/ngos'),
      ])

      const events = await fetchPublic('/events/public')

      const ngoNeedsGroups = await Promise.all(
        ngos.map(async (ngo) => ({ ngo, items: await fetchPublic(`/ngos/${ngo.id}/needs`) }))
      )

      const schoolNeedsGroups = await Promise.all(
        schools.map(async (school) => ({ school, items: await fetchPublic(`/schools/${school.id}/needs`) }))
      )

      const ngoJobsGroups = await Promise.all(
        ngos.map(async (ngo) => ({ ngo, items: await fetchPublic(`/ngos/${ngo.id}/jobs`) }))
      )

      const ngoProductsGroups = await Promise.all(
        ngos.map(async (ngo) => ({ ngo, items: await fetchPublic(`/ngos/${ngo.id}/products`) }))
      )

      const ngoCampaignGroups = await Promise.all(
        ngos.map(async (ngo) => ({ ngo, items: await fetchPublic(`/ngos/${ngo.id}/campaigns`) }))
      )

      const schoolAchievementGroups = await Promise.all(
        schools.map(async (school) => ({ school, items: await fetchPublic(`/schools/${school.id}/achievements`) }))
      )

      const requirements = [
        ...ngoNeedsGroups.flatMap(({ ngo, items }) =>
          items
            .filter((need) => need.status !== 'CLOSED')
            .map((need) => ({
              id: `ngo-need-${need.id}`,
              type: 'requirements',
              title: need.title,
              subtitle: need.description || 'Support request from NGO.',
              meta: `${ngo.name} • ${formatLocation(ngo)}`,
              verified: ngo.verified,
              cta: 'View NGO Profile',
              href: `/ngos/${ngo.id}`,
              accent: COLORS.green,
              openDate: need.openDate || need.createdAt || null,
              closeDate: need.closeDate || need.deadline || null,
              applied: need.applicantCount ?? null,
              logo: ngo.logoUrl,
            }))
        ),
        ...schoolNeedsGroups.flatMap(({ school, items }) =>
          items
            .filter((need) => need.status !== 'CLOSED')
            .map((need) => ({
              id: `school-need-${need.id}`,
              type: 'requirements',
              title: need.title,
              subtitle: need.description || 'Support request from school.',
              meta: `${school.name} • ${formatLocation(school)}`,
              verified: school.verified,
              cta: 'View School Profile',
              href: `/schools/${school.id}`,
              accent: COLORS.blue,
              openDate: need.openDate || need.createdAt || null,
              closeDate: need.closeDate || need.deadline || null,
              applied: need.applicantCount ?? null,
              logo: school.logoUrl,
            }))
        ),
      ]

      const jobs = ngoJobsGroups.flatMap(({ ngo, items }) =>
        items
          .filter((job) => job.status !== 'CLOSED')
          .map((job) => ({
            id: `job-${job.id}`,
            type: 'jobs',
            title: job.title,
            subtitle: job.description || 'Hiring requirement posted by NGO.',
            meta: `${ngo.name} • ${job.location || formatLocation(ngo)}`,
            verified: ngo.verified,
            cta: 'View NGO Profile',
            href: `/ngos/${ngo.id}`,
            accent: COLORS.green,
            openDate: job.openDate || job.createdAt || null,
            closeDate: job.lastDateToApply || job.closeDate || job.deadline || null,
            applied: job.applicantCount ?? null,
            logo: ngo.logoUrl,
          }))
      )

      const products = ngoProductsGroups.flatMap(({ ngo, items }) =>
        items
          .filter((product) => product.available !== false)
          .map((product) => ({
            id: `ngo-product-${product.id}`,
            type: 'products',
            title: product.name,
            subtitle: product.description || 'Product listed by NGO.',
            meta: `${ngo.name} • Rs ${Number(product.price || 0).toLocaleString('en-IN')} • Stock ${product.stockQuantity ?? 0}`,
            verified: ngo.verified,
            cta: 'View NGO Profile',
            href: `/ngos/${ngo.id}`,
            accent: COLORS.green,
            logo: product.imageUrl || ngo.logoUrl,
          }))
      )

      const stories = [
        ...schoolAchievementGroups.flatMap(({ school, items }) =>
          items.slice(0, 2).map((story) => ({
            id: `school-story-${story.id}`,
            type: 'stories',
            title: story.title,
            subtitle: story.description || 'School success story.',
            meta: `${school.name} • ${story.category || 'Achievement'}`,
            verified: school.verified,
            cta: 'View School Profile',
            href: `/schools/${school.id}`,
            accent: COLORS.blue,
            logo: school.logoUrl,
          }))
        ),
        ...ngoCampaignGroups.flatMap(({ ngo, items }) =>
          items.slice(0, 2).map((campaign) => ({
            id: `ngo-campaign-${campaign.id}`,
            type: 'stories',
            title: campaign.campaignName,
            subtitle: campaign.campaignDescription || 'Community success story.',
            meta: `${ngo.name} • ${campaign.status || 'Campaign'}`,
            verified: ngo.verified,
            cta: 'View NGO Profile',
            href: `/ngos/${ngo.id}`,
            accent: COLORS.green,
            logo: ngo.logoUrl,
          }))
        ),
      ]

      const publicEvents = events.map((event) => ({
        id: `event-${event.id}`,
        type: 'events',
        title: event.title,
        subtitle: event.description || 'Public event.',
        meta: `${event.location || 'Location not specified'}${event.city ? ` • ${event.city}` : ''}`,
        verified: true,
        cta: 'View Event',
        href: '/search',
        accent: COLORS.blue,
        openDate: event.startDate || null,
        closeDate: event.endDate || null,
        logo: event.imageUrl,
      }))

      setDirectory({ schools, ngos, requirements, jobs, products, events: publicEvents, stories })
      setLoading(false)
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
    <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
      <TopNav user={user} activeTab={activeTab} setActiveTab={setActiveTab} counts={counts} />

      <main className="mx-auto max-w-5xl px-4 pb-12 pt-8 md:px-6">
        <section className="rounded-2xl border-0 p-8 shadow-lg md:p-12" style={{ backgroundColor: COLORS.blue }}>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest text-white/80" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.green }}></span>
              Welcome to Inclusive Connect
            </div>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl">Explore & Connect with Purpose</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/90 md:text-lg">
              Discover opportunities, success stories, innovative products, and meaningful events in our inclusive community. Browse freely or join as an active member to make a real impact.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="/register" className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-bold text-white transition-all hover:shadow-lg hover:-translate-y-0.5" style={{ backgroundColor: COLORS.green }}>
                Join the Community
              </a>
              <a href="/marketplace" className="inline-flex items-center justify-center rounded-lg border-2 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-white/10" style={{ borderColor: 'rgba(255,255,255,0.4)' }}>
                Browse Marketplace
              </a>
              <a href="/login" className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-bold text-white transition-all hover:bg-white/10">
                Sign In
              </a>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-xl border shadow-sm p-4" style={{ borderColor: COLORS.blueBorder, backgroundColor: COLORS.white }}>
          <label className="relative block">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Search /></span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              type="text"
              placeholder="Search opportunities, stories, and products"
              className="h-12 w-full rounded-lg border bg-white pl-11 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              style={{ borderColor: COLORS.blueBorder }}
            />
          </label>
        </section>

        {/* ── Timeline feed ── */}
        <section className="mt-4">
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-28 animate-pulse rounded-2xl border bg-white" style={{ borderColor: COLORS.blueBorder }} />
              ))}
            </div>
          )}

          {!loading && filteredFeedItems.length === 0 && <EmptyFeed activeTab={activeTab} />}

          {!loading && filteredFeedItems.length > 0 && (
            <div className="pl-1">
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
