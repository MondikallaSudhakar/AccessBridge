import { useNavigate } from 'react-router-dom'
import { SCHOOL_FEATURES } from './schoolWorkspaceData'

const AMBER = '#d97706'

export default function SchoolWorkspaceFeaturePage({ type }) {
  const navigate = useNavigate()
  const config = SCHOOL_FEATURES[type]

  if (!config) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        Invalid school workspace page.
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1" style={{ backgroundColor: `${AMBER}18` }}>
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: AMBER }} />
              <span className="text-xs font-bold" style={{ color: AMBER }}>School / Training Center Workspace</span>
            </div>
            <h2 className="mt-3 text-2xl font-black text-slate-900">{config.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{config.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Tips */}
      {config.tips?.length > 0 && (
        <section className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-amber-700">How to use this page</p>
          <ul className="mt-3 space-y-2">
            {config.tips.map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Connector info */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
        <p className="font-semibold text-slate-800">Connected to your School profile</p>
        <p className="mt-1 text-slate-500">This workspace page links to the {config.title} section of your school dashboard.</p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => navigate(`/school/profile?tab=${encodeURIComponent(config.tab)}`)}
          className="rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: AMBER }}
        >
          Open {config.title} Manager
        </button>
        <button
          type="button"
          onClick={() => navigate('/school-workspace')}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          ← Back to Workspace
        </button>
        <button
          type="button"
          onClick={() => navigate('/school/profile')}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          Open Full School Dashboard
        </button>
      </div>
    </div>
  )
}
