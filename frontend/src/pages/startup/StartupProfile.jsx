import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { useStartupSubscription } from '../../hooks/useStartupSubscription'
import { COLORS } from '../../utils/colors'

function SummaryCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

function DataPanel({ title, subtitle, items, emptyText, actionLabel, actionHref, renderItem, navigate }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        {actionLabel && (
          <button
            type="button"
            onClick={() => navigate(actionHref)}
            className="rounded-lg px-4 py-2 text-xs font-bold text-white shadow-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: COLORS.success }}
          >
            {actionLabel}
          </button>
        )}
      </div>
      <div className="p-5">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
            {emptyText}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => renderItem(item))}
          </div>
        )}
      </div>
    </section>
  )
}

export default function StartupProfile() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [startup, setStartup] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [events, setEvents] = useState([])
  const { loading: subscriptionLoading, subscription, startSubscription } = useStartupSubscription(startup?.id)

  useEffect(() => {
    if (user && user.role !== 'STARTUP_ADMIN') navigate('/dashboard')
  }, [user, navigate])

  useEffect(() => {
    if (!user?.email) return
    fetchStartup()
  }, [user])

  const fetchStartup = async () => {
    setProfileLoading(true)
    try {
      const encoded = encodeURIComponent(user.email)
      const data = await api.get(`/startups/email/${encoded}`)
      setStartup(data)

      if (data?.id) {
        const [productData, eventData] = await Promise.all([
          api.get(`/products/startup/${data.id}`),
          api.get(`/events/startup/${data.id}`),
        ])
        setProducts(Array.isArray(productData) ? productData : [])
        setEvents(Array.isArray(eventData) ? eventData : [])
      }
    } catch (error) {
      console.error('Error fetching startup profile:', error)
      setStartup(null)
      setProducts([])
      setEvents([])
    } finally {
      setProfileLoading(false)
    }
  }

  const upcomingEvents = events.filter((event) => ['UPCOMING', 'ONGOING'].includes((event.status || '').toUpperCase()))
  const recentProducts = products.slice(0, 3)
  const recentEvents = events.slice(0, 3)

  const handleStartSubscription = async () => {
    try {
      await startSubscription({ onActivated: fetchStartup })
    } catch (error) {
      alert(error.message || 'Unable to start subscription')
    }
  }

  return (
    <div className="space-y-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      {profileLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => <div key={item} className="h-14 rounded-lg bg-gray-200 animate-pulse" />)}
        </div>
      ) : (
        <>
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: COLORS.primary }}>Startup Admin</p>
                <h1 className="text-3xl font-black text-slate-900">{startup?.name || 'My Startup'}</h1>
                {startup?.city && <p className="text-sm text-slate-500 mt-1">{[startup.city, startup.state].filter(Boolean).join(', ')}</p>}
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => navigate('/startup/products')} className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90" style={{ backgroundColor: COLORS.success }}>View Products</button>
                  <button onClick={() => navigate('/startup/events')} className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90" style={{ backgroundColor: COLORS.primary }}>View Events</button>
                  <button onClick={() => navigate('/startup/orders')} className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90" style={{ backgroundColor: COLORS.success }}>View Orders</button>
                </div>
                <button
                  type="button"
                  onClick={handleStartSubscription}
                  disabled={subscriptionLoading || subscription?.active}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity disabled:opacity-60 hover:opacity-90"
                  style={{ backgroundColor: subscription?.active ? '#94a3b8' : COLORS.success }}
                >
                  {subscription?.active ? 'Subscribed' : 'Pay with Razorpay'}
                </button>
                <p className="text-xs text-slate-500">
                  {subscriptionLoading
                    ? 'Checking subscription status...'
                    : subscription?.active
                      ? `Active${subscription.expiresAt ? ` until ${new Date(subscription.expiresAt).toLocaleDateString('en-IN')}` : ''}`
                      : 'Required to post startup content'}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard label="Products" value={products.length} hint="Published product listings" />
              <SummaryCard label="Events" value={events.length} hint="Total posted startup events" />
              <SummaryCard label="Upcoming" value={upcomingEvents.length} hint="Upcoming or live events" />
              <SummaryCard label="Owner" value={startup?.email ? 'Verified' : 'Pending'} hint={startup?.email || 'No email available'} />
            </div>
          </section>

          <DataPanel
            title="Latest Products"
            subtitle="Quick snapshot of the products you have already posted."
            items={recentProducts}
            emptyText="No products posted yet. Open the Products page to add your first listing."
            actionLabel="Open Products"
            actionHref="/startup/products"
            navigate={navigate}
            renderItem={(product) => (
              <div key={product.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="h-28 overflow-hidden rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" /> : <span className="text-4xl text-slate-300">📦</span>}
                </div>
                <div className="mt-3 flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-slate-900 line-clamp-1">{product.name}</h3>
                  <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase text-orange-700">{product.category || 'General'}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">{product.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-black text-slate-900">₹{Number(product.price || 0).toLocaleString('en-IN')}</span>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">Stock: {product.stockQuantity}</span>
                </div>
              </div>
            )}
          />

          <DataPanel
            title="Latest Events"
            subtitle="A quick view of your event postings and status."
            items={recentEvents}
            emptyText="No events posted yet. Open the Events page to create your first event."
            actionLabel="Open Events"
            actionHref="/startup/events"
            navigate={navigate}
            renderItem={(event) => (
              <div key={event.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>{event.status || 'UPCOMING'}</span>
                  {event.eventType && <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">{event.eventType}</span>}
                </div>
                <h3 className="mt-3 font-semibold text-slate-900 line-clamp-1">{event.title}</h3>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">{event.description}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{event.location}</span>
                  <span>{event.eventDate ? new Date(event.eventDate).toLocaleDateString('en-IN') : '—'}</span>
                </div>
              </div>
            )}
          />
        </>
      )}
    </div>
  )
}
