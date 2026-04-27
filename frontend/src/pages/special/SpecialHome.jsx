import { useNavigate } from 'react-router-dom'
import { OPPORTUNITIES } from './specialData'

const TEAL = '#0d9488'

const FEATURES = [
  { title: 'Profile', desc: 'Create profile with skills, support needs, and disability type.', to: '/special/profile' },
  {
    title: 'Jobs',
    desc: 'View disability-friendly jobs and apply using text/audio.',
    to: '/special/jobs',
    meta: { openDate: '2025-04-05', closeDate: '2025-05-30', applied: 14 },
  },
  { title: 'Marketplace', desc: 'Buy or sell products in the marketplace.', to: '/special/marketplace' },
  { title: 'Nearby NGOs', desc: 'Discover NGOs and support services near you.', to: '/special/ngos' },
  {
    title: 'Training',
    desc: 'Find special schools and training programs.',
    to: '/special/training',
    meta: { openDate: '2025-04-10', closeDate: '2025-06-15', applied: 9 },
  },
  { title: 'Events', desc: 'Register for events.', to: '/special/events' },
  { title: 'Campaigns', desc: 'Join upcoming campaigns.', to: '/special/campaigns' },
  { title: 'Govt Schemes', desc: 'Explore schemes and benefits.', to: '/special/schemes' },
  { title: 'Request Help', desc: 'Send direct request to NGO.', to: '/special/help' },
  { title: 'Saved', desc: 'Open bookmarked opportunities.', to: '/special/saved' },
]

/* ── Timeline postings ── */
const TIMELINE_POSTINGS = [
  {
    id: 'job-1',
    type: 'Job',
    dot: '#4f46e5',
    bg: '#eef2ff',
    title: 'Customer Support Associate',
    openDate: '2025-04-05',
    closeDate: '2025-05-30',
    applied: 14,
  },
  {
    id: 'train-1',
    type: 'Training',
    dot: '#0d9488',
    bg: '#f0fdfa',
    title: 'Special School & Training Program',
    openDate: '2025-04-10',
    closeDate: '2025-06-15',
    applied: 9,
  },
  {
    id: 'job-2',
    type: 'Job',
    dot: '#4f46e5',
    bg: '#eef2ff',
    title: 'Data Entry & Admin Assistant',
    openDate: '2025-04-15',
    closeDate: '2025-06-01',
    applied: 7,
  },
]

function fmt(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function isExpired(closeDate) {
  return closeDate && new Date(closeDate) < new Date()
}

function MetaBadge({ label, value, highlight }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      <span className={`text-xs font-bold ${highlight ? 'text-rose-500' : 'text-slate-700'}`}>{value}</span>
    </div>
  )
}

function FeatureCard({ feature }) {
  const { title, desc, to, meta } = feature
  const navigate = useNavigate()
  const expired = meta && isExpired(meta.closeDate)

  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-teal-700">{title}</h3>
        {meta && (
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{
              backgroundColor: expired ? '#fee2e2' : '#dcfce7',
              color: expired ? '#dc2626' : '#16a34a',
            }}
          >
            {expired ? 'Closed' : 'Open'}
          </span>
        )}
      </div>

      <p className="mt-1.5 text-sm text-slate-600">{desc}</p>

      {meta && (
        <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
          <MetaBadge label="Open Date" value={fmt(meta.openDate)} />
          <MetaBadge label="Last Date" value={fmt(meta.closeDate)} highlight={expired} />
          <MetaBadge label="Applied" value={`${meta.applied} nos`} />
        </div>
      )}

      <p className="mt-3 text-xs font-bold text-emerald-600">Open page</p>
    </button>
  )
}

function PostingTimeline({ items }) {
  if (!items.length) return null
  return (
    <div className="pl-1">
      {items.map((item, index) => {
        const expired = isExpired(item.closeDate)
        const isLast = index === items.length - 1
        return (
          <div key={item.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="z-10 mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 border-white shadow" style={{ backgroundColor: item.dot }} />
              {!isLast && <div className="mt-1 w-0.5 flex-1 bg-slate-200" />}
            </div>
            <article className="mb-4 min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-2">
                <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ backgroundColor: item.bg, color: item.dot }}>
                  {item.type}
                </span>
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                  style={{
                    backgroundColor: expired ? '#fee2e2' : '#dcfce7',
                    color: expired ? '#dc2626' : '#16a34a',
                  }}
                >
                  {expired ? 'Closed' : 'Open'}
                </span>
              </div>
              <h4 className="mt-2 text-sm font-extrabold text-slate-900">{item.title}</h4>
              <div className="mt-2 flex flex-wrap gap-4 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                <div className="flex flex-col">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Open Date</span>
                  <span className="text-xs font-bold text-slate-700">{fmt(item.openDate)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Last Date</span>
                  <span className={`text-xs font-bold ${expired ? 'text-rose-500' : 'text-slate-700'}`}>{fmt(item.closeDate)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Applied</span>
                  <span className="text-xs font-bold text-slate-700">{item.applied} nos</span>
                </div>
              </div>
            </article>
          </div>
        )
      })}
    </div>
  )
}

export default function SpecialHome() {
  const stats = [
    { label: 'Jobs', count: OPPORTUNITIES.jobs.length },
    { label: 'Products', count: OPPORTUNITIES.marketplace.length },
    { label: 'Training', count: OPPORTUNITIES.training.length },
    { label: 'Schemes', count: OPPORTUNITIES.schemes.length },
  ]

  return (
    <div className="space-y-6">
      {/* Stats */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">Welcome</p>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">{item.label}</p>
              <p className="text-2xl font-black text-slate-900">{item.count}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature cards */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.to} feature={feature} />
        ))}
      </section>

      {/* Active Postings Timeline */}
      <section>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Active Postings Timeline</p>
        <PostingTimeline items={TIMELINE_POSTINGS} />
      </section>
    </div>
  )
}
