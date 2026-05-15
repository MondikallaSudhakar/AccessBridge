import { useNavigate } from 'react-router-dom'

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
    title: 'Customer Support Associate',
    openDate: '2025-04-05',
    closeDate: '2025-05-30',
    applied: 14,
  },
  {
    id: 'train-1',
    type: 'Training',
    title: 'Special School & Training Program',
    openDate: '2025-04-10',
    closeDate: '2025-06-15',
    applied: 9,
  },
  {
    id: 'job-2',
    type: 'Job',
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
      <span className="text-[10px] font-semibold uppercase tracking-wide text-lime-800 font-sans">{label}</span>
      <span className={`text-xs font-bold font-sans ${highlight ? 'text-lime-950 italic' : 'text-slate-900'}`}>{value}</span>
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
      className="group flex flex-col rounded-2xl border border-lime-100 bg-white/90 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-lime-300 hover:shadow-lg hover:shadow-lime-100/80"
    >
      <div className="flex items-start justify-between gap-2 w-full">
        <h3 className="text-base font-bold text-slate-900 font-sans">{title}</h3>
        {meta && (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider font-sans border ${expired ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-lime-300 bg-lime-100 text-lime-950'}`}
          >
            {expired ? 'Closed' : 'Open'}
          </span>
        )}
      </div>

      <p className="mt-2 text-sm text-slate-600 font-sans leading-relaxed">{desc}</p>

      {meta && (
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-lime-100 bg-lime-50/70 px-3 py-3 w-full">
          <MetaBadge label="Open Date" value={fmt(meta.openDate)} />
          <MetaBadge label="Last Date" value={fmt(meta.closeDate)} highlight={expired} />
          <MetaBadge label="Applied" value={`${meta.applied} nos`} />
        </div>
      )}

      <p className="mt-4 text-xs font-bold text-lime-800 underline font-sans">Open page</p>
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
              <div className="z-10 mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 border-lime-500 bg-lime-400 shadow-sm shadow-lime-200" />
              {!isLast && <div className="mt-1 w-[1px] flex-1 bg-lime-100" />}
            </div>
            <article className="mb-6 min-w-0 flex-1 rounded-2xl border border-lime-100 bg-white/90 p-5 transition-all hover:-translate-y-0.5 hover:border-lime-300 hover:shadow-lg hover:shadow-lime-100/80">
              <div className="flex items-start justify-between gap-2">
                <span className="rounded-full border border-lime-200 bg-lime-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-lime-950 font-sans">
                  {item.type}
                </span>
                <span
                  className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-wide font-sans ${expired ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-lime-300 bg-lime-100 text-lime-950'}`}
                >
                  {expired ? 'Closed' : 'Open'}
                </span>
              </div>
              <h4 className="mt-3 text-base font-bold text-slate-900 font-sans">{item.title}</h4>
              <div className="mt-3 flex flex-wrap gap-6 rounded-xl border border-lime-100 bg-lime-50/60 px-4 py-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-lime-800 font-sans">Open Date</span>
                  <span className="text-sm font-bold text-slate-900 font-sans">{fmt(item.openDate)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-lime-800 font-sans">Last Date</span>
                  <span className={`text-sm font-bold font-sans ${expired ? 'text-slate-600 italic' : 'text-slate-900'}`}>{fmt(item.closeDate)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-lime-800 font-sans">Applied</span>
                  <span className="text-sm font-bold text-slate-900 font-sans">{item.applied} nos</span>
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
    { label: 'Jobs', count: '...' },
    { label: 'Products', count: '...' },
    { label: 'Training', count: '...' },
    { label: 'Schemes', count: 4 },
  ]

  return (
    <div className="space-y-8">
      {/* Stats */}
      <section className="overflow-hidden rounded-3xl border border-lime-100 bg-[linear-gradient(135deg,#f3fde2_0%,#fbfff8_45%,#eef7df_100%)] p-6 shadow-sm shadow-lime-100/70 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-700 font-sans">Welcome back</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-serif text-lime-950 md:text-4xl">A softer, brighter workspace for everyday support.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 font-sans">
              Find jobs, training, services, and help requests in one place with a calmer lime-accented interface.
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-lime-200 bg-white/80 px-4 py-2 text-sm font-semibold text-lime-900 shadow-sm shadow-lime-100/60 backdrop-blur">
            <span className="h-2.5 w-2.5 rounded-full bg-lime-500" />
            Special workspace active
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-lime-100 bg-white/85 p-4 shadow-sm shadow-lime-100/50 transition-colors hover:border-lime-200 hover:bg-lime-50/60">
              <p className="text-sm text-slate-500 font-sans">{item.label}</p>
              <p className="mt-1 text-3xl font-serif text-lime-950">{item.count}</p>
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
      <section className="pt-4">
        <p className="mb-6 text-xs font-bold uppercase tracking-[0.18em] text-lime-700 font-sans">Active Postings Timeline</p>
        <PostingTimeline items={TIMELINE_POSTINGS} />
      </section>
    </div>
  )
}
