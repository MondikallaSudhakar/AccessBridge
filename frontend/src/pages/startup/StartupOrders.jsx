import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { useNavigate } from 'react-router-dom'

const normalizeOrder = (order) => {
  const items = Array.isArray(order?.items)
    ? order.items
    : Array.isArray(order?.orderItems)
      ? order.orderItems
      : []

  const toNumber = (value) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  const computedItemsTotal = items.reduce((sum, item) => {
    const itemTotal = item?.totalPrice ?? item?.total_price ?? (toNumber(item?.price) * toNumber(item?.quantity))
    return sum + toNumber(itemTotal)
  }, 0)

  return {
    ...order,
    orderId: order?.orderId ?? order?.id ?? null,
    items,
    orderTotalPrice: order?.orderTotalPrice ?? order?.totalPrice ?? order?.total_price ?? computedItemsTotal,
    sourceTotalPrice: order?.sourceTotalPrice ?? order?.sourceTotal ?? order?.source_total_price ?? computedItemsTotal,
    createdAt: order?.createdAt ?? order?.created_at ?? null,
  }
}

export default function StartupOrders() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [startupId, setStartupId] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    if (!user?.email) return

    // Get Startup ID from email
    fetch(`http://localhost:8081/api/startups/email/${encodeURIComponent(user.email)}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((startup) => {
        if (startup?.id) {
          setStartupId(startup.id)
          fetchOrders(startup.id)
        }
      })
      .catch(() => setLoading(false))
  }, [user])

  const fetchOrders = async (startupId) => {
    try {
      const data = await api.get(`/orders/startup/${startupId}/orders`)
      setOrders(Array.isArray(data) ? data.map(normalizeOrder) : [])
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (!orderId) {
      alert('Error: Order ID is missing')
      return
    }
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus })
      // Refresh orders
      if (startupId) fetchOrders(startupId)
    } catch (error) {
      console.error('Failed to update order status:', error)
      alert('Failed to update order status: ' + (error.message || 'Unknown error'))
    }
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
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Dashboard
            </a>
            <span className="text-gray-200 text-xs">|</span>
            <span className="text-sm font-bold text-gray-900">Startup Orders</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden md:block">{user?.email}</span>
            <button onClick={() => navigate('/startup/profile')}
              className="text-xs font-semibold text-white px-3 py-1.5 rounded transition-colors"
              style={{ backgroundColor: '#e65100' }}>
              Profile
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#e65100' }}>Startup Admin</p>
            <h1 className="text-3xl font-black text-gray-900">Product Orders</h1>
            <p className="text-sm text-gray-500 mt-1">Review customer orders placed for your startup products.</p>
          </div>
        </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center text-gray-500">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Orders Yet</h3>
          <p className="text-gray-500">Orders will appear here once customers buy your products.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => (
            <div
              key={order.orderId ?? order.id}
              onClick={() => setSelectedOrder(selectedOrder?.orderId === (order.orderId ?? order.id) ? null : order)}
              className="cursor-pointer rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Order #{order.orderId ?? order.id ?? '—'}</p>
                  <p className="mt-1 text-sm font-bold text-gray-900">{order.buyerName || 'Community User'}</p>
                  <p className="text-xs text-gray-500">{order.buyerEmail || 'No email provided'}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${getStatusColor(order.status || 'PENDING')}`}>{order.status || 'PENDING'}</span>
              </div>

              <div className="mt-4 border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Order total</span>
                  <span className="font-bold text-gray-900">₹{Number(order.orderTotalPrice ?? order.totalPrice ?? 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                  <span>Your share</span>
                  <span className="font-bold text-orange-600">₹{Number(order.sourceTotalPrice ?? order.sourceTotal ?? 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                  <span>Placed on</span>
                  <span className="font-medium text-gray-700">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : '—'}</span>
                </div>
                {order.buyerAddress && (
                  <div className="mt-3 border-t border-gray-100 pt-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Delivery Address</p>
                    <p className="text-xs text-gray-700 leading-relaxed">{order.buyerAddress}</p>
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-lg bg-orange-50 p-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-orange-700">Items</p>
                <div className="mt-2 space-y-2">
                  {(order.items || []).length > 0 ? (
                    (order.items || []).map((item) => (
                      <div key={item.id ?? `${item.productId}-${item.productName}`} className="rounded-md border border-orange-100 bg-white/80 px-3 py-2 text-sm text-gray-700">
                        <div className="flex items-start justify-between gap-3">
                          <span className="font-semibold text-gray-900">{item.productName || item.name || 'Item'}</span>
                          <span className="text-xs font-bold text-orange-700">x{item.quantity ?? 0}</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                          <span>{item.source || 'Source'}</span>
                          <span>₹{Number(item.totalPrice ?? item.total_price ?? 0).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600">No item details were returned for this order.</p>
                  )}
                </div>
              </div>

              {selectedOrder?.orderId === (order.orderId ?? order.id) && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {['CONFIRMED', 'SHIPPED', 'DELIVERED'].map((status) => (
                      <button
                        key={status}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStatusUpdate(order.orderId ?? order.id, status)
                        }}
                        className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-200"
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}
