import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const BASE = 'http://localhost:8081/api'
const NGO_GREEN = '#5BCB2B'

async function fetchJSON(url) {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export default function NgoDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [ngo, setNgo] = useState(null)
  const [needs, setNeeds] = useState([])
  const [jobs, setJobs] = useState([])
  const [products, setProducts] = useState([])
  const [services, setServices] = useState([])
  const [achievements, setAchievements] = useState([])
  const [tab, setTab] = useState('requirements')
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [chatError, setChatError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [ngoData, needData, jobData, productData, serviceData, achievementData] = await Promise.all([
        fetchJSON(`${BASE}/ngos/${id}`),
        fetchJSON(`${BASE}/ngos/${id}/needs`),
        fetchJSON(`${BASE}/ngos/${id}/jobs`),
        fetchJSON(`${BASE}/ngos/${id}/products`),
        fetchJSON(`${BASE}/ngos/${id}/services`),
        fetchJSON(`${BASE}/ngos/${id}/achievements`),
      ])

      setNgo(ngoData)
      setNeeds(Array.isArray(needData) ? needData : [])
      setJobs(Array.isArray(jobData) ? jobData : [])
      setProducts(Array.isArray(productData) ? productData : [])
      setServices(Array.isArray(serviceData) ? serviceData : [])
      setAchievements(Array.isArray(achievementData) ? achievementData : [])
      setLoading(false)
    }

    load()
  }, [id])

  useEffect(() => {
    if (!user || !localStorage.getItem('token')) return

    let active = true
    const token = localStorage.getItem('token')
    const stream = new EventSource(`${BASE}/messages/stream?token=${encodeURIComponent(token)}`)

    api.get(`/messages/ngo/${id}`)
      .then((data) => {
        if (!active) return
        setMessages(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (!active) return
        setMessages([])
      })

    stream.addEventListener('message', (event) => {
      if (!active) return
      try {
        const incoming = JSON.parse(event.data)
        if (Number(incoming.ngoId) !== Number(id)) return
        setMessages((prev) => {
          if (prev.some((m) => m.id === incoming.id)) return prev
          return [...prev, incoming]
        })
      } catch {
        // Ignore malformed stream events
      }
    })

    return () => {
      active = false
      stream.close()
    }
  }, [id, user])

  const activeNeeds = useMemo(() => needs.filter((n) => n.status !== 'CLOSED'), [needs])
  const openJobs = useMemo(() => jobs.filter((j) => j.status !== 'CLOSED'), [jobs])

  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-10 text-gray-500">Loading NGO profile...</div>
  }

  if (!ngo) {
    return (
      <div className="min-h-screen bg-gray-50 p-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-black text-gray-900">NGO not found</h1>
          <button onClick={() => navigate('/')} className="mt-4 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: NGO_GREEN }}>Go Home</button>
        </div>
      </div>
    )
  }

  const tabs = [
    { key: 'requirements', label: `Requirements (${activeNeeds.length})` },
    { key: 'jobs', label: `Hiring (${openJobs.length})` },
    { key: 'products', label: `Products (${products.length})` },
    { key: 'services', label: `Services (${services.length})` },
    { key: 'achievements', label: `Achievements (${achievements.length})` },
  ]

  const sendMessage = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (!user || !token) {
      navigate('/login')
      return
    }

    const text = messageText.trim()
    if (!text) return

    setSending(true)
    setChatError('')
    try {
      await api.post(`/messages/ngo/${id}`, { content: text })
      setMessageText('')
    } catch (err) {
      setChatError(err.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <button onClick={() => navigate('/')} className="mb-4 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold border" style={{ color: NGO_GREEN, borderColor: '#CBEAB9' }}>Back to Home</button>

        <div className="rounded-2xl border bg-white p-7" style={{ borderColor: '#CBEAB9' }}>
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-900">{ngo.name}</h1>
              <p className="mt-1 text-sm text-gray-500">{[ngo.city, ngo.state, ngo.country].filter(Boolean).join(', ')}</p>
              <p className="mt-4 text-sm leading-relaxed text-gray-700">{ngo.description || ngo.mission || 'No NGO description available yet.'}</p>
            </div>
            <div className="rounded-xl px-4 py-2 text-xs font-bold" style={{ backgroundColor: '#EAF6EF', color: NGO_GREEN }}>{ngo.verified ? 'Verified NGO' : 'Pending Verification'}</div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {tabs.map((item) => (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={`rounded-lg px-3 py-2 text-xs font-bold ${tab === item.key ? 'text-white' : ''}`}
                style={tab === item.key ? { backgroundColor: NGO_GREEN } : { backgroundColor: '#EAF6EF', color: NGO_GREEN }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
          {tab === 'requirements' && (
            <div className="space-y-3">
              {activeNeeds.length === 0 && <p className="text-sm text-gray-500">No active requirements posted.</p>}
              {activeNeeds.map((n) => (
                <div key={n.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-bold text-gray-900">{n.title}</h3>
                    <span className="text-xs font-bold text-gray-500">{n.category}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{n.description}</p>
                  <p className="mt-2 text-xs font-semibold" style={{ color: NGO_GREEN }}>Target: Rs {Number(n.targetAmount || 0).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          )}

          {tab === 'jobs' && (
            <div className="space-y-3">
              {openJobs.length === 0 && <p className="text-sm text-gray-500">No hiring requirements posted.</p>}
              {openJobs.map((j) => (
                <div key={j.id} className="rounded-lg border border-gray-200 p-4">
                  <h3 className="text-base font-bold text-gray-900">{j.title}</h3>
                  <p className="mt-1 text-xs font-semibold text-gray-500">{j.employmentType || 'Role'} | {j.location || 'Location flexible'}</p>
                  <p className="mt-2 text-sm text-gray-600">{j.description}</p>
                  {j.salaryRange && <p className="mt-2 text-xs font-semibold" style={{ color: NGO_GREEN }}>Salary: {j.salaryRange}</p>}
                  {j.applicationUrl && (
                    <a href={j.applicationUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs font-bold text-blue-600">Apply Now</a>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === 'products' && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {products.length === 0 && <p className="text-sm text-gray-500">No products posted.</p>}
              {products.map((p) => (
                <div key={p.id} className="rounded-lg border border-gray-200 p-4">
                  <h3 className="text-base font-bold text-gray-900">{p.name}</h3>
                  <p className="text-xs text-gray-500">{p.category || 'General'} | Stock {p.stockQuantity}</p>
                  <p className="mt-1 text-sm text-gray-600">{p.description}</p>
                  <p className="mt-2 text-sm font-bold" style={{ color: NGO_GREEN }}>Rs {Number(p.price || 0).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          )}

          {tab === 'services' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">Services are visible only on the NGO profile page.</p>
              {services.length === 0 && <p className="text-sm text-gray-500">No services listed.</p>}
              {services.map((s) => (
                <div key={s.id} className="rounded-lg border border-gray-200 p-4">
                  <h3 className="text-base font-bold text-gray-900">{s.title}</h3>
                  <p className="text-xs text-gray-500">{s.category || 'Service'} | {s.availability || 'Availability not specified'}</p>
                  <p className="mt-1 text-sm text-gray-600">{s.description}</p>
                  {s.contactInfo && <p className="mt-2 text-xs font-semibold" style={{ color: NGO_GREEN }}>Contact: {s.contactInfo}</p>}
                </div>
              ))}
            </div>
          )}

          {tab === 'achievements' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">Achievements are visible only on the NGO profile page.</p>
              {achievements.length === 0 && <p className="text-sm text-gray-500">No achievements posted.</p>}
              {achievements.map((a) => (
                <div key={a.id} className="rounded-lg border border-gray-200 p-4">
                  <h3 className="text-base font-bold text-gray-900">{a.title}</h3>
                  <p className="text-xs text-gray-500">{a.category || 'General'} {a.achievementDate ? `| ${a.achievementDate}` : ''}</p>
                  <p className="mt-1 text-sm text-gray-600">{a.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-black text-gray-900">Message NGO</h2>
          {!user && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
              Login is required to send messages.
              <button onClick={() => navigate('/login')} className="ml-2 font-semibold underline">Sign In</button>
            </div>
          )}

          {user && (
            <>
              <div className="mt-4 max-h-72 space-y-2 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-3">
                {messages.length === 0 && <p className="text-xs text-gray-500">No messages yet. Start the conversation.</p>}
                {messages.map((m) => {
                  const mine = user.email === m.senderEmail
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${mine ? 'text-white' : 'bg-white text-gray-700 border border-gray-200'}`} style={mine ? { backgroundColor: NGO_GREEN } : {}}>
                        <p className="text-[11px] font-bold opacity-80">{mine ? 'You' : m.senderName}</p>
                        <p>{m.content}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {chatError && <p className="mt-2 text-xs text-red-600">{chatError}</p>}

              <form onSubmit={sendMessage} className="mt-3 flex items-center gap-2">
                <input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Write your message to NGO..."
                />
                <button type="submit" disabled={sending} className="rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: NGO_GREEN }}>
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
