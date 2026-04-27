import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GUARDIAN_OPPORTUNITIES, readGuardianBookmarks, toggleGuardianBookmark } from './guardianData'

function Card({ item, onPrimary, onBookmark, saved }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{item.place}</p>
          <h4 className="mt-1 text-base font-bold text-slate-900">{item.title}</h4>
          <p className="mt-1 text-xs font-semibold text-slate-500">{item.org}</p>
        </div>
        <button type="button" onClick={onBookmark} className="rounded-full border px-3 py-1 text-xs font-bold" style={{ borderColor: saved ? '#5BCB2B' : '#cbd5e1', color: saved ? '#5BCB2B' : '#64748b' }}>
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>
      <p className="mt-3 text-sm text-slate-600">{item.summary}</p>
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={onPrimary} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Apply on behalf</button>
        <button type="button" onClick={onBookmark} className="rounded-lg border border-emerald-500 px-3 py-2 text-xs font-bold text-emerald-600">Bookmark job</button>
      </div>
    </article>
  )
}

export default function GuardianJobsPage() {
  const navigate = useNavigate()
  const [bookmarks, setBookmarks] = useState(readGuardianBookmarks())
  const [selectedOpportunity, setSelectedOpportunity] = useState(null)
  const [applicationNote, setApplicationNote] = useState('')

  const savedSet = useMemo(() => new Set(bookmarks), [bookmarks])

  const startApplication = (item) => {
    setSelectedOpportunity(item)
    setApplicationNote(`Please consider this dependent for: ${item.title}. I am applying on behalf of them.`)
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">Suitable jobs for dependent</h2>
        <p className="mt-1 text-sm text-slate-600">Apply on behalf and save opportunities for follow-up.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {GUARDIAN_OPPORTUNITIES.jobs.map((item) => (
            <Card
              key={item.id}
              item={item}
              saved={savedSet.has(item.id)}
              onBookmark={() => setBookmarks((current) => toggleGuardianBookmark(current, item.id))}
              onPrimary={() => startApplication(item)}
            />
          ))}
        </div>
      </section>

      {selectedOpportunity && (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Application on behalf</p>
              <h3 className="text-xl font-black text-slate-900">{selectedOpportunity.title}</h3>
              <p className="text-sm text-slate-600">{selectedOpportunity.org} • {selectedOpportunity.place}</p>
            </div>
            <button type="button" onClick={() => navigate('/messages')} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white">Open Messages</button>
          </div>
          <textarea value={applicationNote} onChange={(e) => setApplicationNote(e.target.value)} rows={4} className="mt-4 w-full rounded-2xl border border-emerald-200 px-4 py-3 text-sm outline-none" />
          <button type="button" onClick={() => setBookmarks((current) => toggleGuardianBookmark(current, selectedOpportunity.id))} className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white">Save Draft</button>
        </section>
      )}
    </div>
  )
}
