import { useNavigate } from 'react-router-dom'
import { SCHOOL_CAPABILITIES_DO, SCHOOL_CAPABILITIES_VIEW, SCHOOL_WORKSPACE_NAV } from './schoolWorkspaceData'

const AMBER = '#d97706'

/* ── Sample active postings for timeline ── */
const ACTIVE_POSTINGS = [
  {
    id: 'prog-1',
    type: 'Program',
    dot: '#d97706',
    bg: '#fef3c7',
    title: 'Vocational Skills Training – Batch 3',
    openDate: '2025-03-15',
    closeDate: '2025-06-30',
    applied: 34,
  },
  {
    id: 'adm-1',
    type: 'Admission',
    dot: '#4f46e5',
    bg: '#eef2ff',
    title: 'Special School Admissions 2025–26',
    openDate: '2025-04-01',
    closeDate: '2025-05-20',
    applied: 18,
  },
  {
    id: 'prog-2',
    type: 'Program',
    dot: '#d97706',
    bg: '#fef3c7',
    title: 'Digital Literacy Certificate Course',
    openDate: '2025-04-10',
    closeDate: '2025-07-15',
    applied: 21,
  },
]

const STAT_ITEMS = [
  { label: 'Enrolled Students', value: '48' },
  { label: 'Programs', value: '6' },
  { label: 'Therapy Sessions', value: '15' },
  { label: 'NGO Partners', value: '4' },
]

function fmt(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function isExpired(closeDate) {
  return closeDate && new Date(closeDate) < new Date()
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
      <p className="text-2xl font-black text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  )
}

function CapabilityList({ title, items, tone = 'amber' }) {
  const styles =
    tone === 'green'
      ? { border: 'border-emerald-200', bg: 'bg-emerald-50', dot: 'bg-emerald-500', heading: 'text-emerald-900' }
      : { border: 'border-amber-200', bg: 'bg-amber-50', dot: 'bg-amber-500', heading: 'text-amber-900' }

  return (
    <section className={`rounded-2xl border ${styles.border} ${styles.bg} p-4`}>
      <h3 className={`text-sm font-extrabold ${styles.heading}`}>{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${styles.dot}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function MetaBadge({ label, value, highlight }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      <span className={`text-xs font-bold ${highlight ? 'text-rose-500' : 'text-slate-700'}`}>{value}</span>
    </div>
  )
}

function FeatureCard({ item, accentColor }) {
  const { label, to, meta } = item
  const navigate = useNavigate()
  const expired = meta && isExpired(meta.closeDate)

  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-amber-700">{label}</h3>
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

      <p className="mt-1.5 text-sm text-slate-500">Manage {label.toLowerCase()} for your institution.</p>

      {meta && (
        <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
          <MetaBadge label="Open Date" value={fmt(meta.openDate)} />
          <MetaBadge label="Last Date" value={fmt(meta.closeDate)} highlight={expired} />
          <MetaBadge label="Applied" value={`${meta.applied} nos`} />
        </div>
      )}

      <p className="mt-3 text-xs font-bold" style={{ color: accentColor }}>Open page →</p>
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

export default function SchoolWorkspaceHome() {
  const navigate = useNavigate()
  const featureLinks = SCHOOL_WORKSPACE_NAV.filter((item) => item.to !== '/school-workspace')

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1" style={{ backgroundColor: `${AMBER}18` }}>
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: AMBER }} />
              <span className="text-xs font-bold" style={{ color: AMBER }}>Special Schools / Training Centers</span>
            </div>
            <h2 className="mt-3 text-2xl font-black text-slate-900">Workspace Overview</h2>
            <p className="mt-1 max-w-xl text-sm text-slate-600">
              Manage students, programs, staff, therapy sessions, events, and NGO partnerships — from one dedicated workspace.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/school/profile')}
            className="rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: AMBER }}
          >
            Open School Profile
          </button>
        </div>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {STAT_ITEMS.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </section>

      {/* Capabilities */}
      <div className="grid gap-4 md:grid-cols-2">
        <CapabilityList title="What you can view" items={SCHOOL_CAPABILITIES_VIEW} tone="amber" />
        <CapabilityList title="What you can manage / do" items={SCHOOL_CAPABILITIES_DO} tone="green" />
      </div>

      {/* Feature Links */}
      <section>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Quick Access</p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featureLinks.map((item) => (
            <FeatureCard key={item.to} item={item} accentColor={AMBER} />
          ))}
        </div>
      </section>

      {/* Active Postings Timeline */}
      <section>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Active Postings Timeline</p>
        <PostingTimeline items={ACTIVE_POSTINGS} />
      </section>
    </div>
  )
}
