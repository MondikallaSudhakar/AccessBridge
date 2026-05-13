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
      <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 font-sans">{label}</span>
      <span className={`text-xs font-bold font-sans ${highlight ? 'text-yc-black italic' : 'text-yc-black'}`}>{value}</span>
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
      className="group flex flex-col rounded border border-gray-200 bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-yc-black hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2 w-full">
        <h3 className="text-base font-bold text-yc-black font-sans">{title}</h3>
        {meta && (
          <span
            className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider font-sans border ${expired ? 'border-gray-300 text-gray-500' : 'border-yc-black text-yc-black'}`}
          >
            {expired ? 'Closed' : 'Open'}
          </span>
        )}
      </div>

      <p className="mt-2 text-sm text-gray-600 font-sans leading-relaxed">{desc}</p>

      {meta && (
        <div className="mt-4 grid grid-cols-3 gap-2 rounded border border-gray-200 bg-white px-3 py-3 w-full">
          <MetaBadge label="Open Date" value={fmt(meta.openDate)} />
          <MetaBadge label="Last Date" value={fmt(meta.closeDate)} highlight={expired} />
          <MetaBadge label="Applied" value={`${meta.applied} nos`} />
        </div>
      )}

      <p className="mt-4 text-xs font-bold text-yc-black underline font-sans">Open page</p>
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
              <div className="z-10 mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 border-yc-black bg-yc-black" />
              {!isLast && <div className="mt-1 w-[1px] flex-1 bg-gray-200" />}
            </div>
            <article className="mb-6 min-w-0 flex-1 rounded border border-gray-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-yc-black hover:shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <span className="rounded border border-gray-200 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-yc-black font-sans">
                  {item.type}
                </span>
                <span
                  className={`rounded border px-2 py-1 text-[10px] font-bold uppercase tracking-wide font-sans ${expired ? 'border-gray-300 text-gray-500' : 'border-yc-black text-yc-black'}`}
                >
                  {expired ? 'Closed' : 'Open'}
                </span>
              </div>
              <h4 className="mt-3 text-base font-bold text-yc-black font-sans">{item.title}</h4>
              <div className="mt-3 flex flex-wrap gap-6 rounded border border-gray-200 bg-white px-4 py-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 font-sans">Open Date</span>
                  <span className="text-sm font-bold text-yc-black font-sans">{fmt(item.openDate)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 font-sans">Last Date</span>
                  <span className={`text-sm font-bold font-sans ${expired ? 'text-yc-black italic' : 'text-yc-black'}`}>{fmt(item.closeDate)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 font-sans">Applied</span>
                  <span className="text-sm font-bold text-yc-black font-sans">{item.applied} nos</span>
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
      <section className="rounded border border-gray-200 bg-white p-6 md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-yc-black font-sans">Welcome back</p>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300">
              <p className="text-sm text-gray-500 font-sans">{item.label}</p>
              <p className="text-3xl font-serif text-yc-black mt-1">{item.count}</p>
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
        <p className="mb-6 text-xs font-bold uppercase tracking-[0.18em] text-gray-500 font-sans">Active Postings Timeline</p>
        <PostingTimeline items={TIMELINE_POSTINGS} />
      </section>
    </div>
  )
}
