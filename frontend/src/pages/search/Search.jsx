import { useEffect, useMemo, useState } from 'react'

const BASE = 'http://localhost:8081/api'
const NGO_GREEN = '#5BCB2B'

// Search Page
export default function Search() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [ngos, setNgos] = useState([])
  const [jobCountByNgo, setJobCountByNgo] = useState({})

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const ngoRes = await fetch(`${BASE}/ngos`)
        const ngoData = ngoRes.ok ? await ngoRes.json() : []
        const ngoList = Array.isArray(ngoData) ? ngoData : []
        setNgos(ngoList)

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
