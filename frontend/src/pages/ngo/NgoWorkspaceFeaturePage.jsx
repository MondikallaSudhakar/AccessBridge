import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NGO_FEATURES } from './ngoWorkspaceData'
import NgoJobApplicationsPage from './NgoJobApplicationsPage'
import { useAuth } from '../../context/AuthContext'

const API = 'http://localhost:8081/api'
const GREEN = '#5BCB2B'

const FEATURE_ACTIONS = {
  requirements: { tips: ['Post what your NGO needs from volunteers or sponsors', 'Specify urgency and required expertise', 'Review responses from the support requests tab'] },
  'support-requests': { tips: ['Review incoming requests from beneficiaries and families', 'Accept or decline requests with a note', 'Assign volunteers to follow up'] },
  volunteers: { tips: ['Post volunteer opportunities and roles', 'Review volunteer applications and choose the right fit', 'Track volunteer hours and their contributions', 'Build a community of engaged supporters'] },
  campaigns: { tips: ['Create awareness and fundraising campaigns', 'Set goals and track progress', 'Share campaign links with your network'] },
  events: { tips: ['Create events for specially-abled persons and the community', 'Set date, venue, capacity, and event type', 'Review applicants and approve or reject them'] },
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
        <button type="button" onClick={() => setSelectedJob(null)} className="mb-4 flex items-center gap-2 text-sm font-bold" style={{ color: GREEN }}>
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
          style={{ backgroundColor: GREEN }}
        >
          {showForm ? '✕ Cancel' : '+ Post New Job'}
        </button>
      </div>

      {/* Post job form */}
      {showForm && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">New Job Posting</p>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Job Title *</span>
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} type="text" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" placeholder="e.g. Community Health Worker" />
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
              <input value={form.salaryRange} onChange={(e) => setForm((f) => ({ ...f, salaryRange: e.target.value }))} type="text" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" placeholder="e.g. ₹15,000–₹20,000/mo" />
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
          <button type="button" onClick={post} disabled={saving || !form.title || !form.description} className="rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40" style={{ backgroundColor: GREEN }}>
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
              <button type="button" onClick={() => setSelectedJob(job)} className="rounded-xl px-3 py-1.5 text-xs font-bold text-white" style={{ backgroundColor: GREEN }}>
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

/* ── Requirements sub-section: list and create requirements ── */
function RequirementsSection() {
  const { user } = useAuth()
  const [ngoId, setNgoId] = useState(null)
  const [requirements, setRequirements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', requiredBy: '', urgency: 'MEDIUM' })

  useEffect(() => {
    if (!user?.email) return
    fetch(`${API}/ngos/email/${encodeURIComponent(user.email)}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((ngo) => { if (ngo?.id) setNgoId(ngo.id) })
      .catch(() => {})
  }, [user])

  const loadRequirements = () => {
    if (!ngoId) return
    setLoading(true)
    fetch(`${API}/ngos/${ngoId}/requirements`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { setRequirements(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(loadRequirements, [ngoId])

  const postRequirement = async () => {
    if (!form.title.trim() || !form.description.trim()) return
    setSaving(true)
    const res = await fetch(`${API}/ngos/${ngoId}/requirements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({ title: '', description: '', requiredBy: '', urgency: 'MEDIUM' })
      loadRequirements()
    }
    setSaving(false)
  }

  const urgencyColor = (u) => ({
    LOW: { bg: '#dbeafe', color: '#1d4ed8' },
    MEDIUM: { bg: '#fef3c7', color: '#92400e' },
    HIGH: { bg: '#fee2e2', color: '#dc2626' },
  })[u] || { bg: '#f1f5f9', color: '#64748b' }

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-extrabold text-slate-900">NGO Requirements</h3>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-xl px-4 py-2 text-xs font-bold text-white"
          style={{ backgroundColor: GREEN }}
        >
          {showForm ? '✕ Cancel' : '+ Post Requirement'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">New Requirement</p>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Title *</span>
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} type="text" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" placeholder="e.g. Volunteer Support for Community Drive" />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Urgency</span>
              <select value={form.urgency} onChange={(e) => setForm((f) => ({ ...f, urgency: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Required By</span>
              <input value={form.requiredBy} onChange={(e) => setForm((f) => ({ ...f, requiredBy: e.target.value }))} type="date" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" />
            </label>
          </div>
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Description *</span>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={4} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" placeholder="Describe your requirement in detail..." />
          </label>
          <button type="button" onClick={postRequirement} disabled={saving || !form.title || !form.description} className="rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40" style={{ backgroundColor: GREEN }}>
            {saving ? 'Posting…' : 'Post Requirement'}
          </button>
        </div>
      )}

      {loading && <div className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white" />}

      {!loading && requirements.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
          <p className="text-sm font-bold text-slate-700">No requirements posted yet.</p>
          <p className="mt-1 text-xs text-slate-500">Click "Post Requirement" to post your first requirement.</p>
        </div>
      )}

      {requirements.map((req) => (
        <div key={req.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex-1">
              {req.urgency && <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase" style={urgencyColor(req.urgency)}>{req.urgency}</span>}
              <h4 className="mt-1.5 text-base font-extrabold text-slate-900">{req.title}</h4>
              <p className="text-xs text-slate-500">Required by: {fmtDate(req.requiredBy)}</p>
              <p className="mt-2 text-sm text-slate-600">{req.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Campaigns sub-section: list and create campaigns ── */
function CampaignsSection() {
  const { user } = useAuth()
  const [ngoId, setNgoId] = useState(null)
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ 
    title: '', 
    startDate: '', 
    endDate: '', 
    targetBeneficiaries: '',
    volunteerTarget: '',
    spentAmount: '',
    objective: '',
    impactSummary: ''
  })

  useEffect(() => {
    if (!user?.email) return
    fetch(`${API}/ngos/email/${encodeURIComponent(user.email)}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((ngo) => { if (ngo?.id) setNgoId(ngo.id) })
      .catch(() => {})
  }, [user])

  const loadCampaigns = () => {
    if (!ngoId) return
    setLoading(true)
    fetch(`${API}/ngos/${ngoId}/campaigns`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { setCampaigns(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(loadCampaigns, [ngoId])

  const postCampaign = async () => {
    if (!form.title.trim() || !form.objective.trim()) return
    setSaving(true)
    const res = await fetch(`${API}/ngos/${ngoId}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({
        ...form,
        spentAmount: form.spentAmount ? parseFloat(form.spentAmount) : 0,
        targetBeneficiaries: form.targetBeneficiaries ? parseInt(form.targetBeneficiaries) : 0,
        volunteerTarget: form.volunteerTarget ? parseInt(form.volunteerTarget) : 0
      }),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({ 
        title: '', 
        startDate: '', 
        endDate: '', 
        targetBeneficiaries: '',
        volunteerTarget: '',
        spentAmount: '',
        objective: '',
        impactSummary: ''
      })
      loadCampaigns()
    }
    setSaving(false)
  }

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-extrabold text-slate-900">Campaigns</h3>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-xl px-4 py-2 text-xs font-bold text-white"
          style={{ backgroundColor: GREEN }}
        >
          {showForm ? '✕ Cancel' : '+ Add Campaign'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 space-y-3">
          <div>
            <p className="text-base font-extrabold text-slate-900">Add Campaign</p>
            <p className="text-xs text-slate-600 mt-1">Track campaign outcomes separate from needs and achievements.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-1">
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Campaign Title *</span>
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} type="text" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" placeholder="e.g. Community Awareness Drive 2025" />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Start Date</span>
                <input value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} type="date" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" />
              </label>
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">End Date</span>
                <input value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} type="date" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" />
              </label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Target Beneficiaries</span>
                <input value={form.targetBeneficiaries} onChange={(e) => setForm((f) => ({ ...f, targetBeneficiaries: e.target.value }))} type="number" min="0" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" placeholder="e.g. 500" />
              </label>
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Volunteer Target</span>
                <input value={form.volunteerTarget} onChange={(e) => setForm((f) => ({ ...f, volunteerTarget: e.target.value }))} type="number" min="0" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" placeholder="e.g. 50" />
              </label>
            </div>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Spent Amount (INR)</span>
              <input value={form.spentAmount} onChange={(e) => setForm((f) => ({ ...f, spentAmount: e.target.value }))} type="number" min="0" step="0.01" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" placeholder="e.g. 50000" />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Objective *</span>
              <textarea value={form.objective} onChange={(e) => setForm((f) => ({ ...f, objective: e.target.value }))} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" placeholder="Describe the campaign objective..." />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Impact Summary</span>
              <textarea value={form.impactSummary} onChange={(e) => setForm((f) => ({ ...f, impactSummary: e.target.value }))} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" placeholder="Describe the campaign's impact and outcomes..." />
            </label>
          </div>
          <button type="button" onClick={postCampaign} disabled={saving || !form.title || !form.objective} className="rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40" style={{ backgroundColor: GREEN }}>
            {saving ? 'Adding…' : 'Add Campaign'}
          </button>
        </div>
      )}

      {loading && <div className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white" />}

      {!loading && campaigns.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
          <p className="text-sm font-bold text-slate-700">No campaigns created yet.</p>
          <p className="mt-1 text-xs text-slate-500">Click "Add Campaign" to track your first campaign.</p>
        </div>
      )}

      {campaigns.map((camp) => (
        <div key={camp.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex-1">
              <h4 className="text-base font-extrabold text-slate-900">{camp.title}</h4>
              <p className="text-xs text-slate-500 mt-1">{fmtDate(camp.startDate)} to {fmtDate(camp.endDate)}</p>
              {(camp.targetBeneficiaries || camp.volunteerTarget) && (
                <p className="text-xs text-slate-600 mt-1">
                  {camp.targetBeneficiaries ? `${camp.targetBeneficiaries} Beneficiaries` : ''} 
                  {camp.targetBeneficiaries && camp.volunteerTarget ? ' • ' : ''}
                  {camp.volunteerTarget ? `${camp.volunteerTarget} Volunteers` : ''}
                </p>
              )}
              {camp.spentAmount && <p className="text-xs font-semibold text-emerald-600 mt-1">Spent: ₹{parseFloat(camp.spentAmount).toLocaleString('en-IN')}</p>}
              {camp.objective && <p className="mt-2 text-sm text-slate-600"><strong>Objective:</strong> {camp.objective}</p>}
              {camp.impactSummary && <p className="mt-1 text-sm text-slate-600"><strong>Impact:</strong> {camp.impactSummary}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Products sub-section: list and create products ── */
function ProductsSection() {
  const { user } = useAuth()
  const [ngoId, setNgoId] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', category: 'ASSISTIVE' })

  useEffect(() => {
    if (!user?.email) return
    fetch(`${API}/ngos/email/${encodeURIComponent(user.email)}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((ngo) => { if (ngo?.id) setNgoId(ngo.id) })
      .catch(() => {})
  }, [user])

  const loadProducts = () => {
    if (!ngoId) return
    setLoading(true)
    fetch(`${API}/ngos/${ngoId}/products`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { setProducts(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(loadProducts, [ngoId])

  const postProduct = async () => {
    if (!form.name.trim() || !form.description.trim() || !form.price) return
    setSaving(true)
    const res = await fetch(`${API}/ngos/${ngoId}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ ...form, price: parseFloat(form.price), stock: parseInt(form.stock) || 0 }),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({ name: '', description: '', price: '', stock: '', category: 'ASSISTIVE' })
      loadProducts()
    }
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-extrabold text-slate-900">Products</h3>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-xl px-4 py-2 text-xs font-bold text-white"
          style={{ backgroundColor: GREEN }}
        >
          {showForm ? '✕ Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">New Product</p>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Product Name *</span>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} type="text" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" placeholder="e.g. Assistive Hearing Device" />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Category</span>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400">
                <option value="ASSISTIVE">Assistive Device</option>
                <option value="RESOURCE">Resource</option>
                <option value="TOOLKIT">Toolkit</option>
                <option value="OTHER">Other</option>
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Price (₹) *</span>
              <input value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} type="number" min="0" step="0.01" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" placeholder="0.00" />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Stock</span>
              <input value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} type="number" min="0" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" placeholder="0" />
            </label>
          </div>
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Description *</span>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={4} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" placeholder="Describe your product and its features..." />
          </label>
          <button type="button" onClick={postProduct} disabled={saving || !form.name || !form.description || !form.price} className="rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40" style={{ backgroundColor: GREEN }}>
            {saving ? 'Adding…' : 'Add Product'}
          </button>
        </div>
      )}

      {loading && <div className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white" />}

      {!loading && products.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
          <p className="text-sm font-bold text-slate-700">No products added yet.</p>
          <p className="mt-1 text-xs text-slate-500">Click "Add Product" to publish your first product.</p>
        </div>
      )}

      {products.map((product) => (
        <div key={product.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex-1">
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">{product.category}</span>
              <h4 className="mt-1.5 text-base font-extrabold text-slate-900">{product.name}</h4>
              <p className="text-sm font-semibold text-emerald-600">₹{parseFloat(product.price).toFixed(2)} • Stock: {product.stock || 0}</p>
              <p className="mt-2 text-sm text-slate-600">{product.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Services sub-section: list and create services ── */
function ServicesSection() {
  const { user } = useAuth()
  const [ngoId, setNgoId] = useState(null)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', serviceType: 'SUPPORT', availability: 'AVAILABLE' })

  useEffect(() => {
    if (!user?.email) return
    fetch(`${API}/ngos/email/${encodeURIComponent(user.email)}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((ngo) => { if (ngo?.id) setNgoId(ngo.id) })
      .catch(() => {})
  }, [user])

  const loadServices = () => {
    if (!ngoId) return
    setLoading(true)
    fetch(`${API}/ngos/${ngoId}/services`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { setServices(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(loadServices, [ngoId])

  const postService = async () => {
    if (!form.name.trim() || !form.description.trim()) return
    setSaving(true)
    const res = await fetch(`${API}/ngos/${ngoId}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({ name: '', description: '', serviceType: 'SUPPORT', availability: 'AVAILABLE' })
      loadServices()
    }
    setSaving(false)
  }

  const availColor = (a) => ({
    AVAILABLE: { bg: '#d1fae5', color: '#065f46' },
    LIMITED: { bg: '#fef3c7', color: '#92400e' },
    UNAVAILABLE: { bg: '#fee2e2', color: '#dc2626' },
  })[a] || { bg: '#f1f5f9', color: '#64748b' }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-extrabold text-slate-900">Services</h3>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-xl px-4 py-2 text-xs font-bold text-white"
          style={{ backgroundColor: GREEN }}
        >
          {showForm ? '✕ Cancel' : '+ Add Service'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">New Service</p>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Service Name *</span>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} type="text" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" placeholder="e.g. Vocational Training Program" />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Service Type</span>
              <select value={form.serviceType} onChange={(e) => setForm((f) => ({ ...f, serviceType: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400">
                <option value="SUPPORT">Support</option>
                <option value="TRAINING">Training</option>
                <option value="COUNSELING">Counseling</option>
                <option value="HEALTHCARE">Healthcare</option>
                <option value="OTHER">Other</option>
              </select>
            </label>
            <label className="block md:col-span-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Availability</span>
              <select value={form.availability} onChange={(e) => setForm((f) => ({ ...f, availability: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400">
                <option value="AVAILABLE">Available</option>
                <option value="LIMITED">Limited</option>
                <option value="UNAVAILABLE">Unavailable</option>
              </select>
            </label>
          </div>
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Description *</span>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={4} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" placeholder="Describe your service and eligibility criteria..." />
          </label>
          <button type="button" onClick={postService} disabled={saving || !form.name || !form.description} className="rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40" style={{ backgroundColor: GREEN }}>
            {saving ? 'Adding…' : 'Add Service'}
          </button>
        </div>
      )}

      {loading && <div className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white" />}

      {!loading && services.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
          <p className="text-sm font-bold text-slate-700">No services added yet.</p>
          <p className="mt-1 text-xs text-slate-500">Click "Add Service" to list your first service.</p>
        </div>
      )}

      {services.map((service) => (
        <div key={service.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">{service.serviceType}</span>
                <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase" style={availColor(service.availability)}>{service.availability}</span>
              </div>
              <h4 className="mt-1.5 text-base font-extrabold text-slate-900">{service.name}</h4>
              <p className="mt-2 text-sm text-slate-600">{service.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Achievements sub-section: list and create achievements ── */
function AchievementsSection() {
  const { user } = useAuth()
  const [ngoId, setNgoId] = useState(null)
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', achievementDate: '', achievementType: 'MILESTONE' })

  useEffect(() => {
    if (!user?.email) return
    fetch(`${API}/ngos/email/${encodeURIComponent(user.email)}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((ngo) => { if (ngo?.id) setNgoId(ngo.id) })
      .catch(() => {})
  }, [user])

  const loadAchievements = () => {
    if (!ngoId) return
    setLoading(true)
    fetch(`${API}/ngos/${ngoId}/achievements`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { setAchievements(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(loadAchievements, [ngoId])

  const postAchievement = async () => {
    if (!form.title.trim() || !form.description.trim()) return
    setSaving(true)
    const res = await fetch(`${API}/ngos/${ngoId}/achievements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({ title: '', description: '', achievementDate: '', achievementType: 'MILESTONE' })
      loadAchievements()
    }
    setSaving(false)
  }

  const typeColor = (t) => ({
    MILESTONE: { bg: '#dbeafe', color: '#1d4ed8' },
    AWARD: { bg: '#fde2e4', color: '#9f1239' },
    CERTIFICATION: { bg: '#e6f9d7', color: '#365314' },
    IMPACT_STORY: { bg: '#fde68a', color: '#713f12' },
  })[t] || { bg: '#f1f5f9', color: '#64748b' }

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-extrabold text-slate-900">Achievements</h3>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-xl px-4 py-2 text-xs font-bold text-white"
          style={{ backgroundColor: GREEN }}
        >
          {showForm ? '✕ Cancel' : '+ Add Achievement'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">New Achievement</p>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Achievement Title *</span>
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} type="text" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" placeholder="e.g. Trained 500 specially-abled individuals" />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Achievement Type</span>
              <select value={form.achievementType} onChange={(e) => setForm((f) => ({ ...f, achievementType: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400">
                <option value="MILESTONE">Milestone</option>
                <option value="AWARD">Award</option>
                <option value="CERTIFICATION">Certification</option>
                <option value="IMPACT_STORY">Impact Story</option>
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Date</span>
              <input value={form.achievementDate} onChange={(e) => setForm((f) => ({ ...f, achievementDate: e.target.value }))} type="date" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" />
            </label>
          </div>
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Description *</span>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={4} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" placeholder="Describe your achievement and its impact..." />
          </label>
          <button type="button" onClick={postAchievement} disabled={saving || !form.title || !form.description} className="rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40" style={{ backgroundColor: GREEN }}>
            {saving ? 'Adding…' : 'Add Achievement'}
          </button>
        </div>
      )}

      {loading && <div className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white" />}

      {!loading && achievements.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
          <p className="text-sm font-bold text-slate-700">No achievements added yet.</p>
          <p className="mt-1 text-xs text-slate-500">Click "Add Achievement" to showcase your first milestone.</p>
        </div>
      )}

      {achievements.map((achievement) => (
        <div key={achievement.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex-1">
              <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase" style={typeColor(achievement.achievementType)}>{achievement.achievementType}</span>
              <h4 className="mt-1.5 text-base font-extrabold text-slate-900">{achievement.title}</h4>
              <p className="text-xs text-slate-500">{fmtDate(achievement.achievementDate)}</p>
              <p className="mt-2 text-sm text-slate-600">{achievement.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Events sub-section: list posted events with applicant review panel ── */
function EventsSection() {
  const { user } = useAuth()
  const [ngoId, setNgoId] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [applications, setApplications] = useState([])
  const [appsLoading, setAppsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    eventDate: '',
    location: '',
    city: '',
    state: '',
    eventType: 'WORKSHOP',
    maxParticipants: '',
  })

  // Resolve ngoId from logged-in user's email
  useEffect(() => {
    if (!user?.email) return
    fetch(`${API}/ngos/email/${encodeURIComponent(user.email)}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((ngo) => { if (ngo?.id) setNgoId(ngo.id) })
      .catch(() => {})
  }, [user])

  const loadEvents = () => {
    if (!ngoId) return
    setLoading(true)
    fetch(`${API}/events/ngo/${ngoId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { setEvents(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(loadEvents, [ngoId])

  const loadApplications = (eventId) => {
    setAppsLoading(true)
    fetch(`${API}/events/${eventId}/applications`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { setApplications(Array.isArray(data) ? data : []); setAppsLoading(false) })
      .catch(() => setAppsLoading(false))
  }

  const handleSelectEvent = (ev) => {
    setSelectedEvent(ev)
    loadApplications(ev.id)
  }

  const postEvent = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.eventDate || !form.location.trim()) return
    setSaving(true)
    const payload = {
      ...form,
      maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : 0,
      // Convert local datetime to ISO
      eventDate: form.eventDate ? new Date(form.eventDate).toISOString() : null,
    }
    const res = await fetch(`${API}/events/ngo/${ngoId}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({ title: '', description: '', eventDate: '', location: '', city: '', state: '', eventType: 'WORKSHOP', maxParticipants: '' })
      loadEvents()
    }
    setSaving(false)
  }

  const updateAppStatus = async (appId, status) => {
    await fetch(`${API}/events/${selectedEvent.id}/applications/${appId}/${status === 'APPROVED' ? 'approve' : 'reject'}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    loadApplications(selectedEvent.id)
  }

  const deleteEvent = async (ev) => {
    if (!ngoId) return
    if (!window.confirm(`Delete "${ev.title}"? This will also remove all applications.`)) return
    await fetch(`${API}/events/ngo/${ngoId}/events/${ev.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    loadEvents()
  }

  const EVENT_TYPES = ['WORKSHOP', 'SEMINAR', 'FUNDRAISER', 'AWARENESS', 'COMMUNITY']
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'
  const statusColor = (s) => ({
    UPCOMING: { bg: '#dbeafe', color: '#1d4ed8' },
    ONGOING:  { bg: '#d1fae5', color: '#065f46' },
    COMPLETED:{ bg: '#f1f5f9', color: '#475569' },
    CANCELLED:{ bg: '#fee2e2', color: '#dc2626' },
  })[s] || { bg: '#f1f5f9', color: '#64748b' }
  const appStatusColor = (s) => ({
    PENDING:  { bg: '#fef9c3', color: '#854d0e' },
    APPROVED: { bg: '#d1fae5', color: '#065f46' },
    REJECTED: { bg: '#fee2e2', color: '#dc2626' },
    CANCELLED:{ bg: '#f1f5f9', color: '#475569' },
  })[s] || { bg: '#f1f5f9', color: '#64748b' }

  // ── Applicants drill-down view ──
  if (selectedEvent) {
    return (
      <div className="space-y-4">
        <button type="button" onClick={() => setSelectedEvent(null)} className="mb-2 flex items-center gap-2 text-sm font-bold" style={{ color: GREEN }}>
          ← Back to Events
        </button>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase" style={statusColor(selectedEvent.status)}>
              {selectedEvent.status}
            </span>
            {selectedEvent.eventType && (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">{selectedEvent.eventType}</span>
            )}
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">{selectedEvent.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {selectedEvent.location}{selectedEvent.city ? ` • ${selectedEvent.city}` : ''} | {fmtDate(selectedEvent.eventDate)}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered: {selectedEvent.registeredParticipants || 0} / {selectedEvent.maxParticipants || '∞'}
          </p>
        </div>

        <h4 className="text-sm font-extrabold text-slate-800">Applicants</h4>

        {appsLoading && <div className="h-20 animate-pulse rounded-2xl border border-slate-200 bg-white" />}

        {!appsLoading && applications.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
            <p className="text-sm font-bold text-slate-700">No applications yet.</p>
          </div>
        )}

        {applications.map((app) => (
          <div key={app.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase" style={appStatusColor(app.status)}>
                  {app.status}
                </span>
                <p className="mt-1 text-sm font-extrabold text-slate-900">{app.applicantName}</p>
                <p className="text-xs text-slate-500">{app.applicantEmail}{app.applicantPhone ? ` · ${app.applicantPhone}` : ''}</p>
                {app.applicantNotes && <p className="mt-1 text-xs text-slate-600 italic">"{app.applicantNotes}"</p>}
              </div>
              {app.status === 'PENDING' && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => updateAppStatus(app.id, 'APPROVED')}
                    className="rounded-xl px-3 py-1.5 text-xs font-bold text-white"
                    style={{ backgroundColor: '#16a34a' }}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => updateAppStatus(app.id, 'REJECTED')}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // ── Main events list view ──
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-extrabold text-slate-900">Posted Events</h3>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-xl px-4 py-2 text-xs font-bold text-white"
          style={{ backgroundColor: GREEN }}
        >
          {showForm ? '✕ Cancel' : '+ Create Event'}
        </button>
      </div>

      {/* Create event form */}
      {showForm && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">New Event</p>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Event Title *</span>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                type="text"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400"
                placeholder="e.g. Inclusive Community Awareness Day"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Event Type</span>
              <select
                value={form.eventType}
                onChange={(e) => setForm((f) => ({ ...f, eventType: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400"
              >
                {EVENT_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Date & Time *</span>
              <input
                value={form.eventDate}
                onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))}
                type="datetime-local"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Location / Venue *</span>
              <input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                type="text"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400"
                placeholder="e.g. Town Hall, Mumbai"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">City</span>
              <input
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                type="text"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400"
                placeholder="e.g. Mumbai"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">State</span>
              <input
                value={form.state}
                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                type="text"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400"
                placeholder="e.g. Maharashtra"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Max Participants</span>
              <input
                value={form.maxParticipants}
                onChange={(e) => setForm((f) => ({ ...f, maxParticipants: e.target.value }))}
                type="number"
                min="1"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400"
                placeholder="e.g. 100 (leave blank for unlimited)"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Description *</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={4}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400"
              placeholder="Describe the event, agenda, and who should attend…"
            />
          </label>
          <button
            type="button"
            onClick={postEvent}
            disabled={saving || !form.title || !form.description || !form.eventDate || !form.location}
            className="rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40"
            style={{ backgroundColor: GREEN }}
          >
            {saving ? 'Creating…' : 'Create Event'}
          </button>
        </div>
      )}

      {loading && <div className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white" />}

      {!loading && events.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
          <p className="text-sm font-bold text-slate-700">No events posted yet.</p>
          <p className="mt-1 text-xs text-slate-500">Click "Create Event" to host your first community event.</p>
        </div>
      )}

      {events.map((ev) => {
        const sc = statusColor(ev.status)
        return (
          <div key={ev.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase" style={sc}>
                    {ev.status}
                  </span>
                  {ev.eventType && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                      {ev.eventType}
                    </span>
                  )}
                </div>
                <h4 className="mt-1.5 text-base font-extrabold text-slate-900">{ev.title}</h4>
                <p className="text-xs text-slate-500">
                  {ev.location}{ev.city ? ` • ${ev.city}` : ''} | {fmtDate(ev.eventDate)}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Registered: {ev.registeredParticipants || 0} / {ev.maxParticipants || '∞'}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectEvent(ev)}
                  className="rounded-xl px-3 py-1.5 text-xs font-bold text-white"
                  style={{ backgroundColor: GREEN }}
                >
                  View Applicants
                </button>
                <button
                  type="button"
                  onClick={() => deleteEvent(ev)}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-slate-600">{ev.description}</p>
          </div>
        )
      })}
    </div>
  )
}

/* ── Volunteers sub-section: list and post volunteer opportunities ── */
function VolunteersSection() {
  const { user } = useAuth()
  const [ngoId, setNgoId] = useState(null)
  const [volunteerNeeds, setVolunteerNeeds] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [form, setForm] = useState({ title: '', purpose: '', neededCount: '' })

  useEffect(() => {
    if (!user?.email) return
    fetch(`${API}/ngos/email/${encodeURIComponent(user.email)}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((ngo) => { if (ngo?.id) setNgoId(ngo.id) })
      .catch(() => {})
  }, [user])

  const loadVolunteerNeeds = () => {
    if (!ngoId) return
    setLoading(true)
    Promise.all([
      fetch(`${API}/ngos/${ngoId}/needs`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).then((r) => r.ok ? r.json() : []),
      fetch(`${API}/volunteer-applications/ngo/${ngoId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).then((r) => r.ok ? r.json() : []),
    ])
      .then(([needsData, appData]) => {
        const needs = Array.isArray(needsData)
          ? needsData.filter((need) => (need.category || '').toUpperCase() === 'VOLUNTEER_NEED')
          : []
        setVolunteerNeeds(needs)
        setApplications(Array.isArray(appData) ? appData : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(loadVolunteerNeeds, [ngoId])

  const postVolunteerNeed = async () => {
    if (!form.title.trim() || !form.purpose.trim()) return
    setSaving(true)
    const volunteersNeeded = Number(form.neededCount)
    const res = await fetch(`${API}/ngos/${ngoId}/needs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({
        title: form.title.trim(),
        description: form.purpose.trim(),
        category: 'VOLUNTEER_NEED',
        targetAmount: Number.isFinite(volunteersNeeded) && volunteersNeeded > 0 ? volunteersNeeded : 0,
        urgent: false,
      }),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({ title: '', purpose: '', neededCount: '' })
      loadVolunteerNeeds()
    }
    setSaving(false)
  }

  const closeVolunteerNeed = async (needId) => {
    await fetch(`${API}/ngos/needs/${needId}/close`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    loadVolunteerNeeds()
  }

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  const updateApplicationStatus = async (applicationId, status) => {
    setUpdatingId(applicationId)
    await fetch(`${API}/volunteer-applications/${applicationId}/status?status=${encodeURIComponent(status)}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    setUpdatingId(null)
    loadVolunteerNeeds()
  }

  const visibleApplications = (needId) => {
    const matched = applications.filter((app) => Number(app.sourceId) === Number(needId))
    return matched.filter((app) => statusFilter === 'ALL' || (app.status || 'PENDING') === statusFilter)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-extrabold text-slate-900">Volunteer Needs</h3>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-xl px-4 py-2 text-xs font-bold text-white"
          style={{ backgroundColor: GREEN }}
        >
          {showForm ? '✕ Cancel' : '+ Post Volunteer Need'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">New Volunteer Need</p>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Need Title *</span>
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} type="text" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" placeholder="e.g. Weekend mentors for digital skills" />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">How Many Volunteers Needed</span>
              <input value={form.neededCount} onChange={(e) => setForm((f) => ({ ...f, neededCount: e.target.value }))} type="number" min="1" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" placeholder="e.g. 12" />
            </label>
          </div>
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Purpose *</span>
            <textarea value={form.purpose} onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))} rows={4} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" placeholder="Explain why this volunteer need is important and what volunteers will do." />
          </label>
          <button type="button" onClick={postVolunteerNeed} disabled={saving || !form.title || !form.purpose} className="rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40" style={{ backgroundColor: GREEN }}>
            {saving ? 'Posting…' : 'Post Volunteer Need'}
          </button>
        </div>
      )}

      {loading && <div className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white" />}

      {!loading && volunteerNeeds.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
          <p className="text-sm font-bold text-slate-700">No volunteer needs posted yet.</p>
          <p className="mt-1 text-xs text-slate-500">Post your volunteer need so volunteers can submit interest.</p>
        </div>
      )}

      {!loading && volunteerNeeds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div>
            <p className="text-sm font-bold text-slate-900">Volunteer Interests</p>
            <p className="text-xs text-slate-500">{applications.length} interested volunteers</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Filter by status</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none">
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      )}

      {volunteerNeeds.map((need) => {
        const interested = visibleApplications(need.id)
        return (
        <div key={need.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase" style={{ backgroundColor: need.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2', color: need.status === 'ACTIVE' ? '#16a34a' : '#dc2626' }}>
                  {need.status}
                </span>
                <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[10px] font-semibold text-teal-700">Interested: {interested.length}</span>
              </div>
              <h4 className="mt-1.5 text-base font-extrabold text-slate-900">{need.title}</h4>
              <p className="text-xs text-slate-500">Needed: {Number(need.targetAmount || 0)} volunteers • Posted: {fmtDate(need.createdAt)}</p>
            </div>
            {need.status === 'ACTIVE' && (
              <button type="button" onClick={() => closeVolunteerNeed(need.id)} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100">
                Close Need
              </button>
            )}
          </div>
          <p className="mt-2 text-sm text-slate-600">{need.description}</p>

          {interested.length > 0 && (
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="mt-2 space-y-2">
                {interested
                  .map((app) => (
                  <div key={app.id} className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{app.fullName}</p>
                        <p className="text-xs text-slate-500">{app.email}{app.phone ? ` • ${app.phone}` : ''}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">{app.status || 'PENDING'}</span>
                    </div>
                    {(app.motivationLetter || app.message) && <p className="mt-2 text-xs text-slate-600">{app.motivationLetter || app.message}</p>}
                    <div className="mt-2 flex gap-2">
                      <button type="button" disabled={updatingId === app.id} onClick={() => updateApplicationStatus(app.id, 'ACCEPTED')} className="rounded-lg bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700 disabled:opacity-50">Accept</button>
                      <button type="button" disabled={updatingId === app.id} onClick={() => updateApplicationStatus(app.id, 'REJECTED')} className="rounded-lg bg-rose-100 px-2.5 py-1 text-[11px] font-bold text-rose-700 disabled:opacity-50">Reject</button>
                      <button type="button" disabled={updatingId === app.id} onClick={() => updateApplicationStatus(app.id, 'PENDING')} className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 disabled:opacity-50">Mark Pending</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )})}
    </div>
  )
}

export default function NgoWorkspaceFeaturePage({ type }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(type || 'requirements')
  
  // Tab configuration
  const TABS = [
    { id: 'requirements', label: 'Requirements', icon: '📋' },
    { id: 'volunteers', label: 'Volunteers', icon: '🙋' },
    { id: 'campaigns', label: 'Campaigns', icon: '📅' },
    { id: 'jobs', label: 'Jobs', icon: '💼' },
    { id: 'events', label: 'Events', icon: '🎉' },
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'services', label: 'Services', icon: '👥' },
    { id: 'achievements', label: 'Achievements', icon: '⭐' },
  ]

  const config = NGO_FEATURES[activeTab]
  const tips = FEATURE_ACTIONS[activeTab]?.tips || []

  if (!config) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        Invalid NGO workspace page.
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1" style={{ backgroundColor: `${GREEN}12` }}>
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: GREEN }} />
              <span className="text-xs font-bold" style={{ color: GREEN }}>NGO Workspace</span>
            </div>
            <h2 className="mt-3 text-2xl font-black text-slate-900">{config.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{config.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Tab Navigation Bar */}
      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-all"
              style={{
                backgroundColor: isActive ? GREEN : '#f1f5f9',
                color: isActive ? '#fff' : '#64748b',
                border: isActive ? `2px solid ${GREEN}` : '1px solid #e2e8f0',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tips */}
      {tips.length > 0 && (
        <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-700">How to use this page</p>
          <ul className="mt-3 space-y-2">
            {tips.map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Content - Render based on activeTab */}
      <section>
        {activeTab === 'requirements' && <RequirementsSection />}
        {activeTab === 'volunteers' && <VolunteersSection />}
        {activeTab === 'campaigns' && <CampaignsSection />}
        {activeTab === 'jobs' && <JobsSection />}
        {activeTab === 'events' && <EventsSection />}
        {activeTab === 'products' && <ProductsSection />}
        {activeTab === 'services' && <ServicesSection />}
        {activeTab === 'achievements' && <AchievementsSection />}
      </section>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
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
