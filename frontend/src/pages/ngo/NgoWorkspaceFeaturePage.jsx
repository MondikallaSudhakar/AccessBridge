import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NGO_FEATURES } from './ngoWorkspaceData'
import NgoJobApplicationsPage from './NgoJobApplicationsPage'
import { useAuth } from '../../context/AuthContext'

const API = 'http://localhost:8081/api'
const INDIGO = '#4f46e5'

const FEATURE_ACTIONS = {
  requirements: { tips: ['Post what your NGO needs from volunteers or sponsors', 'Specify urgency and required expertise', 'Review responses from the support requests tab'] },
  'support-requests': { tips: ['Review incoming requests from beneficiaries and families', 'Accept or decline requests with a note', 'Assign volunteers to follow up'] },
  volunteers: { tips: ['Browse volunteer applications', 'Match volunteers with open requirements', 'Track hours and impact contributions'] },
  campaigns: { tips: ['Create awareness and fundraising campaigns', 'Set goals and track progress', 'Share campaign links with your network'] },
  jobs: { tips: ['Post inclusive jobs suitable for persons with disabilities', 'Applications are submitted directly on the platform — no external link needed', 'Review applicants below, shortlist or mark as hired'] },
  products: { tips: ['Publish social-impact or assistive products', 'Manage stock and pricing', 'Earn through sales and donations'] },
  services: { tips: ['List beneficiary services and support programs', 'Manage bookings and requests', 'Track service delivery outcomes'] },
  achievements: { tips: ['Showcase milestones and impact stories', 'Add certifications and recognition', 'Build trust with donors and CSR partners'] },
  messages: { tips: ['Respond to direct messages from users', 'Coordinate with volunteers and supporters', 'Keep communication organized by thread'] },
  csr: { tips: ['Connect with corporate CSR teams for funding and partnerships', 'Post your NGO\'s needs for CSR alignment', 'Track ongoing CSR collaboration progress'] },
}

/* ── Jobs sub-section: list posted jobs with in-platform application panel ── */
function JobsSection() {
  const { user } = useAuth()
  const [ngoId, setNgoId] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', employmentType: 'FULL_TIME', location: '', salaryRange: '', lastDateToApply: '' })
  const [saving, setSaving] = useState(false)

  // Resolve ngoId from the logged-in user's email
  useEffect(() => {
    if (!user?.email) return
    fetch(`${API}/ngos/email/${encodeURIComponent(user.email)}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((ngo) => { if (ngo?.id) setNgoId(ngo.id) })
      .catch(() => {})
  }, [user])

  const load = () => {
    if (!ngoId) return
    setLoading(true)
    fetch(`${API}/ngos/${ngoId}/jobs`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { setJobs(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(load, [ngoId])

  const post = async () => {
    if (!form.title.trim() || !form.description.trim()) return
    setSaving(true)
    const res = await fetch(`${API}/ngos/${ngoId}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ ...form, status: 'OPEN' }),
    })
    if (res.ok) { setShowForm(false); setForm({ title: '', description: '', employmentType: 'FULL_TIME', location: '', salaryRange: '', lastDateToApply: '' }); load() }
    setSaving(false)
  }

  const closeJob = async (jobId) => {
    await fetch(`${API}/ngos/jobs/${jobId}`, {
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
        <button type="button" onClick={() => setSelectedJob(null)} className="mb-4 flex items-center gap-2 text-sm font-bold" style={{ color: INDIGO }}>
          ← Back to Jobs
        </button>
        <NgoJobApplicationsPage jobId={selectedJob.id} jobTitle={selectedJob.title} ngoId={ngoId} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-extrabold text-slate-900">Posted Jobs</h3>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-xl px-4 py-2 text-xs font-bold text-white"
          style={{ backgroundColor: INDIGO }}
        >
          {showForm ? '✕ Cancel' : '+ Post New Job'}
        </button>
      </div>

      {/* Post job form */}
      {showForm && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">New Job Posting</p>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Job Title *</span>
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} type="text" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400" placeholder="e.g. Community Health Worker" />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Employment Type</span>
              <select value={form.employmentType} onChange={(e) => setForm((f) => ({ ...f, employmentType: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400">
                {Object.entries(EMP_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Location</span>
              <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} type="text" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400" placeholder="City / Remote" />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Salary Range</span>
              <input value={form.salaryRange} onChange={(e) => setForm((f) => ({ ...f, salaryRange: e.target.value }))} type="text" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400" placeholder="e.g. ₹15,000–₹20,000/mo" />
            </label>
            <label className="block md:col-span-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Last Date to Apply</span>
              <input value={form.lastDateToApply} onChange={(e) => setForm((f) => ({ ...f, lastDateToApply: e.target.value }))} type="date" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400" />
            </label>
          </div>
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Job Description *</span>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={4} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400" placeholder="Describe responsibilities, requirements, and accessibility support offered…" />
          </label>
          <button type="button" onClick={post} disabled={saving || !form.title || !form.description} className="rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40" style={{ backgroundColor: INDIGO }}>
            {saving ? 'Posting…' : 'Post Job'}
          </button>
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
                <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase" style={{ backgroundColor: job.status === 'OPEN' ? '#dcfce7' : '#fee2e2', color: job.status === 'OPEN' ? '#16a34a' : '#dc2626' }}>
                  {job.status}
                </span>
                {job.employmentType && <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">{EMP_LABELS[job.employmentType] || job.employmentType}</span>}
              </div>
              <h4 className="mt-1.5 text-base font-extrabold text-slate-900">{job.title}</h4>
              <p className="text-xs text-slate-500">{job.location ? `${job.location} • ` : ''}Last date: {fmtDate(job.lastDateToApply)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setSelectedJob(job)} className="rounded-xl px-3 py-1.5 text-xs font-bold text-white" style={{ backgroundColor: INDIGO }}>
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

export default function NgoWorkspaceFeaturePage({ type }) {
  const navigate = useNavigate()
  const config = NGO_FEATURES[type]
  const tips = FEATURE_ACTIONS[type]?.tips || []

  if (!config) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        Invalid NGO workspace page.
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1" style={{ backgroundColor: `${INDIGO}12` }}>
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: INDIGO }} />
              <span className="text-xs font-bold" style={{ color: INDIGO }}>NGO Workspace</span>
            </div>
            <h2 className="mt-3 text-2xl font-black text-slate-900">{config.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{config.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Tips */}
      {tips.length > 0 && (
        <section className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-indigo-700">How to use this page</p>
          <ul className="mt-3 space-y-2">
            {tips.map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Jobs inline panel */}
      {type === 'jobs' && (
        <section>
          <JobsSection />
        </section>
      )}

      {/* Connector info (non-jobs pages) */}
      {type !== 'jobs' && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
          <p className="font-semibold text-slate-800">Connected to your NGO management system</p>
          <p className="mt-1 text-slate-500">This workspace page links directly to the {config.title} section of your NGO profile dashboard.</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => navigate(`/ngo/profile?tab=${encodeURIComponent(config.tab)}`)}
          className="rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: INDIGO }}
        >
          Open {config.title} Manager
        </button>
        <button
          type="button"
          onClick={() => navigate('/ngo')}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          ← Back to Workspace
        </button>
        <button
          type="button"
          onClick={() => navigate('/ngo/profile')}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          Open Full NGO Dashboard
        </button>
      </div>
    </div>
  )
}
