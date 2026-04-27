import { useNavigate } from 'react-router-dom'
import { SCHOOL_CAPABILITIES_DO, SCHOOL_CAPABILITIES_VIEW, SCHOOL_WORKSPACE_NAV } from './schoolWorkspaceData'

const AMBER = '#d97706'

const STAT_ITEMS = [
  { label: 'Enrolled Students', value: '48' },
  { label: 'Programs', value: '6' },
  { label: 'Therapy Sessions', value: '15' },
  { label: 'NGO Partners', value: '4' },
]

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
            <button
              key={item.to}
              type="button"
              onClick={() => navigate(item.to)}
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md"
            >
              <h3 className="text-base font-extrabold text-slate-900 group-hover:text-amber-700">{item.label}</h3>
              <p className="mt-2 text-sm text-slate-500">Manage {item.label.toLowerCase()} for your institution.</p>
              <p className="mt-3 text-xs font-bold" style={{ color: AMBER }}>Open page →</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
