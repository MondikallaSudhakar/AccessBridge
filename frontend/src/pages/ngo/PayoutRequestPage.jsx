import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const COLORS = {
  primary: '#0197B2',
  success: '#5BCB2B',
  warning: '#f59e0b',
  danger: '#ef4444',
  slate: '#64748b',
  navy: '#0f172a',
}

const REQUEST_STATUSES = ['PENDING', 'SENT', 'SETTLED', 'CANCELLED']
const PAYOUT_ELIGIBLE_STATUSES = ['CONFIRMED', 'SHIPPED', 'DELIVERED']

const statusStyles = {
  PENDING: { bg: '#fef3c7', color: '#b45309', label: 'Pending' },
  SENT: { bg: '#dbeafe', color: '#1d4ed8', label: 'Sent' },
  SETTLED: { bg: '#dcfce7', color: '#166534', label: 'Settled' },
  CANCELLED: { bg: '#fee2e2', color: '#b91c1c', label: 'Cancelled' },
}

function money(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`
}

function toNumber(value) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

function normalizeOrder(order) {
  const items = Array.isArray(order?.items)
    ? order.items
    : Array.isArray(order?.orderItems)
      ? order.orderItems
      : []

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

function getStatusStyle(status) {
  return statusStyles[status] || statusStyles.PENDING
}

function getStorageKey(ngoId) {
  return `ngo-payout-requests-${ngoId}`
}

function readRequests(ngoId) {
  try {
    const raw = localStorage.getItem(getStorageKey(ngoId))
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function SummaryCard({ label, value, hint, tone = 'primary' }) {
  const bg = tone === 'success' ? '#f0fdf4' : tone === 'warning' ? '#fffbeb' : tone === 'danger' ? '#fef2f2' : '#f0f8fc'
  const accent = tone === 'success' ? COLORS.success : tone === 'warning' ? COLORS.warning : tone === 'danger' ? COLORS.danger : COLORS.primary

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ backgroundColor: bg, color: accent }}>
        {label}
      </div>
      <p className="mt-3 text-2xl font-black text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

export default function PayoutRequestPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [ngo, setNgo] = useState(null)
  const [orders, setOrders] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState('ALL')
  const [form, setForm] = useState({ amount: '', note: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user && user.role !== 'NGO_ADMIN' && user.role !== 'SUPER_ADMIN') {
      navigate('/dashboard')
    }
  }, [user, navigate])

  useEffect(() => {
    console.log('PayoutRequestPage mounted', { user, ngo })
  }, [])

  useEffect(() => {
    if (!user?.email) return

    let alive = true

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const ngoData = await api.get(`/ngos/email/${encodeURIComponent(user.email)}`)
        if (!alive) return

        const ngoId = ngoData?.id
        setNgo(ngoData || null)

        const orderData = ngoId ? await api.get(`/orders/ngo/${ngoId}/orders`) : []
        if (!alive) return

        setOrders(Array.isArray(orderData) ? orderData : [])

        // load persisted payout requests from backend
        if (ngoId) {
          try {
            const payoutData = await api.get(`/ngos/${ngoId}/payout-requests`)
            if (!alive) return
            setRequests(Array.isArray(payoutData) ? payoutData : [])
          } catch (pdErr) {
            // ignore payout load errors but surface to UI
            if (alive) setRequests([])
          }
        }
      } catch (loadError) {
        if (alive) {
          setNgo(null)
          setOrders([])
          setRequests([])
          setError(loadError.message || 'Failed to load payout request data.')
        }
      } finally {
        if (alive) setLoading(false)
      }
    }

    load()

    return () => {
      alive = false
    }
  }, [user?.email])

  const payoutEligibleOrders = useMemo(() => {
    return orders.filter((order) => PAYOUT_ELIGIBLE_STATUSES.includes(String(order.status || '').toUpperCase()))
  }, [orders])

  const visibleOrders = useMemo(() => {
    return [...orders]
      .map(normalizeOrder)
      .filter((order) => String(order.status || '').toUpperCase() !== 'CANCELLED')
      .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0))
  }, [orders])

  const deliveredAmount = useMemo(() => {
    return payoutEligibleOrders.reduce((sum, order) => sum + toNumber(order.sourceTotalPrice ?? order.orderTotalPrice ?? order.totalPrice), 0)
  }, [payoutEligibleOrders])

  const requestTotals = useMemo(() => {
    return requests.reduce(
      (accumulator, request) => {
        const amount = toNumber(request.amount)
        const status = String(request.status || 'PENDING').toUpperCase()
        if (status !== 'CANCELLED') accumulator.requested += amount
        if (status === 'PENDING') accumulator.pending += amount
        if (status === 'SENT') accumulator.sent += amount
        if (status === 'SETTLED') accumulator.settled += amount
        return accumulator
      },
      { requested: 0, pending: 0, sent: 0, settled: 0 },
    )
  }, [requests])

  const availableToRequest = Math.max(0, deliveredAmount - requestTotals.requested)

  const filteredRequests = useMemo(() => {
    const sorted = [...requests].sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0))
    return filter === 'ALL' ? sorted : sorted.filter((request) => String(request.status || 'PENDING').toUpperCase() === filter)
  }, [filter, requests])

  const requestStatusCounts = useMemo(() => {
    return REQUEST_STATUSES.reduce((accumulator, status) => {
      accumulator[status] = requests.filter((request) => String(request.status || 'PENDING').toUpperCase() === status).length
      return accumulator
    }, {})
  }, [requests])

  // persistence now happens on the server via API

  const flashSuccess = (message) => {
    setSuccess(message)
    window.setTimeout(() => setSuccess(''), 2500)
  }

  const submitRequest = async (event) => {
    event.preventDefault()
    if (!ngo?.id) return

    const amount = toNumber(form.amount)
    if (amount <= 0) {
      setError('Enter a valid payout amount.')
      return
    }
    if (amount > availableToRequest) {
      setError('Requested amount is higher than the available payout balance.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const created = await api.post(`/ngos/${ngo.id}/payout-requests`, { amount, notes: form.note.trim() })
      const nextRequests = [created, ...requests]
      setRequests(nextRequests)
      setForm({ amount: '', note: '' })
      flashSuccess('Payout request created.')
    } catch (submitError) {
      setError(submitError.message || 'Unable to create payout request.')
    } finally {
      setSubmitting(false)
    }
  }

  const updateRequestStatus = (requestId, status) => {
    if (!ngo?.id) return

    // admin-only operation: call server
    api.patch(`/ngos/payout-requests/${requestId}/status`, { status })
      .then((updated) => {
        setRequests((current) => current.map((r) => (r.id === updated.id ? updated : r)))
      })
      .catch((err) => setError(err.message || 'Failed to update request status'))
  }

  const removeRequest = (requestId) => {
    if (!ngo?.id) return
    // cancel via server endpoint
    api.patch(`/ngos/${ngo.id}/payout-requests/${requestId}/cancel`, {})
      .then((updated) => {
        setRequests((current) => current.map((r) => (r.id === updated.id ? updated : r)))
      })
      .catch((err) => setError(err.message || 'Failed to cancel payout request'))
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div>
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1" style={{ backgroundColor: `${COLORS.success}12` }}>
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.success }} />
              <span className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: COLORS.success }}>NGO Payout Request</span>
            </div>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900">Payout Request</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
              Request money from the platform against completed orders. The page keeps track of pending, sent, and settled payout requests in one place.
            </p>
          </div>
        </section>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-sm">
            {success}
          </div>
        )}

        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="h-72 animate-pulse rounded-3xl bg-white shadow-sm" />
            <div className="h-72 animate-pulse rounded-3xl bg-white shadow-sm" />
          </div>
        ) : (
          <>
            {/* Empty-state: show a friendly message when there are no payout-eligible orders and no requests */}
            {!loading && (deliveredAmount <= 0) && requests.length === 0 && (
              <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center text-slate-500">
                <h3 className="text-lg font-bold text-slate-900">No payouts available</h3>
                <p className="mt-2">There are no confirmed, shipped, or delivered orders yet, so no payout is available. Once an order reaches one of those states, its amount will appear here and you can create payout requests.</p>
              </div>
            )}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard label="Available to Request" value={money(availableToRequest)} hint="Confirmed, shipped, or delivered orders minus all active requests" tone="success" />
              <SummaryCard label="Pending" value={money(requestTotals.pending)} hint={`${requestStatusCounts.PENDING || 0} request${(requestStatusCounts.PENDING || 0) === 1 ? '' : 's'}` } tone="warning" />
              <SummaryCard label="Sent" value={money(requestTotals.sent)} hint={`${requestStatusCounts.SENT || 0} request${(requestStatusCounts.SENT || 0) === 1 ? '' : 's'}` } tone="primary" />
              <SummaryCard label="Settled" value={money(requestTotals.settled)} hint={`${requestStatusCounts.SETTLED || 0} request${(requestStatusCounts.SETTLED || 0) === 1 ? '' : 's'}` } tone="success" />
            </div>

            <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Order records</h2>
                  <p className="mt-1 text-sm text-slate-500">All non-cancelled NGO orders are shown here, and confirmed or later orders count toward payout availability.</p>
                </div>
                <div className="text-sm text-slate-500">
                  Showing <span className="font-bold text-slate-900">{visibleOrders.length}</span> order{visibleOrders.length === 1 ? '' : 's'}
                </div>
              </div>

              <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-xs uppercase tracking-[0.14em] text-slate-500">
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Order Total</th>
                      <th className="px-4 py-3 text-right">Your Share</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {visibleOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                          No orders found yet.
                        </td>
                      </tr>
                    ) : (
                      visibleOrders.map((order) => (
                        <tr key={order.orderId ?? order.id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-4 font-mono text-xs font-semibold text-slate-900">#{order.orderId ?? order.id ?? '—'}</td>
                          <td className="px-4 py-4">
                            <div className="font-semibold text-slate-900">{order.buyerName || 'Community User'}</div>
                            <div className="text-xs text-slate-500">{order.buyerEmail || 'No email'}</div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700">
                              {order.status || 'PENDING'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right font-semibold text-slate-900">₹{Number(order.orderTotalPrice ?? order.totalPrice ?? 0).toLocaleString('en-IN')}</td>
                          <td className="px-4 py-4 text-right font-semibold text-emerald-600">₹{Number(order.sourceTotalPrice ?? order.sourceTotal ?? 0).toLocaleString('en-IN')}</td>
                          <td className="px-4 py-4 text-sm text-slate-600">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Request history</h2>
                    <p className="mt-1 text-sm text-slate-500">Track every payout request by status. Use the buttons to move a request through the workflow.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['ALL', 'PENDING', 'SENT', 'SETTLED', 'CANCELLED'].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setFilter(status)}
                        className="rounded-full border px-3 py-1.5 text-xs font-bold transition-colors"
                        style={{
                          borderColor: filter === status ? `${COLORS.success}40` : '#e2e8f0',
                          backgroundColor: filter === status ? '#f0fdf4' : '#fff',
                          color: filter === status ? '#166534' : COLORS.slate,
                        }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {filteredRequests.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                      No payout requests yet. Create one on the right to start tracking the balance.
                    </div>
                  ) : (
                    filteredRequests.map((request) => {
                      const style = getStatusStyle(String(request.status || 'PENDING').toUpperCase())
                      return (
                        <article key={request.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-base font-extrabold text-slate-900">{request.reference || `PR-${request.id}`}</h3>
                                <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold" style={{ backgroundColor: style.bg, color: style.color }}>
                                  {style.label}
                                </span>
                              </div>
                              <p className="mt-1 text-sm font-bold text-slate-900">{money(request.amount)}</p>
                              <p className="mt-1 text-xs text-slate-500">{request.createdAt ? new Date(request.createdAt).toLocaleString('en-IN') : '—'}</p>
                              {request.note && <p className="mt-3 text-sm leading-6 text-slate-600">{request.note}</p>}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {request.status === 'PENDING' && (
                                <button
                                  type="button"
                                  onClick={() => updateRequestStatus(request.id, 'SENT')}
                                  className="rounded-lg px-3 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
                                  style={{ backgroundColor: COLORS.primary }}
                                >
                                  Mark Sent
                                </button>
                              )}
                              {request.status === 'SENT' && (
                                <button
                                  type="button"
                                  onClick={() => updateRequestStatus(request.id, 'SETTLED')}
                                  className="rounded-lg px-3 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
                                  style={{ backgroundColor: COLORS.success }}
                                >
                                  Mark Settled
                                </button>
                              )}
                              {request.status !== 'SETTLED' && request.status !== 'CANCELLED' && (
                                <button
                                  type="button"
                                  onClick={() => updateRequestStatus(request.id, 'CANCELLED')}
                                  className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
                                >
                                  Cancel
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => removeRequest(request.id)}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </article>
                      )
                    })
                  )}
                </div>
              </section>

              <aside className="space-y-6">
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-black text-slate-900">Request payout</h2>
                  <p className="mt-1 text-sm text-slate-500">Create a request from the amount currently available to your NGO.</p>

                  <form onSubmit={submitRequest} className="mt-5 space-y-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Amount</label>
                      <input
                        type="number"
                        min="1"
                        max={availableToRequest}
                        value={form.amount}
                        onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-400"
                        placeholder="Enter amount to request"
                      />
                      <p className="mt-1 text-xs text-slate-500">Maximum available: {money(availableToRequest)}</p>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Note</label>
                      <textarea
                        rows="4"
                        value={form.note}
                        onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-400"
                        placeholder="Optional note for the platform team"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || availableToRequest <= 0}
                      className="w-full rounded-xl px-4 py-3 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      style={{ backgroundColor: COLORS.success }}
                    >
                      {submitting ? 'Submitting…' : 'Request Amount'}
                    </button>
                  </form>
                </section>
              </aside>
            </div>
          </>
        )}
      </div>
    </div>
  )
}