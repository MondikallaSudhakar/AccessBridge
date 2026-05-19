import { useEffect, useState } from 'react'
import StartupJobApplicationsPage from './StartupJobApplicationsPage'
import { useAuth } from '../../context/AuthContext'
import { useStartupSubscription } from '../../hooks/useStartupSubscription'
import { COLORS } from '../../utils/colors'

const API = 'http://localhost:8081/api'

export default function StartupJobsPage() {
  const { user } = useAuth()
  const [startupId, setStartupId] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', employmentType: 'FULL_TIME', location: '', salaryRange: '', lastDateToApply: '' })
  const [saving, setSaving] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const { loading: subscriptionLoading, subscription, startSubscription } = useStartupSubscription(startupId)

  useEffect(() => {
    if (!user?.email) return
    fetch(`${API}/startups/email/${encodeURIComponent(user.email)}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((s) => { if (s?.id) setStartupId(s.id) })
      .catch(() => {})
  }, [user])

  const load = () => {
    if (!startupId) return
    setLoading(true)
    fetch(`${API}/startups/${startupId}/jobs`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { setJobs(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(load, [startupId])

  const post = async () => {
    if (!form.title.trim() || !form.description.trim()) return
    if (!subscription?.active) return
    // show explicit warning before posting
    if (!showWarning) { setShowWarning(true); return }

    setSaving(true)
    const res = await fetch(`${API}/startups/${startupId}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ ...form, status: 'OPEN' }),
    })
    if (res.ok) { setShowForm(false); setShowWarning(false); setForm({ title: '', description: '', employmentType: 'FULL_TIME', location: '', salaryRange: '', lastDateToApply: '' }); load() }
    setSaving(false)
  }

  const closeJob = async (jobId) => {
    await fetch(`${API}/startups/jobs/${jobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ status: 'CLOSED' }),
    })
    load()
  }

  const EMP_LABELS = { FULL_TIME: 'Full-time', PART_TIME: 'Part-time', CONTRACT: 'Contract', INTERN: 'Internship', VOLUNTEER: 'Volunteer' }

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  if (selectedJob) {
    return (
      <div>
        <button type="button" onClick={() => setSelectedJob(null)} className="mb-4 flex items-center gap-2 text-sm font-bold" style={{ color: COLORS.primary }}>
          ← Back to Jobs
        </button>
        <StartupJobApplicationsPage jobId={selectedJob.id} jobTitle={selectedJob.title} startupId={startupId} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Posted Jobs</h3>
          <p className="text-xs text-slate-500">{subscriptionLoading ? 'Checking subscription status...' : subscription?.active ? 'Subscription active' : 'Subscription required to post jobs'}</p>
        </div>
        <div className="flex gap-2">
          {!subscription?.active && (
            <button type="button" onClick={() => startSubscription({ onActivated: load })} className="rounded-xl px-4 py-2 text-xs font-bold text-white" style={{ backgroundColor: COLORS.success }}>
              Pay with Razorpay
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            disabled={!subscription?.active}
            className="rounded-xl px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
            style={{ backgroundColor: COLORS.success }}
          >
            {showForm ? '✕ Cancel' : '+ Post New Job'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">New Job Posting</p>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Job Title *</span>
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} type="text" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" placeholder="e.g. Product Designer" />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Employment Type</span>
              <select value={form.employmentType} onChange={(e) => setForm((f) => ({ ...f, employmentType: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400">
                {Object.entries(EMP_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Location</span>
              <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} type="text" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" placeholder="City / Remote" />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Salary Range</span>
              <input value={form.salaryRange} onChange={(e) => setForm((f) => ({ ...f, salaryRange: e.target.value }))} type="text" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" placeholder="e.g. ₹20,000–₹40,000/mo" />
            </label>
            <label className="block md:col-span-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Last Date to Apply</span>
              <input value={form.lastDateToApply} onChange={(e) => setForm((f) => ({ ...f, lastDateToApply: e.target.value }))} type="date" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" />
            </label>
          </div>
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Job Description *</span>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={4} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" placeholder="Describe responsibilities, requirements, and accessibility support offered…" />
          </label>

          {/* Warning modal area */}
          {showWarning && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm font-bold text-amber-800">Please confirm</p>
              <p className="mt-1 text-xs text-amber-700">Post jobs here only for persons with disabilities or specifically-abled persons. Ensure the listing includes accessibility information and reasonable accommodations.</p>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => setShowWarning(false)} className="rounded-xl px-4 py-2 text-xs font-bold bg-white border">Cancel</button>
                <button type="button" onClick={post} disabled={!subscription?.active} className="rounded-xl px-4 py-2 text-xs font-bold text-white disabled:opacity-60" style={{ backgroundColor: GREEN }}>{saving ? 'Posting…' : 'I confirm — Post job'}</button>
              </div>
            </div>
          )}

          {!showWarning && (
            <button type="button" onClick={post} disabled={saving || !form.title || !form.description || !subscription?.active} className="rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40" style={{ backgroundColor: GREEN }}>
              {saving ? 'Posting…' : 'Post Job'}
            </button>
          )}
        </div>
      )}

      {loading && <div className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white" />}

      {!loading && jobs.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
          <p className="text-sm font-bold text-slate-700">No jobs posted yet.</p>
          <p className="mt-1 text-xs text-slate-500">Click "Post New Job" to create your first inclusive job listing.</p>
        </div>
      )}

      {jobs.map((job) => (
        <div key={job.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase" style={{ backgroundColor: job.status === 'OPEN' ? '#dcfce7' : '#fee2e2', color: job.status === 'OPEN' ? COLORS.success : '#dc2626' }}>
                  {job.status}
                </span>
                {job.employmentType && <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">{EMP_LABELS[job.employmentType] || job.employmentType}</span>}
              </div>
              <h4 className="mt-1.5 text-base font-extrabold text-slate-900">{job.title}</h4>
              <p className="text-xs text-slate-500">{job.location ? `${job.location} • ` : ''}Last date: {fmtDate(job.lastDateToApply)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setSelectedJob(job)} className="rounded-xl px-3 py-1.5 text-xs font-bold text-white" style={{ backgroundColor: COLORS.success }}>
                View Applications
              </button>
              {job.status === 'OPEN' && (
                <button type="button" onClick={() => closeJob(job.id)} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100">
                  Close Job
                </button>
              )}
            </div>
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-slate-600">{job.description}</p>
        </div>
      ))}
    </div>
  )
}
