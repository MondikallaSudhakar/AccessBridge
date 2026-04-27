import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'

const API = 'http://localhost:8081/api'

const COLORS = {
  green: '#5BCB2B',
  greenSoft: '#eaf6ef',
  greenBorder: '#c8e6d2',
  blue: '#0197B2',
  blueSoft: '#e7f7fb',
  blueBorder: '#b8e7f1',
  blueDark: '#0a4b5a',
  heroGradient: 'linear-gradient(120deg, #0197B2 0%, #5BCB2B 100%)',
  white: '#ffffff',
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
}

function TopNav({ user }) {
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
    <header className="sticky top-0 z-50 border-b backdrop-blur-sm" style={{ borderColor: COLORS.blueBorder, backgroundColor: 'rgba(255,255,255,0.95)' }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 md:px-6">
        <div className="flex min-w-0 items-center gap-3 md:gap-4">
          <a href="/" className="flex shrink-0 items-center gap-2">
            <div className="h-8 w-8 rounded-lg text-sm font-black text-white grid place-items-center" style={{ background: COLORS.heroGradient }}>IC</div>
            <span className="hidden text-sm font-extrabold tracking-tight text-slate-900 md:inline">Inclusive Connect</span>
          </a>

          <label className="relative hidden md:block">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><Icons.Search /></span>
            <input
              type="text"
              placeholder="Search public updates, stories, and products"
              className="h-10 w-72 rounded-full border bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-emerald-500"
              style={{ borderColor: COLORS.blueBorder }}
            />
          </label>
        </div>

        <nav className="flex items-center gap-1 md:gap-2">
          {navItems.map((item) => (
            <a key={item.label} href={item.href} className="group hidden items-center gap-1.5 rounded-lg px-2.5 py-2 text-slate-600 transition-colors hover:text-slate-900 md:flex">
              <item.Icon />
              <span className="text-xs font-medium">{item.label}</span>
            </a>
          ))}

          <a href={user ? '/dashboard' : '/login'} className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-slate-700 hover:bg-slate-50">
            <Icons.User />
            <span className="hidden text-xs font-semibold md:inline">{user ? 'Me' : 'Sign In'}</span>
          </a>
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
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #e7f7fb 0%, #f4fbef 35%, #ffffff 100%)' }}>
      <TopNav user={user} />

      <main className="mx-auto max-w-5xl px-4 pb-12 pt-8 md:px-6">
        <section className="rounded-3xl border p-6 shadow-md md:p-8" style={{ borderColor: COLORS.blueBorder, background: COLORS.heroGradient }}>
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">General User / Viewer</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">Browse the ecosystem without logging in.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/90 md:text-lg">
              Explore platform updates, success stories, public products, events, and awareness content.
              No posting required. Upgrade later if you want to volunteer, buy, or join as an organization user.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="/register" className="inline-flex rounded-xl px-5 py-3 text-sm font-bold text-white" style={{ backgroundColor: COLORS.blueDark }}>Upgrade to Active User</a>
              <a href="/login" className="inline-flex rounded-xl border px-5 py-3 text-sm font-bold text-white" style={{ borderColor: 'rgba(255,255,255,0.75)' }}>Login</a>
              <a href="/marketplace" className="inline-flex rounded-xl border px-5 py-3 text-sm font-bold text-white" style={{ borderColor: 'rgba(255,255,255,0.75)' }}>Browse Marketplace</a>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border bg-white p-4" style={{ borderColor: COLORS.blueBorder }}>
          <label className="relative block">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><Icons.Search /></span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              type="text"
              placeholder="Search public updates, stories, and products"
              className="h-11 w-full rounded-xl border bg-white pl-10 pr-3 text-sm outline-none focus:border-emerald-500"
              style={{ borderColor: COLORS.blueBorder }}
            />
          </label>
        </section>

        <section className="mt-4">
          <RoleTabs activeTab={activeTab} setActiveTab={setActiveTab} counts={counts} />
        </section>

        <section className="mt-4 space-y-3">
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-28 animate-pulse rounded-2xl border bg-white" style={{ borderColor: COLORS.blueBorder }} />
              ))}
            </div>
          )}

          {!loading && filteredFeedItems.length === 0 && <EmptyFeed activeTab={activeTab} />}

          {!loading && filteredFeedItems.map((item, index) => (
            <article
              key={item.id}
              className="rounded-2xl border bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              style={{ borderColor: COLORS.blueBorder, animation: `slide-up 0.25s ease-out ${index * 0.03}s both` }}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <span className="inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase" style={{ backgroundColor: COLORS.greenSoft, color: item.accent }}>
                    {item.type === 'stories' ? 'Story' : item.type.slice(0, -1)}
                  </span>
                  <h3 className="mt-2 text-lg font-extrabold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{item.meta}</p>
                </div>
                {item.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: COLORS.blueSoft, color: COLORS.blue }}>
                    <Icons.Verified /> Verified
                  </span>
                )}
              </div>

              <p className="text-sm leading-relaxed text-slate-600">{item.subtitle}</p>

              <div className="mt-4 flex items-center gap-2">
                <a href={item.href} className="rounded-lg px-3.5 py-2 text-xs font-bold text-white" style={{ backgroundColor: COLORS.blue }}>
                  {item.cta}
                </a>
                <a href="/search" className="rounded-lg border px-3.5 py-2 text-xs font-bold" style={{ borderColor: COLORS.green, color: COLORS.green }}>
                  Similar Results
                </a>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}
