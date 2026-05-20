import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import authService from '../../services/authService'
import api from '../../services/api'

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js'
const DEFAULT_CURRENCY = 'INR'

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }

    const existingScript = document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`)
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true), { once: true })
      existingScript.addEventListener('error', () => resolve(false), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = RAZORPAY_SCRIPT_URL
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

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
  const isSpecialUser = user?.role === 'SPECIAL_ABLED_PERSON'
  const marketplacePath = isSpecialUser ? '/special/marketplace' : '/marketplace'
  const profilePath = isSpecialUser ? '/special/profile' : '/profile'
  const ordersPath = isSpecialUser ? '/special/orders' : '/orders'

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
      navigate(profilePath)
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

      const paymentOrder = await api.post(`/orders/payment-order?userId=${currentUserId}`, cartItems)
      const razorpayKeyId = paymentOrder?.keyId
      const razorpayOrderId = paymentOrder?.id || paymentOrder?.orderId

      if (!razorpayKeyId || !razorpayOrderId) {
        throw new Error('Unable to start Razorpay checkout.')
      }

      const scriptReady = await loadRazorpayScript()
      if (!scriptReady || !window.Razorpay) {
        throw new Error('Unable to load Razorpay checkout.')
      }

      const totalAmount = Number(paymentOrder?.amount || 0)
      const checkout = new window.Razorpay({
        key: razorpayKeyId,
        order_id: razorpayOrderId,
        amount: paymentOrder.amountPaise || Math.round(totalAmount * 100),
        currency: paymentOrder.currency || DEFAULT_CURRENCY,
        name: 'Community Marketplace',
        description: 'Product order payment',
        notes: {
          userId: String(currentUserId),
          itemCount: String(cartItems.length),
        },
        theme: {
          color: '#0d9488',
        },
        handler: async (response) => {
          const createdOrder = await api.post(`/orders/payment-verify?userId=${currentUserId}`, {
            orderId: response.razorpay_order_id || response.order_id,
            paymentId: response.razorpay_payment_id || response.payment_id,
            signature: response.razorpay_signature || response.signature,
            cartItems,
          })

          if (createdOrder?.id) {
            setOrderPlaced(true)
            clearCart()

            setTimeout(() => {
              navigate(ordersPath)
            }, 2000)
          }
        },
        modal: {
          ondismiss: () => {},
        },
        prefill: {
          name: user?.name || 'Customer',
          email: user?.email || '',
          contact: user?.phone || '',
        },
      })

      checkout.open()

    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.')
      console.error('Checkout error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="bg-white rounded-[24px] shadow-sm p-10 max-w-md w-full text-center border border-slate-200">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-emerald-50">
            <svg className="w-8 h-8" style={{ color: '#16a34a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Order Placed!</h2>
          <p className="text-slate-600 mb-6">Your order has been successfully placed. Redirecting you to your orders...</p>
          <button
            onClick={() => navigate('/orders')}
            className="w-full text-white font-bold py-3 rounded-xl transition-all"
            style={{ backgroundColor: '#0d9488' }}
          >
            View Orders
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="container mx-auto px-4 sm:px-6 py-10 max-w-7xl">
        <div className="mb-8 rounded-[28px] bg-white p-8 shadow-sm border border-slate-200">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-teal-600 mb-2">Checkout</p>
          <h1 className="text-3xl sm:text-4xl font-black mb-3 text-slate-900">Shopping Cart</h1>
          <p className="text-slate-600 max-w-2xl">Review your items, confirm your saved address, and place the order without leaving the flow.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl p-4 border border-red-200 bg-red-50">
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        )}

        {cart.length === 0 ? (
          <div className="bg-white rounded-[24px] border border-dashed border-slate-200 p-16 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-amber-50" style={{ color: '#ea580c' }}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Your Cart is Empty</h3>
            <p className="text-slate-500 mb-6">Browse the marketplace to find products for your next order.</p>
            <button
              onClick={() => navigate(marketplacePath)}
              className="inline-flex items-center justify-center text-white font-bold py-3 px-8 rounded-xl transition-all"
              style={{ backgroundColor: '#0d9488' }}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-[24px] shadow-sm overflow-hidden border border-slate-200">
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
              <div className="bg-white rounded-[24px] shadow-sm p-6 sticky top-24 border border-slate-200">
                <h2 className="text-lg font-black text-slate-900 mb-6">Order Summary</h2>

                <div className="mb-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400 mb-2">Delivery Address</p>
                      <p className="text-sm font-semibold text-slate-900">{addressLoading ? 'Loading saved address...' : (savedAddress || 'No address saved yet')}</p>
                    </div>
                    <button
                      onClick={() => navigate(profilePath)}
                      className="shrink-0 text-sm font-bold rounded-xl px-3 py-2 transition-all"
                      style={{ color: '#0d9488', background: '#f0fdfa' }}
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
                  style={!loading && cart.length > 0 ? { backgroundColor: '#0d9488' } : undefined}
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
