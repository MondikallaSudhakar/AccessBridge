import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function SpecialHelpPage() {
  const { user } = useAuth()
  const [ngos, setNgos] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({ ngoId: '', requestType: 'GENERAL_SUPPORT', title: '', description: '', preferredCity: '' })

  useEffect(() => {
    const loadNgos = async () => {
      try {
        const list = await api.get('/ngos')
        const normalized = Array.isArray(list) ? list : []
        setNgos(normalized)
        if (normalized.length > 0) {
          setForm((current) => ({ ...current, ngoId: current.ngoId || String(normalized[0].id) }))
        }
      } catch {
        setNgos([])
      }
    }

    loadNgos()
  }, [])

  const submitHelp = async (event) => {
    event.preventDefault()
    if (!form.ngoId) {
      setError('Please select an NGO')
      return
    }

    setSubmitting(true)
    setError('')
    setMessage('')

    try {
      await api.post(`/ngos/${form.ngoId}/support-requests`, {
        requesterName: (user?.name || '').trim() || 'Community User',
        requesterEmail: (user?.email || '').trim(),
        requesterPhone: '',
        requestType: form.requestType,
        title: form.title,
        description: form.description,
        preferredCity: form.preferredCity,
      })
      setForm((current) => ({ ...current, title: '', description: '', preferredCity: '' }))
      setMessage('Help request submitted successfully.')
    } catch (err) {
      setError(err.message || 'Failed to submit help request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submitHelp} className="max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-black text-slate-900">Request NGO help</h2>
      <p className="text-sm text-slate-500">Send your support request to a nearby NGO service team.</p>

      {message && <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
      {error && <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="mt-4 space-y-3">
        <select value={form.ngoId} onChange={(e) => setForm({ ...form, ngoId: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" required>
          <option value="">Select NGO</option>
          {ngos.map((ngo) => <option key={ngo.id} value={String(ngo.id)}>{ngo.name}</option>)}
        </select>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="Help request title" required />
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="Describe the help you need" required />
        <input value={form.preferredCity} onChange={(e) => setForm({ ...form, preferredCity: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="Preferred city (optional)" />
      </div>

      <button type="submit" disabled={submitting || !user?.email} className="mt-4 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
        {submitting ? 'Submitting...' : 'Submit Help Request'}
      </button>
    </form>
  )
}
