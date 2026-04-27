import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OPPORTUNITIES, loadBookmarks, toggleBookmark } from './specialData'

function OpportunityCard({ item, bookmarked, onBookmark, onPrimary, primaryLabel, secondaryLabel }) {
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
        <button type="button" onClick={onPrimary} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white">
          {primaryLabel}
        </button>
        <button type="button" onClick={onBookmark} className="rounded-lg border px-3 py-2 text-xs font-bold" style={{ borderColor: '#5BCB2B', color: '#5BCB2B' }}>
          {secondaryLabel}
        </button>
      </div>
    </article>
  )
}

const CONFIG = {
  marketplace: {
    title: 'Marketplace - buy or sell products',
    action: 'Buy assistive products or list your own products in the marketplace.',
    primaryLabel: 'Buy product',
    secondaryLabel: 'Sell / save',
    onPrimaryPath: '/marketplace',
    columns: 'md:grid-cols-2',
  },
  ngos: {
    title: 'Nearby NGOs & services',
    action: 'Find nearby services and open help page to request support.',
    primaryLabel: 'Request NGO help',
    secondaryLabel: 'Save NGO',
    onPrimaryPath: '/special/help',
    columns: 'md:grid-cols-2',
  },
  training: {
    title: 'Special schools & training programs',
    action: 'Enroll in training programs for skills and independence.',
    primaryLabel: 'Enroll in training',
    secondaryLabel: 'Save program',
    onPrimaryPath: '/search',
    columns: 'md:grid-cols-2',
  },
  events: {
    title: 'Events',
    action: 'Register for events and accessibility meetups.',
    primaryLabel: 'Register event',
    secondaryLabel: 'Save event',
    onPrimaryPath: '/search',
    columns: 'md:grid-cols-2',
  },
  campaigns: {
    title: 'Upcoming campaigns',
    action: 'Join inclusion campaigns and awareness drives.',
    primaryLabel: 'Join campaign',
    secondaryLabel: 'Save campaign',
    onPrimaryPath: '/search',
    columns: 'md:grid-cols-2',
  },
  schemes: {
    title: 'Govt schemes & benefits',
    action: 'Track benefits, documents, and support programs.',
    primaryLabel: 'Open guide',
    secondaryLabel: 'Save scheme',
    onPrimaryPath: '/search',
    columns: 'md:grid-cols-2',
  },
}

export default function SpecialFeaturePage({ type }) {
  const navigate = useNavigate()
  const [bookmarks, setBookmarks] = useState(loadBookmarks())

  const config = CONFIG[type]
  const items = OPPORTUNITIES[type] || []
  const bookmarkSet = useMemo(() => new Set(bookmarks), [bookmarks])

  if (!config) {
    return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">Invalid feature route.</div>
  }

  const onBookmark = (id) => {
    setBookmarks((current) => toggleBookmark(current, id))
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black text-slate-900">{config.title}</h2>
      <p className="mt-1 text-sm text-slate-600">{config.action}</p>

      <div className={`mt-5 grid gap-4 ${config.columns}`}>
        {items.map((item) => (
          <OpportunityCard
            key={item.id}
            item={item}
            bookmarked={bookmarkSet.has(item.id)}
            onBookmark={() => onBookmark(item.id)}
            onPrimary={() => navigate(config.onPrimaryPath)}
            primaryLabel={config.primaryLabel}
            secondaryLabel={config.secondaryLabel}
          />
        ))}
      </div>
    </section>
  )
}
