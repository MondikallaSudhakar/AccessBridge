import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

/* ── colours ── */
const G  = '#5BCB2B'   // brand green
const B  = '#1A8FD1'   // brand blue
const NAVY = '#0f172a'

const PAYOUT_ELIGIBLE_STATUSES = ['CONFIRMED', 'SHIPPED', 'DELIVERED']
const REQUEST_STATUSES = ['PENDING', 'SENT', 'SETTLED', 'CANCELLED']

const STATUS = {
  PENDING:   { bg: '#fef9c3', color: '#854d0e',  dot: '#f59e0b', label: 'Pending'   },
  SENT:      { bg: '#dbeafe', color: '#1d4ed8',  dot: '#3b82f6', label: 'Sent'      },
  SETTLED:   { bg: '#dcfce7', color: '#166534',  dot: '#22c55e', label: 'Settled'   },
  CANCELLED: { bg: '#fee2e2', color: '#b91c1c',  dot: '#ef4444', label: 'Cancelled' },
}

const money = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`
const toNum  = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0 }
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const st = (s) => STATUS[String(s || 'PENDING').toUpperCase()] || STATUS.PENDING

/* ── Stat chip ── */
function StatChip({ label, value, sub, accent }) {
  return (
    <div style={{
      flex: '1 1 140px', minWidth: 130,
      background: '#fff',
      border: `1.5px solid ${accent}30`,
      borderRadius: 16, padding: '14px 18px',
      boxShadow: `0 2px 10px ${accent}12`,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: NAVY, lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

/* ── Request card ── */
function RequestCard({ request, isSuperAdmin, onUpdate, onCancel }) {
  const s = st(request.status)
  const status = String(request.status || 'PENDING').toUpperCase()
  return (
    <div style={{
      background: '#fff',
      border: '1.5px solid #e9ecef',
      borderRadius: 14,
      padding: '16px 18px',
      transition: 'box-shadow .15s, border-color .15s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = `${G}50`}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#e9ecef'}
    >
      {/* top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: NAVY }}>
              {request.reference || `PR-${request.id}`}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700, borderRadius: 20,
              padding: '2px 9px', background: s.bg, color: s.color,
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
              {s.label}
            </span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: NAVY }}>{money(request.amount)}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{fmtDate(request.createdAt)}</div>
          {request.note && (
            <div style={{ marginTop: 6, fontSize: 12, color: '#64748b', background: '#f8fafc', borderRadius: 8, padding: '6px 10px' }}>
              {request.note}
            </div>
          )}
        </div>

        {/* action buttons */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {isSuperAdmin && status === 'PENDING' && (
            <button onClick={() => onUpdate(request.id, 'SENT')} style={actionBtn(B)}>Mark Sent</button>
          )}
          {isSuperAdmin && status === 'SENT' && (
            <button onClick={() => onUpdate(request.id, 'SETTLED')} style={actionBtn(G)}>Mark Settled</button>
          )}
          {status !== 'SETTLED' && status !== 'CANCELLED' && (
            <button onClick={() => onCancel(request.id)} style={actionBtn('#ef4444', true)}>Cancel</button>
          )}
        </div>
      </div>
    </div>
  )
}

function actionBtn(color, outline = false) {
  return {
    fontSize: 11, fontWeight: 700, borderRadius: 20, cursor: 'pointer',
    padding: '5px 12px', border: `1.5px solid ${color}`,
    background: outline ? 'transparent' : color,
    color: outline ? color : '#fff',
    transition: 'opacity .15s',
    whiteSpace: 'nowrap',
  }
}

/* ── Main component ── */
export default function PayoutRequestPage() {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'SUPER_ADMIN'

  const [ngo, setNgo]           = useState(null)
  const [orders, setOrders]     = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter]     = useState('ALL')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ amount: '', note: '' })
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')

  /* load data */
  useEffect(() => {
    if (!user?.email) return
    let alive = true
    const load = async () => {
      setLoading(true); setError('')
      try {
        const ngoData = await api.get(`/ngos/email/${encodeURIComponent(user.email)}`)
        if (!alive) return
        setNgo(ngoData || null)
        const ngoId = ngoData?.id
        const orderData = ngoId ? await api.get(`/orders/ngo/${ngoId}/orders`) : []
        if (!alive) return
        setOrders(Array.isArray(orderData) ? orderData : [])
        if (ngoId) {
          try {
            const pd = await api.get(`/ngos/${ngoId}/payout-requests`)
            if (alive) setRequests(Array.isArray(pd) ? pd : [])
          } catch { if (alive) setRequests([]) }
        }
      } catch (e) {
        if (alive) { setNgo(null); setOrders([]); setRequests([]); setError(e.message || 'Failed to load.') }
      } finally { if (alive) setLoading(false) }
    }
    load()
    return () => { alive = false }
  }, [user?.email])

  /* derived */
  const eligibleOrders = useMemo(() =>
    orders.filter(o => PAYOUT_ELIGIBLE_STATUSES.includes(String(o.status || '').toUpperCase())), [orders])

  const eligibleAmount = useMemo(() =>
    eligibleOrders.reduce((s, o) => s + toNum(o.sourceTotalPrice ?? o.orderTotalPrice ?? o.totalPrice), 0), [eligibleOrders])

  const totals = useMemo(() => requests.reduce((acc, r) => {
    const a = toNum(r.amount), s = String(r.status || 'PENDING').toUpperCase()
    if (s !== 'CANCELLED') acc.requested += a
    if (s === 'PENDING')   acc.pending   += a
    if (s === 'SENT')      acc.sent      += a
    if (s === 'SETTLED')   acc.settled   += a
    return acc
  }, { requested: 0, pending: 0, sent: 0, settled: 0 }), [requests])

  const available = Math.max(0, eligibleAmount - totals.requested)

  const filtered = useMemo(() => {
    const sorted = [...requests].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    return filter === 'ALL' ? sorted : sorted.filter(r => String(r.status || 'PENDING').toUpperCase() === filter)
  }, [filter, requests])

  const counts = useMemo(() =>
    REQUEST_STATUSES.reduce((a, s) => {
      a[s] = requests.filter(r => String(r.status || 'PENDING').toUpperCase() === s).length; return a
    }, {}), [requests])

  /* actions */
  const flash = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000) }

  const submit = async (e) => {
    e.preventDefault()
    const amount = toNum(form.amount)
    if (amount <= 0) { setError('Enter a valid amount.'); return }
    if (amount > available) { setError('Amount exceeds available balance.'); return }
    setSubmitting(true); setError('')
    try {
      const created = await api.post(`/ngos/${ngo.id}/payout-requests`, { amount, notes: form.note.trim() })
      setRequests(prev => [created, ...prev])
      setForm({ amount: '', note: '' })
      setShowForm(false)
      flash('✅ Payout request submitted!')
    } catch (err) {
      setError(err.message || 'Failed to submit.')
    } finally { setSubmitting(false) }
  }

  const updateStatus = (id, status) => {
    api.patch(`/ngos/payout-requests/${id}/status`, { status })
      .then(updated => setRequests(prev => prev.map(r => r.id === updated.id ? updated : r)))
      .catch(e => setError(e.message || 'Failed to update status.'))
  }

  const cancelRequest = (id) => {
    api.patch(`/ngos/${ngo?.id}/payout-requests/${id}/cancel`, {})
      .then(updated => setRequests(prev => prev.map(r => r.id === updated.id ? updated : r)))
      .catch(e => setError(e.message || 'Failed to cancel.'))
  }

  /* ── render ── */
  if (loading) return (
    <div style={{ padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${G}30`, borderTopColor: G, animation: 'spin .8s linear infinite' }} />
      <p style={{ fontSize: 13, color: '#64748b' }}>Loading payout data…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Header row ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: NAVY }}>Payouts</h2>
          <p style={{ margin: '3px 0 0', fontSize: 12, color: '#64748b' }}>
            {eligibleOrders.length} eligible order{eligibleOrders.length !== 1 ? 's' : ''} · {requests.length} request{requests.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => { setShowForm(v => !v); setError('') }}
          disabled={available <= 0}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '9px 20px', borderRadius: 12, border: 'none',
            background: available <= 0 ? '#e2e8f0' : G,
            color: available <= 0 ? '#94a3b8' : '#fff',
            fontWeight: 700, fontSize: 13, cursor: available <= 0 ? 'not-allowed' : 'pointer',
            boxShadow: available > 0 ? `0 3px 10px ${G}40` : 'none',
            transition: 'all .15s',
          }}
        >
          {showForm ? '✕ Close' : '＋ New Payout Request'}
        </button>
      </div>

      {/* ── Alerts ── */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626', fontWeight: 600 }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#166534', fontWeight: 600 }}>
          {success}
        </div>
      )}

      {/* ── Stat chips ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <StatChip label="Available" value={money(available)} sub="Ready to request" accent={G} />
        <StatChip label="Pending"   value={money(totals.pending)} sub={`${counts.PENDING || 0} request${counts.PENDING !== 1 ? 's' : ''}`} accent="#f59e0b" />
        <StatChip label="Sent"      value={money(totals.sent)}    sub={`${counts.SENT || 0} request${counts.SENT !== 1 ? 's' : ''}`}    accent={B} />
        <StatChip label="Settled"   value={money(totals.settled)} sub={`${counts.SETTLED || 0} settled`}  accent="#22c55e" />
      </div>

      {/* ── Request form (inline collapsible) ── */}
      {showForm && (
        <div style={{
          background: '#fff', border: `1.5px solid ${G}40`,
          borderRadius: 16, padding: '20px 22px',
          boxShadow: `0 4px 20px ${G}12`,
        }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800, color: NAVY }}>New Payout Request</h3>
          <p style={{ margin: '0 0 16px', fontSize: 12, color: '#64748b' }}>
            Max available: <strong style={{ color: G }}>{money(available)}</strong>
          </p>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Amount (₹) *
              </label>
              <input
                type="number" required min="1" max={available}
                value={form.amount}
                onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                placeholder={`Up to ${money(available)}`}
                style={{
                  display: 'block', width: '100%', boxSizing: 'border-box',
                  marginTop: 5, border: '1.5px solid #e2e8f0', borderRadius: 10,
                  padding: '10px 13px', fontSize: 14, color: NAVY,
                  outline: 'none', fontFamily: "'Inter', sans-serif",
                }}
                onFocus={e => { e.target.style.borderColor = G; e.target.style.boxShadow = `0 0 0 3px ${G}20` }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Note (optional)
              </label>
              <textarea
                rows={3} value={form.note}
                onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                placeholder="Any note for the platform team…"
                style={{
                  display: 'block', width: '100%', boxSizing: 'border-box',
                  marginTop: 5, border: '1.5px solid #e2e8f0', borderRadius: 10,
                  padding: '10px 13px', fontSize: 13, color: NAVY, resize: 'vertical',
                  outline: 'none', fontFamily: "'Inter', sans-serif",
                }}
                onFocus={e => { e.target.style.borderColor = G; e.target.style.boxShadow = `0 0 0 3px ${G}20` }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="submit" disabled={submitting}
                style={{
                  padding: '10px 22px', borderRadius: 10, border: 'none',
                  background: submitting ? '#94a3b8' : G, color: '#fff',
                  fontWeight: 700, fontSize: 13, cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: submitting ? 'none' : `0 3px 10px ${G}40`,
                }}
              >
                {submitting ? 'Submitting…' : 'Submit Request'}
              </button>
              <button
                type="button" onClick={() => setShowForm(false)}
                style={{
                  padding: '10px 18px', borderRadius: 10,
                  border: '1.5px solid #e2e8f0', background: '#fff',
                  color: '#64748b', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Filter tabs ── */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {['ALL', ...REQUEST_STATUSES].map(s => {
          const active = filter === s
          const cnt = s === 'ALL' ? requests.length : (counts[s] || 0)
          return (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${active ? G : '#e2e8f0'}`,
              background: active ? `${G}12` : '#fff',
              color: active ? '#166534' : '#64748b',
              fontWeight: active ? 700 : 500, fontSize: 12, cursor: 'pointer',
              transition: 'all .15s',
              display: 'inline-flex', alignItems: 'center', gap: 5,
            }}>
              {s === 'ALL' ? 'All' : s[0] + s.slice(1).toLowerCase()}
              <span style={{
                fontSize: 10, fontWeight: 800, borderRadius: 10, padding: '1px 6px',
                background: active ? G : '#f1f5f9', color: active ? '#fff' : '#64748b',
              }}>{cnt}</span>
            </button>
          )
        })}
      </div>

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '48px 24px',
          border: '1.5px dashed #e2e8f0', borderRadius: 16,
          background: '#fafbfc',
        }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>💸</div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#334155' }}>
            {filter === 'ALL' ? 'No payout requests yet' : `No ${filter.toLowerCase()} requests`}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>
            {filter === 'ALL' && available > 0
              ? 'Click "New Payout Request" above to get started.'
              : filter === 'ALL'
              ? 'Once orders are confirmed or delivered, you can request payouts here.'
              : `No requests with status "${filter}" found.`}
          </p>
        </div>
      )}

      {/* ── Request cards ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(req => (
          <RequestCard
            key={req.id}
            request={req}
            isSuperAdmin={isSuperAdmin}
            onUpdate={updateStatus}
            onCancel={cancelRequest}
          />
        ))}
      </div>

      {/* ── Orders snapshot ── */}
      {eligibleOrders.length > 0 && (
        <details style={{ border: '1.5px solid #e9ecef', borderRadius: 14, overflow: 'hidden' }}>
          <summary style={{
            padding: '12px 18px', fontSize: 13, fontWeight: 700, color: NAVY,
            cursor: 'pointer', userSelect: 'none', background: '#f8fafc',
            listStyle: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span>📦 Eligible Orders Snapshot</span>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>
              {eligibleOrders.length} orders · {money(eligibleAmount)} total
            </span>
          </summary>
          <div style={{ padding: '0 18px 14px', display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
            {eligibleOrders.slice(0, 10).map(o => (
              <div key={o.orderId ?? o.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                background: '#fff', border: '1px solid #f1f5f9', borderRadius: 10, padding: '10px 14px', fontSize: 12,
              }}>
                <div>
                  <span style={{ fontWeight: 700, color: NAVY }}>#{o.orderId ?? o.id}</span>
                  <span style={{ color: '#64748b', marginLeft: 8 }}>{o.buyerName || 'Customer'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                    background: '#d1fae5', color: '#065f46',
                  }}>{o.status}</span>
                  <span style={{ fontWeight: 700, color: G }}>{money(o.sourceTotalPrice ?? o.orderTotalPrice ?? o.totalPrice)}</span>
                </div>
              </div>
            ))}
            {eligibleOrders.length > 10 && (
              <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
                +{eligibleOrders.length - 10} more orders
              </p>
            )}
          </div>
        </details>
      )}
    </div>
  )
}