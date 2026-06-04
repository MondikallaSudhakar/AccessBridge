import { useEffect, useMemo, useState } from 'react'
import api from '../../services/api'
import { useCart } from '../../context/CartContext'

const GREEN = '#5BCB2B'
const NAVY = '#0f172a'

const normalizeProduct = (p) => ({
  ...p,
  stockQuantity: Number(p?.stockQuantity ?? 0),
  price: Number(p?.price ?? 0),
  source: String(p?.source || p?.sourceType || 'UNKNOWN').toUpperCase(),
})

const FILTERS = ['All', 'NGO', 'Startup', 'Hardware', 'Software']
const SORT_OPTIONS = ['Recently Added', 'Price: Low to High', 'Price: High to Low', 'Name A-Z']
const PAGE_SIZE = 6

export default function Marketplace() {
  const { addToCart } = useCart()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [cartMessage, setCartMessage] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [sortBy, setSortBy] = useState('Recently Added')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [availableProducts, startups] = await Promise.all([
          api.get('/products/all-available').catch(() => []),
          api.get('/startups').catch(() => []),
        ])
        const merged = new Map()
        const addProduct = (product, sourceDetails, sourceOverride) => {
          if (!product) return
          const normalized = normalizeProduct({
            ...product,
            ...(sourceOverride ? { source: sourceOverride } : {}),
            ...(sourceDetails ? { sourceDetails } : {}),
          })
          const key = `${normalized.source || 'UNKNOWN'}-${normalized.id}`
          if (!merged.has(key)) merged.set(key, normalized)
        }
        const startupList = Array.isArray(startups) ? startups : []
        await Promise.all(startupList.map(async (startup) => {
          try {
            const rows = await api.get(`/products/startup/${startup.id}`).catch(() => [])
            ;(Array.isArray(rows) ? rows : []).forEach((p) => addProduct(p, { id: startup.id, name: startup.name }, 'STARTUP'))
          } catch {}
        }))
        ;(Array.isArray(availableProducts) ? availableProducts : []).forEach((p) => addProduct(p))
        setProducts([...merged.values()])
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => p.stockQuantity > 0)
    if (activeFilter !== 'All') {
      list = list.filter((p) => {
        if (activeFilter === 'NGO') return p.source === 'NGO'
        if (activeFilter === 'Startup') return p.source === 'STARTUP'
        if (activeFilter === 'Hardware') return (p.category || '').toLowerCase().includes('hardware')
        if (activeFilter === 'Software') return (p.category || '').toLowerCase().includes('software')
        return true
      })
    }
    if (sortBy === 'Price: Low to High') list = [...list].sort((a, b) => a.price - b.price)
    else if (sortBy === 'Price: High to Low') list = [...list].sort((a, b) => b.price - a.price)
    else if (sortBy === 'Name A-Z') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [products, activeFilter, sortBy])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE))
  const paginated = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleFilter = (f) => { setActiveFilter(f); setPage(1) }

  const handleAddToCart = (product) => {
    addToCart(product)
    setCartMessage(`${product.name} added to cart!`)
    setTimeout(() => setCartMessage(''), 2500)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes mpFadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        .mp-fade-up { animation: mpFadeUp 0.4s ease both }
        .mp-card { transition: box-shadow 0.22s, transform 0.22s; border-radius: 14px; overflow:hidden; border:1px solid #e8edf2; background:#fff; display:flex; flex-direction:column; }
        .mp-card:hover { box-shadow: 0 8px 32px rgba(91,203,43,0.13); transform: translateY(-3px); }
        .mp-add-btn { background:${GREEN}; color:#fff; border:none; border-radius:8px; padding:10px 0; font-size:13.5px; font-weight:700; width:100%; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:7px; transition: background 0.15s; }
        .mp-add-btn:hover { background:#47a820; }
        .mp-add-btn:disabled { background:#e2e8f0; color:#94a3b8; cursor:not-allowed; }
        .mp-filter-chip { border:1.5px solid #dbe4ee; background:#fff; border-radius:999px; padding:6px 18px; font-size:13px; font-weight:500; cursor:pointer; transition:all 0.15s; color:#374151; }
        .mp-filter-chip.active { background:${GREEN}; color:#fff; border-color:${GREEN}; font-weight:700; }
        .mp-filter-chip:hover:not(.active) { border-color:${GREEN}; color:${GREEN}; }
        .mp-page-btn { width:34px; height:34px; border-radius:8px; border:1px solid #e2e8f0; background:#fff; font-size:13px; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#374151; transition:all 0.15s; }
        .mp-page-btn.active { background:${GREEN}; color:#fff; border-color:${GREEN}; }
        .mp-page-btn:hover:not(.active):not(:disabled) { border-color:${GREEN}; color:${GREEN}; }
        .mp-page-btn:disabled { opacity:0.4; cursor:not-allowed; }
        .mp-hero-btn-primary { background:${GREEN}; color:#fff; border:none; border-radius:8px; padding:10px 22px; font-size:13.5px; font-weight:700; cursor:pointer; transition:background 0.15s; }
        .mp-hero-btn-primary:hover { background:#47a820; }
        .mp-hero-btn-outline { background:#fff; color:#374151; border:1.5px solid #d1d5db; border-radius:8px; padding:10px 22px; font-size:13.5px; font-weight:600; cursor:pointer; transition:all 0.15s; }
        .mp-hero-btn-outline:hover { border-color:${GREEN}; color:${GREEN}; }
        .mp-toast { position:fixed; top:80px; right:24px; z-index:200; background:#16a34a; color:#fff; padding:12px 22px; border-radius:12px; font-size:14px; font-weight:600; box-shadow:0 8px 24px rgba(0,0,0,0.13); animation: mpFadeUp 0.3s ease; }
        .mp-skeleton { background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius:10px; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .mp-sort-select { border:1.5px solid #dbe4ee; border-radius:8px; padding:6px 30px 6px 12px; font-size:13px; font-weight:500; color:#374151; background:#fff; cursor:pointer; outline:none; appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 10px center; }
        .mp-badge { font-size:10px; font-weight:700; padding:3px 9px; border-radius:999px; text-transform:uppercase; letter-spacing:0.04em; }
      `}</style>

      {cartMessage && <div className="mp-toast">{cartMessage}</div>}

      {/* ── Hero Section ── */}
      <div style={{ background: '#fafafa', borderBottom: '1px solid #f0f4f8', padding: '40px 0 32px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 40, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 36, fontWeight: 900, color: NAVY, lineHeight: 1.15, marginBottom: 14 }}>
              Assistive Product<br />
              <span style={{ color: GREEN }}>Marketplace</span>
            </h1>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, maxWidth: 420, marginBottom: 24 }}>
              Discover life-changing innovations designed for accessibility. From startup prototypes to established NGO solutions, empower your journey with technology that adapts to you.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="mp-hero-btn-primary">Explore Categories</button>
              <button className="mp-hero-btn-outline">Partner With Us</button>
            </div>
          </div>
          <div style={{ width: 280, minHeight: 180, background: '#fff', border: '1px solid #e8edf2', borderRadius: 16, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: 13 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🛍️</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Featured Products</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter + Sort Bar ── */}
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '24px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {FILTERS.map((f) => (
              <button key={f} className={`mp-filter-chip${activeFilter === f ? ' active' : ''}`} onClick={() => handleFilter(f)}>
                {f}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="15" height="15" fill="none" stroke="#6b7280" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 8h10M11 12h2" /></svg>
            <select className="mp-sort-select" value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1) }}>
              {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Product Grid ── */}
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '24px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[1, 2, 3, 4, 5, 6].map((v) => (
              <div key={v} style={{ borderRadius: 14, border: '1px solid #e8edf2', overflow: 'hidden', background: '#fff' }}>
                <div className="mp-skeleton" style={{ height: 200, borderRadius: 0 }} />
                <div style={{ padding: '16px' }}>
                  <div className="mp-skeleton" style={{ height: 16, width: '70%', marginBottom: 10 }} />
                  <div className="mp-skeleton" style={{ height: 12, width: '90%', marginBottom: 6 }} />
                  <div className="mp-skeleton" style={{ height: 12, width: '60%', marginBottom: 16 }} />
                  <div className="mp-skeleton" style={{ height: 38 }} />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 6 }}>No Products Found</div>
            <div style={{ fontSize: 14 }}>Try adjusting your filters.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {paginated.map((product, i) => {
              const isNgo = product.source === 'NGO'
              const isStartup = product.source === 'STARTUP'
              const isSub = product.subscriptionBased || (product.price && String(product.price).includes('/yr'))
              return (
                <div key={`${product.source}-${product.id}`} className="mp-card mp-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
                  {/* Image */}
                  <div style={{ position: 'relative', height: 200, background: '#f8fafc', overflow: 'hidden' }}>
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, color: '#cbd5e1' }}>📦</div>
                    )}
                    {/* Source badge top-left */}
                    <span className="mp-badge" style={{ position: 'absolute', top: 10, left: 10, background: isStartup ? '#e0f2fe' : '#f0fdf4', color: isStartup ? '#0369a1' : '#16a34a' }}>
                      {isStartup ? 'Startup' : isNgo ? 'NGO' : product.source}
                    </span>
                    {/* Category / New badge top-right */}
                    {product.category && (
                      <span className="mp-badge" style={{ position: 'absolute', top: 10, right: 10, background: '#fff', color: '#374151', border: '1px solid #e2e8f0' }}>
                        {product.category}
                      </span>
                    )}
                  </div>
                  {/* Body */}
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, margin: 0, lineHeight: 1.3, flex: 1, marginRight: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {product.name}
                      </h3>
                      <span style={{ fontSize: 15, fontWeight: 800, color: GREEN, whiteSpace: 'nowrap', flexShrink: 0 }}>
                        ${Number(product.price).toLocaleString()}{isSub ? '/yr' : ''}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 10, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {product.description}
                    </p>
                    <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 14 }}>
                      By: <span style={{ color: '#374151', fontWeight: 600 }}>{product.sourceDetails?.name || product.source}</span>
                    </p>
                    <button
                      className="mp-add-btn"
                      disabled={product.stockQuantity <= 0}
                      onClick={() => handleAddToCart(product)}
                    >
                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l3-8H6.4M7 13l-1 5h12m-11 0a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2z" /></svg>
                      {product.stockQuantity > 0 ? (isSub ? 'Subscribe Now' : 'Add to Cart') : 'Unavailable'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Pagination ── */}
        {!loading && filteredProducts.length > PAGE_SIZE && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 40 }}>
            <button className="mp-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => {
              if (totalPages > 5 && n !== 1 && n !== totalPages && Math.abs(n - page) > 1) {
                if (n === 2 || n === totalPages - 1) return <span key={n} style={{ padding: '0 4px', color: '#94a3b8' }}>…</span>
                return null
              }
              return (
                <button key={n} className={`mp-page-btn${page === n ? ' active' : ''}`} onClick={() => setPage(n)}>{n}</button>
              )
            })}
            <button className="mp-page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid #e8edf2', marginTop: 48, padding: '28px 24px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontWeight: 900, color: NAVY, fontSize: 15, marginBottom: 3 }}>KnotneX</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>© 2024 KnotneX. Empowering accessibility through innovation.</div>
          </div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
            {['About Us', 'Contact', 'Privacy Policy', 'Terms of Service', 'Help Center'].map((link) => (
              <a key={link} href="#" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', fontWeight: 500 }}
                onMouseEnter={(e) => e.currentTarget.style.color = GREEN}
                onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}>{link}</a>
            ))}
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" /></svg>
              </button>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49" /></svg>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
