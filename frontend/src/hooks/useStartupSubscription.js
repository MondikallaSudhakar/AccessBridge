import { useCallback, useEffect, useState } from 'react'
import api from '../services/api'

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js'
const SUBSCRIPTION_PLAN = 'MONTHLY'
const SUBSCRIPTION_AMOUNT_INR = 499

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

function normalizeSubscription(data) {
  const expiresAt = data?.expiresAt || null
  const expired = Boolean(expiresAt && new Date(expiresAt).getTime() <= Date.now())
  const active = Boolean(data?.active) && !expired

  return {
    active,
    expired,
    plan: data?.plan || 'FREE',
    activatedAt: data?.activatedAt || null,
    expiresAt,
    orderId: data?.orderId || null,
    paymentId: data?.paymentId || null,
  }
}

export function useStartupSubscription(startupId) {
  const [loading, setLoading] = useState(Boolean(startupId))
  const [subscription, setSubscription] = useState({
    active: false,
    expired: false,
    plan: 'FREE',
    activatedAt: null,
    expiresAt: null,
    orderId: null,
    paymentId: null,
  })

  const refreshSubscription = useCallback(async () => {
    if (!startupId) {
      setLoading(false)
      setSubscription({ active: false, expired: false, plan: 'FREE', activatedAt: null, expiresAt: null, orderId: null, paymentId: null })
      return
    }

    setLoading(true)
    try {
      const data = await api.get(`/startups/${startupId}/subscription`) 
      setSubscription(normalizeSubscription(data))
    } catch {
      setSubscription({ active: false, expired: false, plan: 'FREE', activatedAt: null, expiresAt: null, orderId: null, paymentId: null })
    } finally {
      setLoading(false)
    }
  }, [startupId])

  useEffect(() => {
    refreshSubscription()
  }, [refreshSubscription])

  const startSubscription = useCallback(async ({ onActivated } = {}) => {
    if (!startupId) {
      throw new Error('Startup profile is still loading.')
    }

    const order = await api.post(`/startups/${startupId}/subscription/order`, {})
    const razorpayKeyId = order?.keyId
    const razorpayOrderId = order?.id || order?.orderId
    if (!razorpayKeyId || !razorpayOrderId) {
      throw new Error('Unable to create a Razorpay order from the backend.')
    }

    const scriptReady = await loadRazorpayScript()
    if (!scriptReady || !window.Razorpay) {
      throw new Error('Unable to load Razorpay checkout.')
    }

    const checkout = new window.Razorpay({
      key: razorpayKeyId,
      order_id: razorpayOrderId,
      amount: order.amountPaise || SUBSCRIPTION_AMOUNT_INR * 100,
      currency: order.currency || 'INR',
      name: 'KnotneX Startup Subscription',
      description: `${SUBSCRIPTION_PLAN} access for startup posting features`,
      notes: {
        startupId: String(startupId),
        plan: SUBSCRIPTION_PLAN,
      },
      theme: { color: '#5BCB2B' },
      handler: async (response) => {
        await api.post(`/startups/${startupId}/subscription/verify`, {
          orderId: response.razorpay_order_id || response.order_id,
          paymentId: response.razorpay_payment_id || response.payment_id,
          signature: response.razorpay_signature || response.signature,
        })
        await refreshSubscription()
        if (typeof onActivated === 'function') {
          await onActivated()
        }
        window.alert('Subscription activated. Posting features are now available.')
      },
      modal: { ondismiss: () => {} },
      prefill: { name: 'Startup Admin', email: '' },
    })

    checkout.open()
  }, [startupId, refreshSubscription])

  return {
    loading,
    subscription,
    refreshSubscription,
    startSubscription,
    subscriptionPlan: SUBSCRIPTION_PLAN,
    subscriptionAmountInr: SUBSCRIPTION_AMOUNT_INR,
  }
}