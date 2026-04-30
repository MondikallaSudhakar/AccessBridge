import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import authService from '../../services/authService'
import api from '../../services/api'
import UserNavbar from '../../components/common/UserNavbar'

export default function Cart() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { cart, removeFromCart, updateQuantity, clearCart, getTotalPrice, getTotalItems } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [savedAddress, setSavedAddress] = useState('')
  const [addressLoading, setAddressLoading] = useState(false)
  const currentUserId = user?.userId ?? user?.id

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUserId) return

      const cachedAddress = user?.address || authService.getCurrentUser()?.address
      if (cachedAddress) {
        setSavedAddress(cachedAddress)
      }

      try {
        setAddressLoading(true)
        const profile = await authService.getProfile(currentUserId)
        setSavedAddress(profile?.address || '')
      } catch (err) {
        console.error('Failed to load user profile:', err)
      } finally {
        setAddressLoading(false)
      }
    }

    loadProfile()
  }, [currentUserId, user?.address])

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

    if (!savedAddress?.trim()) {
      setError('Add a delivery address in your profile before placing the order.')
      navigate('/profile')
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
      <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="bg-white rounded-[24px] shadow-[0_20px_60px_rgba(15,23,42,.12)] p-10 max-w-md w-full text-center border border-slate-100">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg, #e2f8ea, #c8f1d7)' }}>
            <svg className="w-8 h-8" style={{ color: '#16a34a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Order Placed!</h2>
          <p className="text-slate-600 mb-6">Your order has been successfully placed. Redirecting you to your orders...</p>
          <button
            onClick={() => navigate('/orders')}
            className="w-full text-white font-bold py-3 rounded-xl transition-all"
            style={{ background: 'linear-gradient(135deg, #0f766e, #14b8a6)' }}
          >
            View Orders
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <UserNavbar currentPage="cart" cartCount={getTotalItems()} />

      <div className="container mx-auto px-4 sm:px-6 py-10 max-w-7xl">
        <div className="mb-8 rounded-[28px] bg-gradient-to-r from-[#0f766e] to-[#115e59] text-white p-8 shadow-[0_18px_40px_rgba(15,118,110,.22)] relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute right-20 bottom-0 w-24 h-24 rounded-full bg-white/5" />
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/70 mb-2">Checkout</p>
          <h1 className="text-3xl sm:text-4xl font-black mb-3">Shopping Cart</h1>
          <p className="text-white/75 max-w-2xl">Review your items, confirm your saved address, and place the order without leaving the flow.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl p-4 border border-red-200 bg-red-50">
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        )}

        {cart.length === 0 ? (
          <div className="bg-white rounded-[24px] border border-dashed border-slate-200 p-16 text-center shadow-[0_10px_30px_rgba(15,23,42,.06)]">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #fff7ed, #ffedd5)', color: '#ea580c' }}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Your Cart is Empty</h3>
            <p className="text-slate-500 mb-6">Browse the marketplace to find products for your next order.</p>
            <button
              onClick={() => navigate('/marketplace')}
              className="inline-flex items-center justify-center text-white font-bold py-3 px-8 rounded-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-[24px] shadow-[0_10px_30px_rgba(15,23,42,.06)] overflow-hidden border border-slate-100">
                <div className="border-b border-slate-100 p-6">
                  <h2 className="text-lg font-black text-slate-900">{getTotalItems()} Item(s) in Cart</h2>
                </div>

                <div className="divide-y divide-slate-100">
                  {cart.map((item) => (
                    <div key={`${item.productId}-${item.source}`} className="p-6 hover:bg-slate-50/70 transition-colors">
                      <div className="flex gap-6">
                        {/* Product Image */}
                        <div className="w-24 h-24 rounded-2xl flex items-center justify-center flex-shrink-0 bg-slate-100 overflow-hidden">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <span className="text-3xl">📦</span>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-grow">
                          <h3 className="font-black text-slate-900 mb-1">{item.productName}</h3>
                          <p className="text-sm text-slate-500 mb-2">{item.description}</p>
                          <p className="text-xs text-slate-400 mb-3">
                            From: <span className="text-slate-600 font-semibold">{item.sourceDetails?.name || item.source}</span>
                          </p>
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-black text-slate-900">₹{parseFloat(item.price).toLocaleString()}</span>
                            {item.category && (
                              <span className="text-xs bg-teal-50 text-teal-700 font-bold px-2.5 py-1 rounded-full">
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

                          <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                            <button
                              onClick={() => updateQuantity(item.productId, item.source, Math.max(1, item.quantity - 1))}
                              className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900 font-bold transition-colors"
                            >
                              −
                            </button>
                            <span className="px-4 py-1.5 font-bold text-slate-900 min-w-[50px] text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.source, item.quantity + 1)}
                              className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900 font-bold transition-colors"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-slate-500">Subtotal</p>
                            <p className="text-lg font-black text-slate-900">₹{(parseFloat(item.price) * item.quantity).toLocaleString()}</p>
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
              <div className="bg-white rounded-[24px] shadow-[0_10px_30px_rgba(15,23,42,.06)] p-6 sticky top-24 border border-slate-100">
                <h2 className="text-lg font-black text-slate-900 mb-6">Order Summary</h2>

                <div className="mb-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400 mb-2">Delivery Address</p>
                      <p className="text-sm font-semibold text-slate-900">{addressLoading ? 'Loading saved address...' : (savedAddress || 'No address saved yet')}</p>
                    </div>
                    <button
                      onClick={() => navigate('/profile')}
                      className="shrink-0 text-sm font-bold rounded-xl px-3 py-2 transition-all"
                      style={{ color: '#0f766e', background: '#ecfdf5' }}
                    >
                      Edit
                    </button>
                  </div>
                  {!savedAddress && !addressLoading && (
                    <p className="text-xs text-slate-500">Add a delivery address in your profile before placing the order.</p>
                  )}
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">₹{getTotalPrice().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping</span>
                    <span className="font-semibold text-emerald-600">Free</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax</span>
                    <span className="font-semibold">₹0</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900">Total</span>
                    <span className="text-2xl font-black text-slate-900">₹{getTotalPrice().toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading || cart.length === 0}
                  className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
                    loading || cart.length === 0
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'shadow-md hover:shadow-lg'
                  }`}
                  style={!loading && cart.length > 0 ? { background: 'linear-gradient(135deg, #0f766e, #14b8a6)' } : undefined}
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>

                <p className="text-xs text-slate-500 text-center mt-4">
                  Orders will use the address saved in your profile.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
