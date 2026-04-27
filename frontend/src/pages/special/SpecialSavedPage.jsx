import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OPPORTUNITIES, loadBookmarks, toggleBookmark } from './specialData'

function allOpportunities() {
  return Object.values(OPPORTUNITIES).flatMap((items) => items)
}

export default function SpecialSavedPage() {
  const navigate = useNavigate()
  const [bookmarks, setBookmarks] = useState(loadBookmarks())

  const savedItems = useMemo(() => {
    const ids = new Set(bookmarks)
    return allOpportunities().filter((item) => ids.has(item.id))
  }, [bookmarks])

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black text-slate-900">Saved opportunities</h2>
      <p className="mt-1 text-sm text-slate-600">Your bookmarked jobs, products, services, programs, events, campaigns, and schemes.</p>

      {savedItems.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
          No saved items yet. Save opportunities from feature pages and they will appear here.
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
                <button type="button" onClick={() => navigate('/special')} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white">Open workspace</button>
                <button type="button" onClick={() => setBookmarks((current) => toggleBookmark(current, item.id))} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">Remove</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
