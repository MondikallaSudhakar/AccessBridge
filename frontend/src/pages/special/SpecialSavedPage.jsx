import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadBookmarks, toggleBookmark } from './specialData'

const API = 'http://localhost:8081/api'
const NAVY = '#0f172a'
const G = '#16a34a'

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
  } catch {
    return null
  }
}

function SavedJobCard({ job, ngoName, bookmarked, onRemove }) {
  const status = STATUS_BADGE[job.status] || STATUS_BADGE.OPEN
  const lastDate = fmt(job.lastDateToApply)
  const isExpired = job.lastDateToApply && new Date(job.lastDateToApply) < new Date()

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
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
          onClick={onRemove}
          className="shrink-0 rounded-full px-3 py-1 text-xs font-bold transition-colors"
          style={{ borderColor: '#5BCB2B', color: '#5BCB2B', border: '1px solid #5BCB2B' }}
        >
          ★ Remove
        </button>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">{job.description}</p>

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
      </div>
    </article>
  )
}

export default function SpecialSavedPage() {
  const navigate = useNavigate()
  const [bookmarks, setBookmarks] = useState(loadBookmarks())
  const [savedJobs, setSavedJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        // Extract job IDs from bookmarks
        const jobIds = bookmarks
          .filter((b) => b.startsWith('job-'))
          .map((b) => b.replace('job-', ''))

        if (jobIds.length === 0) {
          setSavedJobs([])
          setLoading(false)
          return
        }

        // Fetch all NGOs and their jobs
        const res = await fetch(`${API}/ngos`)
        const ngos = res.ok ? await res.json() : []

        const allJobs = []
        await Promise.all(
          ngos.map(async (ngo) => {
            const jr = await fetch(`${API}/ngos/${ngo.id}/jobs`)
            if (!jr.ok) return
            const jobList = await jr.json()
            jobList.forEach((j) => {
              if (jobIds.includes(String(j.id))) {
                allJobs.push({ job: j, ngoName: ngo.name, ngoId: ngo.id })
              }
            })
          })
        )

        // Sort: open first, then by creation date desc
        allJobs.sort((a, b) => {
          if (a.job.status === 'OPEN' && b.job.status !== 'OPEN') return -1
          if (a.job.status !== 'OPEN' && b.job.status === 'OPEN') return 1
          return new Date(b.job.createdAt) - new Date(a.job.createdAt)
        })

        setSavedJobs(allJobs)
      } catch {
        /* silent */
      }
      setLoading(false)
    }

    load()
  }, [bookmarks])

  const handleRemove = (jobId) => {
    const updated = toggleBookmark(bookmarks, `job-${jobId}`)
    setBookmarks(updated)
  }

  const isEmpty = !loading && savedJobs.length === 0

  return (
    <section style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,.05)', fontFamily: "'Inter',sans-serif" }}>
      <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 900, color: NAVY }}>Saved Opportunities</h2>
      <p style={{ margin: '0 0 24px', fontSize: 13, color: '#64748b' }}>
        Items you bookmark across Jobs, NGOs, Events, and Marketplace will appear here.
      </p>

      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {[1, 2, 3].map((n) => (
            <div key={n} style={{ height: 160, backgroundColor: '#f1f5f9', borderRadius: 16, animation: 'pulse 2s' }} />
          ))}
        </div>
      )}

      {!loading && isEmpty && (
        <div style={{ border: '2px dashed #e2e8f0', borderRadius: 14, padding: '40px 24px', textAlign: 'center', color: '#94a3b8' }}>
          <p style={{ fontSize: 28, margin: '0 0 8px' }}>🔖</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: NAVY, margin: '0 0 6px' }}>No saved items yet</p>
          <p style={{ fontSize: 13, margin: '0 0 20px' }}>
            Browse jobs, NGOs, events, and products — save anything you want to revisit later.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/special/jobs')} style={{ background: G, color: '#fff', border: 'none', borderRadius: 9, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Browse Jobs</button>
            <button onClick={() => navigate('/special/ngos')} style={{ background: '#1A8FD1', color: '#fff', border: 'none', borderRadius: 9, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Browse NGOs</button>
            <button onClick={() => navigate('/special/marketplace')} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 9, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Marketplace</button>
          </div>
        </div>
      )}

      {!loading && !isEmpty && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {savedJobs.map(({ job, ngoName }) => (
            <SavedJobCard
              key={job.id}
              job={job}
              ngoName={ngoName}
              bookmarked={bookmarks.includes(`job-${job.id}`)}
              onRemove={() => handleRemove(job.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
