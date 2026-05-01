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
              onClick={() => navigate('/marketplace')}
              className="inline-block rounded-lg px-8 py-3 font-bold text-white transition-colors"
              style={{ backgroundColor: '#0d9488' }}
            >
              Shop Now
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Orders List */}
            <div className="lg:col-span-2">
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold text-slate-700">Order ID</th>
                      <th className="px-6 py-4 text-left font-bold text-slate-700">Date</th>
                      <th className="px-6 py-4 text-left font-bold text-slate-700">Status</th>
                      <th className="px-6 py-4 text-right font-bold text-slate-700">Total</th>
                      <th className="px-6 py-4 text-center font-bold text-slate-700">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((order) => (
                      <tr 
                        key={order.id}
                        onClick={() => handleViewOrder(order)}
                        className="cursor-pointer transition-colors hover:bg-slate-50"
                      >
                        <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-900">#{order.id}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-900">₹{parseFloat(order.totalPrice).toLocaleString()}</td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={(e) => {e.stopPropagation(); handleViewOrder(order)}}
                            className="text-teal-600 hover:text-teal-700 font-bold text-xs transition-colors"
                          >
                            {selectedOrder?.id === order.id ? 'Hide' : 'View'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Details */}
            <div className="lg:col-span-1">
              {selectedOrder ? (
                <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
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
                <div className="sticky top-24 rounded-2xl bg-white p-6 text-center border border-slate-200 shadow-sm">
                  <p className="text-sm font-semibold text-slate-600">Select an order to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
