import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OPPORTUNITIES, loadBookmarks, toggleBookmark } from './specialData'

const BASE = 'http://localhost:8081/api'
const G = '#16a34a'

/* ── Shared generic card (for non-marketplace tabs) ── */
function OpportunityCard({ item, bookmarked, onBookmark, onPrimary, primaryLabel, secondaryLabel }) {
  return (
    <article style={{ background:'#fff', borderRadius:16, border:'1px solid #e2e8f0', padding:18, boxShadow:'0 1px 4px rgba(0,0,0,.06)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', gap:10 }}>
        <div>
          <p style={{ margin:0, fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#94a3b8' }}>{item.place}</p>
          <h4 style={{ margin:'4px 0 2px', fontSize:15, fontWeight:800, color:'#0f172a' }}>{item.title}</h4>
          <p style={{ margin:0, fontSize:12, fontWeight:600, color:'#64748b' }}>{item.org}</p>
        </div>
        <button type="button" onClick={onBookmark}
          style={{ border:`1px solid ${bookmarked?G:'#cbd5e1'}`, borderRadius:20, padding:'4px 12px', fontSize:11, fontWeight:700, cursor:'pointer', background:'none', color: bookmarked?G:'#64748b', whiteSpace:'nowrap' }}>
          {bookmarked ? 'Saved' : 'Save'}
        </button>
      </div>
      <p style={{ margin:'10px 0 14px', fontSize:13, color:'#64748b', lineHeight:1.6 }}>{item.summary}</p>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        <button type="button" onClick={onPrimary}
          style={{ background:G, color:'#fff', border:'none', borderRadius:9, padding:'8px 14px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
          {primaryLabel}
        </button>
        <button type="button" onClick={onBookmark}
          style={{ border:`1px solid ${G}`, color:G, background:'none', borderRadius:9, padding:'8px 14px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
          {secondaryLabel}
        </button>
      </div>
    </article>
  )
}

/* ── Product card for marketplace ── */
function ProductCard({ product, onContact }) {
  const [imgErr, setImgErr] = useState(false)
  const price = product.price != null ? `₹${Number(product.price).toLocaleString('en-IN')}` : 'Free'
  const inStock = product.stockQuantity > 0
  const source = product._source || 'NGO'

  return (
    <article style={{ background:'#fff', borderRadius:16, border:'1px solid #e2e8f0', overflow:'hidden', boxShadow:'0 1px 6px rgba(0,0,0,.07)', display:'flex', flexDirection:'column' }}>
      {/* Image */}
      <div style={{ height:160, background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
        {product.imageUrl && !imgErr
          ? <img src={product.imageUrl} alt={product.name} onError={() => setImgErr(true)}
              style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
          : <div style={{ fontSize:40, color:'#cbd5e1' }}>📦</div>
        }
        <span style={{ position:'absolute', top:10, left:10, background: source==='NGO'?`${G}E6`:'#3b82f6E6', color:'#fff', fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:20 }}>{source}</span>
        {!inStock && (
          <span style={{ position:'absolute', top:10, right:10, background:'#ef4444DD', color:'#fff', fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:20 }}>Out of stock</span>
        )}
      </div>
      {/* Body */}
      <div style={{ padding:'14px 16px', flex:1, display:'flex', flexDirection:'column' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, marginBottom:6 }}>
          <h4 style={{ margin:0, fontSize:14, fontWeight:800, color:'#0f172a', lineHeight:1.4 }}>{product.name}</h4>
          <p style={{ margin:0, fontSize:14, fontWeight:800, color:G, whiteSpace:'nowrap' }}>{price}</p>
        </div>
        {product.category && (
          <span style={{ display:'inline-block', fontSize:10, fontWeight:700, color:G, background:`${G}15`, padding:'2px 8px', borderRadius:20, marginBottom:6, alignSelf:'flex-start' }}>{product.category}</span>
        )}
        <p style={{ margin:0, fontSize:12, color:'#64748b', lineHeight:1.6, flex:1 }}>{product.description || 'No description available.'}</p>
        <div style={{ marginTop:12, display:'flex', gap:8 }}>
          <button onClick={onContact} disabled={!inStock}
            style={{ flex:1, background: inStock?G:'#94a3b8', color:'#fff', border:'none', borderRadius:9, padding:'9px 0', fontSize:12, fontWeight:700, cursor: inStock?'pointer':'not-allowed' }}>
            {inStock ? 'Enquire / Buy' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </article>
  )
}

const CONFIG = {
  marketplace: {
    title: 'Marketplace',
    action: 'Buy assistive products listed by NGOs and startups.',
    columns: 3,
  },
  ngos: {
    title: 'Nearby NGOs & services',
    action: 'Find nearby services and open help page to request support.',
    primaryLabel: 'Request NGO help',
    secondaryLabel: 'Save NGO',
    onPrimaryPath: '/special/help',
  },
  training: {
    title: 'Special schools & training programs',
    action: 'Enroll in training programs for skills and independence.',
    primaryLabel: 'Enroll in training',
    secondaryLabel: 'Save program',
    onPrimaryPath: '/search',
  },
  events: {
    title: 'Events',
    action: 'Register for events and accessibility meetups.',
    primaryLabel: 'Register event',
    secondaryLabel: 'Save event',
    onPrimaryPath: '/search',
  },
  campaigns: {
    title: 'Upcoming campaigns',
    action: 'Join inclusion campaigns and awareness drives.',
    primaryLabel: 'Join campaign',
    secondaryLabel: 'Save campaign',
    onPrimaryPath: '/search',
  },
  schemes: {
    title: 'Govt schemes & benefits',
    action: 'Track benefits, documents, and support programs.',
    primaryLabel: 'Open guide',
    secondaryLabel: 'Save scheme',
    onPrimaryPath: '/search',
  },
}

export default function SpecialFeaturePage({ type }) {
  const navigate = useNavigate()
  const [bookmarks, setBookmarks] = useState(loadBookmarks())

  /* ── Marketplace-specific state ── */
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('ALL')
  const [contactMsg, setContactMsg] = useState(null) // { product }

  useEffect(() => {
    if (type !== 'marketplace') return
    setLoadingProducts(true)

    const headers = { 'Content-Type': 'application/json' }
    const token = localStorage.getItem('token')
    if (token) headers['Authorization'] = `Bearer ${token}`

    Promise.all([
      fetch(`${BASE}/products`, { headers }).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(`${BASE}/ngos`, { headers }).then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(async ([startupProds, ngos]) => {
      // Tag startup products
      const tagged = Array.isArray(startupProds)
        ? startupProds.filter(p => p.available).map(p => ({ ...p, _source: 'Startup', _key: `s-${p.id}` }))
        : []

      // Fetch NGO products for each NGO
      const ngoProductArrays = await Promise.all(
        (Array.isArray(ngos) ? ngos : []).map(ngo =>
          fetch(`${BASE}/ngos/${ngo.id}/products`, { headers })
            .then(r => r.ok ? r.json() : [])
            .catch(() => [])
            .then(prods =>
              (Array.isArray(prods) ? prods : [])
                .filter(p => p.available)
                .map(p => ({ ...p, _source: 'NGO', _key: `n-${p.id}`, _ngoName: ngo.name }))
            )
        )
      )
      const ngoProds = ngoProductArrays.flat()

      setProducts([...tagged, ...ngoProds])
    }).finally(() => setLoadingProducts(false))
  }, [type])

  const config = CONFIG[type]
  const items = OPPORTUNITIES[type] || []
  const bookmarkSet = useMemo(() => new Set(bookmarks), [bookmarks])
  const onBookmark = id => setBookmarks(cur => toggleBookmark(cur, id))

  if (!config) {
    return <div style={{ padding:20, color:'#ef4444' }}>Invalid feature route.</div>
  }

  /* ── Marketplace view ── */
  if (type === 'marketplace') {
    const categories = ['ALL', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))]
    const filtered = products.filter(p => {
      const matchCat = catFilter === 'ALL' || p.category === catFilter
      const matchQ = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchQ
    })

    return (
      <section style={{ fontFamily:"'Inter',sans-serif" }}>
        {/* Header */}
        <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e2e8f0', padding:'20px 24px', marginBottom:20, boxShadow:'0 1px 4px rgba(0,0,0,.05)' }}>
          <h2 style={{ margin:'0 0 4px', fontSize:20, fontWeight:900, color:'#0f172a' }}>{config.title}</h2>
          <p style={{ margin:0, fontSize:13, color:'#64748b' }}>{config.action}</p>
        </div>

        {/* Search + filter */}
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:16 }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            style={{ flex:1, minWidth:180, border:'1.5px solid #e2e8f0', borderRadius:10, padding:'9px 14px', fontSize:13, color:'#0f172a', outline:'none', fontFamily:"'Inter',sans-serif" }}
          />
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {categories.map(c => (
              <button key={c} onClick={() => setCatFilter(c)}
                style={{ border:'none', borderRadius:20, padding:'7px 14px', fontSize:12, fontWeight:700, cursor:'pointer',
                  background: catFilter===c ? G : '#f1f5f9',
                  color: catFilter===c ? '#fff' : '#64748b' }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loadingProducts ? (
          <div style={{ textAlign:'center', padding:'60px 0', color:'#94a3b8' }}>
            <div style={{ width:36, height:36, borderRadius:'50%', border:`4px solid ${G}30`, borderTopColor:G, animation:'spin .8s linear infinite', margin:'0 auto 12px' }}/>
            <p style={{ fontSize:14, margin:0 }}>Loading products...</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px', color:'#94a3b8' }}>
            <p style={{ fontSize:32, margin:'0 0 8px' }}>📦</p>
            <p style={{ fontSize:15, fontWeight:700, color:'#0f172a', margin:'0 0 4px' }}>
              {products.length === 0 ? 'No products available yet' : 'No products match your search'}
            </p>
            <p style={{ fontSize:13, margin:0 }}>
              {products.length === 0 ? 'NGOs and startups will list products here.' : 'Try a different search or category.'}
            </p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 }}>
            {filtered.map(p => (
              <ProductCard key={p._key || p.id} product={p} onContact={() => setContactMsg(p)} />
            ))}
          </div>
        )}

        {/* Enquiry modal */}
        {contactMsg && (
          <div onClick={() => setContactMsg(null)}
            style={{ position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(15,23,42,.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:20, boxSizing:'border-box' }}>
            <div onClick={e => e.stopPropagation()}
              style={{ background:'#fff', borderRadius:18, boxShadow:'0 20px 60px rgba(0,0,0,.2)', maxWidth:420, width:'100%', padding:28, position:'relative' }}>
              <button onClick={() => setContactMsg(null)}
                style={{ position:'absolute', top:14, right:14, width:30, height:30, borderRadius:'50%', border:'none', background:'#f1f5f9', cursor:'pointer', fontSize:14, fontWeight:700, color:'#64748b', display:'flex', alignItems:'center', justifyContent:'center' }}>x</button>
              <p style={{ margin:'0 0 4px', fontSize:11, fontWeight:700, color:G, textTransform:'uppercase', letterSpacing:'0.06em' }}>Product Enquiry</p>
              <h3 style={{ margin:'0 0 6px', fontSize:17, fontWeight:900, color:'#0f172a' }}>{contactMsg.name}</h3>
              <p style={{ margin:'0 0 16px', fontSize:13, color:'#64748b' }}>{contactMsg.description}</p>
              <div style={{ background:`${G}10`, borderRadius:10, padding:'12px 14px', marginBottom:16 }}>
                <p style={{ margin:'0 0 4px', fontSize:13, fontWeight:700, color:'#0f172a' }}>Price: <span style={{ color:G }}>{contactMsg.price != null ? `₹${Number(contactMsg.price).toLocaleString('en-IN')}` : 'Free'}</span></p>
                <p style={{ margin:'0 0 4px', fontSize:12, color:'#64748b' }}>Stock: {contactMsg.stockQuantity} units</p>
                <p style={{ margin:0, fontSize:12, color:'#64748b' }}>Source: {contactMsg._source}</p>
              </div>
              <p style={{ margin:'0 0 14px', fontSize:13, color:'#64748b' }}>To enquire or purchase, please contact the listing organisation directly or use the Help section.</p>
              <button onClick={() => { setContactMsg(null); navigate('/special/help') }}
                style={{ width:'100%', background:G, color:'#fff', border:'none', borderRadius:11, padding:'12px', fontSize:14, fontWeight:700, cursor:'pointer' }}>
                Go to Help / Contact
              </button>
            </div>
          </div>
        )}
      </section>
    )
  }

  /* ── Generic tabs (ngos, training, events, campaigns, schemes) ── */
  return (
    <section style={{ background:'#fff', borderRadius:20, border:'1px solid #e2e8f0', padding:20, boxShadow:'0 1px 4px rgba(0,0,0,.05)' }}>
      <h2 style={{ margin:'0 0 4px', fontSize:20, fontWeight:900, color:'#0f172a' }}>{config.title}</h2>
      <p style={{ margin:'0 0 20px', fontSize:13, color:'#64748b' }}>{config.action}</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
        {items.map(item => (
          <OpportunityCard
            key={item.id}
            item={item}
            bookmarked={bookmarkSet.has(item.id)}
            onBookmark={() => onBookmark(item.id)}
            onPrimary={() => navigate(config.onPrimaryPath)}
            primaryLabel={config.primaryLabel}
            secondaryLabel={config.secondaryLabel}
          />
        ))}
      </div>
      {items.length === 0 && (
        <div style={{ textAlign:'center', padding:'40px 0', color:'#94a3b8' }}>
          <p style={{ fontSize:14 }}>Nothing available yet.</p>
        </div>
      )}
    </section>
  )
}
