import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const STATUS_BADGE = {
  PENDING: { bg: '#fef3c7', color: '#d97706', label: 'Pending' },
  ACCEPTED: { bg: '#dcfce7', color: '#16a34a', label: 'Accepted' },
  DECLINED: { bg: '#fee2e2', color: '#dc2626', label: 'Declined' },
}

function formatDate(value) {
  if (!value) return 'Not available'
  try {
    return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return 'Not available'
  }
}

function RequestCard({ request }) {
  const status = STATUS_BADGE[request.status] || STATUS_BADGE.PENDING
  const typeLabel = (request.requestType || 'GENERAL_SUPPORT').replace(/_/g, ' ')

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ backgroundColor: status.bg, color: status.color }}>
              {status.label}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
              {typeLabel}
            </span>
          </div>
          <h4 className="text-base font-extrabold text-slate-900">{request.title}</h4>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Sent to: {request.ngo?.name || 'NGO'}
            {request.preferredCity ? ` • ${request.preferredCity}` : ''}
          </p>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-slate-600">{request.description}</p>

      <div className="mt-4 flex flex-wrap gap-4 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Submitted</p>
          <p className="text-xs font-bold text-slate-700">{formatDate(request.createdAt)}</p>
        </div>
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Contact</p>
          <p className="text-xs font-bold text-slate-700">{request.requesterPhone || 'Not provided'}</p>
        </div>
      </div>

      {request.ngoResponseNote && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">NGO Response</p>
          <p className="mt-1 text-sm text-slate-600">{request.ngoResponseNote}</p>
        </div>
      )}
    </article>
  )
}

export default function GuardianRequestsHistoryPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const response = await api.get(`/ngos/support-requests/history?email=${encodeURIComponent(user?.email || '')}`)
        const data = Array.isArray(response) ? response : []
        setRequests(data)
      } catch {
        setRequests([])
      } finally {
        setLoading(false)
      }
    }

    if (user?.email) {
      load()
    } else {
      setLoading(false)
    }
  }, [user?.email])

  const visible = filter === 'all' ? requests : requests.filter((request) => request.status === filter)
  const filters = [
    { id: 'all', label: 'All', count: requests.length },
    { id: 'PENDING', label: 'Pending', count: requests.filter((request) => request.status === 'PENDING').length },
    { id: 'ACCEPTED', label: 'Accepted', count: requests.filter((request) => request.status === 'ACCEPTED').length },
    { id: 'DECLINED', label: 'Declined', count: requests.filter((request) => request.status === 'DECLINED').length },
  ]

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-black text-slate-900">Request History</h2>
      <p className="mt-1 text-sm text-slate-600">Review all support requests submitted by you and NGO responses.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setFilter(entry.id)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold ${filter === entry.id ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            {entry.label} ({entry.count})
          </button>
        ))}
      </div>

      {loading && (
        <p className="mt-6 text-sm text-slate-500">Loading request history...</p>
      )}

      {!loading && visible.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
          {filter === 'all' ? 'No requests submitted yet.' : `No ${filter.toLowerCase()} requests found.`}
        </div>
      )}

      {!loading && visible.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {visible.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </section>
  )
}
