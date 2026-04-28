import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const TEAL = '#0d9488'

export default function VolunteerApplicationsPage() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!user?.email) return
      setLoading(true)
      setError('')
      try {
        const data = await api.get(`/volunteer-applications/email/${encodeURIComponent(user.email)}`)
        setApplications(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.message || 'Failed to load applications.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.email])

  const getStatusColor = (status) => {
    const colors = {
      PENDING: { bg: '#FEF3C7', text: '#92400E' },
      APPROVED: { bg: '#DBEAFE', text: '#1E40AF' },
      REJECTED: { bg: '#FEE2E2', text: '#991B1B' },
      WITHDRAWN: { bg: '#F3E8FF', text: '#6B21A8' },
    }
    return colors[status] || colors.PENDING
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black text-slate-900">My Applications</h2>
      <p className="mt-1 text-sm text-slate-600">Track the status of your volunteer applications.</p>

      {loading && <p className="mt-4 text-sm text-slate-500">Loading your applications...</p>}
      {!!error && <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">{error}</p>}
      {!loading && applications.length === 0 && !error && (
        <p className="mt-4 rounded-xl border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600">You haven't submitted any volunteer applications yet.</p>
      )}

      {!loading && applications.length > 0 && (
        <div className="mt-5 space-y-3">
          {applications.map((app, index) => {
            const status = app.status || 'PENDING'
            const colors = getStatusColor(status)
            return (
              <div key={`${app.id}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-900">{app.opportunityTitle || `${app.opportunityType} Application`}</h4>
                    <p className="mt-1 text-xs text-slate-600">Organization: {app.organizationName || 'Organization'}</p>
                    <p className="mt-0.5 text-xs text-slate-500">Applied: {new Date(app.createdAt || app.appliedDate).toLocaleDateString()}</p>
                  </div>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap"
                    style={{ backgroundColor: colors.bg, color: colors.text }}
                  >
                    {status}
                  </span>
                </div>
                {app.motivationLetter && (
                  <p className="mt-3 text-sm text-slate-600">Letter: {app.motivationLetter.substring(0, 100)}...</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
