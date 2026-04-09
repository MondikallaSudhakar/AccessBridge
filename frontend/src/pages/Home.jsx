import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const API = 'http://localhost:8081/api'

async function fetchPublic(path) {
  try {
    const res = await fetch(`${API}${path}`)
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

// Brand colors: Blue #1A8FD1 | Green #5BBE00

const Icons = {
  School: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V9l8-5 8 5v10M9 19v-5h6v5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2M9 9h6" />
    </svg>
  ),
  NGO: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
    </svg>
  ),
  Startup: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Donor: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  Arrow: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  ),
  Menu: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
}

function EmptyState({ msg }) {
  return (
    <div className="col-span-3 py-16 text-center border border-dashed border-gray-200 rounded-xl">
      <p className="text-gray-400 text-sm">{msg}</p>
      <a href="/register" className="inline-block mt-4 text-xs font-semibold hover:opacity-80 transition-opacity" style={{ color: '#1A8FD1' }}>
        Be the first to register →
      </a>
    </div>
  )
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [activeTab, setActiveTab] = useState('products')
  const [directory, setDirectory] = useState({ products: [], schools: [], ngos: [] })
  const [dirLoading, setDirLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    Promise.all([
      fetchPublic('/products/available'),
      fetchPublic('/schools'),
      fetchPublic('/ngos'),
    ]).then(([products, schools, ngos]) => {
      setDirectory({ products, schools, ngos })
      setDirLoading(false)
    })
  }, [])

  const stats = [
    { value: '500+', label: 'Schools Connected' },
    { value: '200+', label: 'NGOs Empowered' },
    { value: '1,200+', label: 'Startups Launched' },
    { value: '50L+', label: 'Rupees Donated' },
  ]

  const features = [
    {
      Icon: Icons.School,
      title: 'Schools',
      desc: 'Post resource needs, celebrate milestones, and connect with donors who are invested in the future of education.',
      accent: 'blue',
    },
    {
      Icon: Icons.NGO,
      title: 'NGOs',
      desc: 'Plan campaigns, coordinate volunteers, and mobilize community support for the causes that matter most.',
      accent: 'green',
    },
    {
      Icon: Icons.Startup,
      title: 'Startups',
      desc: 'List your social-impact products, reach a motivated customer base, and grow your purpose-driven business.',
      accent: 'blue',
    },
    {
      Icon: Icons.Donor,
      title: 'Donors',
      desc: 'Browse verified causes, contribute directly, and get clear visibility into where every rupee goes.',
      accent: 'green',
    },
  ]

  const steps = [
    {
      num: '01',
      title: 'Create an Account',
      desc: 'Sign up in under two minutes. Choose your role — School, NGO, Startup, or Donor — and complete your profile.',
      color: '#1A8FD1',
    },
    {
      num: '02',
      title: 'Get Verified',
      desc: 'Our admin team reviews and approves your organization, ensuring every member meets our trust standards.',
      color: '#5BBE00',
    },
    {
      num: '03',
      title: 'Create Impact',
      desc: 'Post needs, launch campaigns, list products, or donate. Every action strengthens the community.',
      color: '#1A8FD1',
    },
  ]

  const testimonials = [
    {
      quote: 'Inclusive Connect helped our school raise funds for a computer lab in just three weeks. The platform is simple and trustworthy.',
      author: 'Priya Sharma',
      role: 'Principal, Delhi Public School',
      tag: 'School',
    },
    {
      quote: 'As an NGO we struggled to reach donors. This platform gave us visibility and a structured way to run campaigns.',
      author: 'Amit Desai',
      role: 'Director, Asha Foundation',
      tag: 'NGO',
    },
    {
      quote: 'We listed our eco-friendly products on the marketplace and saw immediate traction from the donor community.',
      author: 'Riya Kapoor',
      role: 'Co-founder, GreenLeaf Startup',
      tag: 'Startup',
    },
  ]

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Navbar ─────────────────────────────────── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-sm border-b border-gray-100' : 'bg-white/0'}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5">
            <div className="flex items-center">
              <div className="w-4 h-7 rounded-sm" style={{ backgroundColor: '#1A8FD1', clipPath: 'polygon(0 0, 60% 0, 100% 50%, 60% 100%, 0 100%, 40% 50%)' }}></div>
              <div className="w-4 h-7 rounded-sm -ml-1" style={{ backgroundColor: '#5BBE00', clipPath: 'polygon(40% 0, 100% 0, 100% 100%, 40% 100%, 0 50%)' }}></div>
            </div>
            <span className="font-bold text-gray-900 text-sm tracking-tight">Inclusive Connect</span>
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How It Works</a>
            <a href="#directory" className="hover:text-gray-900 transition-colors font-semibold" style={{ color: '#5BBE00' }}>Directory</a>
            <a href="#impact" className="hover:text-gray-900 transition-colors">Impact</a>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <a href="/dashboard" style={{ backgroundColor: '#1A8FD1' }} className="text-white px-5 py-2.5 rounded text-sm font-semibold hover:opacity-90 transition-opacity">
                Dashboard
              </a>
            ) : (
              <>
                <a href="/login" className="text-gray-500 hover:text-gray-900 px-4 py-2.5 rounded text-sm font-medium transition-colors">
                  Sign In
                </a>
                <a href="/register" style={{ backgroundColor: '#1A8FD1' }} className="text-white px-5 py-2.5 rounded text-sm font-semibold hover:opacity-90 transition-opacity">
                  Get Started
                </a>
              </>
            )}
          </div>

          <button className="md:hidden text-gray-600" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <Icons.X /> : <Icons.Menu />}
          </button>
        </div>

        {mobileMenu && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-5 space-y-4">
            <a href="#features" className="block text-sm text-gray-600">Features</a>
            <a href="#how-it-works" className="block text-sm text-gray-600">How It Works</a>
            <a href="/login" className="block text-sm text-gray-600">Sign In</a>
            <a href="/register" className="block text-white text-sm font-semibold px-4 py-2.5 rounded text-center" style={{ backgroundColor: '#1A8FD1' }}>
              Get Started
            </a>
          </div>
        )}
      </nav>

      {/* ── Hero ───────────────────────────────────── */}
      <section className="pt-40 pb-24" style={{ backgroundColor: '#F0F8FF' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full mb-8 border"
              style={{ color: '#1A8FD1', borderColor: '#1A8FD1', backgroundColor: '#E8F4FC' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#5BBE00' }}></span>
              Community Platform
            </span>

            <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-none tracking-tight mb-8">
              Where Communities<br />
              <span style={{ color: '#1A8FD1' }}>Come Together</span>
            </h1>

            <p className="text-xl text-gray-500 leading-relaxed max-w-xl mb-10">
              A single platform connecting schools, NGOs, startups, and donors to
              collaborate, fund, and build a more inclusive India.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="/register"
                className="inline-flex items-center gap-2 text-white px-7 py-4 rounded text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#1A8FD1' }}
              >
                Start for Free <Icons.Arrow />
              </a>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-7 py-4 rounded text-sm font-semibold transition-colors border"
                style={{ color: '#5BBE00', borderColor: '#5BBE00', backgroundColor: 'transparent' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F0FBE8' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {stats.map((s, i) => (
              <div key={s.label} className={`px-8 py-7 ${i < stats.length - 1 ? 'border-r border-gray-100' : ''}`}>
                <div className="text-3xl font-black mb-1" style={{ color: i % 2 === 0 ? '#1A8FD1' : '#5BBE00' }}>
                  {s.value}
                </div>
                <div className="text-sm text-gray-400 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Divider band ───────────────────────────── */}
      <div className="h-1.5 w-full" style={{ background: 'linear-gradient(to right, #1A8FD1 50%, #5BBE00 50%)' }}></div>

      {/* ── Features ───────────────────────────────── */}
      <section id="features" className="py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16">
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#1A8FD1' }}>
              Platform
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-5">
              One platform, four voices.
            </h2>
            <p className="text-lg text-gray-500 max-w-lg">
              Every participant has a dedicated set of tools designed for their specific community role.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f) => {
              const color = f.accent === 'blue' ? '#1A8FD1' : '#5BBE00'
              const bg = f.accent === 'blue' ? '#E8F4FC' : '#EEF8E0'
              return (
                <div
                  key={f.title}
                  className="group bg-white border border-gray-100 rounded-xl p-8 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div
                    className="w-11 h-11 rounded-lg flex items-center justify-center mb-6"
                    style={{ backgroundColor: bg, color }}
                  >
                    <f.Icon />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-5">{f.desc}</p>
                  <div className="flex items-center gap-2 text-xs font-semibold transition-colors" style={{ color }}>
                    <span>Learn more</span>
                    <Icons.Arrow />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────── */}
      <section id="how-it-works" className="py-28" style={{ backgroundColor: '#F7FAFD' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16">
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#5BBE00' }}>
              Process
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900">
              Up and running in three steps.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map((s, i) => (
              <div key={s.num} className="relative bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
                {/* Top colored bar */}
                <div className="h-1 w-12 rounded-full mb-6" style={{ backgroundColor: s.color }}></div>
                <div className="text-5xl font-black mb-5 leading-none" style={{ color: `${s.color}20` }}>
                  {s.num}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-3">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>

                {i < steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-5 top-10 z-10 w-10 h-10 rounded-full items-center justify-center border border-gray-200 bg-white shadow-sm text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Impact section ─────────────────────────── */}
      <section id="impact" className="py-28" style={{ backgroundColor: '#0D2B45' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-5" style={{ color: '#5BBE00' }}>
                Impact
              </p>
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">
                Real numbers.<br />Real change.
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                Since launch, Inclusive Connect has facilitated thousands of connections
                between those who give and those who need — all verified and transparent.
              </p>
              <div className="space-y-3">
                {[
                  'Admin-verified organizations only',
                  'Full donation trail and reporting',
                  'Direct communication between parties',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-gray-300">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#5BBE00', color: '#fff' }}>
                      <Icons.Check />
                    </div>
                    {item}
                  </div>
                ))}
              </div>

              <a
                href="/register"
                className="inline-flex items-center gap-2 mt-10 text-sm font-semibold px-6 py-3.5 rounded text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#1A8FD1' }}
              >
                Join the Platform <Icons.Arrow />
              </a>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className="rounded-xl p-7"
                  style={{ backgroundColor: i % 2 === 0 ? 'rgba(26,143,209,0.12)' : 'rgba(91,190,0,0.12)', border: `1px solid ${i % 2 === 0 ? 'rgba(26,143,209,0.25)' : 'rgba(91,190,0,0.25)'}` }}
                >
                  <div className="text-4xl font-black mb-2" style={{ color: i % 2 === 0 ? '#5cb8ff' : '#91e23e' }}>
                    {s.value}
                  </div>
                  <div className="text-sm text-gray-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────── */}
      <section className="py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16">
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#1A8FD1' }}>
              Testimonials
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900">
              Trusted by the community.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={t.author} className="rounded-xl border border-gray-100 p-8 hover:shadow-md transition-shadow">
                {/* Tag pill */}
                <span
                  className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-6"
                  style={{
                    backgroundColor: i % 2 === 0 ? '#E8F4FC' : '#EEF8E0',
                    color: i % 2 === 0 ? '#1A8FD1' : '#5BBE00',
                  }}
                >
                  {t.tag}
                </span>
                <p className="text-gray-600 text-sm leading-relaxed mb-8">"{t.quote}"</p>
                <div>
                  <div className="text-sm font-bold text-gray-900">{t.author}</div>
                  <div className="text-xs text-gray-400 mt-1">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Community Directory ─────────────────── */}
      <section id="directory" className="py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-10">
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#5BBE00' }}>
              Community Directory
            </p>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900">
                  Browse without signing in.
                </h2>
                <p className="text-gray-500 mt-3 text-lg max-w-xl">
                  Explore products from startups, schools seeking support, and NGOs making a difference — all verified by our team.
                </p>
              </div>
              <a href="/register" className="shrink-0 text-sm font-semibold text-white px-5 py-3 rounded hover:opacity-90 transition-opacity" style={{ backgroundColor: '#1A8FD1' }}>
                Join to Contribute
              </a>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-8">
            {[
              { key: 'products', label: 'Products', count: directory.products.length },
              { key: 'schools', label: 'Schools', count: directory.schools.length },
              { key: 'ngos', label: 'NGOs', count: directory.ngos.length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold transition-all duration-200"
                style={activeTab === tab.key
                  ? { backgroundColor: '#1A8FD1', color: '#fff' }
                  : { backgroundColor: 'transparent', color: '#6b7280' }
                }
              >
                {tab.label}
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                  style={activeTab === tab.key
                    ? { backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }
                    : { backgroundColor: '#e5e7eb', color: '#6b7280' }
                  }
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Content */}
          {dirLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-44 bg-gray-100 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <>
              {/* ── Products Grid ── */}
              {activeTab === 'products' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {directory.products.length === 0 ? (
                    <EmptyState msg="No products listed yet. Check back soon." />
                  ) : (
                    directory.products.slice(0, 9).map((p) => (
                      <div key={p.id} className="border border-gray-100 rounded-xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#EEF8E0', color: '#5BBE00' }}>
                            {p.category || 'Product'}
                          </span>
                          <span className="text-sm font-black" style={{ color: '#1A8FD1' }}>
                            ₹{Number(p.price).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1.5 group-hover:text-gray-700 transition-colors">{p.name}</h3>
                        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{p.description || 'No description provided.'}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-xs text-gray-400">{p.stockQuantity} in stock</span>
                          <a href="/register" className="text-xs font-semibold hover:opacity-80 transition-opacity" style={{ color: '#1A8FD1' }}>
                            Buy now →
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ── Schools Grid ── */}
              {activeTab === 'schools' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {directory.schools.length === 0 ? (
                    <EmptyState msg="No schools registered yet." />
                  ) : (
                    directory.schools.slice(0, 9).map((s) => (
                      <div key={s.id} className="border border-gray-100 rounded-xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer"
                        onClick={() => window.location.href = `/schools/${s.id}`}>
                        <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                          <div className="flex flex-wrap gap-1.5">
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#E8F4FC', color: '#1A8FD1' }}>
                              School
                            </span>
                            {s.specialSchool && (
                              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#FCE4EC', color: '#C62828' }}>
                                Special School
                              </span>
                            )}
                          </div>
                          {s.verified && (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1" style={{ backgroundColor: '#EEF8E0', color: '#5BBE00' }}>
                              <Icons.Check /> Verified
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1.5 group-hover:text-gray-700 transition-colors">{s.name}</h3>
                        <p className="text-xs text-gray-400 mb-2">{[s.city, s.state].filter(Boolean).join(', ') || s.address}</p>
                        {s.specialSchool && s.disabilityTypes && (
                          <p className="text-xs mb-2" style={{ color: '#C62828' }}>Supports: {s.disabilityTypes}</p>
                        )}
                        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{s.description || 'A school seeking community support.'}</p>
                        <div className="mt-4">
                          <span className="text-xs font-semibold group-hover:opacity-70 transition-opacity" style={{ color: '#1A8FD1' }}>
                            View details →
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ── NGOs Grid ── */}
              {activeTab === 'ngos' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {directory.ngos.length === 0 ? (
                    <EmptyState msg="No NGOs registered yet." />
                  ) : (
                    directory.ngos.slice(0, 9).map((n) => (
                      <div key={n.id} className="border border-gray-100 rounded-xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#EEF8E0', color: '#5BBE00' }}>
                            NGO
                          </span>
                          {n.verified && (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1" style={{ backgroundColor: '#E8F4FC', color: '#1A8FD1' }}>
                              <Icons.Check /> Verified
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1.5">{n.name}</h3>
                        <p className="text-xs text-gray-400 mb-2">{[n.city, n.state].filter(Boolean).join(', ') || n.address}</p>
                        {n.mission && <p className="text-xs text-gray-400 italic line-clamp-2">"{n.mission}"</p>}
                        <div className="mt-4">
                          <a href="/register" className="text-xs font-semibold hover:opacity-80 transition-opacity" style={{ color: '#5BBE00' }}>
                            Donate or Volunteer →
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* View all link */}
              <div className="mt-8 text-center">
                <a href="/register" className="inline-flex items-center gap-2 text-sm font-semibold border rounded px-6 py-3 transition-colors hover:bg-gray-50"
                  style={{ color: '#1A8FD1', borderColor: '#1A8FD1' }}>
                  Sign up to see all listings <Icons.Arrow />
                </a>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────── */}
      <section className="py-28" style={{ backgroundColor: '#F0F8FF' }}>
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold tracking-widest uppercase mb-6" style={{ color: '#1A8FD1' }}>
            Get Started
          </p>
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
            Ready to make<br />
            <span style={{ color: '#5BBE00' }}>a difference?</span>
          </h2>
          <p className="text-gray-500 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
            Join thousands of schools, NGOs, startups, and donors already building a 
            stronger and more inclusive community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="inline-flex items-center justify-center gap-2 text-white px-9 py-4 rounded text-sm font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#1A8FD1' }}
            >
              Create Your Account <Icons.Arrow />
            </a>
            <a
              href="/marketplace"
              className="inline-flex items-center justify-center gap-2 px-9 py-4 rounded text-sm font-semibold border transition-colors"
              style={{ color: '#5BBE00', borderColor: '#5BBE00' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#EEF8E0' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              Explore Marketplace
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────── */}
      <footer style={{ backgroundColor: '#0D2B45' }} className="text-white py-14">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex items-center">
                  <div className="w-4 h-7 rounded-sm" style={{ backgroundColor: '#1A8FD1', clipPath: 'polygon(0 0, 60% 0, 100% 50%, 60% 100%, 0 100%, 40% 50%)' }}></div>
                  <div className="w-4 h-7 rounded-sm -ml-1" style={{ backgroundColor: '#5BBE00', clipPath: 'polygon(40% 0, 100% 0, 100% 100%, 40% 100%, 0 50%)' }}></div>
                </div>
                <span className="font-bold text-sm">Inclusive Connect</span>
              </div>
              <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                Connecting schools, NGOs, startups, and donors to build a more inclusive India.
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-12 text-sm text-gray-400">
              <div className="space-y-2.5">
                <div className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">Platform</div>
                <a href="/register" className="block hover:text-white transition-colors">Register</a>
                <a href="/login" className="block hover:text-white transition-colors">Sign In</a>
                <a href="/marketplace" className="block hover:text-white transition-colors">Marketplace</a>
              </div>
              <div className="space-y-2.5">
                <div className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">Community</div>
                <a href="#features" className="block hover:text-white transition-colors">Features</a>
                <a href="#how-it-works" className="block hover:text-white transition-colors">How It Works</a>
                <a href="#impact" className="block hover:text-white transition-colors">Impact</a>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">© 2025 Inclusive Connect. All rights reserved.</p>
            <div className="h-0.5 w-24 rounded-full" style={{ background: 'linear-gradient(to right, #1A8FD1, #5BBE00)' }}></div>
            <p className="text-xs text-gray-600">Empowering Change across India.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
