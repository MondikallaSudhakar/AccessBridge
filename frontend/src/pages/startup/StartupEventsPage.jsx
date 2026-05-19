import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import StartupEventsSection from './StartupEventsSection'
import { COLORS } from '../../utils/colors'

export default function StartupEventsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [startupId, setStartupId] = useState(null)

  useEffect(() => {
    if (user && user.role !== 'STARTUP_ADMIN') navigate('/dashboard')
  }, [user, navigate])

  useEffect(() => {
    if (!user?.email) return
    ;(async () => {
      try {
        const encoded = encodeURIComponent(user.email)
        const data = await api.get(`/startups/email/${encoded}`)
        setStartupId(data?.id || null)
      } catch {
        setStartupId(null)
      }
    })()
  }, [user])

  return (
    <div className="space-y-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: COLORS.primary }}>Startup Admin</p>
            <h1 className="text-3xl font-black text-slate-900">Posted Events</h1>
            <p className="text-sm text-slate-500 mt-1">Create and manage events for your startup in a dedicated page.</p>
          </div>
          <button onClick={() => navigate('/startup/profile')} className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90" style={{ backgroundColor: COLORS.success }}>
            Back to Profile
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-5">
          <StartupEventsSection startupId={startupId} />
        </div>
      </section>
    </div>
  )
}
