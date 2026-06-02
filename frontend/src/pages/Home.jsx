import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import logoImg from '../assets/logo.jpeg'

const API = 'http://localhost:8081/api'

const COLORS = {
  primary: '#0197B2',
  primaryLight: '#f0f8fc',
  border: '#e5e7eb',
  text: '#1f2937',
  textLight: '#4b5563',
  textLighter: '#9ca3af',
  bg: '#ffffff',
  bgLight: '#ffffff',
  success: '#82cd27',
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

const PUBLIC_TABS = [
  { id: 'all', label: 'All' },
  { id: 'events', label: 'Events' },
  { id: 'stories', label: 'Stories' },
  { id: 'jobs', label: 'Jobs' },
  { id: 'requirements', label: 'Requirements' },
  { id: 'products', label: 'Products' },
]

const PUBLIC_TAB_IDS = new Set(PUBLIC_TABS.map((tab) => tab.id))

const FALLBACK_ITEMS = [
  {
    id: 'fallback-event-1',
    type: 'events',
    title: 'Test event',
    meta: 'KSRCT • Tiruchengode, India',
    subtitle: 'Comprehensive technical symposium for payment gateway innovations and fintech security protocols. Join us for a deep dive into secure payment flow.',
    openDate: '2026-06-09',
    closeDate: '2026-06-15',
    status: 'Registering',
    cta: 'View Event',
    href: '/events/1'
  },
  {
    id: 'fallback-story-1',
    type: 'stories',
    title: 'Vyuga Annual Summit',
    meta: 'Community Hub • Downtown',
    subtitle: 'Experience the intersection of technology and art in our annual storytelling showcase. A journey through digital transformation and human connection.',
    openDate: '2026-05-22',
    duration: '15 min read',
    cta: 'Read Story',
    href: '/stories/1'
  },
  {
    id: 'fallback-job-1',
    type: 'jobs',
    title: 'Lead Design Architect',
    meta: 'Innovative Solutions • Remote',
    subtitle: 'Seeking an experienced architect to lead our UI/UX transition. You will be responsible for maintaining brand integrity across global platforms.',
    closeDate: '2026-07-15',
    jobType: 'Full-time',
    cta: 'Apply Now',
    href: '/jobs/1'
  }
]

const TimelineIcons = {
  events: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5 text-[#132c02]" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  stories: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5 text-[#132c02]" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5L6 9H2v6h4l5 4V5z" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  ),
  jobs: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5 text-[#132c02]" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  requirements: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5 text-[#132c02]" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  products: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5 text-[#132c02]" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  )
}

function getTagStyle(type) {
  switch (type) {
    case 'events':
      return { bg: '#e0f2fe', text: '#0369a1', label: 'EVENT' }
    case 'stories':
      return { bg: '#dcfce7', text: '#15803d', label: 'STORY' }
    case 'jobs':
      return { bg: '#f1f5f9', text: '#475569', label: 'JOB' }
    case 'requirements':
      return { bg: '#f3e8ff', text: '#7e22ce', label: 'REQUIREMENT' }
    case 'products':
      return { bg: '#fef3c7', text: '#b45309', label: 'PRODUCT' }
    default:
      return { bg: '#f1f5f9', text: '#475569', label: 'INFO' }
  }
}

function fmtDate(dateStr) {
  if (!dateStr) return null
  try {
    const d = new Date(dateStr)
    if (isNaN(d)) return null
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch { return null }
}

function getCardDetails(item) {
  const openFmt = fmtDate(item.openDate) || '09 Jun 2026'
  const closeFmt = fmtDate(item.closeDate) || '15 Jul 2026'
  
  switch (item.type) {
    case 'events':
      return {
        label1: 'OPEN DATE',
        value1: openFmt,
        label2: 'STATUS',
        value2: <span className="text-[#15803d] font-extrabold">{item.status || 'Registering'}</span>
      }
    case 'stories':
      return {
        label1: 'PUBLISHED',
        value1: openFmt,
        label2: 'DURATION',
        value2: item.duration || '15 min read'
      }
    case 'jobs':
      return {
        label1: 'DEADLINE',
        value1: closeFmt,
        label2: 'TYPE',
        value2: item.jobType || 'Full-time'
      }
    case 'requirements':
      return {
        label1: 'DEADLINE',
        value1: closeFmt,
        label2: 'TYPE',
        value2: item.requirementType || 'Donation'
      }
    case 'products':
      return {
        label1: 'PRICE',
        value1: item.price || 'Free',
        label2: 'SELLER',
        value2: item.seller || 'Community Store'
      }
    default:
      return {
        label1: 'DATE',
        value1: openFmt,
        label2: 'TYPE',
        value2: 'General'
      }
  }
}

function TopNav({ user, activeTab }) {
  const navItems = user
    ? [
      { label: 'Home', href: '/', Icon: () => null },
      { label: 'My Network', href: '/search', Icon: () => null },
      { label: 'Marketplace', href: '/marketplace', Icon: () => null },
      { label: 'Messaging', href: user.role === 'USER' ? '/messages' : '/ngo/profile?tab=messages', Icon: () => null },
      { label: 'Notifications', href: '/dashboard', Icon: () => null },
    ]
    : []

  return (
    <header className="sticky top-0 z-50 border-b border-gray-150 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <div className="flex items-center">
          <a href="/" className="flex shrink-0 items-center gap-2">
            <img src={logoImg} alt="KnotneX" className="h-8 w-8 rounded-lg object-cover" />
            <span className="text-xl font-bold tracking-tight text-gray-900">KnotneX</span>
          </a>
        </div>

        {!user && (
          <nav className="hidden md:flex items-center gap-6">
            {PUBLIC_TABS.map((tab) => {
              const selected = tab.id === activeTab
              const tabHref = tab.id === 'all' ? '/' : `/?tab=${tab.id}`
              return (
                <Link
                  key={tab.id}
                  className="px-1 py-1 text-sm font-semibold transition-colors border-b-2 hover:text-gray-900"
                  to={tabHref}
                  style={{
                    color: selected ? '#1f2937' : '#6b7280',
                    borderColor: selected ? '#82cd27' : 'transparent',
                  }}
                >
                  {tab.label}
                </Link>
              )
            })}
          </nav>
        )}

        <nav className="flex items-center gap-4">
          {user ? (
            navItems.map((item) => (
              <Link key={item.label} to={item.href} className="hidden items-center gap-1.5 rounded px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 md:flex">
                <span>{item.label}</span>
              </Link>
            ))
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="px-5 py-2 rounded-xl font-bold text-sm bg-[#82cd27] text-[#132c02] hover:bg-[#74b823] transition-colors shadow-sm">
                Join Now
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

function TimelineItem({ item }) {
  const tagStyle = getTagStyle(item.type)
  const details = getCardDetails(item)
  const buttonLabel = item.cta || (
    item.type === 'events' ? 'View Event' :
    item.type === 'stories' ? 'Read Story' :
    item.type === 'jobs' ? 'Apply Now' :
    item.type === 'requirements' ? 'View Detail' : 'View'
  )

  return (
    <div className="relative">
      {/* Left: Circle Dot on the timeline */}
      <div className="absolute -left-12 md:-left-16 top-0 w-12 md:w-16 flex justify-center">
        <div className="w-10 h-10 rounded-full bg-[#82cd27] flex items-center justify-center border-4 border-white shadow-sm">
          {TimelineIcons[item.type] ? TimelineIcons[item.type]() : TimelineIcons.stories()}
        </div>
      </div>

      {/* Right: Card */}
      <div className="bg-white border border-gray-200 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
        {/* Left Card content */}
        <div className="flex-1 min-w-0 p-6 md:p-8 pr-4 w-full">
          <span
            className="inline-block px-3 py-1 text-[10px] font-extrabold tracking-wider rounded-full uppercase mb-4"
            style={{ backgroundColor: tagStyle.bg, color: tagStyle.text }}
          >
            {tagStyle.label}
          </span>
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">{item.title}</h3>
          <p className="text-xs font-semibold text-gray-400 mt-1">{item.meta}</p>
          <p className="text-sm text-gray-600 mt-4 leading-relaxed">{item.subtitle}</p>
          
          <hr className="border-gray-100 my-5" />
          
          <div className="flex gap-10">
            <div>
              <div className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">{details.label1}</div>
              <div className="text-sm font-semibold text-gray-900 mt-1">{details.value1}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">{details.label2}</div>
              <div className="text-sm font-semibold text-gray-900 mt-1">{details.value2}</div>
            </div>
          </div>
        </div>

        {/* Right Card CTA */}
        <div className="w-full md:w-auto shrink-0 px-6 pb-6 md:pb-0 md:pr-8 flex items-center justify-center">
          <Link
            to={item.href}
            className="w-full md:w-auto text-center px-6 py-3 rounded-xl font-bold text-sm tracking-wide bg-[#82cd27] text-[#132c02] hover:bg-[#74b823] hover:shadow-md transition-all duration-200 whitespace-nowrap"
          >
            {buttonLabel}
          </Link>
        </div>
      </div>
    </div>
  )
}

function EmptyFeed({ activeTab }) {
  return (
    <div className="rounded-2xl border border-gray-200 py-12 text-center bg-gray-50">
      <h3 className="text-lg font-semibold text-gray-900">No {activeTab === 'all' ? 'opportunities' : activeTab} found</h3>
      <p className="mt-2 text-sm text-gray-500">Try another search keyword or select a different category above.</p>
      <Link to="/register" className="mt-4 inline-flex rounded-xl px-5 py-2.5 text-sm font-bold text-[#132c02] bg-[#82cd27] hover:bg-[#74b823] transition-colors">
        Join the Community
      </Link>
    </div>
  )
}

export default function Home() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [directory, setDirectory] = useState({ products: [], schools: [], ngos: [], jobs: [], requirements: [], events: [], stories: [] })

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 3

  const requestedTab = searchParams.get('tab') || 'all'
  const activeTab = PUBLIC_TAB_IDS.has(requestedTab) ? requestedTab : 'all'

  // Reset pagination when active tab or query changes
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, query])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const recentData = await fetchPublic('/public/recent')
        
        const organized = {
          products: [],
          schools: [],
          ngos: [],
          jobs: [],
          requirements: [],
          events: [],
          stories: []
        }
        
        let hasData = false
        if (Array.isArray(recentData) && recentData.length > 0) {
          recentData.forEach((item) => {
            if (organized[item.type]) {
              organized[item.type].push(item)
              hasData = true
            }
          })
        }
        
        // If API returns no data, populate with high quality mock data matching the screenshot
        if (!hasData) {
          FALLBACK_ITEMS.forEach((item) => {
            if (organized[item.type]) {
              organized[item.type].push(item)
            }
          })
        }
        
        setDirectory(organized)
      } catch (err) {
        console.error('Failed to load recent data:', err)
        // Fallback on error
        const organized = {
          products: [],
          schools: [],
          ngos: [],
          jobs: [],
          requirements: [],
          events: [],
          stories: []
        }
        FALLBACK_ITEMS.forEach((item) => {
          if (organized[item.type]) {
            organized[item.type].push(item)
          }
        })
        setDirectory(organized)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  // Interleaved items list to alternate categories beautifully and match screenshot order
  const allFeedItems = useMemo(() => {
    const items = []
    const maxLength = Math.max(
      directory.events.length,
      directory.stories.length,
      directory.jobs.length,
      directory.requirements.length,
      directory.products.length
    )
    
    for (let i = 0; i < maxLength; i++) {
      if (directory.events[i]) items.push(directory.events[i])
      if (directory.stories[i]) items.push(directory.stories[i])
      if (directory.jobs[i]) items.push(directory.jobs[i])
      if (directory.requirements[i]) items.push(directory.requirements[i])
      if (directory.products[i]) items.push(directory.products[i])
    }
    
    return items
  }, [directory])

  const filteredFeedItems = useMemo(() => {
    let items = allFeedItems
    if (activeTab !== 'all') {
      items = items.filter((item) => item.type === activeTab)
    }
    if (query.trim()) {
      const text = query.toLowerCase()
      items = items.filter((item) => {
        return (
          item.title?.toLowerCase().includes(text) ||
          item.subtitle?.toLowerCase().includes(text) ||
          item.meta?.toLowerCase().includes(text)
        )
      })
    }
    return items
  }, [activeTab, allFeedItems, query])

  // Pagination Math
  const totalPages = Math.ceil(filteredFeedItems.length / itemsPerPage)
  
  const paginatedFeedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredFeedItems.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredFeedItems, currentPage])

  const getPageNumbers = () => {
    const pages = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('...')
      
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i)
      }
      
      if (currentPage < totalPages - 2) pages.push('...')
      if (!pages.includes(totalPages)) pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="bg-white min-h-screen flex flex-col justify-between">
      <div>
        <TopNav user={user} activeTab={activeTab} />

        <main className="mx-auto max-w-5xl px-4 py-12 md:px-6">
          {/* Header section with Title and Search records */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="max-w-xl">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                Explore Opportunities
              </h1>
              <p className="mt-3 text-base text-gray-500 leading-relaxed">
                Discover local events, community stories, and professional requirements tailored for you. KnotneX connects you with what matters most.
              </p>
            </div>
            <div className="w-full md:w-auto shrink-0">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search records..."
                  className="block w-full md:w-72 pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#82cd27] focus:border-transparent text-sm text-gray-900 bg-white placeholder-gray-400 transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Timeline Feed Container */}
          <section className="relative pl-12 md:pl-16">
            {/* Continuous light green timeline vertical line */}
            <div className="absolute left-[20px] md:left-[24px] top-6 bottom-6 w-0.5 bg-[#82cd27]/20" />
            
            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-48 animate-pulse rounded-2xl border border-gray-200 bg-gray-50" />
                ))}
              </div>
            ) : paginatedFeedItems.length === 0 ? (
              <EmptyFeed activeTab={activeTab} />
            ) : (
              <div className="space-y-8">
                {paginatedFeedItems.map((item) => (
                  <TimelineItem
                    key={item.id}
                    item={item}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Pagination Controls */}
          {!loading && paginatedFeedItems.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-150 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              {getPageNumbers().map((page, idx) => {
                if (page === '...') {
                  return (
                    <span key={`dots-${idx}`} className="w-9 text-center text-gray-400 text-sm font-semibold select-none">
                      ...
                    </span>
                  )
                }
                
                const isCurrent = page === currentPage
                return (
                  <button
                    key={`page-${page}`}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-bold transition-all duration-200 ${
                      isCurrent
                        ? 'bg-[#2c4e09] text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-150 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-[#eef2f6] border-t border-gray-200 py-10 mt-20">
        <div className="mx-auto max-w-6xl px-4 flex flex-col md:flex-row justify-between items-center gap-6 md:px-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="font-bold text-gray-800 text-base">KnotneX</span>
            <span className="text-xs text-gray-500">© 2024 KnotneX. All rights reserved.</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-gray-600">
            <a href="#about" className="hover:text-[#82cd27] transition-colors">About</a>
            <a href="#terms" className="hover:text-[#82cd27] transition-colors">Terms</a>
            <a href="#privacy" className="hover:text-[#82cd27] transition-colors">Privacy</a>
            <a href="#contact" className="hover:text-[#82cd27] transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-4 text-gray-500">
            <a href="#" className="hover:text-[#82cd27] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </a>
            <a href="#" className="hover:text-[#82cd27] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </a>
            <a href="#" className="hover:text-[#82cd27] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <circle cx="6" cy="6" r="3" />
                <circle cx="18" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="18" r="3" />
                <line x1="12" y1="12" x2="6" y2="6" />
                <line x1="12" y1="12" x2="18" y2="6" />
                <line x1="12" y1="12" x2="6" y2="18" />
                <line x1="12" y1="12" x2="18" y2="18" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
