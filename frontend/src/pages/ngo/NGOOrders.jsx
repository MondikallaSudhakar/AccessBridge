import React, { useState, useEffect } from 'react'
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

export default function NGOOrders() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [ngoId, setNgoId] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [filterStatus, setFilterStatus] = useState('ALL')

  useEffect(() => {
    if (!user?.email) return

    // Get NGO ID from email
    fetch(`/api/ngos/email/${encodeURIComponent(user.email)}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((ngo) => {
        if (ngo?.id) {
          setNgoId(ngo.id)
          fetchOrders(ngo.id)
        }
      })
      .catch(() => setLoading(false))
  }, [user])

  const fetchOrders = async (ngoId) => {
    try {
      const data = await api.get(`/orders/ngo/${ngoId}/orders`)
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
      if (ngoId) fetchOrders(ngoId)
    } catch (error) {
      console.error('Failed to update order status:', error)
      alert('Failed to update order status: ' + (error.message || 'Unknown error'))
    }
  }

  const filteredOrders = filterStatus === 'ALL' 
    ? orders 
    : orders.filter(o => {
        // Group by order and check if any order has items matching the NGO
        return true // This is simplified; in real implementation, you'd filter properly
      })

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
            <a href="/ngo" className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Workspace
            </a>
            <span className="text-gray-200 text-xs">|</span>
            <span className="text-sm font-bold text-gray-900">NGO Orders</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden md:block">{user?.email}</span>
            <button onClick={() => navigate('/ngo/profile')}
              className="text-xs font-semibold text-white px-3 py-1.5 rounded transition-colors"
              style={{ backgroundColor: '#5BCB2B' }}>
              Profile
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#5BCB2B' }}>NGO Admin</p>
          <h1 className="text-3xl font-black text-gray-900">Product Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Review orders placed for products published by your NGO.</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center text-gray-500">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Orders Yet</h3>
          <p className="text-gray-500">Orders will appear here once customers buy your products.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-bold text-gray-700">Order ID</th>
                <th className="px-6 py-3 text-left font-bold text-gray-700">Customer</th>
                <th className="px-6 py-3 text-left font-bold text-gray-700">Status</th>
                <th className="px-6 py-3 text-right font-bold text-gray-700">Order Total</th>
                <th className="px-6 py-3 text-right font-bold text-gray-700">Your Share</th>
                <th className="px-6 py-3 text-left font-bold text-gray-700">Date</th>
                <th className="px-6 py-3 text-center font-bold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
          {filteredOrders.map((order) => (
            <React.Fragment key={order.orderId ?? order.id}>
              <tr 
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setSelectedOrder(selectedOrder?.orderId === (order.orderId ?? order.id) ? null : order)}
              >
                <td className="px-6 py-4 font-mono text-xs font-semibold text-gray-900">#{order.orderId ?? order.id ?? '—'}</td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">{order.buyerName || 'Community User'}</div>
                  <div className="text-xs text-gray-500">{order.buyerEmail || 'No email'}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${getStatusColor(order.status || 'PENDING')}`}>
                    {order.status || 'PENDING'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-semibold text-gray-900">₹{Number(order.orderTotalPrice ?? order.totalPrice ?? 0).toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 text-right font-semibold text-emerald-600">₹{Number(order.sourceTotalPrice ?? order.sourceTotal ?? 0).toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={(e) => {e.stopPropagation(); setSelectedOrder(selectedOrder?.orderId === (order.orderId ?? order.id) ? null : order)}}
                    className="text-emerald-600 hover:text-emerald-700 font-bold text-xs transition-colors"
                  >
                    {selectedOrder?.orderId === (order.orderId ?? order.id) ? 'Hide' : 'View'}
                  </button>
                </td>
              </tr>
              {selectedOrder?.orderId === (order.orderId ?? order.id) && (
                <tr className="bg-emerald-50 border-t border-emerald-100">
                  <td colSpan="7" className="px-6 py-6">
                    <div className="space-y-6">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest mb-3 text-emerald-700">Items in this order</p>
                        <div className="space-y-2">
                          {(order.items || []).length > 0 ? (
                            (order.items || []).map((item) => (
                              <div key={item.id ?? `${item.productId}-${item.productName}`} className="flex items-center justify-between rounded-lg bg-white border border-emerald-100 px-4 py-3 text-sm">
                                <div>
                                  <div className="font-semibold text-gray-900">{item.productName || item.name || 'Item'}</div>
                                  <div className="text-xs text-gray-500">{item.source || 'Source'} • Qty: {item.quantity ?? 0}</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-gray-900">₹{Number(item.totalPrice ?? item.total_price ?? 0).toLocaleString('en-IN')}</div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-600">No item details available</p>
                          )}
                        </div>
                      </div>
                      <div className="border-t border-emerald-200 pt-4">
                        <p className="text-xs font-bold uppercase tracking-widest mb-3 text-emerald-700">Update Status</p>
                        <div className="flex flex-wrap gap-2">
                          {['CONFIRMED', 'SHIPPED', 'DELIVERED'].map((status) => (
                            <button
                              key={status}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStatusUpdate(order.orderId ?? order.id, status)
                              }}
                              className="rounded-lg bg-emerald-600 text-white px-4 py-2 text-xs font-bold transition-colors hover:bg-emerald-700"
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  )
}
