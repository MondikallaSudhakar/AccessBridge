import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'

const API = 'http://localhost:8081/api'

const COLORS = {
  green: '#5BCB2B',
  greenSoft: '#eaf6ef',
  greenBorder: '#c8e6d2',
  white: '#ffffff',
  blue: '#0d6efd',
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
  const messagingHref = user?.role === 'USER' ? '/messages' : '/ngo/profile?tab=messages'

  const navItems = [
    { label: 'Home', href: '/', Icon: Icons.Home },
    { label: 'My Network', href: '/search', Icon: Icons.Network },
    { label: 'Marketplace', href: '/marketplace', Icon: Icons.Marketplace },
    { label: 'Messaging', href: messagingHref, Icon: Icons.Messages },
    { label: 'Notifications', href: '/dashboard', Icon: Icons.Bell },
  ]

  return (
    <header className="sticky top-0 z-50 border-b backdrop-blur-sm" style={{ borderColor: COLORS.greenBorder, backgroundColor: 'rgba(255,255,255,0.95)' }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 md:px-6">
        <div className="flex min-w-0 items-center gap-3 md:gap-4">
          <a href="/" className="flex shrink-0 items-center gap-2">
            <div className="h-8 w-8 rounded-lg text-sm font-black text-white grid place-items-center" style={{ backgroundColor: COLORS.green }}>IC</div>
            <span className="hidden text-sm font-extrabold tracking-tight text-slate-900 md:inline">Inclusive Connect</span>
          </a>

          <label className="relative hidden md:block">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><Icons.Search /></span>
            <input
              type="text"
              placeholder="Search NGOs, schools, and products"
              className="h-10 w-72 rounded-full border bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-emerald-500"
              style={{ borderColor: COLORS.greenBorder }}
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
                backgroundColor: selected ? COLORS.green : COLORS.greenSoft,
                color: selected ? COLORS.white : COLORS.green,
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
      <p className="mt-2 text-sm text-slate-500">Try another tab or register your organization to be visible in this community feed.</p>
      <a href="/register" className="mt-4 inline-flex rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: COLORS.green }}>
        Register Now
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
  const [directory, setDirectory] = useState({ products: [], schools: [], ngos: [], jobs: [], requirements: [] })

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [schools, ngos] = await Promise.all([
        fetchPublic('/schools'),
        fetchPublic('/ngos'),
      ])

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

      setDirectory({ schools, ngos, requirements, jobs, products })
      setLoading(false)
    }

    load()
  }, [])

  const allFeedItems = useMemo(() => {
    return [...directory.jobs, ...directory.requirements, ...directory.products]
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
    total: directory.jobs.length + directory.requirements.length + directory.products.length,
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f3fbf6 0%, #ffffff 25%)' }}>
      <TopNav user={user} />

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 pb-10 pt-5 md:grid-cols-12 md:px-6">
        <aside className="md:col-span-3">
          <div className="sticky top-20 space-y-4">
            <section className="rounded-2xl border bg-white p-5" style={{ borderColor: COLORS.greenBorder }}>
              <h1 className="text-lg font-extrabold text-slate-900">Community Dashboard</h1>
              <p className="mt-2 text-sm text-slate-600">Discover verified NGOs, schools, and social products in separate tabs just like a professional network feed.</p>
              <div className="mt-4 flex gap-2">
                <a href="/register" className="rounded-lg px-3 py-2 text-xs font-bold text-white" style={{ backgroundColor: COLORS.green }}>Join</a>
                <a href="/dashboard" className="rounded-lg border px-3 py-2 text-xs font-bold" style={{ borderColor: COLORS.green, color: COLORS.green }}>Dashboard</a>
              </div>
            </section>

            <section className="rounded-2xl border bg-white p-5" style={{ borderColor: COLORS.greenBorder }}>
              <h2 className="text-sm font-bold text-slate-900">Live Counts</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li>Jobs: <strong>{counts.jobs}</strong></li>
                <li>Requirements: <strong>{counts.requirements}</strong></li>
                <li>Products: <strong>{counts.products}</strong></li>
              </ul>
            </section>
          </div>
        </aside>

        <section className="md:col-span-6">
          <div className="mb-4 rounded-2xl border bg-white p-4" style={{ borderColor: COLORS.greenBorder }}>
            <label className="relative block">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><Icons.Search /></span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="text"
                placeholder="Search inside current tab"
                className="h-11 w-full rounded-xl border bg-white pl-10 pr-3 text-sm outline-none focus:border-emerald-500"
                style={{ borderColor: COLORS.greenBorder }}
              />
            </label>
          </div>

          <RoleTabs activeTab={activeTab} setActiveTab={setActiveTab} counts={counts} />

          <div className="space-y-3">
            {loading && (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-32 animate-pulse rounded-2xl border bg-white" style={{ borderColor: COLORS.greenBorder }} />
                ))}
              </div>
            )}

            {!loading && filteredFeedItems.length === 0 && <EmptyFeed activeTab={activeTab} />}

            {!loading && filteredFeedItems.map((item, index) => (
              <article
                key={item.id}
                className="rounded-2xl border bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                style={{ borderColor: COLORS.greenBorder, animation: `slide-up 0.25s ease-out ${index * 0.03}s both` }}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase" style={{ backgroundColor: COLORS.greenSoft, color: item.accent }}>
                      {item.type.slice(0, -1)}
                    </span>
                    <h3 className="mt-2 text-lg font-extrabold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{item.meta}</p>
                  </div>
                  {item.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: COLORS.greenSoft, color: COLORS.green }}>
                      <Icons.Verified /> Verified
                    </span>
                  )}
                </div>

                <p className="text-sm leading-relaxed text-slate-600">{item.subtitle}</p>

                <div className="mt-4 flex items-center gap-2">
                  <a href={item.href} className="rounded-lg px-3.5 py-2 text-xs font-bold text-white" style={{ backgroundColor: COLORS.green }}>
                    {item.cta}
                  </a>
                  <a href="/search" className="rounded-lg border px-3.5 py-2 text-xs font-bold" style={{ borderColor: COLORS.green, color: COLORS.green }}>
                    Similar Results
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="md:col-span-3">
          <div className="sticky top-20 space-y-4">
            <section className="rounded-2xl border bg-white p-5" style={{ borderColor: COLORS.greenBorder }}>
              <h2 className="text-sm font-bold text-slate-900">Suggested Actions</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>Create your organization profile</li>
                <li>Connect with verified NGOs</li>
                <li>Browse school support needs</li>
                <li>Check social products in marketplace</li>
              </ul>
            </section>

            <section className="rounded-2xl border bg-white p-5" style={{ borderColor: COLORS.greenBorder }}>
              <h2 className="text-sm font-bold text-slate-900">Quick Links</h2>
              <div className="mt-3 grid grid-cols-1 gap-2 text-sm font-semibold">
                <a href="/marketplace" className="rounded-lg px-3 py-2" style={{ backgroundColor: COLORS.greenSoft, color: COLORS.green }}>Marketplace</a>
                <a href="/admin/approvals" className="rounded-lg px-3 py-2" style={{ backgroundColor: COLORS.greenSoft, color: COLORS.green }}>Admin Approvals</a>
                <a href="/school/profile" className="rounded-lg px-3 py-2" style={{ backgroundColor: COLORS.greenSoft, color: COLORS.green }}>School Profile</a>
              </div>
            </section>
          </div>
        </aside>
      </main>
    </div>
  )
}
