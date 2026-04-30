import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
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

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: 'home' },
  { label: 'Marketplace', path: '/marketplace', icon: 'shop' },
  { label: 'Orders', path: '/orders', icon: 'bag' },
  { label: 'Cart', path: '/cart', icon: 'cart' },
]

function SidebarIcon({ name }) {
  const icons = {
    home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6',
    shop: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
    bag: 'M6 8h12l-1 12H7L6 8zm3 0V6a3 3 0 016 0v2',
    cart: 'M3 3h2l.4 2M7 13h10l3-8H6.4M7 13l-1 5h12m-11 0a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2z',
  }

  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ display: 'block', flexShrink: 0 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d={icons[name]} />
    </svg>
  )
}

export default function Orders() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getTotalItems } = useCart()
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderItems, setOrderItems] = useState([])
  const [loading, setLoading] = useState(true)
  const currentUserId = user?.userId ?? user?.id

  useEffect(() => {
    if (!currentUserId) {
      navigate('/login')
      return
    }
    fetchOrders()
  }, [currentUserId])

  const fetchOrders = async () => {
    try {
      const data = await api.get(`/orders/user/${currentUserId}`)
      setOrders(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrderItems = async (orderId) => {
    try {
      const data = await api.get(`/orders/${orderId}/items`)
      setOrderItems(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch order items:', error)
    }
  }

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    fetchOrderItems(order.id)
  }

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="lg:flex lg:min-h-screen">
        <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:flex-col lg:border-r lg:border-slate-200 lg:bg-white">
          <div className="border-b border-slate-100 px-5 pb-4 pt-6">
            <div className="mb-4 flex cursor-pointer items-center gap-2.5" onClick={() => navigate('/dashboard')}>
              <div className="flex items-center">
                <div style={{ width: 14, height: 24, backgroundColor: BRAND.blue, clipPath: 'polygon(0 0,60% 0,100% 50%,60% 100%,0 100%,40% 50%)' }} />
                <div style={{ width: 14, height: 24, marginLeft: -5, backgroundColor: BRAND.green, clipPath: 'polygon(40% 0,100% 0,100% 100%,40% 100%,0 50%)' }} />
              </div>
              <span className="text-sm font-black tracking-tight" style={{ color: BRAND.navy }}>Inclusive Connect</span>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1" style={{ borderColor: `${BRAND.green}50`, backgroundColor: `${BRAND.green}12` }}>
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: BRAND.green }} />
              <span className="text-xs font-bold" style={{ color: BRAND.green }}>Orders Portal</span>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Navigation</p>
            {NAV_ITEMS.map((item) => {
              const active = item.path === '/orders'
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className="mb-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors"
                  style={{
                    backgroundColor: active ? BRAND.teal : 'transparent',
                    color: active ? '#fff' : '#374151',
                    fontWeight: active ? 700 : 500,
                  }}
                >
                  <SidebarIcon name={item.icon} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="lg:hidden">
            <UserNavbar currentPage="orders" cartCount={getTotalItems()} />
          </div>

          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <section className="relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 p-8 text-white shadow-xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.16),_transparent_30%)]" />
              <div className="relative max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white/85">
                  <span className="h-2 w-2 rounded-full bg-white/90" />
                  Order Center
                </div>
                <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">My Orders</h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">
                  Review your purchases, track status updates, and check every item in one place.
                </p>
              </div>
            </section>

        {loading ? (
          <div className="mt-8 grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-white p-6 shadow-sm"></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">No Orders Yet</h3>
            <p className="mb-6 text-slate-500">Start shopping to place your first order.</p>
            <button
              onClick={() => navigate('/marketplace')}
              className="inline-block rounded-lg px-8 py-3 font-bold text-white transition-colors"
              style={{ backgroundColor: BRAND.teal }}
            >
              Shop Now
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Orders List */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => handleViewOrder(order)}
                    className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="mb-1 text-xs font-semibold text-slate-400">ORDER #{order.id}</p>
                        <p className="text-sm text-slate-600">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="mb-1 text-xs font-semibold text-slate-400">Total Amount</p>
                        <p className="text-2xl font-black text-slate-900">₹{parseFloat(order.totalPrice).toLocaleString()}</p>
                      </div>
                      <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Details */}
            <div className="lg:col-span-1">
              {selectedOrder ? (
                <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-sm">
                  <h2 className="mb-6 text-lg font-bold text-slate-900">Order Details</h2>

                  <div className="mb-6 border-b border-slate-200 pb-6">
                    <p className="mb-1 text-xs font-semibold text-slate-400">Order ID</p>
                    <p className="font-mono text-sm font-bold text-slate-900">{selectedOrder.id}</p>
                  </div>

                  <div className="mb-6 border-b border-slate-200 pb-6">
                    <p className="mb-1 text-xs font-semibold text-slate-400">Status</p>
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>

                  <div className="mb-6 border-b border-slate-200 pb-6">
                    <p className="mb-2 text-xs font-semibold text-slate-400">Items</p>
                    <div className="space-y-3">
                      {orderItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-start text-sm">
                          <div className="flex-grow">
                            <p className="font-bold text-slate-900">{item.productName}</p>
                            <p className="text-xs text-slate-500">{item.source}</p>
                            <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-bold text-slate-900">₹{parseFloat(item.totalPrice).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-slate-600">Subtotal</p>
                      <p className="text-sm font-semibold text-slate-900">₹{parseFloat(selectedOrder.totalPrice).toLocaleString()}</p>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-sm text-slate-600">Shipping</p>
                      <p className="text-sm font-semibold text-emerald-600">Free</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                      <p className="font-bold text-slate-900">Total</p>
                      <p className="text-xl font-black text-slate-900">₹{parseFloat(selectedOrder.totalPrice).toLocaleString()}</p>
                    </div>
                  </div>

                  <p className="text-center text-xs text-slate-500">
                    Order placed on {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <div className="sticky top-24 rounded-2xl bg-slate-100 p-6 text-center">
                  <p className="text-sm font-semibold text-slate-600">Select an order to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  )
}
