import { useNavigate } from 'react-router-dom'
import { OPPORTUNITIES } from './specialData'

const FEATURES = [
  { title: 'Profile', desc: 'Create profile with skills, support needs, and disability type.', to: '/special/profile' },
  { title: 'Jobs', desc: 'View disability-friendly jobs and apply using text/audio.', to: '/special/jobs' },
  { title: 'Marketplace', desc: 'Buy or sell products in the marketplace.', to: '/special/marketplace' },
  { title: 'Nearby NGOs', desc: 'Discover NGOs and support services near you.', to: '/special/ngos' },
  { title: 'Training', desc: 'Find special schools and training programs.', to: '/special/training' },
  { title: 'Events', desc: 'Register for events.', to: '/special/events' },
  { title: 'Campaigns', desc: 'Join upcoming campaigns.', to: '/special/campaigns' },
  { title: 'Govt Schemes', desc: 'Explore schemes and benefits.', to: '/special/schemes' },
  { title: 'Request Help', desc: 'Send direct request to NGO.', to: '/special/help' },
  { title: 'Saved', desc: 'Open bookmarked opportunities.', to: '/special/saved' },
]

export default function SpecialHome() {
  const navigate = useNavigate()

  const stats = [
    { label: 'Jobs', count: OPPORTUNITIES.jobs.length },
    { label: 'Products', count: OPPORTUNITIES.marketplace.length },
    { label: 'Training', count: OPPORTUNITIES.training.length },
    { label: 'Schemes', count: OPPORTUNITIES.schemes.length },
  ]

  return (
    <div className="space-y-6">
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
