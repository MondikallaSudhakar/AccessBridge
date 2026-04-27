import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function GuardianHelpPage() {
  const { user } = useAuth()
  const [ngos, setNgos] = useState([])
  const [submittingHelp, setSubmittingHelp] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [helpForm, setHelpForm] = useState({ ngoId: '', requestType: 'DEPENDENT_SUPPORT', title: '', description: '', preferredCity: '' })

  useEffect(() => {
    const loadNgos = async () => {
      try {
        const list = await api.get('/ngos')
        const normalized = Array.isArray(list) ? list : []
        setNgos(normalized)
        if (normalized.length > 0) {
          setHelpForm((current) => ({ ...current, ngoId: current.ngoId || String(normalized[0].id) }))
        }
      } catch {
        setNgos([])
      }
    }
    loadNgos()
  }, [])

  const submitHelpRequest = async (event) => {
    event.preventDefault()
    if (!helpForm.ngoId) {
      setError('Please select an NGO before requesting help.')
      return
    }
    setSubmittingHelp(true)
    setError('')
    setMessage('')
    try {
      await api.post(`/ngos/${helpForm.ngoId}/support-requests`, {
        requesterName: (user?.name || '').trim() || 'Guardian User',
        requesterEmail: (user?.email || '').trim(),
        requesterPhone: '',
        requestType: helpForm.requestType,
        title: helpForm.title,
        description: helpForm.description,
        preferredCity: helpForm.preferredCity,
      })
      setHelpForm((current) => ({ ...current, title: '', description: '', preferredCity: '' }))
      setMessage('Help request submitted to the selected NGO.')
    } catch (err) {
      setError(err.message || 'Failed to submit help request')
    } finally {
      setSubmittingHelp(false)
    }
  }

  return (
    <form onSubmit={submitHelpRequest} className="max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-black text-slate-900">Request NGO support</h2>
      <p className="text-sm text-slate-500">Ask an NGO for dependent support and follow-up services.</p>

      {message && <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
      {error && <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="mt-4 space-y-3">
        <select value={helpForm.ngoId} onChange={(e) => setHelpForm({ ...helpForm, ngoId: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" required>
          <option value="">Select NGO</option>
          {ngos.map((ngo) => <option key={ngo.id} value={String(ngo.id)}>{ngo.name}</option>)}
        </select>
        <input value={helpForm.title} onChange={(e) => setHelpForm({ ...helpForm, title: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="Help request title" required />
        <textarea value={helpForm.description} onChange={(e) => setHelpForm({ ...helpForm, description: e.target.value })} rows={3} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="Describe the support needed for dependent" required />
        <input value={helpForm.preferredCity} onChange={(e) => setHelpForm({ ...helpForm, preferredCity: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="Preferred city (optional)" />
      </div>

      <button type="submit" disabled={submittingHelp || !user?.email} className="mt-4 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
        {submittingHelp ? 'Submitting...' : 'Submit Help Request'}
      </button>
    </form>
  )
}
