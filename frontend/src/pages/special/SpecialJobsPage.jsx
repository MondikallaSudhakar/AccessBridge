import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { loadBookmarks, toggleBookmark } from './specialData'

const API = 'http://localhost:8081/api'

const STATUS_BADGE = {
  OPEN: { bg: '#dcfce7', color: '#16a34a', label: 'Open' },
  CLOSED: { bg: '#fee2e2', color: '#dc2626', label: 'Closed' },
}

const EMP_LABELS = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERN: 'Internship',
  VOLUNTEER: 'Volunteer',
}

function fmt(dateStr) {
  if (!dateStr) return null
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch { return null }
}

function JobCard({ job, bookmarked, onBookmark, onApply, ngoName }) {
  const status = STATUS_BADGE[job.status] || STATUS_BADGE.OPEN
  const lastDate = fmt(job.lastDateToApply)
  const isExpired = job.lastDateToApply && new Date(job.lastDateToApply) < new Date()

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
              style={{ backgroundColor: status.bg, color: status.color }}
            >
              {status.label}
            </span>
            {job.employmentType && (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                {EMP_LABELS[job.employmentType] || job.employmentType}
              </span>
            )}
          </div>
          <h4 className="mt-2 text-base font-extrabold text-slate-900">{job.title}</h4>
          <p className="mt-0.5 text-xs font-semibold text-slate-500">{ngoName}{job.location ? ` • ${job.location}` : ''}</p>
        </div>
        <button
          type="button"
          onClick={onBookmark}
          className="shrink-0 rounded-full border px-3 py-1 text-xs font-bold transition-colors"
          style={{ borderColor: bookmarked ? '#5BCB2B' : '#cbd5e1', color: bookmarked ? '#5BCB2B' : '#64748b' }}
        >
          {bookmarked ? '★ Saved' : '☆ Save'}
        </button>
      </div>

      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">{job.description}</p>

      {/* Date strip */}
      <div className="mt-3 flex flex-wrap gap-4 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
        {job.salaryRange && (
          <div className="flex flex-col">
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Salary</span>
            <span className="text-xs font-bold text-slate-700">{job.salaryRange}</span>
          </div>
        )}
        {lastDate && (
          <div className="flex flex-col">
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Last Date</span>
            <span className={`text-xs font-bold ${isExpired ? 'text-rose-500' : 'text-slate-700'}`}>{lastDate}</span>
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Posted</span>
          <span className="text-xs font-bold text-slate-700">{fmt(job.createdAt) || '—'}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onApply(job, ngoName)}
          disabled={job.status === 'CLOSED' || isExpired}
          className="rounded-xl px-4 py-2 text-xs font-bold text-white transition-opacity disabled:opacity-40"
          style={{ backgroundColor: '#0d9488' }}
        >
          Apply on Platform
        </button>
        <button
          type="button"
          onClick={onBookmark}
          className="rounded-xl border px-4 py-2 text-xs font-bold"
          style={{ borderColor: '#5BCB2B', color: '#5BCB2B' }}
        >
          {bookmarked ? 'Remove Save' : 'Save Job'}
        </button>
      </div>
    </article>
  )
}

function ApplicationModal({ job, ngoName, onClose, onSuccess }) {
  const { user } = useAuth()
  const [form, setForm] = useState({
    applicantName: user?.name || '',
    applicantEmail: user?.email || '',
    applicantPhone: '',
    disabilityType: '',
    coverLetter: `Hello,\n\nI am interested in the role: ${job.title} at ${ngoName}.\nPlease consider my profile and accessibility needs.\n\n`,
    resumeText: '',
  })
  const [audioFile, setAudioFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const submit = async () => {
    if (!form.applicantName.trim() || !form.applicantEmail.trim()) {
      setError('Name and email are required.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const payload = {
        ...form,
        audioNoteFileName: audioFile?.name || null,
      }
      const res = await fetch(`${API}/ngos/jobs/${job.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(payload),
      })
      if (res.status === 409) { setError('You have already applied for this job.'); return }
      if (!res.ok) { setError('Application failed. Please try again.'); return }
      onSuccess()
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 md:items-center">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">Apply on Platform</span>
            <h3 className="mt-0.5 text-lg font-extrabold text-slate-900">{job.title}</h3>
            <p className="text-sm text-slate-500">{ngoName}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-50">
            ✕ Close
          </button>
        </div>

        <div className="space-y-4 p-5">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {error}
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Full Name *</span>
              <input
                value={form.applicantName}
                onChange={update('applicantName')}
                type="text"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500"
                placeholder="Your full name"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Email *</span>
              <input
                value={form.applicantEmail}
                onChange={update('applicantEmail')}
                type="email"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500"
                placeholder="your@email.com"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Phone</span>
              <input
                value={form.applicantPhone}
                onChange={update('applicantPhone')}
                type="tel"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500"
                placeholder="Mobile number"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Disability Type <span className="normal-case font-normal text-slate-400">(optional)</span></span>
              <input
                value={form.disabilityType}
                onChange={update('disabilityType')}
                type="text"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500"
                placeholder="e.g. Visual, Hearing, Mobility…"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Cover Letter</span>
            <textarea
              value={form.coverLetter}
              onChange={update('coverLetter')}
              rows={5}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500"
              placeholder="Tell the organization why you're a great fit…"
            />
          </label>

          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Resume / Skills Summary</span>
            <textarea
              value={form.resumeText}
              onChange={update('resumeText')}
              rows={4}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500"
              placeholder="Paste your resume or a short skills summary…"
            />
          </label>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Audio Note <span className="normal-case font-normal text-slate-400">(optional)</span></span>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
              className="mt-2 block w-full text-sm text-slate-600"
            />
            {audioFile && (
              <p className="mt-1 text-xs font-semibold text-teal-700">Attached: {audioFile.name}</p>
            )}
            <p className="mt-1 text-xs text-slate-400">Record a short voice introduction to support your application.</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="flex-1 rounded-xl py-3 text-sm font-bold text-white transition-opacity disabled:opacity-50"
              style={{ backgroundColor: '#0d9488' }}
            >
              {submitting ? 'Submitting…' : 'Submit Application'}
            </button>
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SuccessBanner({ job, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">✓</div>
        <h3 className="mt-4 text-xl font-extrabold text-slate-900">Application Submitted!</h3>
        <p className="mt-2 text-sm text-slate-600">
          Your application for <strong>{job.title}</strong> has been submitted successfully. The NGO will review and respond via the platform.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl py-3 text-sm font-bold text-white"
          style={{ backgroundColor: '#0d9488' }}
        >
          Done
        </button>
      </div>
    </div>
  )
}

export default function SpecialJobsPage() {
  const [bookmarks, setBookmarks] = useState(loadBookmarks())
  const [jobs, setJobs] = useState([])         // { job, ngoName, ngoId }
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')  // all | FULL_TIME | PART_TIME | INTERN | VOLUNTEER
  const [selectedJob, setSelectedJob] = useState(null)
  const [successJob, setSuccessJob] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API}/ngos`)
        const ngos = res.ok ? await res.json() : []
        const allJobs = []
        await Promise.all(
          ngos.map(async (ngo) => {
            const jr = await fetch(`${API}/ngos/${ngo.id}/jobs`)
            if (!jr.ok) return
            const jobList = await jr.json()
            jobList.forEach((j) => allJobs.push({ job: j, ngoName: ngo.name, ngoId: ngo.id }))
          })
        )
        // Sort: open first, then by creation date desc
        allJobs.sort((a, b) => {
          if (a.job.status === 'OPEN' && b.job.status !== 'OPEN') return -1
          if (a.job.status !== 'OPEN' && b.job.status === 'OPEN') return 1
          return new Date(b.job.createdAt) - new Date(a.job.createdAt)
        })
        setJobs(allJobs)
      } catch { /* silent */ }
      setLoading(false)
    }
    load()
  }, [])

  const bookmarkSet = new Set(bookmarks)

  const FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'FULL_TIME', label: 'Full-time' },
    { id: 'PART_TIME', label: 'Part-time' },
    { id: 'INTERN', label: 'Internship' },
    { id: 'VOLUNTEER', label: 'Volunteer' },
    { id: 'CONTRACT', label: 'Contract' },
  ]

  const visible = filter === 'all'
    ? jobs
    : jobs.filter((j) => j.job.employmentType === filter)

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">Disability-Friendly Job Listings</h2>
        <p className="mt-1 text-sm text-slate-600">
          Apply directly on the platform — no external links. Text or audio applications supported.
        </p>

        {/* Filter chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className="rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all"
              style={{
                backgroundColor: filter === f.id ? '#0d9488' : '#f1f5f9',
                color: filter === f.id ? '#ffffff' : '#475569',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* Job cards */}
      <section>
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white" />
            ))}
          </div>
        )}

        {!loading && visible.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <p className="text-base font-bold text-slate-700">No jobs found for this filter.</p>
            <p className="mt-1 text-sm text-slate-500">Try a different category or check back later.</p>
          </div>
        )}

        {!loading && (
          <div className="grid gap-4 md:grid-cols-2">
            {visible.map(({ job, ngoName }) => (
              <JobCard
                key={job.id}
                job={job}
                ngoName={ngoName}
                bookmarked={bookmarkSet.has(`job-${job.id}`)}
                onBookmark={() => setBookmarks((b) => toggleBookmark(b, `job-${job.id}`))}
                onApply={(j, n) => setSelectedJob({ job: j, ngoName: n })}
              />
            ))}
          </div>
        )}
      </section>

      {/* Application modal */}
      {selectedJob && !successJob && (
        <ApplicationModal
          job={selectedJob.job}
          ngoName={selectedJob.ngoName}
          onClose={() => setSelectedJob(null)}
          onSuccess={() => { setSuccessJob(selectedJob); setSelectedJob(null) }}
        />
      )}

      {/* Success banner */}
      {successJob && (
        <SuccessBanner
          job={successJob.job}
          onClose={() => setSuccessJob(null)}
        />
      )}
    </div>
  )
}
