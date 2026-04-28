import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { readGuardianBookmarks, toggleGuardianBookmark } from './guardianData'
import useGuardianOpportunities from '../../hooks/useGuardianOpportunities'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const CONFIG = {
  schools: {
    title: 'School courses',
    subtitle: 'View special courses from schools and training centers only.',
    primaryLabel: 'Enroll now',
    secondaryLabel: 'Save course',
    path: '/search',
  },
  ngos: {
    title: 'NGOs and support services',
    subtitle: 'Find NGO support services and request help when needed.',
    primaryLabel: 'Request support',
    secondaryLabel: 'Save NGO',
    path: '/guardian/help',
  },
  learning: {
    title: 'Learning resources',
    subtitle: 'Open adaptive resources and programs for dependent learning.',
    primaryLabel: 'Open resource',
    secondaryLabel: 'Save resource',
    path: '/search',
  },
  events: {
    title: 'Events and awareness programs',
    subtitle: 'Register for community events and awareness sessions.',
    primaryLabel: 'Register',
    secondaryLabel: 'Save event',
    path: '/search',
  },
  therapy: {
    title: 'Therapy programs',
    subtitle: 'Book therapy-focused courses and sessions for the dependent.',
    primaryLabel: 'Book now',
    secondaryLabel: 'Save booking',
    path: '/search',
  },
}

function Card({ item, onPrimary, onBookmark, saved, config, primaryLabel, primaryDisabled, statusLabel }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{item.place}</p>
          <h4 className="mt-1 text-base font-bold text-slate-900">{item.title}</h4>
          <p className="mt-1 text-xs font-semibold text-slate-500">{item.org}</p>
        </div>
        <button type="button" onClick={onBookmark} className="rounded-full border px-3 py-1 text-xs font-bold" style={{ borderColor: saved ? '#5BCB2B' : '#cbd5e1', color: saved ? '#5BCB2B' : '#64748b' }}>
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>
      <p className="mt-3 text-sm text-slate-600">{item.summary}</p>
      {statusLabel && (
        <p className="mt-3 inline-flex rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
          Application status: {statusLabel}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <button type="button" disabled={primaryDisabled} onClick={onPrimary} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-400">{primaryLabel || config.primaryLabel}</button>
        <button type="button" onClick={onBookmark} className="rounded-lg border border-emerald-500 px-3 py-2 text-xs font-bold text-emerald-600">{config.secondaryLabel}</button>
      </div>
    </article>
  )
}

export default function GuardianFeaturePage({ type }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [bookmarks, setBookmarks] = useState(readGuardianBookmarks())
  const { opportunities, loading, error } = useGuardianOpportunities()
  const [registeringEvent, setRegisteringEvent] = useState(null)
  const [regForm, setRegForm] = useState({ notes: '' })
  const [regMsg, setRegMsg] = useState('')
  const [submittingReg, setSubmittingReg] = useState(false)
  const [myApplications, setMyApplications] = useState({})

  const config = CONFIG[type]
  const items = opportunities[type] || []
  const savedSet = useMemo(() => new Set(bookmarks), [bookmarks])

  useEffect(() => {
    const loadMyEventApplications = async () => {
      if (type !== 'events' || !user?.email || items.length === 0) {
        setMyApplications({})
        return
      }

      const entries = await Promise.all(items.map(async (item) => {
        if (!item.sourceId) return null
        try {
          const response = await api.get(`/events/${item.sourceId}/my-application`)
          return response?.id ? [item.sourceId, response] : null
        } catch {
          return null
        }
      }))

      const next = {}
      entries.filter(Boolean).forEach(([eventId, application]) => {
        next[eventId] = application
      })
      setMyApplications(next)
    }

    loadMyEventApplications()
  }, [type, user?.email, items])

  const handleEventApply = async (event) => {
    event.preventDefault()
    if (!registeringEvent?.sourceId) return
    setRegMsg('')
    setSubmittingReg(true)
    try {
      const payload = regForm.notes.trim() ? { notes: regForm.notes.trim() } : {}
      const response = await api.post(`/events/${registeringEvent.sourceId}/apply`, payload)
      setMyApplications((current) => ({ ...current, [registeringEvent.sourceId]: response }))
      setRegMsg('Applied successfully.')
      setTimeout(() => {
        setRegisteringEvent(null)
        setRegMsg('')
        setRegForm({ notes: '' })
      }, 1000)
    } catch (err) {
      setRegMsg(err.message || 'Failed to apply for this event.')
    } finally {
      setSubmittingReg(false)
    }
  }

  if (!config) {
    return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">Invalid guardian feature route.</div>
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black text-slate-900">{config.title}</h2>
      <p className="mt-1 text-sm text-slate-600">{config.subtitle}</p>
      {loading && <p className="mt-4 text-sm text-slate-500">Loading from database...</p>}
      {!!error && <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">{error}</p>}
      {!loading && items.length === 0 && !error && (
        <p className="mt-4 rounded-xl border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600">No records available for this section yet.</p>
      )}

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <Card
            key={item.id}
            item={item}
            saved={savedSet.has(item.id)}
            primaryLabel={type === 'events' && myApplications[item.sourceId] ? 'Applied' : config.primaryLabel}
            primaryDisabled={type === 'events' && Boolean(myApplications[item.sourceId])}
            statusLabel={type === 'events' && myApplications[item.sourceId] ? (myApplications[item.sourceId].status || 'PENDING') : ''}
            onPrimary={() => {
              if (type === 'events') {
                setRegisteringEvent(item)
                setRegMsg('')
                setRegForm({ notes: '' })
                return
              }
              navigate(config.path)
            }}
            onBookmark={() => setBookmarks((current) => toggleGuardianBookmark(current, item.id))}
            config={config}
          />
        ))}
      </div>

      {registeringEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 px-4" onClick={() => setRegisteringEvent(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-600">Event Registration</p>
            <h3 className="mt-1 text-lg font-black text-slate-900">{registeringEvent.title}</h3>
            <p className="mt-1 text-xs text-slate-500">{registeringEvent.place}</p>
            <form onSubmit={handleEventApply} className="mt-4 space-y-3">
              <label className="block text-xs font-bold text-slate-600" htmlFor="guardianEventNotes">Additional Notes (optional)</label>
              <textarea
                id="guardianEventNotes"
                rows={3}
                value={regForm.notes}
                onChange={(event) => setRegForm({ notes: event.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                placeholder="Share any support needs for event access..."
              />
              {!!regMsg && (
                <p className={`rounded-lg px-3 py-2 text-xs font-semibold ${regMsg.toLowerCase().includes('success') ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                  {regMsg}
                </p>
              )}
              <div className="flex gap-2">
                <button type="button" onClick={() => setRegisteringEvent(null)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700">Cancel</button>
                <button type="submit" disabled={submittingReg} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-60">
                  {submittingReg ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
