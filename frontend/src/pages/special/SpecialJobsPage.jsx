import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OPPORTUNITIES, loadBookmarks, toggleBookmark } from './specialData'

function OpportunityCard({ item, bookmarked, onBookmark, onApply }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{item.place}</p>
          <h4 className="mt-1 text-base font-bold text-slate-900">{item.title}</h4>
          <p className="mt-1 text-xs font-semibold text-slate-500">{item.org}</p>
        </div>
        <button type="button" onClick={onBookmark} className="rounded-full border px-3 py-1 text-xs font-bold" style={{ borderColor: bookmarked ? '#5BCB2B' : '#cbd5e1', color: bookmarked ? '#5BCB2B' : '#64748b' }}>
          {bookmarked ? 'Saved' : 'Save'}
        </button>
      </div>
      <p className="mt-3 text-sm text-slate-600">{item.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={onApply} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white">
          Apply with text/audio
        </button>
        <button type="button" onClick={onBookmark} className="rounded-lg border px-3 py-2 text-xs font-bold" style={{ borderColor: '#5BCB2B', color: '#5BCB2B' }}>
          Save job
        </button>
      </div>
    </article>
  )
}

export default function SpecialJobsPage() {
  const navigate = useNavigate()
  const [bookmarks, setBookmarks] = useState(loadBookmarks())
  const [selectedJob, setSelectedJob] = useState(null)
  const [applicationText, setApplicationText] = useState('')
  const [applicationAudioName, setApplicationAudioName] = useState('')

  const bookmarkSet = useMemo(() => new Set(bookmarks), [bookmarks])

  const openJobApplication = (job) => {
    setSelectedJob(job)
    setApplicationText(`Hello, I am interested in the role: ${job.title}. Please consider my profile and accessibility needs.`)
    setApplicationAudioName('')
  }

  const saveApplicationDraft = () => {
    if (!selectedJob) return
    const draft = {
      jobId: selectedJob.id,
      title: selectedJob.title,
      text: applicationText,
      audioFileName: applicationAudioName,
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(`special-job-draft-${selectedJob.id}`, JSON.stringify(draft))
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">Disability-friendly job listings</h2>
        <p className="mt-1 text-sm text-slate-600">Apply with text or audio and bookmark roles to revisit.</p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {OPPORTUNITIES.jobs.map((item) => (
            <OpportunityCard
              key={item.id}
              item={item}
              bookmarked={bookmarkSet.has(item.id)}
              onBookmark={() => setBookmarks((current) => toggleBookmark(current, item.id))}
              onApply={() => openJobApplication(item)}
            />
          ))}
        </div>
      </section>

      {selectedJob && (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Job application</p>
              <h3 className="text-xl font-black text-slate-900">{selectedJob.title}</h3>
              <p className="text-sm text-slate-600">{selectedJob.org} • {selectedJob.place}</p>
            </div>
            <button type="button" onClick={() => navigate('/messages')} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white">
              Open Messages
            </button>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wide text-emerald-700">Text application</span>
              <textarea value={applicationText} onChange={(e) => setApplicationText(e.target.value)} rows={5} className="mt-1 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-sm outline-none" />
            </label>

            <div className="space-y-3 rounded-2xl border border-emerald-200 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Audio note</p>
              <input type="file" accept="audio/*" onChange={(e) => setApplicationAudioName(e.target.files?.[0]?.name || '')} className="block w-full text-sm" />
              <p className="text-xs text-slate-500">{applicationAudioName ? `Attached: ${applicationAudioName}` : 'Attach a short audio note for your application.'}</p>
              <button type="button" onClick={saveApplicationDraft} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white">
                Save Draft
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
