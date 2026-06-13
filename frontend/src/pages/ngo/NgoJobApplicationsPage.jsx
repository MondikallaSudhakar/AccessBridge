import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'

const API = '/api'

const STATUS_STYLE = {
  PENDING: { bg: '#fef3c7', color: '#d97706', label: 'Pending' },
  SHORTLISTED: { bg: '#dbeafe', color: '#2563eb', label: 'Shortlisted' },
  HIRED: { bg: '#dcfce7', color: '#16a34a', label: 'Hired' },
  REJECTED: { bg: '#fee2e2', color: '#dc2626', label: 'Rejected' },
}

const GREEN = '#5BCB2B'

function fmt(dateStr) {
  if (!dateStr) return '—'
  try { return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
  catch { return '—' }
}

function ApplicationCard({ app, onStatusChange }) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState(app.status)
  const [note, setNote] = useState(app.ngoReviewNote || '')
  const [saving, setSaving] = useState(false)
  const style = STATUS_STYLE[status] || STATUS_STYLE.PENDING

  const save = async (newStatus) => {
    setSaving(true)
    try {
      const params = new URLSearchParams({ status: newStatus, reviewNote: note })
      const res = await fetch(`${API}/ngos/jobs/applications/${app.id}/status?${params}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      if (res.ok) {
        setStatus(newStatus)
        onStatusChange(app.id, newStatus)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-extrabold text-slate-900">{app.applicantName}</p>
          <p className="mt-0.5 text-xs font-semibold text-slate-500">{app.applicantEmail} {app.applicantPhone ? `• ${app.applicantPhone}` : ''}</p>
          {app.disabilityType && (
            <span className="mt-1 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              {app.disabilityType}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase" style={{ backgroundColor: style.bg, color: style.color }}>
            {style.label}
          </span>
          <span className="text-xs text-slate-400">{fmt(app.appliedAt)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-3 text-xs font-bold"
        style={{ color: GREEN }}
      >
        {open ? '▲ Hide details' : '▼ View application'}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {app.coverLetter && (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cover Letter</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{app.coverLetter}</p>
            </div>
          )}
          {app.resumeText && (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Resume / Skills</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{app.resumeText}</p>
            </div>
          )}
          {app.audioNoteFileName && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Audio Note Attached</p>
              <p className="mt-1 text-xs font-semibold text-slate-700">{app.audioNoteFileName}</p>
            </div>
          )}

          {/* Review actions */}
          <div className="rounded-xl border border-slate-200 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Review Note</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400"
              placeholder="Add a note for internal tracking…"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {['SHORTLISTED', 'HIRED', 'REJECTED', 'PENDING'].map((s) => {
                const st = STATUS_STYLE[s]
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={saving || status === s}
                    onClick={() => save(s)}
                    className="rounded-xl px-3 py-1.5 text-xs font-bold disabled:opacity-40 transition-opacity"
                    style={{ backgroundColor: st.bg, color: st.color }}
                  >
                    {saving && status !== s ? '…' : st.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </article>
  )
}

export default function NgoJobApplicationsPage({ jobId, jobTitle, ngoId }) {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!jobId) return
    setLoading(true)
    fetch(`${API}/ngos/jobs/${jobId}/applications`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { setApplications(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [jobId])

  const handleStatusChange = (id, newStatus) => {
    setApplications((prev) => prev.map((a) => a.id === id ? { ...a, status: newStatus } : a))
  }

  const FILTER_OPTS = ['all', 'PENDING', 'SHORTLISTED', 'HIRED', 'REJECTED']

  const visible = filter === 'all'
    ? applications
    : applications.filter((a) => a.status === filter)

  const counts = FILTER_OPTS.reduce((acc, f) => {
    acc[f] = f === 'all' ? applications.length : applications.filter((a) => a.status === f).length
    return acc
  }, {})

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: GREEN }}>Job Applications</p>
          <h3 className="mt-0.5 text-lg font-extrabold text-slate-900">{jobTitle || 'Applications'}</h3>
        </div>
        <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: '#f0f9e7', color: GREEN }}>
          {applications.length} total
        </span>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {FILTER_OPTS.map((f) => {
          const st = f === 'all' ? { bg: GREEN, color: '#fff' } : STATUS_STYLE[f]
          const active = filter === f
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className="rounded-xl px-3 py-1.5 text-xs font-bold transition-all"
              style={{
                backgroundColor: active ? (f === 'all' ? GREEN : st.bg) : '#f1f5f9',
                color: active ? (f === 'all' ? '#fff' : st.color) : '#64748b',
              }}
            >
              {f === 'all' ? 'All' : STATUS_STYLE[f].label} ({counts[f]})
            </button>
          )
        })}
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2].map((n) => <div key={n} className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}
        </div>
      )}

      {!loading && visible.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
          <p className="font-bold text-slate-700">No {filter === 'all' ? '' : filter.toLowerCase() + ' '}applications yet.</p>
          <p className="mt-1 text-sm text-slate-500">Applications submitted via the platform will appear here.</p>
        </div>
      )}

      {!loading && visible.map((app) => (
        <ApplicationCard key={app.id} app={app} onStatusChange={handleStatusChange} />
      ))}
    </div>
  )
}
