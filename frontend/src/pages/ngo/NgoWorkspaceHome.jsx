import { useNavigate } from 'react-router-dom'
import { NGO_CAPABILITIES_DO, NGO_CAPABILITIES_VIEW, NGO_WORKSPACE_NAV } from './ngoWorkspaceData'

const INDIGO = '#4f46e5'

const STAT_ITEMS = [
  { label: 'Volunteers', value: '12+' },
  { label: 'Active Jobs', value: '8' },
  { label: 'Campaigns', value: '5' },
  { label: 'CSR Partners', value: '3' },
]

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
      <p className="text-2xl font-black text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  )
}

function CapabilityList({ title, items, tone = 'indigo' }) {
  const styles =
    tone === 'green'
      ? { border: 'border-emerald-200', bg: 'bg-emerald-50', dot: 'bg-emerald-500', heading: 'text-emerald-900' }
      : { border: 'border-indigo-200', bg: 'bg-indigo-50', dot: 'bg-indigo-500', heading: 'text-indigo-900' }

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

export default function NgoWorkspaceHome() {
  const navigate = useNavigate()
  const featureLinks = NGO_WORKSPACE_NAV.filter((item) => item.to !== '/ngo')

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1" style={{ backgroundColor: `${INDIGO}12` }}>
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: INDIGO }} />
              <span className="text-xs font-bold" style={{ color: INDIGO }}>NGO / Organization / Corporate CSR</span>
            </div>
            <h2 className="mt-3 text-2xl font-black text-slate-900">Workspace Overview</h2>
            <p className="mt-1 max-w-xl text-sm text-slate-600">
              Manage requirements, volunteers, jobs, CSR collaborations, products, and services — all from one place.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/ngo/profile')}
            className="rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: INDIGO }}
          >
            Open NGO Profile
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
        <CapabilityList title="What you can view" items={NGO_CAPABILITIES_VIEW} tone="indigo" />
        <CapabilityList title="What you can post / do" items={NGO_CAPABILITIES_DO} tone="green" />
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
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
            >
              <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-700">{item.label}</h3>
              <p className="mt-2 text-sm text-slate-500">Manage {item.label.toLowerCase()} for your organization.</p>
              <p className="mt-3 text-xs font-bold" style={{ color: INDIGO }}>Open page →</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
