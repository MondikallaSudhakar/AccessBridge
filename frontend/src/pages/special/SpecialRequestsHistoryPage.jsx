import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const NAVY = '#0f172a'
const G = '#16a34a'
const B = '#1A8FD1'
const TEAL = '#0d9488'

const STATUS_BADGE = {
  PENDING: { bg: '#fef3c7', color: '#d97706', label: 'Pending' },
  ACCEPTED: { bg: '#dcfce7', color: '#16a34a', label: 'Accepted' },
  DECLINED: { bg: '#fee2e2', color: '#dc2626', label: 'Declined' },
}

function fmt(dateStr) {
  if (!dateStr) return null
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return null
  }
}

function RequestCard({ request }) {
  const status = STATUS_BADGE[request.status] || STATUS_BADGE.PENDING
  const createdDate = fmt(request.createdAt)
  const requestTypeLabel = request.requestType?.replace(/_/g, ' ') || 'General Support'

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
              style={{ backgroundColor: status.bg, color: status.color }}
            >
              {status.label}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
              {requestTypeLabel}
            </span>
          </div>
          <h4 className="text-base font-extrabold text-slate-900">{request.title}</h4>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Sent to: {request.ngo?.name || 'NGO'}
            {request.preferredCity && ` • ${request.preferredCity}`}
          </p>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">{request.description}</p>

      <div className="mt-4 flex flex-wrap gap-4 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
        <div className="flex flex-col">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Submitted</span>
          <span className="text-xs font-bold text-slate-700">{createdDate || '—'}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Contact</span>
          <span className="text-xs font-bold text-slate-700">{request.requesterPhone || 'Not provided'}</span>
        </div>
      </div>

      {request.ngoResponseNote && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">NGO Response</span>
          <p className="mt-1 text-sm text-slate-600">{request.ngoResponseNote}</p>
        </div>
      )}
    </article>
  )
}

export default function SpecialRequestsHistoryPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all | PENDING | ACCEPTED | DECLINED

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const response = await api.get(`/ngos/support-requests/history?email=${encodeURIComponent(user?.email || '')}`)
        const data = Array.isArray(response) ? response : response.data || []
        setRequests(data)
      } catch (err) {
        console.error('Failed to load request history:', err)
        setRequests([])
      }
      setLoading(false)
    }

    if (user?.email) {
      load()
    }
  }, [user?.email])

  const visible = filter === 'all'
    ? requests
    : requests.filter((r) => r.status === filter)

  const FILTERS = [
    { id: 'all', label: 'All', count: requests.length },
    { id: 'PENDING', label: 'Pending', count: requests.filter((r) => r.status === 'PENDING').length },
    { id: 'ACCEPTED', label: 'Accepted', count: requests.filter((r) => r.status === 'ACCEPTED').length },
    { id: 'DECLINED', label: 'Declined', count: requests.filter((r) => r.status === 'DECLINED').length },
  ]

  return (
    <section style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,.05)', fontFamily: "'Inter',sans-serif" }}>
      <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 900, color: NAVY }}>Request History</h2>
      <p style={{ margin: '0 0 24px', fontSize: 13, color: '#64748b' }}>
        View all help requests you've submitted to NGOs and their responses.
      </p>

      {/* Filter chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className="rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all"
            style={{
              backgroundColor: filter === f.id ? B : '#f1f5f9',
              color: filter === f.id ? '#ffffff' : '#475569',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {[1, 2, 3].map((n) => (
            <div key={n} style={{ height: 200, backgroundColor: '#f1f5f9', borderRadius: 16, animation: 'pulse 2s' }} />
          ))}
        </div>
      )}

      {!loading && visible.length === 0 && (
        <div style={{ border: '2px dashed #e2e8f0', borderRadius: 14, padding: '40px 24px', textAlign: 'center', color: '#94a3b8' }}>
          <p style={{ fontSize: 28, margin: '0 0 8px' }}>📋</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: NAVY, margin: '0 0 6px' }}>
            {filter === 'all' ? 'No requests yet' : `No ${filter.toLowerCase()} requests`}
          </p>
          <p style={{ fontSize: 13, margin: 0 }}>
            {filter === 'all'
              ? 'Your help requests to NGOs will appear here.'
              : `Try a different filter to see all your requests.`}
          </p>
        </div>
      )}

      {!loading && visible.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {visible.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </section>
  )
}
