import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

const BASE = 'http://localhost:8081/api'
const NGO_GREEN = '#5BCB2B'

const TABS = ['overview', 'requirements', 'jobs', 'products', 'services', 'achievements', 'messages']

const blankNeed = { title: '', description: '', category: 'SUPPORT', targetAmount: '', urgent: false }
const blankJob = { title: '', description: '', employmentType: 'FULL_TIME', location: '', salaryRange: '', applicationUrl: '', lastDateToApply: '' }
const blankProduct = { name: '', description: '', category: '', price: '', stockQuantity: '', available: true }
const blankService = { title: '', description: '', category: '', contactInfo: '', availability: '', status: 'ACTIVE' }
const blankAchievement = { title: '', description: '', category: '', achievementDate: '', imageUrl: '' }

const formatMessageTime = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const getThreadKey = (message, currentEmail) => {
  if (!message || !currentEmail) return null
  if (message.senderEmail === currentEmail) return message.recipientEmail || null
  return message.senderEmail || null
}

const getThreadName = (message, currentEmail) => {
  if (!message || !currentEmail) return 'Unknown user'
  if (message.senderEmail === currentEmail) {
    return message.recipientEmail || 'Unknown user'
  }
  return message.senderName || message.senderEmail || 'Unknown user'
}

export default function NgoProfile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [ngo, setNgo] = useState(null)
  const [form, setForm] = useState({})
  const [error, setError] = useState('')

  const [needs, setNeeds] = useState([])
  const [jobs, setJobs] = useState([])
  const [products, setProducts] = useState([])
  const [services, setServices] = useState([])
  const [achievements, setAchievements] = useState([])
  const [messages, setMessages] = useState([])
  const [selectedThreadEmail, setSelectedThreadEmail] = useState('')
  const [messageText, setMessageText] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)

  const [needForm, setNeedForm] = useState(blankNeed)
  const [jobForm, setJobForm] = useState(blankJob)
  const [productForm, setProductForm] = useState(blankProduct)
  const [serviceForm, setServiceForm] = useState(blankService)
  const [achievementForm, setAchievementForm] = useState(blankAchievement)

  useEffect(() => {
    if (user && user.role !== 'NGO_ADMIN') {
      navigate('/dashboard')
      return
    }
    if (user?.email) {
      loadNgo()
    }
  }, [user])

  useEffect(() => {
    if (!ngo?.id || !user) return

    let active = true
    const token = localStorage.getItem('token')
    if (!token) return

    const stream = new EventSource(`${BASE}/messages/stream?token=${encodeURIComponent(token)}`)

    api.get(`/messages/ngo/${ngo.id}`)
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
        if (Number(incoming.ngoId) !== Number(ngo.id)) return
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
  }, [ngo?.id, user])

  const conversationThreads = useMemo(() => {
    if (!user?.email) return []

    const grouped = new Map()

    for (const message of messages) {
      const threadEmail = getThreadKey(message, user.email)
      if (!threadEmail || threadEmail === user.email) continue

      const existing = grouped.get(threadEmail)
      if (!existing) {
        grouped.set(threadEmail, {
          email: threadEmail,
          name: getThreadName(message, user.email),
          lastMessage: message,
        })
        continue
      }

      const existingTime = new Date(existing.lastMessage?.createdAt || 0).getTime()
      const currentTime = new Date(message?.createdAt || 0).getTime()
      if (currentTime >= existingTime) {
        existing.lastMessage = message
      }

      if (!existing.name || existing.name === existing.email) {
        existing.name = getThreadName(message, user.email)
      }
    }

    return Array.from(grouped.values()).sort((a, b) => {
      const timeA = new Date(a.lastMessage?.createdAt || 0).getTime()
      const timeB = new Date(b.lastMessage?.createdAt || 0).getTime()
      return timeB - timeA
    })
  }, [messages, user?.email])

  const activeThreadMessages = useMemo(() => {
    if (!selectedThreadEmail || !user?.email) return []

    return messages
      .filter((message) => getThreadKey(message, user.email) === selectedThreadEmail)
      .sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime())
  }, [messages, selectedThreadEmail, user?.email])

  useEffect(() => {
    if (conversationThreads.length === 0) {
      setSelectedThreadEmail('')
      return
    }

    const exists = conversationThreads.some((thread) => thread.email === selectedThreadEmail)
    if (!exists) {
      setSelectedThreadEmail(conversationThreads[0].email)
    }
  }, [conversationThreads, selectedThreadEmail])

  const loadNgo = async () => {
    setLoading(true)
    setError('')
    try {
      const encoded = encodeURIComponent(user.email)
      const ngoData = await api.get(`/ngos/email/${encoded}`)
      setNgo(ngoData)
      setForm(ngoData)
      await loadNgoData(ngoData.id)
    } catch {
      setNgo(null)
      setForm({ email: user.email, verified: false, country: 'India' })
    } finally {
      setLoading(false)
    }
  }

  const loadNgoData = async (ngoId) => {
    const [needData, jobData, productData, serviceData, achievementData] = await Promise.all([
      api.get(`/ngos/${ngoId}/needs`).catch(() => []),
      api.get(`/ngos/${ngoId}/jobs`).catch(() => []),
      api.get(`/ngos/${ngoId}/products`).catch(() => []),
      api.get(`/ngos/${ngoId}/services`).catch(() => []),
      api.get(`/ngos/${ngoId}/achievements`).catch(() => []),
    ])
    setNeeds(Array.isArray(needData) ? needData : [])
    setJobs(Array.isArray(jobData) ? jobData : [])
    setProducts(Array.isArray(productData) ? productData : [])
    setServices(Array.isArray(serviceData) ? serviceData : [])
    setAchievements(Array.isArray(achievementData) ? achievementData : [])
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleProfileInput = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [e.target.name]: value }))
  }

  const saveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    setError('')
    try {
      if (ngo?.id) {
        const updated = await api.put(`/ngos/${ngo.id}`, { ...form, verified: ngo.verified })
        setNgo(updated)
        setForm(updated)
      } else {
        const created = await api.post('/ngos', { ...form, email: user.email, verified: false })
        setNgo(created)
        setForm(created)
        await loadNgoData(created.id)
      }
    } catch (err) {
      setError(err.message || 'Failed to save profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const createNeed = async (e) => {
    e.preventDefault()
    if (!ngo?.id) return
    try {
      await fetch(`${BASE}/ngos/${ngo.id}/needs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          ...needForm,
          targetAmount: needForm.targetAmount ? parseFloat(needForm.targetAmount) : 0,
        }),
      })
      setNeedForm(blankNeed)
      loadNgoData(ngo.id)
    } catch {
      setError('Failed to post requirement')
    }
  }

  const createJob = async (e) => {
    e.preventDefault()
    if (!ngo?.id) return
    try {
      await api.post(`/ngos/${ngo.id}/jobs`, jobForm)
      setJobForm(blankJob)
      loadNgoData(ngo.id)
    } catch (err) {
      setError(err.message || 'Failed to post job')
    }
  }

  const createProduct = async (e) => {
    e.preventDefault()
    if (!ngo?.id) return
    try {
      await api.post(`/ngos/${ngo.id}/products`, {
        ...productForm,
        price: productForm.price ? parseFloat(productForm.price) : 0,
        stockQuantity: productForm.stockQuantity ? parseInt(productForm.stockQuantity, 10) : 0,
      })
      setProductForm(blankProduct)
      loadNgoData(ngo.id)
    } catch (err) {
      setError(err.message || 'Failed to post product')
    }
  }

  const createService = async (e) => {
    e.preventDefault()
    if (!ngo?.id) return
    try {
      await api.post(`/ngos/${ngo.id}/services`, serviceForm)
      setServiceForm(blankService)
      loadNgoData(ngo.id)
    } catch (err) {
      setError(err.message || 'Failed to post service')
    }
  }

  const createAchievement = async (e) => {
    e.preventDefault()
    if (!ngo?.id) return
    try {
      await api.post(`/ngos/${ngo.id}/achievements`, achievementForm)
      setAchievementForm(blankAchievement)
      loadNgoData(ngo.id)
    } catch (err) {
      setError(err.message || 'Failed to post achievement')
    }
  }

  const closeNeed = async (needId) => {
    if (!ngo?.id) return
    await fetch(`${BASE}/ngos/needs/${needId}/close`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    })
    loadNgoData(ngo.id)
  }

  const deleteItem = async (endpoint) => {
    if (!ngo?.id) return
    await api.delete(endpoint)
    loadNgoData(ngo.id)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!ngo?.id) return
    if (!localStorage.getItem('token')) {
      setError('Session expired. Please login again.')
      navigate('/login')
      return
    }

    const content = messageText.trim()
    if (!content) return
    if (!selectedThreadEmail) {
      setError('Choose a user conversation first.')
      return
    }

    setSendingMessage(true)
    try {
      await api.post(`/messages/ngo/${ngo.id}`, { content, recipientEmail: selectedThreadEmail })
      setMessageText('')
    } catch (err) {
      setError(err.message || 'Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-10 text-gray-500">Loading NGO dashboard...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <nav className="sticky top-0 z-20 border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="rounded-lg px-3 py-1.5 text-xs font-bold" style={{ backgroundColor: '#EAF6EF', color: NGO_GREEN }}>Back</button>
            <h1 className="text-lg font-black text-gray-900">NGO Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(ngo?.id ? `/ngos/${ngo.id}` : '/')} className="text-xs font-semibold text-blue-600">View Public Profile</button>
            <button onClick={handleLogout} className="text-xs font-semibold text-red-600">Logout</button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-6">
        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="mb-5 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-3 py-2 text-xs font-bold uppercase ${tab === t ? 'text-white' : 'bg-white border'}`}
              style={tab === t ? { backgroundColor: NGO_GREEN } : { color: NGO_GREEN, borderColor: '#CBEAB9' }}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <form onSubmit={saveProfile} className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-xl font-black text-gray-900">NGO Profile</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input name="name" value={form.name || ''} onChange={handleProfileInput} placeholder="NGO Name" className="rounded-lg border border-gray-300 p-3 text-sm" required />
              <input name="email" value={form.email || ''} onChange={handleProfileInput} placeholder="Email" className="rounded-lg border border-gray-300 p-3 text-sm" required />
              <input name="phone" value={form.phone || ''} onChange={handleProfileInput} placeholder="Phone" className="rounded-lg border border-gray-300 p-3 text-sm" />
              <input name="registrationNumber" value={form.registrationNumber || ''} onChange={handleProfileInput} placeholder="Registration Number" className="rounded-lg border border-gray-300 p-3 text-sm" />
              <input name="city" value={form.city || ''} onChange={handleProfileInput} placeholder="City" className="rounded-lg border border-gray-300 p-3 text-sm" />
              <input name="state" value={form.state || ''} onChange={handleProfileInput} placeholder="State" className="rounded-lg border border-gray-300 p-3 text-sm" />
              <input name="country" value={form.country || ''} onChange={handleProfileInput} placeholder="Country" className="rounded-lg border border-gray-300 p-3 text-sm" />
              <input name="websiteUrl" value={form.websiteUrl || ''} onChange={handleProfileInput} placeholder="Website URL" className="rounded-lg border border-gray-300 p-3 text-sm" />
              <input name="logoUrl" value={form.logoUrl || ''} onChange={handleProfileInput} placeholder="Logo URL" className="rounded-lg border border-gray-300 p-3 text-sm md:col-span-2" />
              <textarea name="address" value={form.address || ''} onChange={handleProfileInput} placeholder="Address" className="rounded-lg border border-gray-300 p-3 text-sm md:col-span-2" rows={2} required />
              <textarea name="mission" value={form.mission || ''} onChange={handleProfileInput} placeholder="Mission" className="rounded-lg border border-gray-300 p-3 text-sm md:col-span-2" rows={2} />
              <textarea name="description" value={form.description || ''} onChange={handleProfileInput} placeholder="Description" className="rounded-lg border border-gray-300 p-3 text-sm md:col-span-2" rows={3} />
            </div>
            <button type="submit" className="mt-5 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: NGO_GREEN }}>{savingProfile ? 'Saving...' : 'Save NGO Profile'}</button>
          </form>
        )}

        {tab === 'requirements' && (
          <div className="space-y-5">
            <form onSubmit={createNeed} className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-3 text-lg font-black">Post Requirement</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input value={needForm.title} onChange={(e) => setNeedForm((p) => ({ ...p, title: e.target.value }))} placeholder="Requirement title" className="rounded-lg border border-gray-300 p-3 text-sm" required />
                <input value={needForm.targetAmount} onChange={(e) => setNeedForm((p) => ({ ...p, targetAmount: e.target.value }))} placeholder="Target amount" type="number" className="rounded-lg border border-gray-300 p-3 text-sm" />
                <input value={needForm.category} onChange={(e) => setNeedForm((p) => ({ ...p, category: e.target.value }))} placeholder="Category" className="rounded-lg border border-gray-300 p-3 text-sm" />
                <label className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 text-sm">
                  <input type="checkbox" checked={needForm.urgent} onChange={(e) => setNeedForm((p) => ({ ...p, urgent: e.target.checked }))} /> Urgent
                </label>
                <textarea value={needForm.description} onChange={(e) => setNeedForm((p) => ({ ...p, description: e.target.value }))} placeholder="Description" className="rounded-lg border border-gray-300 p-3 text-sm md:col-span-2" rows={3} required />
              </div>
              <button className="mt-4 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: NGO_GREEN }}>Post Requirement</button>
            </form>

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="mb-3 font-bold">Requirements ({needs.length})</h3>
              <div className="space-y-2">
                {needs.map((n) => (
                  <div key={n.id} className="rounded-lg border border-gray-200 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{n.title}</p>
                      <span className="text-xs font-bold text-gray-500">{n.status}</span>
                    </div>
                    <p className="mt-1 text-gray-600">{n.description}</p>
                    <div className="mt-2 flex gap-3 text-xs font-semibold">
                      {n.status === 'ACTIVE' && <button onClick={() => closeNeed(n.id)} className="text-amber-700">Close</button>}
                      <button onClick={() => deleteItem(`/ngos/needs/${n.id}`)} className="text-red-600">Delete</button>
                    </div>
                  </div>
                ))}
                {needs.length === 0 && <p className="text-sm text-gray-500">No requirements posted yet.</p>}
              </div>
            </div>
          </div>
        )}

        {tab === 'jobs' && (
          <div className="space-y-5">
            <form onSubmit={createJob} className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-3 text-lg font-black">Post Hiring Requirement (Job)</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input value={jobForm.title} onChange={(e) => setJobForm((p) => ({ ...p, title: e.target.value }))} placeholder="Job title" className="rounded-lg border border-gray-300 p-3 text-sm" required />
                <input value={jobForm.employmentType} onChange={(e) => setJobForm((p) => ({ ...p, employmentType: e.target.value }))} placeholder="Employment type" className="rounded-lg border border-gray-300 p-3 text-sm" />
                <input value={jobForm.location} onChange={(e) => setJobForm((p) => ({ ...p, location: e.target.value }))} placeholder="Location" className="rounded-lg border border-gray-300 p-3 text-sm" />
                <input value={jobForm.salaryRange} onChange={(e) => setJobForm((p) => ({ ...p, salaryRange: e.target.value }))} placeholder="Salary range" className="rounded-lg border border-gray-300 p-3 text-sm" />
                <input value={jobForm.applicationUrl} onChange={(e) => setJobForm((p) => ({ ...p, applicationUrl: e.target.value }))} placeholder="Application URL" className="rounded-lg border border-gray-300 p-3 text-sm" />
                <input value={jobForm.lastDateToApply} onChange={(e) => setJobForm((p) => ({ ...p, lastDateToApply: e.target.value }))} type="date" className="rounded-lg border border-gray-300 p-3 text-sm" />
                <textarea value={jobForm.description} onChange={(e) => setJobForm((p) => ({ ...p, description: e.target.value }))} placeholder="Job description" className="rounded-lg border border-gray-300 p-3 text-sm md:col-span-2" rows={3} required />
              </div>
              <button className="mt-4 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: NGO_GREEN }}>Post Job</button>
            </form>

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="mb-3 font-bold">Hiring Requirements ({jobs.length})</h3>
              <div className="space-y-2">
                {jobs.map((j) => (
                  <div key={j.id} className="rounded-lg border border-gray-200 p-3 text-sm">
                    <p className="font-semibold">{j.title}</p>
                    <p className="text-gray-500">{j.employmentType} | {j.location}</p>
                    <p className="mt-1 text-gray-600">{j.description}</p>
                    <button onClick={() => deleteItem(`/ngos/jobs/${j.id}`)} className="mt-2 text-xs font-semibold text-red-600">Delete</button>
                  </div>
                ))}
                {jobs.length === 0 && <p className="text-sm text-gray-500">No hiring requirements posted yet.</p>}
              </div>
            </div>
          </div>
        )}

        {tab === 'products' && (
          <div className="space-y-5">
            <form onSubmit={createProduct} className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-3 text-lg font-black">Post Product</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input value={productForm.name} onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))} placeholder="Product name" className="rounded-lg border border-gray-300 p-3 text-sm" required />
                <input value={productForm.category} onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))} placeholder="Category" className="rounded-lg border border-gray-300 p-3 text-sm" />
                <input value={productForm.price} onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))} type="number" placeholder="Price" className="rounded-lg border border-gray-300 p-3 text-sm" required />
                <input value={productForm.stockQuantity} onChange={(e) => setProductForm((p) => ({ ...p, stockQuantity: e.target.value }))} type="number" placeholder="Stock quantity" className="rounded-lg border border-gray-300 p-3 text-sm" />
                <label className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 text-sm md:col-span-2">
                  <input type="checkbox" checked={productForm.available} onChange={(e) => setProductForm((p) => ({ ...p, available: e.target.checked }))} /> Available
                </label>
                <textarea value={productForm.description} onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))} placeholder="Product description" className="rounded-lg border border-gray-300 p-3 text-sm md:col-span-2" rows={3} />
              </div>
              <button className="mt-4 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: NGO_GREEN }}>Post Product</button>
            </form>

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="mb-3 font-bold">Products ({products.length})</h3>
              <div className="space-y-2">
                {products.map((p) => (
                  <div key={p.id} className="rounded-lg border border-gray-200 p-3 text-sm">
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-gray-500">Price: Rs {Number(p.price || 0).toLocaleString('en-IN')} | Stock: {p.stockQuantity}</p>
                    <p className="mt-1 text-gray-600">{p.description}</p>
                    <button onClick={() => deleteItem(`/ngos/products/${p.id}`)} className="mt-2 text-xs font-semibold text-red-600">Delete</button>
                  </div>
                ))}
                {products.length === 0 && <p className="text-sm text-gray-500">No products posted yet.</p>}
              </div>
            </div>
          </div>
        )}

        {tab === 'services' && (
          <div className="space-y-5">
            <form onSubmit={createService} className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-1 text-lg font-black">Post Service</h2>
              <p className="mb-3 text-xs text-gray-500">Visible on NGO profile page only.</p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input value={serviceForm.title} onChange={(e) => setServiceForm((p) => ({ ...p, title: e.target.value }))} placeholder="Service title" className="rounded-lg border border-gray-300 p-3 text-sm" required />
                <input value={serviceForm.category} onChange={(e) => setServiceForm((p) => ({ ...p, category: e.target.value }))} placeholder="Category" className="rounded-lg border border-gray-300 p-3 text-sm" />
                <input value={serviceForm.contactInfo} onChange={(e) => setServiceForm((p) => ({ ...p, contactInfo: e.target.value }))} placeholder="Contact info" className="rounded-lg border border-gray-300 p-3 text-sm" />
                <input value={serviceForm.availability} onChange={(e) => setServiceForm((p) => ({ ...p, availability: e.target.value }))} placeholder="Availability" className="rounded-lg border border-gray-300 p-3 text-sm" />
                <textarea value={serviceForm.description} onChange={(e) => setServiceForm((p) => ({ ...p, description: e.target.value }))} placeholder="Service description" className="rounded-lg border border-gray-300 p-3 text-sm md:col-span-2" rows={3} required />
              </div>
              <button className="mt-4 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: NGO_GREEN }}>Post Service</button>
            </form>

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="mb-3 font-bold">Services ({services.length})</h3>
              <div className="space-y-2">
                {services.map((s) => (
                  <div key={s.id} className="rounded-lg border border-gray-200 p-3 text-sm">
                    <p className="font-semibold">{s.title}</p>
                    <p className="text-gray-500">{s.category} | {s.availability}</p>
                    <p className="mt-1 text-gray-600">{s.description}</p>
                    <button onClick={() => deleteItem(`/ngos/services/${s.id}`)} className="mt-2 text-xs font-semibold text-red-600">Delete</button>
                  </div>
                ))}
                {services.length === 0 && <p className="text-sm text-gray-500">No services posted yet.</p>}
              </div>
            </div>
          </div>
        )}

        {tab === 'achievements' && (
          <div className="space-y-5">
            <form onSubmit={createAchievement} className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-1 text-lg font-black">Post Achievement</h2>
              <p className="mb-3 text-xs text-gray-500">Visible on NGO profile page only.</p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input value={achievementForm.title} onChange={(e) => setAchievementForm((p) => ({ ...p, title: e.target.value }))} placeholder="Achievement title" className="rounded-lg border border-gray-300 p-3 text-sm" required />
                <input value={achievementForm.category} onChange={(e) => setAchievementForm((p) => ({ ...p, category: e.target.value }))} placeholder="Category" className="rounded-lg border border-gray-300 p-3 text-sm" />
                <input value={achievementForm.achievementDate} onChange={(e) => setAchievementForm((p) => ({ ...p, achievementDate: e.target.value }))} type="date" className="rounded-lg border border-gray-300 p-3 text-sm" />
                <input value={achievementForm.imageUrl} onChange={(e) => setAchievementForm((p) => ({ ...p, imageUrl: e.target.value }))} placeholder="Image URL" className="rounded-lg border border-gray-300 p-3 text-sm" />
                <textarea value={achievementForm.description} onChange={(e) => setAchievementForm((p) => ({ ...p, description: e.target.value }))} placeholder="Achievement description" className="rounded-lg border border-gray-300 p-3 text-sm md:col-span-2" rows={3} required />
              </div>
              <button className="mt-4 rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: NGO_GREEN }}>Post Achievement</button>
            </form>

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="mb-3 font-bold">Achievements ({achievements.length})</h3>
              <div className="space-y-2">
                {achievements.map((a) => (
                  <div key={a.id} className="rounded-lg border border-gray-200 p-3 text-sm">
                    <p className="font-semibold">{a.title}</p>
                    <p className="text-gray-500">{a.category || 'General'} {a.achievementDate ? `| ${a.achievementDate}` : ''}</p>
                    <p className="mt-1 text-gray-600">{a.description}</p>
                    <button onClick={() => deleteItem(`/ngos/achievements/${a.id}`)} className="mt-2 text-xs font-semibold text-red-600">Delete</button>
                  </div>
                ))}
                {achievements.length === 0 && <p className="text-sm text-gray-500">No achievements posted yet.</p>}
              </div>
            </div>
          </div>
        )}

        {tab === 'messages' && (
          <div className="rounded-2xl border border-gray-200 bg-white p-0 overflow-hidden">
            <div className="border-b bg-gradient-to-r from-[#0f172a] to-[#1e293b] px-5 py-4 text-white">
              <h2 className="text-lg font-black">Inbox</h2>
              <p className="text-xs text-slate-200">Professional real-time chat. Click a user to open the thread.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[300px_1fr]">
              <aside className="border-r border-gray-200 bg-[#f8fafc]">
                <div className="border-b border-gray-200 px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-500">Conversations</div>
                <div className="max-h-[32rem] overflow-y-auto">
                  {conversationThreads.length === 0 && (
                    <p className="p-4 text-sm text-gray-500">No user conversations yet.</p>
                  )}

                  {conversationThreads.map((thread) => {
                    const active = thread.email === selectedThreadEmail
                    return (
                      <button
                        key={thread.email}
                        type="button"
                        onClick={() => setSelectedThreadEmail(thread.email)}
                        className={`w-full border-b border-gray-100 px-4 py-3 text-left transition ${active ? 'bg-white' : 'hover:bg-white/70'}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-bold text-gray-900">{thread.name}</p>
                          <span className="text-[11px] text-gray-500">{formatMessageTime(thread.lastMessage?.createdAt)}</span>
                        </div>
                        <p className="mt-1 truncate text-xs text-gray-500">{thread.lastMessage?.content || 'No messages'}</p>
                      </button>
                    )
                  })}
                </div>
              </aside>

              <section className="flex min-h-[32rem] flex-col bg-white">
                {selectedThreadEmail ? (
                  <>
                    <div className="border-b border-gray-200 px-5 py-3">
                      <p className="text-sm font-black text-gray-900">
                        {conversationThreads.find((t) => t.email === selectedThreadEmail)?.name || selectedThreadEmail}
                      </p>
                      <p className="text-xs text-gray-500">{selectedThreadEmail}</p>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto bg-[#f1f5f9] px-5 py-4">
                      {activeThreadMessages.length === 0 && <p className="text-sm text-gray-500">No messages in this conversation yet.</p>}

                      {activeThreadMessages.map((m) => {
                        const mine = m.senderEmail === user.email
                        return (
                          <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                            <div
                              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm ${mine ? 'text-white rounded-br-md' : 'bg-white text-gray-700 border border-gray-200 rounded-bl-md'}`}
                              style={mine ? { backgroundColor: NGO_GREEN } : {}}
                            >
                              <p className={`text-[11px] font-bold ${mine ? 'text-white/90' : 'text-gray-500'}`}>
                                {mine ? 'You' : m.senderName || m.senderEmail}
                              </p>
                              <p className="mt-0.5 whitespace-pre-wrap break-words">{m.content}</p>
                              <p className={`mt-1 text-[10px] ${mine ? 'text-white/80' : 'text-gray-400'}`}>{formatMessageTime(m.createdAt)}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <form onSubmit={sendMessage} className="border-t border-gray-200 bg-white p-3">
                      <div className="flex items-center gap-2">
                        <input
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#5BCB2B]"
                          placeholder="Type your reply..."
                        />
                        <button type="submit" disabled={sendingMessage} className="rounded-xl px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: NGO_GREEN }}>
                          {sendingMessage ? 'Sending...' : 'Send'}
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="flex flex-1 items-center justify-center px-5 text-center text-sm text-gray-500">
                    Select a user from the left to start chatting.
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
