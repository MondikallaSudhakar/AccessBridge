import { useEffect, useState } from 'react'
import api from '../../services/api'
import { useStartupSubscription } from '../../hooks/useStartupSubscription'

const EVENT_TYPES = ['WORKSHOP', 'SEMINAR', 'FUNDRAISER', 'AWARENESS', 'COMMUNITY']

const statusColor = (status) => ({
  UPCOMING: { bg: '#fff7ed', color: '#c2410c' },
  ONGOING: { bg: '#ffedd5', color: '#9a3412' },
  COMPLETED: { bg: '#f1f5f9', color: '#475569' },
  CANCELLED: { bg: '#fee2e2', color: '#dc2626' },
})[status] || { bg: '#f1f5f9', color: '#64748b' }

const appStatusColor = (status) => ({
  PENDING: { bg: '#fef3c7', color: '#92400e' },
  APPROVED: { bg: '#dcfce7', color: '#166534' },
  REJECTED: { bg: '#fee2e2', color: '#b91c1c' },
})[status] || { bg: '#f1f5f9', color: '#64748b' }

export default function StartupEventsSection({ startupId }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [applications, setApplications] = useState([])
  const [appsLoading, setAppsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const { loading: subscriptionLoading, subscription, startSubscription } = useStartupSubscription(startupId)
  const [form, setForm] = useState({
    title: '',
    description: '',
    eventDate: '',
    location: '',
    city: '',
    state: '',
    eventType: 'WORKSHOP',
    maxParticipants: '',
  })

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      eventDate: '',
      location: '',
      city: '',
      state: '',
      eventType: 'WORKSHOP',
      maxParticipants: '',
    })
  }

  const loadEvents = async () => {
    if (!startupId) return
    setLoading(true)
    try {
      const data = await api.get(`/events/startup/${startupId}`)
      setEvents(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load startup events:', err)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [startupId])

  const loadApplications = async (eventId) => {
    setAppsLoading(true)
    try {
      const data = await api.get(`/events/startup/${startupId}/events/${eventId}/applications`)
      setApplications(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load event applications:', err)
      setApplications([])
    } finally {
      setAppsLoading(false)
    }
  }

  const handleSelectEvent = (event) => {
    setSelectedEvent(event)
    loadApplications(event.id)
  }

  const handleSaveEvent = async () => {
    if (!startupId || !form.title.trim() || !form.description.trim() || !form.eventDate || !form.location.trim()) {
      return
    }

    if (!subscription?.active) {
      setError('A paid Startup subscription is required to create events.')
      return
    }

    setSaving(true)
    setError('')
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        eventDate: new Date(form.eventDate).toISOString(),
        location: form.location.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        eventType: form.eventType,
        maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : 0,
      }

      await api.post(`/events/startup/${startupId}/create`, payload)
      resetForm()
      setShowForm(false)
      loadEvents()
    } catch (err) {
      setError(err.message || 'Failed to create event')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteEvent = async (event) => {
    if (!window.confirm(`Delete "${event.title}"? This will remove any applications.`)) return
    try {
      await api.delete(`/events/startup/${startupId}/events/${event.id}`)
      if (selectedEvent?.id === event.id) {
        setSelectedEvent(null)
        setApplications([])
      }
      loadEvents()
    } catch (err) {
      setError(err.message || 'Failed to delete event')
    }
  }

  const updateApplicationStatus = async (applicationId, status) => {
    if (!selectedEvent) return
    try {
      await api.patch(`/events/startup/${startupId}/events/${selectedEvent.id}/applications/${applicationId}/${status === 'APPROVED' ? 'approve' : 'reject'}`, {})
      loadApplications(selectedEvent.id)
      loadEvents()
    } catch (err) {
      setError(err.message || 'Failed to update application status')
    }
  }

  const formatDate = (dateValue) => {
    if (!dateValue) return '—'
    const parsed = new Date(dateValue)
    return Number.isNaN(parsed.getTime())
      ? '—'
      : parsed.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
  }

  if (!startupId) {
    return null
  }

  if (selectedEvent) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setSelectedEvent(null)}
          className="text-sm font-bold"
          style={{ color: '#e65100' }}
        >
          ← Back to Events
        </button>

        <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="rounded-full px-3 py-1 text-[11px] font-bold uppercase" style={statusColor(selectedEvent.status)}>
              {selectedEvent.status}
            </span>
            {selectedEvent.eventType && (
              <span className="rounded-full bg-orange-50 px-3 py-1 text-[11px] font-semibold text-orange-700">
                {selectedEvent.eventType}
              </span>
            )}
          </div>
          <h3 className="text-lg font-extrabold text-gray-900">{selectedEvent.title}</h3>
          <p className="mt-1 text-xs text-gray-500">
            {selectedEvent.location}{selectedEvent.city ? ` • ${selectedEvent.city}` : ''} | {formatDate(selectedEvent.eventDate)}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Registered: {selectedEvent.registeredParticipants || 0} / {selectedEvent.maxParticipants || '∞'}
          </p>
        </div>

        <h4 className="text-sm font-extrabold text-gray-800">Applicants</h4>

        {appsLoading && <div className="h-20 animate-pulse rounded-2xl border border-gray-200 bg-white" />}

        {!appsLoading && applications.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center">
            <p className="text-sm font-bold text-gray-700">No applications yet.</p>
          </div>
        )}

        {applications.map((application) => (
          <div key={application.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase" style={appStatusColor(application.status)}>
                  {application.status}
                </span>
                <p className="mt-1 text-sm font-extrabold text-gray-900">{application.applicantName}</p>
                <p className="text-xs text-gray-500">{application.applicantEmail}{application.applicantPhone ? ` · ${application.applicantPhone}` : ''}</p>
                {application.applicantNotes && <p className="mt-1 text-xs text-gray-600 italic">"{application.applicantNotes}"</p>}
              </div>
              {application.status === 'PENDING' && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => updateApplicationStatus(application.id, 'APPROVED')}
                    className="rounded-xl px-3 py-1.5 text-xs font-bold text-white"
                    style={{ backgroundColor: '#16a34a' }}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => updateApplicationStatus(application.id, 'REJECTED')}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-gray-900">Posted Events</h3>
          <p className="text-xs text-gray-500">Create events for your startup and manage registrations.</p>
          <p className="text-xs text-gray-500">{subscriptionLoading ? 'Checking subscription status...' : subscription?.active ? 'Subscription active' : 'Subscription required to create events'}</p>
        </div>
        <div className="flex gap-2">
          {!subscription?.active && (
            <button type="button" onClick={() => startSubscription({ onActivated: loadEvents })} className="rounded-xl px-4 py-2 text-xs font-bold text-white" style={{ backgroundColor: '#e65100' }}>
              Pay with Razorpay
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setShowForm((value) => !value)
              setError('')
            }}
            disabled={!subscription?.active}
            className="rounded-xl px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
            style={{ backgroundColor: '#e65100' }}
          >
            {showForm ? '✕ Cancel' : '+ Create Event'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="space-y-3 rounded-2xl border border-orange-200 bg-orange-50 p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Event Title *</span>
              <input
                value={form.title}
                onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
                type="text"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                placeholder="e.g. Startup Demo Day"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Event Type</span>
              <select
                value={form.eventType}
                onChange={(e) => setForm((current) => ({ ...current, eventType: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
              >
                {EVENT_TYPES.map((type) => <option key={type} value={type}>{type.charAt(0) + type.slice(1).toLowerCase()}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Date & Time *</span>
              <input
                value={form.eventDate}
                onChange={(e) => setForm((current) => ({ ...current, eventDate: e.target.value }))}
                type="datetime-local"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Location / Venue *</span>
              <input
                value={form.location}
                onChange={(e) => setForm((current) => ({ ...current, location: e.target.value }))}
                type="text"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                placeholder="e.g. Innovation Hub, Pune"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">City</span>
              <input
                value={form.city}
                onChange={(e) => setForm((current) => ({ ...current, city: e.target.value }))}
                type="text"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                placeholder="e.g. Pune"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">State</span>
              <input
                value={form.state}
                onChange={(e) => setForm((current) => ({ ...current, state: e.target.value }))}
                type="text"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                placeholder="e.g. Maharashtra"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Max Participants</span>
              <input
                value={form.maxParticipants}
                onChange={(e) => setForm((current) => ({ ...current, maxParticipants: e.target.value }))}
                type="number"
                min="1"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                placeholder="e.g. 100"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Description *</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
              rows={4}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
              placeholder="Describe the event, agenda, and who should attend…"
            />
          </label>
          {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
          <button
            type="button"
            onClick={handleSaveEvent}
            disabled={saving || !form.title || !form.description || !form.eventDate || !form.location || !subscription?.active}
            className="rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40"
            style={{ backgroundColor: '#e65100' }}
          >
            {saving ? 'Creating…' : 'Create Event'}
          </button>
        </div>
      )}

      {loading && <div className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white" />}

      {!loading && events.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
          <p className="text-sm font-bold text-slate-700">No events posted yet.</p>
          <p className="mt-1 text-xs text-slate-500">Click "Create Event" to host your first startup event.</p>
        </div>
      )}

      {events.map((event) => {
        const colors = statusColor(event.status)
        return (
          <div key={event.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase" style={colors}>
                    {event.status}
                  </span>
                  {event.eventType && (
                    <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[10px] font-semibold text-orange-700">
                      {event.eventType}
                    </span>
                  )}
                </div>
                <h4 className="mt-1.5 text-base font-extrabold text-slate-900">{event.title}</h4>
                <p className="text-xs text-slate-500">
                  {event.location}{event.city ? ` • ${event.city}` : ''} | {formatDate(event.eventDate)}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Registered: {event.registeredParticipants || 0} / {event.maxParticipants || '∞'}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectEvent(event)}
                  className="rounded-xl px-3 py-1.5 text-xs font-bold text-white"
                  style={{ backgroundColor: '#e65100' }}
                >
                  View Applicants
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteEvent(event)}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-slate-600">{event.description}</p>
          </div>
        )
      })}
    </div>
  )
}