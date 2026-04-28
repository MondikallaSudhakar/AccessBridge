import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { readGuardianBookmarks, toggleGuardianBookmark } from './guardianData'
import useGuardianOpportunities from '../../hooks/useGuardianOpportunities'

export default function GuardianSavedPage() {
  const navigate = useNavigate()
  const [bookmarks, setBookmarks] = useState(readGuardianBookmarks())
  const { opportunities, loading, error } = useGuardianOpportunities()

  const savedItems = useMemo(() => {
    const ids = new Set(bookmarks)
    const allItems = Object.values(opportunities).flatMap((items) => items)
    return allItems.filter((item) => ids.has(item.id))
  }, [bookmarks, opportunities])

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black text-slate-900">Saved opportunities</h2>
      <p className="mt-1 text-sm text-slate-600">Your saved jobs, schools, NGO support options, resources, events, and therapy slots.</p>
      {loading && <p className="mt-4 text-sm text-slate-500">Loading latest records from database...</p>}
      {!!error && <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">{error}</p>}

      {savedItems.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
          No saved items yet. Bookmark opportunities from the feature pages.
        </div>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {savedItems.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{item.place}</p>
              <h3 className="mt-1 text-base font-bold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-xs font-semibold text-slate-500">{item.org}</p>
              <p className="mt-3 text-sm text-slate-600">{item.summary}</p>
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => navigate('/guardian')} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white">Open workspace</button>
                <button type="button" onClick={() => setBookmarks((current) => toggleGuardianBookmark(current, item.id))} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">Remove</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
