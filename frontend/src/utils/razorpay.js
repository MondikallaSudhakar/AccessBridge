const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js'

export function loadRazorpayScript() {
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

export async function openRazorpayCheckout({
  order,
  name,
  description,
  themeColor = '#0d9488',
  notes = {},
  prefill = {},
  onSuccess,
}) {
  if (!order) {
    throw new Error('Unable to start Razorpay checkout.')
  }

  const razorpayKeyId = order?.keyId
  const razorpayOrderId = order?.id || order?.orderId
  if (!razorpayKeyId || !razorpayOrderId) {
    throw new Error('Unable to create a Razorpay order from the backend.')
  }

  const scriptReady = await loadRazorpayScript()
  if (!scriptReady || !window.Razorpay) {
    throw new Error('Unable to load Razorpay checkout.')
  }

  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay({
      key: razorpayKeyId,
      order_id: razorpayOrderId,
      amount: order.amountPaise || Math.round(Number(order.amount || 0) * 100),
      currency: order.currency || 'INR',
      name,
      description,
      notes,
      theme: { color: themeColor },
      handler: async (response) => {
        try {
          const result = await onSuccess(response)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      },
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled')),
      },
      prefill,
    })

    checkout.open()
  })
}