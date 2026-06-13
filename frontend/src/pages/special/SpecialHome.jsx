import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const BASE = '/api'
const G = '#16a34a'
const NAVY = '#0f172a'

const authHdr = () => {
  const t = localStorage.getItem('token')
  return t ? { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` } : { 'Content-Type': 'application/json' }
}
const get = url => fetch(url, { headers: authHdr() }).then(r => r.ok ? r.json() : []).catch(() => [])

/* ── SVG Icon Paths ── */
const ICON_PATHS = {
  briefcase: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  services: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.066z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  training: 'M12 6.253v13m0-13C10.832 5.483 9.246 5 7.5 5 4.462 5 2 6.79 2 9v11c0-2.21 2.462-4 5.5-4 1.746 0 3.332.483 4.5 1.253m0-13C13.168 5.483 14.754 5 16.5 5c3.038 0 5.5 1.79 5.5 4v11c0 2.21-2.462 4-5.5 4-1.746 0-3.332-.483-4.5-1.253',
  ngo: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  events: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  schemes: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
  trending: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  cart: 'M3 3h2l.4 2M7 13h10l3-8H6.4M7 13l-1 5h12m-11 0a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2z',
  arrow: 'M13 7l5 5m0 0l-5 5m5-5H6',
  shop: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
}

function SvgIcon({ name, size = 20, color = '#64748b', strokeWidth = 1.7 }) {
  const d = ICON_PATHS[name]
  if (!d) return null
  return (
    <svg width={size} height={size} fill="none" stroke={color} strokeWidth={strokeWidth} viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  )
}

/* ── Key Services Config ── */
const KEY_SERVICES = [
  { icon: 'briefcase', title: 'Jobs', desc: 'Curated inclusive job openings across major sectors.', to: '/special/jobs', color: '#64748b' },
  { icon: 'services', title: 'Services', desc: 'Essential support tools and professional services.', to: '/special/ngos', color: '#16a34a' },
  { icon: 'training', title: 'Training', desc: 'Skill-building workshops and certifications.', to: '/special/training', color: '#0ea5e9' },
  { icon: 'ngo', title: 'NGOs', desc: 'Connect with organizations making a real impact.', to: '/special/ngos', color: '#8b5cf6' },
  { icon: 'events', title: 'Events', desc: 'Inclusive networking and social gatherings.', to: '/special/events', color: '#0d9488' },
  { icon: 'schemes', title: 'Schemes', desc: 'Stay updated on the latest empowerment programs.', to: '/special/schemes', color: '#d97706' },
]

/* ── Service Card ── */
function ServiceCard({ service }) {
  const navigate = useNavigate()
  const [hov, setHov] = useState(false)
  return (
    <button
      type="button"
      onClick={() => navigate(service.to)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', flexDirection: 'column', gap: 12, padding: 20,
        background: '#fff', borderRadius: 16, border: `1.5px solid ${hov ? '#e2e8f0' : '#f1f5f9'}`,
        cursor: 'pointer', textAlign: 'left', transition: 'all .2s',
        boxShadow: hov ? '0 4px 20px rgba(0,0,0,.06)' : '0 1px 3px rgba(0,0,0,.03)',
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: `${service.color}10`, border: `1px solid ${service.color}20`,
      }}>
        <SvgIcon name={service.icon} size={22} color={service.color} />
      </div>
      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: NAVY }}>{service.title}</h3>
      <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.55 }}>{service.desc}</p>
    </button>
  )
}

/* ── Active Postings Timeline ── */
const ACTIVE_POSTINGS = [
  { id: 1, time: '2 Hours Ago', title: 'UX Designer Wanted', org: 'Inclusive Tech Corp • Remote', tag: 'New Listing', tagColor: G },
  { id: 2, time: 'Yesterday', title: 'Web Accessibility Seminar', org: 'Govt Empowerment Program', tag: 'Register Now', tagColor: '#dc2626' },
  { id: 3, time: '2 Days Ago', title: 'Marketing Internship', org: 'Future Focus NGO', tag: null, tagColor: null },
  { id: 4, time: 'Last Week', title: 'Career Mentorship Open', org: 'Apply for 1-on-1 sessions', tag: null, tagColor: null },
]

function ActivePostings() {
  const navigate = useNavigate()
  return (
    <div style={{
      background: '#fff', borderRadius: 16, border: '1.5px solid #f1f5f9',
      padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,.04)', height: 'fit-content',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <SvgIcon name="trending" size={18} color={G} strokeWidth={2} />
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: NAVY }}>Active Postings</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {ACTIVE_POSTINGS.map((post, idx) => (
          <div key={post.id} style={{ display: 'flex', gap: 14, paddingBottom: idx < ACTIVE_POSTINGS.length - 1 ? 18 : 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: idx === 0 ? G : '#cbd5e1', marginTop: 4, flexShrink: 0 }} />
              {idx < ACTIVE_POSTINGS.length - 1 && <div style={{ width: 1, flex: 1, background: '#e2e8f0', marginTop: 4 }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{post.time}</p>
              <p style={{ margin: '3px 0 2px', fontSize: 14, fontWeight: 700, color: NAVY }}>{post.title}</p>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>{post.org}</p>
              {post.tag && (
                <span style={{
                  display: 'inline-block', marginTop: 6, fontSize: 10, fontWeight: 700,
                  padding: '3px 10px', borderRadius: 6,
                  background: `${post.tagColor}15`, color: post.tagColor,
                }}>{post.tag}</span>
              )}
              {!post.tag && idx === 2 && (
                <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                  {[G, '#0ea5e9', '#f59e0b'].map((c, i) => (
                    <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => navigate('/special/jobs')}
        style={{
          width: '100%', marginTop: 20, padding: '10px 16px', borderRadius: 10,
          border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, color: '#374151', transition: 'all .15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1' }}
        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0' }}
      >
        View All Activity
      </button>
    </div>
  )
}

/* ── Product Card for Marketplace Highlights ── */
function ProductCard({ product }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        minWidth: 200, maxWidth: 220, background: '#fff', borderRadius: 14,
        border: `1.5px solid ${hov ? '#e2e8f0' : '#f1f5f9'}`,
        overflow: 'hidden', cursor: 'pointer', transition: 'all .2s',
        boxShadow: hov ? '0 4px 16px rgba(0,0,0,.06)' : '0 1px 3px rgba(0,0,0,.03)',
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
        flexShrink: 0,
      }}
    >
      <div style={{ height: 160, background: '#f1f5f9', overflow: 'hidden' }}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 36 }}>📦</div>
        )}
      </div>
      <div style={{ padding: '14px 16px' }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: NAVY, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</p>
        <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>By {product.sourceName || 'Community'}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: NAVY }}>₹{Number(product.price || 0).toFixed(2)}</span>
          <div style={{
            width: 32, height: 32, borderRadius: 8, border: '1.5px solid #e2e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff',
          }}>
            <SvgIcon name="cart" size={16} color="#64748b" />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════ MAIN COMPONENT ═══════════ */
export default function SpecialHome() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [prodLoading, setProdLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await get(`${BASE}/products/all-available`)
        const list = Array.isArray(data) ? data : []
        setProducts(list.slice(0, 6).map(p => ({
          ...p,
          sourceName: p.sourceDetails?.name || (p.source === 'STARTUP' ? 'Startup' : 'NGO'),
        })))
      } finally { setProdLoading(false) }
    }
    load()
  }, [])

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');`}</style>

      {/* ═══════ HERO SECTION ═══════ */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginBottom: 48 }} className="special-hero-grid">
        {/* Left - Welcome */}
        <div style={{
          background: 'linear-gradient(145deg, #f0fdf4 0%, #f8fdf5 50%, #ecfdf5 100%)',
          borderRadius: 20, padding: '40px 44px', position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative circle */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(22,163,74,.06)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(22,163,74,.04)', pointerEvents: 'none' }} />

          <span style={{
            display: 'inline-block', fontSize: 11, fontWeight: 700, color: '#fff',
            background: G, padding: '5px 14px', borderRadius: 8, marginBottom: 20,
            letterSpacing: '0.03em',
          }}>Welcome Back</span>

          <h1 style={{ margin: '0 0 16px', fontSize: 34, fontWeight: 800, color: NAVY, lineHeight: 1.25, maxWidth: 420 }}>
            Empowering Your{' '}
            <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 700 }}>Journey</span>
            {' '}Without Limits.
          </h1>

          <p style={{ margin: '0 0 28px', fontSize: 14, color: '#64748b', lineHeight: 1.7, maxWidth: 420 }}>
            Access inclusive job markets, essential services, and educational resources tailored to your unique potential.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/special/jobs')}
              style={{
                padding: '11px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: NAVY, color: '#fff', fontSize: 13, fontWeight: 700,
                transition: 'transform .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >Explore Services</button>
            <button
              onClick={() => navigate('/special/profile')}
              style={{
                padding: '11px 24px', borderRadius: 10, cursor: 'pointer',
                background: '#fff', color: NAVY, fontSize: 13, fontWeight: 700,
                border: '1.5px solid #e2e8f0', transition: 'all .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'translateY(0)' }}
            >My Workspace</button>
          </div>
        </div>

        {/* Right - Quick Stats */}
        <div style={{
          background: '#fff', borderRadius: 20, border: '1.5px solid #f1f5f9',
          padding: 28, display: 'flex', flexDirection: 'column', gap: 18,
          boxShadow: '0 1px 4px rgba(0,0,0,.04)',
        }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: NAVY }}>Quick Stats</h3>

          {/* Profile completion */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Profile Completion</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: G }}>85%</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: '#f1f5f9', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '85%', borderRadius: 4, background: `linear-gradient(90deg, ${G}, #22c55e)`, transition: 'width .6s ease' }} />
            </div>
          </div>

          {/* Connections */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex' }}>
              {['#16a34a', '#0ea5e9', '#f59e0b'].map((c, i) => (
                <div key={i} style={{
                  width: 28, height: 28, borderRadius: '50%', background: c,
                  border: '2px solid #fff', marginLeft: i > 0 ? -8 : 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#fff',
                }}>{['K', 'A', 'R'][i]}</div>
              ))}
            </div>
            <span style={{ fontSize: 13, color: '#64748b' }}>+12 New Connections</span>
          </div>

          <div style={{ flex: 1 }} />

          {/* View Dashboard link */}
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, background: 'none',
              border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151',
              padding: 0, transition: 'color .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = G}
            onMouseLeave={e => e.currentTarget.style.color = '#374151'}
          >
            View Dashboard
            <SvgIcon name="arrow" size={16} color="currentColor" />
          </button>
        </div>
      </section>

      {/* ═══════ KEY SERVICES + ACTIVE POSTINGS ═══════ */}
      <section style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: NAVY }}>Key Services</h2>
          <button
            onClick={() => navigate('/special/ngos')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#64748b' }}
            onMouseEnter={e => e.currentTarget.style.color = G}
            onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
          >See All</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }} className="special-services-grid">
          {/* Services grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }} className="special-cards-grid">
            {KEY_SERVICES.map(s => <ServiceCard key={s.title} service={s} />)}
          </div>
          {/* Active Postings */}
          <ActivePostings />
        </div>
      </section>

      {/* ═══════ MARKETPLACE HIGHLIGHTS ═══════ */}
      <section style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: NAVY }}>Marketplace Highlights</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#94a3b8' }}>Support businesses led by the community</p>
          </div>
          <button
            onClick={() => navigate('/special/marketplace')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 18px', borderRadius: 10, border: '1.5px solid #e2e8f0',
              background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151',
              transition: 'all .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0' }}
          >
            Browse Store
            <SvgIcon name="shop" size={16} color="#64748b" />
          </button>
        </div>

        {prodLoading ? (
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ minWidth: 200, height: 260, borderRadius: 14, background: '#f1f5f9', flexShrink: 0 }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8', fontSize: 14 }}>No products available yet.</div>
        ) : (
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }} className="special-products-scroll">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* ── Responsive styles ── */}
      <style>{`
        .special-hero-grid { grid-template-columns: 1fr 320px !important; }
        .special-services-grid { grid-template-columns: 1fr 320px !important; }
        .special-cards-grid { grid-template-columns: repeat(3, 1fr) !important; }
        .special-products-scroll::-webkit-scrollbar { height: 4px; }
        .special-products-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .special-products-scroll::-webkit-scrollbar-track { background: transparent; }

        @media (max-width: 1024px) {
          .special-hero-grid { grid-template-columns: 1fr !important; }
          .special-services-grid { grid-template-columns: 1fr !important; }
          .special-cards-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .special-cards-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
