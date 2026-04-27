import { useNavigate } from 'react-router-dom'
import { NGO_FEATURES } from './ngoWorkspaceData'

const INDIGO = '#4f46e5'

const FEATURE_ACTIONS = {
  requirements: { tips: ['Post what your NGO needs from volunteers or sponsors', 'Specify urgency and required expertise', 'Review responses from the support requests tab'] },
  'support-requests': { tips: ['Review incoming requests from beneficiaries and families', 'Accept or decline requests with a note', 'Assign volunteers to follow up'] },
  volunteers: { tips: ['Browse volunteer applications', 'Match volunteers with open requirements', 'Track hours and impact contributions'] },
  campaigns: { tips: ['Create awareness and fundraising campaigns', 'Set goals and track progress', 'Share campaign links with your network'] },
  jobs: { tips: ['Post inclusive jobs suitable for persons with disabilities', 'Review applicants and shortlist candidates', 'Partner with startups and CSR for joint hiring'] },
  products: { tips: ['Publish social-impact or assistive products', 'Manage stock and pricing', 'Earn through sales and donations'] },
  services: { tips: ['List beneficiary services and support programs', 'Manage bookings and requests', 'Track service delivery outcomes'] },
  achievements: { tips: ['Showcase milestones and impact stories', 'Add certifications and recognition', 'Build trust with donors and CSR partners'] },
  messages: { tips: ['Respond to direct messages from users', 'Coordinate with volunteers and supporters', 'Keep communication organized by thread'] },
  csr: { tips: ['Connect with corporate CSR teams for funding and partnerships', 'Post your NGO\'s needs for CSR alignment', 'Track ongoing CSR collaboration progress'] },
}

export default function NgoWorkspaceFeaturePage({ type }) {
  const navigate = useNavigate()
  const config = NGO_FEATURES[type]
  const tips = FEATURE_ACTIONS[type]?.tips || []

  if (!config) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        Invalid NGO workspace page.
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1" style={{ backgroundColor: `${INDIGO}12` }}>
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: INDIGO }} />
              <span className="text-xs font-bold" style={{ color: INDIGO }}>NGO Workspace</span>
            </div>
            <h2 className="mt-3 text-2xl font-black text-slate-900">{config.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{config.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Tips */}
      {tips.length > 0 && (
        <section className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-indigo-700">How to use this page</p>
          <ul className="mt-3 space-y-2">
            {tips.map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Connector info */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
        <p className="font-semibold text-slate-800">Connected to your NGO management system</p>
        <p className="mt-1 text-slate-500">This workspace page links directly to the {config.title} section of your NGO profile dashboard.</p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => navigate(`/ngo/profile?tab=${encodeURIComponent(config.tab)}`)}
          className="rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: INDIGO }}
        >
          Open {config.title} Manager
        </button>
        <button
          type="button"
          onClick={() => navigate('/ngo')}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          ← Back to Workspace
        </button>
        <button
          type="button"
          onClick={() => navigate('/ngo/profile')}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          Open Full NGO Dashboard
        </button>
      </div>
    </div>
  )
}
