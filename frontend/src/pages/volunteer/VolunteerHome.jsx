import { useNavigate } from 'react-router-dom'
import { VOLUNTEER_CAPABILITIES_DO, VOLUNTEER_CAPABILITIES_VIEW, VOLUNTEER_WORKSPACE_NAV } from './volunteerData'

const TEAL = '#0d9488'

const FEATURES = [
  { title: 'Opportunities', desc: 'Browse volunteer roles and opportunities posted by NGOs.', to: '/volunteer/opportunities' },
  { title: 'NGO Needs', desc: 'View support requests from organizations looking for volunteers.', to: '/volunteer/ngo-needs' },
  { title: 'Events & Campaigns', desc: 'Join community events and awareness campaigns.', to: '/volunteer/events' },
  { title: 'Schools & Mentors', desc: 'Find schools looking for mentors and supporters.', to: '/volunteer/schools' },
  { title: 'Impact Stories', desc: 'Read inspiring stories from volunteers and communities.', to: '/volunteer/stories' },
  { title: 'My Applications', desc: 'Track your volunteer applications and their status.', to: '/volunteer/applications' },
]

function CapabilityList({ title, items, tone = 'teal' }) {
  const toneStyles = tone === 'green'
    ? { border: 'border-emerald-200', bg: 'bg-emerald-50', dot: 'bg-emerald-500', heading: 'text-emerald-900' }
    : { border: 'border-teal-200', bg: 'bg-teal-50', dot: 'bg-teal-500', heading: 'text-teal-900' }

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

export default function VolunteerHome() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: TEAL }}>Volunteer Workspace</p>
        <h1 className="mt-2 text-2xl font-black text-slate-900">Support communities and create impact</h1>
        <p className="mt-2 text-sm text-slate-600">Browse volunteer opportunities, join campaigns, and help organizations make a difference.</p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <CapabilityList title="You Can View" items={VOLUNTEER_CAPABILITIES_VIEW} tone="teal" />
        <CapabilityList title="You Can Do" items={VOLUNTEER_CAPABILITIES_DO} tone="green" />
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
            <p className="mt-3 text-xs font-bold" style={{ color: TEAL }}>Explore</p>
          </button>
        ))}
      </section>
    </div>
  )
}
