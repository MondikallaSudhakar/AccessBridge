import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import UserNavbar from '../../components/common/UserNavbar'

export default function Cart() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { cart, removeFromCart, updateQuantity, clearCart, getTotalPrice, getTotalItems } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderPlaced, setOrderPlaced] = useState(false)
  const currentUserId = user?.userId ?? user?.id

  const handleCheckout = async () => {
    if (!currentUserId) {
      alert('Please login to place an order')
      navigate('/login')
      return
    }

    if (cart.length === 0) {
      setError('Your cart is empty')
      return
    }

    setLoading(true)
    setError('')

    try {
      const invalidItem = cart.find((item) => !item.source || item.sourceId == null)
      if (invalidItem) {
        throw new Error('Some cart items are missing product source details. Please remove the item and add it again.')
      }

      // Prepare cart items for order
      const cartItems = cart.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        source: item.source,
        sourceId: item.sourceId,
      }))

      // Create order
      const response = await api.post(`/orders?userId=${currentUserId}`, cartItems)

      if (response.id) {
        setOrderPlaced(true)
        clearCart()
        
        // Show success message
        setTimeout(() => {
          navigate('/orders')
        }, 2000)
      }
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.')
      console.error('Checkout error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
          <p className="text-gray-600 mb-6">Your order has been successfully placed. Redirecting you to your orders...</p>
          <button
            onClick={() => navigate('/orders')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors"
          >
            View Orders
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <UserNavbar currentPage="cart" cartCount={getTotalItems()} />

      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <h1 className="text-4xl font-black text-gray-900 mb-8">Shopping Cart</h1>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        )}

        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center shadow-sm">
            <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Your Cart is Empty</h3>
            <p className="text-gray-500 mb-6">Browse our marketplace to find amazing products.</p>
            <button
              onClick={() => navigate('/marketplace')}
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 p-6">
                  <h2 className="text-lg font-bold text-gray-900">{getTotalItems()} Item(s) in Cart</h2>
                </div>

                <div className="divide-y divide-gray-200">
                  {cart.map((item) => (
                    <div key={`${item.productId}-${item.source}`} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex gap-6">
                        {/* Product Image */}
                        <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <span className="text-3xl">📦</span>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-grow">
                          <h3 className="font-bold text-gray-900 mb-1">{item.productName}</h3>
                          <p className="text-sm text-gray-500 mb-2">{item.description}</p>
                          <p className="text-xs text-gray-400 mb-3">
                            From: <span className="text-gray-600 font-semibold">{item.sourceDetails?.name || item.source}</span>
                          </p>
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-black text-gray-900">₹{parseFloat(item.price).toLocaleString()}</span>
                            {item.category && (
                              <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2.5 py-1 rounded-full">
                                {item.category}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity & Remove */}
                        <div className="flex flex-col items-end gap-4">
                          <button
                            onClick={() => removeFromCart(item.productId, item.source)}
                            className="text-red-600 hover:text-red-700 font-bold text-sm transition-colors"
                          >
                            Remove
                          </button>

                          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                            <button
                              onClick={() => updateQuantity(item.productId, item.source, Math.max(1, item.quantity - 1))}
                              className="px-2.5 py-1.5 text-gray-600 hover:text-gray-900 font-bold transition-colors"
                            >
                              −
                            </button>
                            <span className="px-4 py-1.5 font-bold text-gray-900 min-w-[50px] text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.source, item.quantity + 1)}
                              className="px-2.5 py-1.5 text-gray-600 hover:text-gray-900 font-bold transition-colors"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-gray-500">Subtotal</p>
                            <p className="text-lg font-black text-gray-900">₹{(parseFloat(item.price) * item.quantity).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">₹{getTotalPrice().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span className="font-semibold">₹0</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-black text-gray-900">₹{getTotalPrice().toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading || cart.length === 0}
                  className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
                    loading || cart.length === 0
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg'
                  }`}
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By placing an order, you agree to our Terms of Service
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
