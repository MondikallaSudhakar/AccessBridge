import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GUARDIAN_OPPORTUNITIES, readGuardianBookmarks, toggleGuardianBookmark } from './guardianData'

const CONFIG = {
  schools: {
    title: 'Special schools and therapy centers',
    subtitle: 'Enroll dependent in schools, training, and therapy centers.',
    primaryLabel: 'Enroll now',
    secondaryLabel: 'Save school',
    path: '/search',
  },
  ngos: {
    title: 'NGOs and support services',
    subtitle: 'Find NGO support services and request help when needed.',
    primaryLabel: 'Request support',
    secondaryLabel: 'Save NGO',
    path: '/guardian/help',
  },
  learning: {
    title: 'Learning resources',
    subtitle: 'Open adaptive resources and programs for dependent learning.',
    primaryLabel: 'Open resource',
    secondaryLabel: 'Save resource',
    path: '/search',
  },
  events: {
    title: 'Events and awareness programs',
    subtitle: 'Register for community events and awareness sessions.',
    primaryLabel: 'Register',
    secondaryLabel: 'Save event',
    path: '/search',
  },
  therapy: {
    title: 'Book therapy or training',
    subtitle: 'Book therapy and training appointments for the dependent.',
    primaryLabel: 'Book now',
    secondaryLabel: 'Save booking',
    path: '/search',
  },
}

function Card({ item, onPrimary, onBookmark, saved, config }) {
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
        <button type="button" onClick={onPrimary} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white">{config.primaryLabel}</button>
        <button type="button" onClick={onBookmark} className="rounded-lg border border-emerald-500 px-3 py-2 text-xs font-bold text-emerald-600">{config.secondaryLabel}</button>
      </div>
    </article>
  )
}

export default function GuardianFeaturePage({ type }) {
  const navigate = useNavigate()
  const [bookmarks, setBookmarks] = useState(readGuardianBookmarks())

  const config = CONFIG[type]
  const items = GUARDIAN_OPPORTUNITIES[type] || []
  const savedSet = useMemo(() => new Set(bookmarks), [bookmarks])

  if (!config) {
    return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">Invalid guardian feature route.</div>
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black text-slate-900">{config.title}</h2>
      <p className="mt-1 text-sm text-slate-600">{config.subtitle}</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <Card
            key={item.id}
            item={item}
            saved={savedSet.has(item.id)}
            onPrimary={() => navigate(config.path)}
            onBookmark={() => setBookmarks((current) => toggleGuardianBookmark(current, item.id))}
            config={config}
          />
        ))}
      </div>
    </section>
  )
}
