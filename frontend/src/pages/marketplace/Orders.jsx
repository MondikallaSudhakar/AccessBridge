import { useState, useEffect } from 'react'
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
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-4 h-7 rounded-sm" style={{ backgroundColor: '#1A8FD1', clipPath: 'polygon(0 0, 60% 0, 100% 50%, 60% 100%, 0 100%, 40% 50%)' }}></div>
            <div className="w-4 h-7 rounded-sm -ml-1.5" style={{ backgroundColor: '#5BBE00', clipPath: 'polygon(40% 0, 100% 0, 100% 100%, 40% 100%, 0 50%)' }}></div>
            <span className="font-black tracking-tight text-gray-900 text-lg">Inclusive Connect</span>
          </div>
          <button
            onClick={() => navigate('/marketplace')}
            className="text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Back to Marketplace
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <h1 className="text-4xl font-black text-gray-900 mb-8">My Orders</h1>

        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse h-24"></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center shadow-sm">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-500 mb-6">Start shopping to place your first order.</p>
            <button
              onClick={() => navigate('/marketplace')}
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Shop Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Orders List */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => handleViewOrder(order)}
                    className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-lg transition-all hover:border-orange-300 border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-1">ORDER #{order.id}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-1">Total Amount</p>
                        <p className="text-2xl font-black text-gray-900">₹{parseFloat(order.totalPrice).toLocaleString()}</p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-6">Order Details</h2>

                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <p className="text-xs text-gray-500 font-semibold mb-1">Order ID</p>
                    <p className="font-mono text-sm font-bold text-gray-900">{selectedOrder.id}</p>
                  </div>

                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <p className="text-xs text-gray-500 font-semibold mb-1">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>

                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <p className="text-xs text-gray-500 font-semibold mb-2">Items</p>
                    <div className="space-y-3">
                      {orderItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-start text-sm">
                          <div className="flex-grow">
                            <p className="font-bold text-gray-900">{item.productName}</p>
                            <p className="text-xs text-gray-500">{item.source}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-bold text-gray-900">₹{parseFloat(item.totalPrice).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-gray-600">Subtotal</p>
                      <p className="text-sm font-semibold text-gray-900">₹{parseFloat(selectedOrder.totalPrice).toLocaleString()}</p>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-sm text-gray-600">Shipping</p>
                      <p className="text-sm font-semibold text-green-600">Free</p>
                    </div>
                    <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                      <p className="font-bold text-gray-900">Total</p>
                      <p className="text-xl font-black text-gray-900">₹{parseFloat(selectedOrder.totalPrice).toLocaleString()}</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    Order placed on {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-xl p-6 text-center sticky top-24">
                  <p className="text-sm text-gray-600 font-semibold">Select an order to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
