import { useNavigate } from 'react-router-dom'
import useGuardianOpportunities from '../../hooks/useGuardianOpportunities'

const FEATURES = [
  { title: 'Dependent Profile', desc: 'Create and manage dependent profile details.', to: '/guardian/profile' },
  { title: 'Jobs', desc: 'Apply for suitable jobs on behalf of dependent.', to: '/guardian/jobs' },
  { title: 'Schools', desc: 'Browse schools and training centers in the directory.', to: '/guardian/schools' },
  { title: 'NGO Support', desc: 'Find NGOs and support services.', to: '/guardian/ngos' },
  { title: 'Courses and Learning', desc: 'Browse courses and learning programs.', to: '/guardian/learning' },
  { title: 'Events', desc: 'Join events and awareness programs.', to: '/guardian/events' },
  { title: 'Therapy', desc: 'Find therapy-focused programs and sessions.', to: '/guardian/therapy' },
  { title: 'Request Help', desc: 'Send NGO support requests.', to: '/guardian/help' },
  { title: 'Request History', desc: 'Track submitted NGO requests and responses.', to: '/guardian/requests' },
  { title: 'Saved', desc: 'Open saved opportunities.', to: '/guardian/saved' },
  { title: 'Track Progress', desc: 'Future progress tracking dashboard.', to: '/guardian/progress' },
]

const CAN_VIEW = [
  'Suitable jobs for dependent',
  'Schools, courses, and therapy programs',
  'NGOs and support services',
  'Courses and learning programs',
  'Events and awareness programs',
]

const CAN_DO = [
  'Create and manage dependent profile',
  'Apply for jobs on behalf',
  'Enroll in schools or training',
  'Request NGO support',
  'Book therapy or training',
  'Track progress (future)',
]

function CapabilityList({ title, items, tone = 'blue' }) {
  const toneStyles = tone === 'green'
    ? { border: 'border-emerald-200', bg: 'bg-emerald-50', dot: 'bg-emerald-500', heading: 'text-emerald-900' }
    : { border: 'border-sky-200', bg: 'bg-sky-50', dot: 'bg-sky-500', heading: 'text-sky-900' }

  return (
    <section className={`rounded-2xl border ${toneStyles.border} ${toneStyles.bg} p-4`}>
      <h3 className={`text-sm font-extrabold ${toneStyles.heading}`}>{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
            <span className={`mt-1.5 h-2 w-2 rounded-full ${toneStyles.dot}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function GuardianHome() {
  const navigate = useNavigate()
  const { opportunities, loading, error } = useGuardianOpportunities()

  const stats = [
    { label: 'Jobs', count: opportunities.jobs.length },
    { label: 'Schools', count: opportunities.schools.length },
    { label: 'Events', count: opportunities.events.length },
    { label: 'Therapy', count: opportunities.therapy.length },
  ]

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">Guardian Workspace</p>
        {loading && <p className="mt-3 text-sm text-slate-500">Loading latest opportunities from database...</p>}
        {!!error && <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">{error}</p>}
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">{item.label}</p>
              <p className="text-2xl font-black text-slate-900">{item.count}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <CapabilityList title="They Can View" items={CAN_VIEW} tone="blue" />
        <CapabilityList title="They Can Post / Do" items={CAN_DO} tone="green" />
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {FEATURES.map((feature) => (
          <button
            key={feature.to}
            type="button"
            onClick={() => navigate(feature.to)}
            className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <h3 className="text-base font-extrabold text-slate-900">{feature.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{feature.desc}</p>
            <p className="mt-3 text-xs font-bold text-emerald-600">Open page</p>
          </button>
        ))}
      </section>
    </div>
  )
}
