import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function Orders() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderItems, setOrderItems] = useState([])
  const [loading, setLoading] = useState(true)
  const currentUserId = user?.userId ?? user?.id
  const isSpecialUser = user?.role === 'SPECIAL_ABLED_PERSON'
  const marketplacePath = isSpecialUser ? '/special/marketplace' : '/marketplace'

  const HOME = {
    primary: '#0197B2',
    primaryLight: '#f0f8fc',
  }

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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-teal-600">
            <span className="h-2 w-2 rounded-full bg-teal-500" />
            Order Center
          </div>
          <div className="mt-4 max-w-3xl">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">My Orders</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Review your purchases, track status updates, and check every item in one place.
            </p>
          </div>
        </section>

        {loading ? (
          <div className="mt-8 grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-white p-6 shadow-sm border border-slate-100"></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">No Orders Yet</h3>
            <p className="mb-6 text-slate-500">Start shopping to place your first order.</p>
            <button
              onClick={() => navigate(marketplacePath)}
              className="inline-block rounded-lg px-8 py-3 font-bold text-white transition-colors"
              style={{ backgroundColor: '#0d9488' }}
            >
              Shop Now
            </button>
          </div>
        ) : (
          // Simplified layout for special users: stacked cards with inline details
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Order #{order.id}</div>
                    <div className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusColor(order.status)}`}>{order.status}</span>
                    <div className="text-sm font-bold text-slate-900">₹{parseFloat(order.totalPrice).toLocaleString()}</div>
                    <button
                      onClick={() => { handleViewOrder(order); }}
                      className="rounded-full px-3 py-1 text-sm font-medium text-white"
                      style={{ backgroundColor: HOME.primary }}
                    >
                      {selectedOrder?.id === order.id ? 'Hide' : 'Details'}
                    </button>
                  </div>
                </div>

                {selectedOrder?.id === order.id && (
                  <div className="mt-4 border-t pt-3">
                    <div className="space-y-2">
                      {orderItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <div>
                            <div className="font-semibold text-slate-900">{item.productName}</div>
                            <div className="text-xs text-slate-500">Qty: {item.quantity}</div>
                          </div>
                          <div className="font-semibold">₹{parseFloat(item.totalPrice).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex justify-between items-center text-sm">
                      <div className="text-slate-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</div>
                      <div className="font-bold text-slate-900">Total: ₹{parseFloat(order.totalPrice).toLocaleString()}</div>
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
