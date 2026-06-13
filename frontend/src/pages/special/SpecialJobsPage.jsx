import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { loadBookmarks, toggleBookmark } from './specialData'

const API = '/api'
const GREEN = '#16a34a'
const NAVY = '#0f172a'

const STATUS_BADGE = {
  OPEN: { bg: '#dcfce7', color: '#16a34a', label: 'OPEN' },
  CLOSED: { bg: '#fee2e2', color: '#dc2626', label: 'CLOSED' },
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

/* ═══════════ JOB CARD ═══════════ */
function JobCard({ job, bookmarked, onBookmark, onApply, orgName }) {
  const status = STATUS_BADGE[job.status] || STATUS_BADGE.OPEN
  const lastDate = fmt(job.lastDateToApply)
  const isExpired = job.lastDateToApply && new Date(job.lastDateToApply) < new Date()
  const [hov, setHov] = useState(false)

  return (
    <article
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', flexDirection: 'column',
        background: '#fff', borderRadius: 16,
        border: `1.5px solid ${hov ? '#e2e8f0' : '#f1f5f9'}`,
        padding: '22px 24px',
        boxShadow: hov ? '0 4px 20px rgba(0,0,0,.06)' : '0 1px 3px rgba(0,0,0,.02)',
        transition: 'all .2s',
        transform: hov ? 'translateY(-1px)' : 'none',
      }}
    >
      {/* Top row: badges + save */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
            <span style={{
              display: 'inline-block', fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.04em', padding: '3px 10px', borderRadius: 6,
              background: status.bg, color: status.color,
            }}>
              {status.label}
            </span>
            {job.employmentType && (
              <span style={{
                display: 'inline-block', fontSize: 10, fontWeight: 700,
                padding: '3px 10px', borderRadius: 6,
                background: NAVY, color: '#fff',
              }}>
                {EMP_LABELS[job.employmentType] || job.employmentType}
              </span>
            )}
          </div>

          {/* Title */}
          <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: NAVY, lineHeight: 1.3 }}>
            {job.title}
          </h4>

          {/* Org + Location */}
          <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: '#64748b' }}>
            {orgName}{job.location ? ` • ${job.location}` : ''}
          </p>
        </div>

        {/* Save button */}
        <button
          type="button"
          onClick={onBookmark}
          style={{
            display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
            padding: '5px 14px', borderRadius: 8,
            border: `1.5px solid ${bookmarked ? GREEN : '#d1d5db'}`,
            background: bookmarked ? `${GREEN}08` : '#fff',
            color: bookmarked ? GREEN : '#6b7280',
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
            transition: 'all .15s',
          }}
        >
          {bookmarked ? '★' : '☆'} {bookmarked ? 'Saved' : 'Save'}
        </button>
      </div>

      {/* Description */}
      {job.description && (
        <p style={{
          margin: '12px 0 0', fontSize: 13.5, color: '#64748b', lineHeight: 1.65,
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {job.description}
        </p>
      )}

      {/* Date / Salary strip */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 24,
        marginTop: 14, padding: '10px 14px', borderRadius: 10,
        background: '#f8fafc', border: '1px solid #f1f5f9',
      }}>
        {job.salaryRange && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8' }}>Salary</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: NAVY }}>
              {typeof job.salaryRange === 'number' ? `₹${Number(job.salaryRange).toLocaleString('en-IN')}` : job.salaryRange}
            </span>
          </div>
        )}
        {lastDate && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8' }}>Last Date</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: isExpired ? '#dc2626' : GREEN }}>{lastDate}</span>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8' }}>Posted</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: NAVY }}>{fmt(job.createdAt) || '—'}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
        <button
          type="button"
          onClick={() => onApply(job, orgName)}
          disabled={job.status === 'CLOSED' || isExpired}
          style={{
            padding: '9px 20px', borderRadius: 10, border: 'none',
            background: GREEN, color: '#fff',
            fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
            opacity: (job.status === 'CLOSED' || isExpired) ? 0.4 : 1,
            transition: 'opacity .15s',
          }}
        >
          Apply on Platform
        </button>
        <button
          type="button"
          onClick={onBookmark}
          style={{
            padding: '9px 20px', borderRadius: 10,
            border: `1.5px solid ${GREEN}`,
            background: '#fff', color: GREEN,
            fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
            transition: 'all .15s',
          }}
        >
          {bookmarked ? 'Remove Save' : 'Save Job'}
        </button>
      </div>
    </article>
  )
}

/* ═══════════ APPLICATION MODAL ═══════════ */
function ApplicationModal({ job, orgName, source, onClose, onSuccess }) {
  const { user } = useAuth()
  const [form, setForm] = useState({
    applicantName: user?.name || '',
    applicantEmail: user?.email || '',
    applicantPhone: '',
    disabilityType: '',
    coverLetter: `Hello,\n\nI am interested in the role: ${job.title} at ${orgName}.\nPlease consider my profile and accessibility needs.\n\n`,
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
      const endpoint = source === 'startup'
        ? `${API}/startups/jobs/${job.id}/apply`
        : `${API}/ngos/jobs/${job.id}/apply`
      const res = await fetch(endpoint, {
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

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    border: '1.5px solid #e2e8f0', borderRadius: 10,
    padding: '10px 14px', fontSize: 13.5, outline: 'none',
    transition: 'border-color .15s', fontFamily: "'Inter', sans-serif",
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.5)', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 640, background: '#fff', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,.2)', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid #f1f5f9', padding: 22 }}>
          <div>
            <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: GREEN }}>Apply on Platform</span>
            <h3 style={{ margin: '4px 0 2px', fontSize: 18, fontWeight: 900, color: NAVY }}>{job.title}</h3>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>{orgName}</p>
          </div>
          <button type="button" onClick={onClose} style={{
            border: '1.5px solid #e2e8f0', background: '#fff', borderRadius: 10,
            padding: '6px 14px', fontSize: 13, fontWeight: 700, color: '#64748b', cursor: 'pointer',
          }}>✕ Close</button>
        </div>

        <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13, fontWeight: 600 }}>{error}</div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {[['applicantName', 'Full Name *', 'text', 'Your full name'], ['applicantEmail', 'Email *', 'email', 'your@email.com'], ['applicantPhone', 'Phone', 'tel', 'Mobile number'], ['disabilityType', 'Disability Type (optional)', 'text', 'e.g. Visual, Hearing…']].map(([field, label, type, ph]) => (
              <div key={field}>
                <span style={{ display: 'block', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: 6 }}>{label}</span>
                <input value={form[field]} onChange={update(field)} type={type} placeholder={ph} style={inputStyle} />
              </div>
            ))}
          </div>

          <div>
            <span style={{ display: 'block', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: 6 }}>Cover Letter</span>
            <textarea value={form.coverLetter} onChange={update('coverLetter')} rows={5} placeholder="Tell the organization why you're a great fit…" style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <div>
            <span style={{ display: 'block', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: 6 }}>Resume / Skills Summary</span>
            <textarea value={form.resumeText} onChange={update('resumeText')} rows={4} placeholder="Paste your resume or a short skills summary…" style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <div style={{ padding: 16, borderRadius: 12, background: '#f8fafc', border: '1.5px solid #f1f5f9' }}>
            <span style={{ display: 'block', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginBottom: 8 }}>Audio Note (optional)</span>
            <input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} style={{ fontSize: 13, color: '#64748b' }} />
            {audioFile && <p style={{ margin: '6px 0 0', fontSize: 12, fontWeight: 700, color: GREEN }}>Attached: {audioFile.name}</p>}
            <p style={{ margin: '4px 0 0', fontSize: 11, color: '#94a3b8' }}>Record a short voice introduction to support your application.</p>
          </div>

          <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
            <button type="button" onClick={submit} disabled={submitting} style={{
              flex: 1, padding: '12px 20px', borderRadius: 12, border: 'none',
              background: GREEN, color: '#fff', fontSize: 13.5, fontWeight: 700,
              cursor: 'pointer', opacity: submitting ? 0.5 : 1,
            }}>
              {submitting ? 'Submitting…' : 'Submit Application'}
            </button>
            <button type="button" onClick={onClose} style={{
              padding: '12px 24px', borderRadius: 12, border: '1.5px solid #e2e8f0',
              background: '#fff', fontSize: 13.5, fontWeight: 700, color: '#64748b', cursor: 'pointer',
            }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════ SUCCESS BANNER ═══════════ */
function SuccessBanner({ job, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.5)', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 400, background: '#fff', borderRadius: 20, padding: 32, textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: 28, color: GREEN }}>✓</div>
        <h3 style={{ margin: '16px 0 8px', fontSize: 20, fontWeight: 900, color: NAVY }}>Application Submitted!</h3>
        <p style={{ margin: 0, fontSize: 13.5, color: '#64748b', lineHeight: 1.6 }}>
          Your application for <strong>{job.title}</strong> has been submitted successfully. The organisation will review and respond via the platform.
        </p>
        <button type="button" onClick={onClose} style={{
          marginTop: 24, width: '100%', padding: '12px', borderRadius: 12, border: 'none',
          background: GREEN, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
        }}>Done</button>
      </div>
    </div>
  )
}

/* ═══════════ MAIN PAGE ═══════════ */
export default function SpecialJobsPage() {
  const [bookmarks, setBookmarks] = useState(loadBookmarks())
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedJob, setSelectedJob] = useState(null)
  const [successJob, setSuccessJob] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const allJobs = []

        // load NGO jobs
        try {
          const res = await fetch(`${API}/ngos`)
          const ngos = res.ok ? await res.json() : []
          await Promise.all(ngos.map(async (ngo) => {
            const jr = await fetch(`${API}/ngos/${ngo.id}/jobs`)
            if (!jr.ok) return
            const jobList = await jr.json()
            jobList.forEach((j) => allJobs.push({ job: j, orgName: ngo.name, orgId: ngo.id, source: 'ngo' }))
          }))
        } catch (e) { /* ignore NGO load errors */ }

        // load Startup jobs
        try {
          const sr = await fetch(`${API}/startups`)
          const startups = sr.ok ? await sr.json() : []
          await Promise.all(startups.map(async (startup) => {
            const jr = await fetch(`${API}/startups/${startup.id}/jobs`)
            if (!jr.ok) return
            const jobList = await jr.json()
            jobList.forEach((j) => allJobs.push({ job: j, orgName: startup.name, orgId: startup.id, source: 'startup' }))
          }))
        } catch (e) { /* ignore startup load errors */ }

        // Sort: open first, then by creation date desc
        allJobs.sort((a, b) => {
          if (a.job.status === 'OPEN' && b.job.status !== 'OPEN') return -1
          if (a.job.status !== 'OPEN' && b.job.status === 'OPEN') return 1
          return new Date(b.job.createdAt) - new Date(a.job.createdAt)
        })
        setJobs(allJobs)
      } catch (err) {
        console.error('Failed loading jobs', err)
      }
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
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ═══ Header ═══ */}
      <section style={{
        background: '#fff', borderRadius: 16, border: '1.5px solid #f1f5f9',
        padding: '24px 28px', marginBottom: 24,
        boxShadow: '0 1px 3px rgba(0,0,0,.03)',
      }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: NAVY }}>Disability-Friendly Job Listings</h2>
        <p style={{ margin: '6px 0 0', fontSize: 13.5, color: '#64748b' }}>
          Apply directly on the platform — no external links. Text or audio applications supported.
        </p>

        {/* Filter chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18 }}>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              style={{
                padding: '7px 16px', borderRadius: 10, border: 'none',
                fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                background: filter === f.id ? GREEN : '#f1f5f9',
                color: filter === f.id ? '#fff' : '#475569',
                transition: 'all .15s',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* ═══ Job Cards ═══ */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} style={{ height: 220, borderRadius: 16, background: '#f8fafc', border: '1.5px solid #f1f5f9' }} />
          ))}
        </div>
      )}

      {!loading && visible.length === 0 && (
        <div style={{
          borderRadius: 16, border: '2px dashed #e2e8f0', background: '#fff',
          padding: '48px 24px', textAlign: 'center',
        }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#475569' }}>No jobs found for this filter.</p>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#94a3b8' }}>Try a different category or check back later.</p>
        </div>
      )}

      {!loading && visible.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
          {visible.map(({ job, orgName, source }) => {
            const key = `${source}-job-${job.id}`
            return (
              <JobCard
                key={key}
                job={job}
                orgName={orgName}
                bookmarked={bookmarkSet.has(key)}
                onBookmark={() => setBookmarks((b) => toggleBookmark(b, key))}
                onApply={(j, n) => setSelectedJob({ job: j, orgName: n, source })}
              />
            )
          })}
        </div>
      )}

      {/* Application modal */}
      {selectedJob && !successJob && (
        <ApplicationModal
          job={selectedJob.job}
          orgName={selectedJob.orgName}
          source={selectedJob.source}
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
