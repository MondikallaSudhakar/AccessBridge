import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function NGOOrders() {
  const { user } = useAuth()
  const [ngoId, setNgoId] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [filterStatus, setFilterStatus] = useState('ALL')

  useEffect(() => {
    if (!user?.email) return

    // Get NGO ID from email
    fetch(`http://localhost:8081/api/ngos/email/${encodeURIComponent(user.email)}`, {
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
      setOrders(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus })
      // Refresh orders
      if (ngoId) fetchOrders(ngoId)
    } catch (error) {
      console.error('Failed to update order status:', error)
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
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#111827' }}>
        Product Orders
      </h2>

      {loading ? (
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <p style={{ color: '#6b7280' }}>Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div
          style={{
            border: '2px dashed #e5e7eb',
            borderRadius: '12px',
            padding: '48px 32px',
            textAlign: 'center',
            backgroundColor: '#f9fafb',
          }}
        >
          <p style={{ color: '#6b7280', fontSize: '14px' }}>No orders received yet</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '16px',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                boxShadow: selectedOrder?.id === order.id ? '0 10px 15px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 'bold', margin: 0 }}>
                    ORDER #{order.id}
                  </p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
                    {order.productName || 'Product Order'}
                  </p>
                </div>
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                  className={getStatusColor(order.status || 'PENDING')}
                >
                  {order.status || 'PENDING'}
                </span>
              </div>

              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>
                  Quantity: <span style={{ fontWeight: 'bold', color: '#111827' }}>{order.quantity || 0}</span>
                </p>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>
                  Total: <span style={{ fontWeight: 'bold', color: '#111827' }}>₹{parseFloat(order.totalPrice || 0).toLocaleString()}</span>
                </p>
              </div>

              {selectedOrder?.id === order.id && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                  <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#111827' }}>
                    Update Status:
                  </p>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {['CONFIRMED', 'SHIPPED', 'DELIVERED'].map((status) => (
                      <button
                        key={status}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStatusUpdate(order.id, status)
                        }}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          backgroundColor: '#e5e7eb',
                          color: '#374151',
                          transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => (e.target.style.backgroundColor = '#d1d5db')}
                        onMouseLeave={(e) => (e.target.style.backgroundColor = '#e5e7eb')}
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
  )
}
