import { useEffect, useMemo, useState } from 'react'
import api from '../../services/api'
import { useCart } from '../../context/CartContext'
import UserNavbar from '../../components/common/UserNavbar'

const BRAND = {
  green: '#5BCB2B',
  blue: '#1A8FD1',
  teal: '#0d9488',
  navy: '#0f172a',
  slate: '#64748b',
  border: '#dbe4ee',
  soft: '#f8fafc',
}

const normalizeProduct = (product) => ({
  ...product,
  stockQuantity: Number(product?.stockQuantity ?? 0),
  price: Number(product?.price ?? 0),
  source: String(product?.source || product?.sourceType || 'UNKNOWN').toUpperCase(),
})

export default function Marketplace() {
  const { addToCart, getTotalItems } = useCart()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [cartMessage, setCartMessage] = useState('')
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState('ALL')

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.get('/products/all-available')
        setProducts(Array.isArray(data) ? data.map(normalizeProduct) : [])
      } catch (error) {
        console.error('Failed to fetch products', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()

    return products
      .filter((product) => product.stockQuantity > 0)
      .filter((product) => sourceFilter === 'ALL' || product.source === sourceFilter)
      .filter((product) => {
        if (!query) return true
        return [product.name, product.description, product.category, product.sourceDetails?.name, product.source]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query))
      })
      .sort((left, right) => {
        if (left.source === right.source) return left.name.localeCompare(right.name)
        return left.source.localeCompare(right.source)
      })
  }, [products, search, sourceFilter])

  const sourceCounts = useMemo(() => ({
    ALL: products.filter((product) => product.stockQuantity > 0).length,
    NGO: products.filter((product) => product.stockQuantity > 0 && product.source === 'NGO').length,
    STARTUP: products.filter((product) => product.stockQuantity > 0 && product.source === 'STARTUP').length,
  }), [products])

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <UserNavbar currentPage="marketplace" cartCount={getTotalItems()} />

      {cartMessage && (
        <div className="fixed right-6 top-20 z-40 rounded-xl bg-emerald-600 px-6 py-3 text-white shadow-lg">
          {cartMessage}
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_30%)]" />
          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white/85">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Inclusive Marketplace
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Assistive Product Marketplace</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">
              Browse curated assistive products from NGOs and startups in one place. Only products with stock available are shown.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-white/15 px-4 py-2 font-semibold">Available: {sourceCounts.ALL}</span>
              <span className="rounded-full bg-white/15 px-4 py-2 font-semibold">NGO: {sourceCounts.NGO}</span>
              <span className="rounded-full bg-white/15 px-4 py-2 font-semibold">Startup: {sourceCounts.STARTUP}</span>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative block flex-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
              </span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                type="text"
                placeholder="Search products, organizations, or categories"
                className="h-12 w-full rounded-xl border bg-slate-50 pl-11 pr-4 text-sm outline-none transition-colors focus:bg-white"
                style={{ borderColor: BRAND.border }}
              />
            </label>

            <div className="flex flex-wrap gap-2">
              {['ALL', 'NGO', 'STARTUP'].map((source) => {
                const active = sourceFilter === source
                const label = source === 'ALL' ? `All (${sourceCounts.ALL})` : `${source === 'NGO' ? 'NGOs' : 'Startups'} (${sourceCounts[source]})`

                return (
                  <button
                    key={source}
                    type="button"
                    onClick={() => setSourceFilter(source)}
                    className="rounded-full px-4 py-2 text-sm font-bold transition-all"
                    style={{
                      backgroundColor: active ? (source === 'STARTUP' ? BRAND.blue : BRAND.green) : BRAND.soft,
                      color: active ? '#fff' : BRAND.navy,
                      border: `1px solid ${active ? 'transparent' : BRAND.border}`,
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {loading ? (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((value) => (
              <div key={value} className="flex h-72 flex-col rounded-2xl bg-white p-4 shadow-sm animate-pulse">
                <div className="mb-4 h-32 rounded-lg bg-gray-200" />
                <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
                <div className="mb-4 h-4 w-1/2 rounded bg-gray-200" />
                <div className="mt-auto h-10 rounded-lg bg-gray-200" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-600">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">No Products Available</h3>
            <p className="text-slate-500">No in-stock products match your current filters.</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => {
              const isStartup = product.source === 'STARTUP'
              const accent = isStartup ? BRAND.blue : BRAND.green

              return (
                <div key={`${product.source || 'UNKNOWN'}-${product.id}`} className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative flex h-48 items-center justify-center overflow-hidden border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-6xl text-slate-300 transition-transform duration-300 group-hover:scale-110">📦</span>
                    )}
                    <span className="absolute left-3 top-3 z-20 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm backdrop-blur" style={{ backgroundColor: accent }}>
                      {product.source === 'STARTUP' ? 'Startup' : 'NGO'}
                    </span>
                    {product.category && (
                      <span className="absolute right-3 top-3 z-20 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-slate-800 shadow-sm backdrop-blur">
                        {product.category}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-grow flex-col p-5">
                    <h3 className="mb-1.5 line-clamp-1 font-bold text-slate-900 transition-colors group-hover:text-teal-600">
                      {product.name}
                    </h3>
                    <p className="mb-4 flex-grow line-clamp-2 text-xs leading-relaxed text-slate-500">
                      {product.description}
                    </p>
                    {product.source && (
                      <p className="mb-3 text-xs font-semibold text-slate-400">
                        By: <span className="text-slate-700">{product.sourceDetails?.name || product.source}</span>
                      </p>
                    )}
                    <div className="mb-4 flex items-end justify-between">
                      <div>
                        <p className="mb-0.5 text-xs font-semibold text-slate-400">Price</p>
                        <span className="text-xl font-black text-slate-900">₹{Number(product.price).toLocaleString('en-IN')}</span>
                      </div>
                      <span className="rounded-md px-2.5 py-1 text-xs font-bold" style={{ backgroundColor: `${accent}12`, color: accent }}>
                        In Stock ({product.stockQuantity})
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={product.stockQuantity <= 0}
                      onClick={() => {
                        addToCart(product)
                        setCartMessage('Added to cart!')
                        setTimeout(() => setCartMessage(''), 2000)
                      }}
                      className={`w-full rounded-lg py-2.5 text-sm font-bold transition-colors ${
                        product.stockQuantity > 0
                          ? 'text-white shadow-sm'
                          : 'cursor-not-allowed bg-slate-100 text-slate-400'
                      }`}
                      style={product.stockQuantity > 0 ? { backgroundColor: accent } : undefined}
                    >
                      {product.stockQuantity > 0 ? 'Add to Cart' : 'Unavailable'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
