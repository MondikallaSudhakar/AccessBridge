import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const BASE = 'http://localhost:8081/api'
const NGO_GREEN = '#5BCB2B'

// Search Page
export default function Search() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [ngos, setNgos] = useState([])
  const [jobCountByNgo, setJobCountByNgo] = useState({})
  const [helpMessage, setHelpMessage] = useState('')
  const [helpError, setHelpError] = useState('')
  const [submittingHelp, setSubmittingHelp] = useState(false)
  const [helpForm, setHelpForm] = useState({ ngoId: '', requestType: 'GENERAL_SUPPORT', title: '', description: '', preferredCity: '' })

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const ngoRes = await fetch(`${BASE}/ngos`)
        const ngoData = ngoRes.ok ? await ngoRes.json() : []
        const ngoList = Array.isArray(ngoData) ? ngoData : []
        setNgos(ngoList)
        if (ngoList.length > 0) {
          setHelpForm((current) => ({ ...current, ngoId: current.ngoId || String(ngoList[0].id) }))
        }

        const counts = {}
        await Promise.all(
          ngoList.map(async (ngo) => {
            try {
              const jobsRes = await fetch(`${BASE}/ngos/${ngo.id}/jobs`)
              const jobs = jobsRes.ok ? await jobsRes.json() : []
              counts[ngo.id] = Array.isArray(jobs) ? jobs.filter((j) => j.status !== 'CLOSED').length : 0
            } catch {
              counts[ngo.id] = 0
            }
          })
        )
        setJobCountByNgo(counts)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const filteredNgos = useMemo(() => {
    const text = query.trim().toLowerCase()
    if (!text) return ngos
    return ngos.filter((ngo) => {
      return [ngo.name, ngo.city, ngo.state, ngo.mission, ngo.description]
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(text))
    })
  }, [ngos, query])

  const submitHelpRequest = async (event) => {
    event.preventDefault()
    if (!user?.email) {
      setHelpError('Please login to submit a help request.')
      return
    }
    if (!helpForm.ngoId) {
      setHelpError('Please choose an NGO first.')
      return
    }
    setSubmittingHelp(true)
    setHelpError('')
    setHelpMessage('')
    try {
      await api.post(`/ngos/${helpForm.ngoId}/support-requests`, {
        requesterName: (user.name || 'Community User').trim(),
        requesterEmail: user.email.trim(),
        requesterPhone: '',
        requestType: helpForm.requestType,
        title: helpForm.title,
        description: helpForm.description,
        preferredCity: helpForm.preferredCity,
      })
      setHelpForm((current) => ({ ...current, title: '', description: '', preferredCity: '' }))
      setHelpMessage('Help request submitted successfully.')
    } catch (err) {
      setHelpError(err.message || 'Failed to submit help request')
    } finally {
      setSubmittingHelp(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-800">Search</h1>
        <p className="mb-8 text-sm text-gray-600">Find NGOs and open their profiles to view requirements, hiring, products, services, and achievements.</p>

        <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search NGOs by name, city, mission..."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <form onSubmit={submitHelpRequest} className="mb-8 rounded-lg bg-white p-6 shadow-md">
          <h2 className="text-lg font-bold text-gray-900">Request Help</h2>
          <p className="mt-1 text-sm text-gray-600">Send a support request directly to an NGO.</p>
          {helpMessage && <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{helpMessage}</p>}
          {helpError && <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{helpError}</p>}
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <select value={helpForm.ngoId} onChange={(e) => setHelpForm({ ...helpForm, ngoId: e.target.value })} className="rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-emerald-500" required>
              <option value="">Select NGO</option>
              {ngos.map((ngo) => <option key={ngo.id} value={String(ngo.id)}>{ngo.name}</option>)}
            </select>
            <input value={helpForm.preferredCity} onChange={(e) => setHelpForm({ ...helpForm, preferredCity: e.target.value })} className="rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-emerald-500" placeholder="Preferred city (optional)" />
            <input value={helpForm.title} onChange={(e) => setHelpForm({ ...helpForm, title: e.target.value })} className="md:col-span-2 rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-emerald-500" placeholder="Help request title" required />
            <textarea value={helpForm.description} onChange={(e) => setHelpForm({ ...helpForm, description: e.target.value })} rows={3} className="md:col-span-2 rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-emerald-500" placeholder="Describe what help you need" required />
          </div>
          <button type="submit" disabled={submittingHelp || !user?.email} className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
            {submittingHelp ? 'Submitting...' : 'Submit Help Request'}
          </button>
          {!user?.email && <p className="mt-2 text-xs text-amber-700">Login is required to send help requests.</p>}
        </form>

        <div className="rounded-lg bg-white p-6 shadow-md">
          {loading && <p className="text-gray-600">Loading NGO directory...</p>}

          {!loading && filteredNgos.length === 0 && (
            <p className="text-gray-600">No NGOs match your search.</p>
          )}

          {!loading && filteredNgos.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredNgos.map((ngo) => (
                <div key={ngo.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">{ngo.name}</h2>
                      <p className="text-xs text-gray-500">{[ngo.city, ngo.state].filter(Boolean).join(', ')}</p>
                    </div>
                    {ngo.verified && <span className="rounded-full px-2 py-1 text-xs font-bold" style={{ backgroundColor: '#EAF6EF', color: NGO_GREEN }}>Verified</span>}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-600">{ngo.mission || ngo.description || 'No mission added yet.'}</p>
                  <p className="mt-3 text-xs font-semibold text-blue-600">Open hiring requirements: {jobCountByNgo[ngo.id] || 0}</p>
                  <a href={`/ngos/${ngo.id}`} className="mt-3 inline-block text-sm font-bold" style={{ color: NGO_GREEN }}>View NGO Profile</a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
