import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const BASE = 'http://localhost:8081/api'

async function fetchOrgByEmail(type, email) {
  try {
    const encoded = encodeURIComponent(email)
    const res = await fetch(`${BASE}/${type}/email/${encoded}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

const roleTypeMap = {
  SCHOOL_ADMIN: 'schools',
  NGO_ADMIN: 'ngos',
  STARTUP_ADMIN: 'startups',
}

const roleLabel = {
  SCHOOL_ADMIN: 'School',
  NGO_ADMIN: 'NGO',
  STARTUP_ADMIN: 'Startup',
}

export default function AdminApproval() {
  const [pendingUsers, setPendingUsers] = useState([])
  const [orgDetails, setOrgDetails] = useState({}) // email -> org record
  const [expanded, setExpanded] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState({})
  const [error, setError] = useState('')
  const { user, logout } = useAuth()

  useEffect(() => { fetchPendingUsers() }, [])

  const fetchPendingUsers = async () => {
    setLoading(true)
    try {
      const data = await api.get('/admin/pending')
      setPendingUsers(data || [])
      // Fetch org details for each org account
      const orgPromises = (data || [])
        .filter(u => roleTypeMap[u.role])
        .map(async (u) => {
          const org = await fetchOrgByEmail(roleTypeMap[u.role], u.email)
          return [u.email, org]
        })
      const results = await Promise.all(orgPromises)
      const map = {}
      results.forEach(([email, org]) => { if (org) map[email] = org })
      setOrgDetails(map)
    } catch (err) {
      setError('Failed to load pending approvals')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (userId, action) => {
    setActionLoading(prev => ({ ...prev, [userId]: action }))
    try {
      await api.post(`/admin/${action}/${userId}`)
      fetchPendingUsers()
    } catch (err) {
      setError(`Failed to ${action} account`)
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: null }))
    }
  }

  if (user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-12 bg-white rounded-xl border border-red-100 shadow-sm max-w-sm">
          <div className="text-4xl font-black text-red-500 mb-2">403</div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Access Denied</h2>
          <p className="text-gray-500 text-sm">Only Super Admins can view this page.</p>
          <a href="/dashboard" className="text-xs font-semibold mt-4 inline-block" style={{ color: '#1A8FD1' }}>← Back to Dashboard</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-gray-700 text-sm transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Dashboard
            </a>
            <span className="text-gray-200">|</span>
            <h1 className="text-sm font-bold text-gray-900">Pending Approvals</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={fetchPendingUsers} className="text-xs font-semibold hover:opacity-70 transition-opacity" style={{ color: '#1A8FD1' }}>
              Refresh
            </button>
            <button onClick={() => { logout(); window.location.href = '/' }} className="text-xs font-semibold text-red-500 border border-red-100 px-3 py-1.5 rounded transition-colors hover:bg-red-50">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#1A8FD1' }}>Super Admin</p>
          <h2 className="text-3xl font-black text-gray-900">Organization Approvals</h2>
          <p className="text-gray-400 text-sm mt-1">Review each application before approving access to the platform.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-lg mb-6">{error}</div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse"></div>)}
          </div>
        ) : pendingUsers.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center">
            <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#EEF8E0' }}>
              <svg className="w-6 h-6" style={{ color: '#5BBE00' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">All Clear!</h3>
            <p className="text-gray-400 text-sm">No pending approvals at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map((item) => {
              const org = orgDetails[item.email]
              const type = roleTypeMap[item.role]
              const isExpanded = expanded === item.id
              const acting = actionLoading[item.id]

              return (
                <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Summary Row */}
                  <div className="px-6 py-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Role badge */}
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                        style={{ backgroundColor: type ? '#E8F4FC' : '#f3f4f6', color: type ? '#1A8FD1' : '#6b7280' }}>
                        {(roleLabel[item.role] || 'U')[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-900 text-sm">{item.name}</span>
                          {item.role && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: type ? '#E8F4FC' : '#f3f4f6', color: type ? '#1A8FD1' : '#6b7280' }}>
                              {roleLabel[item.role] || item.role}
                            </span>
                          )}
                          {org && (
                            <span className="text-xs text-gray-400">• {org.name}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{item.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {org && (
                        <button
                          onClick={() => setExpanded(isExpanded ? null : item.id)}
                          className="text-xs font-semibold border rounded-lg px-3 py-1.5 transition-colors hover:bg-gray-50"
                          style={{ color: '#1A8FD1', borderColor: '#c3dff5' }}
                        >
                          {isExpanded ? 'Hide' : 'View Details'}
                        </button>
                      )}
                      <button
                        onClick={() => handleAction(item.id, 'reject')}
                        disabled={!!acting}
                        className="text-xs font-semibold border rounded-lg px-3 py-1.5 transition-colors hover:bg-red-50 disabled:opacity-50"
                        style={{ color: '#ef4444', borderColor: '#fecaca' }}
                      >
                        {acting === 'reject' ? '...' : 'Reject'}
                      </button>
                      <button
                        onClick={() => handleAction(item.id, 'approve')}
                        disabled={!!acting}
                        className="text-xs font-semibold text-white rounded-lg px-4 py-1.5 hover:opacity-90 transition-opacity disabled:opacity-50"
                        style={{ backgroundColor: '#5BBE00' }}
                      >
                        {acting === 'approve' ? 'Approving...' : 'Approve'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Org Details */}
                  {isExpanded && org && (
                    <div className="border-t border-gray-50 bg-gray-50/50 px-6 py-5">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                        {roleLabel[item.role]} Information
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3">
                        {[
                          { label: 'Organization Name', value: org.name },
                          { label: 'Email', value: org.email },
                          { label: 'Phone', value: org.phone },
                          { label: 'Address', value: org.address },
                          { label: 'City', value: org.city },
                          { label: 'State', value: org.state },
                          { label: 'Country', value: org.country },
                          { label: 'Website', value: org.websiteUrl, link: true },
                          { label: 'Reg. Number', value: org.registrationNumber },
                          { label: 'Industry', value: org.industry },
                          { label: 'Mission', value: org.mission, wide: true },
                          { label: 'Description', value: org.description, wide: true },
                        ].filter(f => f.value).map((field) => (
                          <div key={field.label} className={field.wide ? 'col-span-2 md:col-span-3' : ''}>
                            <dt className="text-xs font-semibold text-gray-400">{field.label}</dt>
                            <dd className="text-sm text-gray-700 mt-0.5">
                              {field.link
                                ? <a href={field.value} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: '#1A8FD1' }}>{field.value}</a>
                                : field.value}
                            </dd>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {isExpanded && !org && (
                    <div className="border-t border-gray-50 bg-gray-50/50 px-6 py-4">
                      <p className="text-xs text-gray-400">No organization record was submitted with this application.</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
