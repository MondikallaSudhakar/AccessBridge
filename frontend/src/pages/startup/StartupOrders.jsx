import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { useNavigate } from 'react-router-dom'
import { COLORS } from '../../utils/colors'

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
    <div className="space-y-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: COLORS.primary }}>Startup Admin</p>
          <h1 className="text-3xl font-black text-slate-900">Product Orders</h1>
          <p className="text-sm text-slate-500 mt-1">Review customer orders placed for your startup products.</p>
        </div>
        <button onClick={() => navigate('/startup/profile')}
          className="hidden sm:inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: COLORS.success }}>
          Back to Profile
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center text-gray-500">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Orders Yet</h3>
          <p className="text-gray-500">Orders will appear here once customers buy your products.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div
              key={order.orderId ?? order.id}
              onClick={() => setSelectedOrder(selectedOrder?.orderId === (order.orderId ?? order.id) ? null : order)}
              className="cursor-pointer rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-50 text-xl">📦</div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Order #{order.orderId ?? order.id ?? '—'}</p>
                    <h3 className="text-base font-bold text-gray-900">{order.buyerName || 'Community User'}</h3>
                    <p className="text-xs text-gray-500">{order.buyerEmail || 'No email provided'}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 md:gap-8">
                  <div className="text-left md:text-right">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Placed On</p>
                    <p className="text-sm font-medium text-gray-700">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : '—'}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Your Share</p>
                    <p className="text-sm font-bold text-orange-600">₹{Number(order.sourceTotalPrice ?? order.sourceTotal ?? 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Amount</p>
                    <p className="text-base font-black text-gray-900">₹{Number(order.orderTotalPrice ?? order.totalPrice ?? 0).toLocaleString('en-IN')}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${getStatusColor(order.status || 'PENDING')}`}>{order.status || 'PENDING'}</span>
                </div>
              </div>

              {selectedOrder?.orderId === (order.orderId ?? order.id) && (
                <div className="mt-6 border-t border-gray-100 pt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Order Items</h4>
                      <div className="space-y-2">
                        {(order.items || []).length > 0 ? (
                          (order.items || []).map((item) => (
                            <div key={item.id ?? `${item.productId}-${item.productName}`} className="flex items-center justify-between rounded-lg border border-emerald-50 bg-emerald-50/30 px-4 py-3">
                              <div>
                                <p className="text-sm font-bold text-gray-900">{item.productName || item.name || 'Item'}</p>
                                <p className="text-[11px] text-emerald-700 font-medium">Qty: {item.quantity ?? 0}</p>
                              </div>
                              <p className="text-sm font-bold text-gray-900">₹{Number(item.totalPrice ?? item.total_price ?? 0).toLocaleString('en-IN')}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-600">No item details were returned for this order.</p>
                        )}
                      </div>
                    </div>

                    <div>
                      {order.buyerAddress && (
                        <div className="mb-6">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Delivery Details</h4>
                          <div className="rounded-lg bg-slate-50 p-4">
                            <p className="text-sm text-gray-700 leading-relaxed">{order.buyerAddress}</p>
                          </div>
                        </div>
                      )}

                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Update Order Status</h4>
                      <div className="flex flex-wrap gap-2">
                        {['CONFIRMED', 'SHIPPED', 'DELIVERED'].map((status) => (
                          <button
                            key={status}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStatusUpdate(order.orderId ?? order.id, status)
                            }}
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition-all hover:border-emerald-500 hover:text-emerald-600"
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
