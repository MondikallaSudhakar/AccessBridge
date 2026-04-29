import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const BASE = 'http://localhost:8081/api'
const TEAL = '#0197B2'

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

const roleColors = {
  SCHOOL_ADMIN: { bg: '#f0fdf4', text: '#166534', icon: '#5BCB2B' },
  NGO_ADMIN: { bg: '#e7f7fb', text: '#064e78', icon: '#0197B2' },
  STARTUP_ADMIN: { bg: '#fffbeb', text: '#78350f', icon: '#f59e0b' },
  VOLUNTEER: { bg: '#fef3c7', text: '#78350f', icon: '#f59e0b' },
  SPECIAL_ABLED_PERSON: { bg: '#f0fdf4', text: '#166534', icon: '#10b981' },
  GUARDIAN_CAREGIVER: { bg: '#fdf2f8', text: '#831843', icon: '#ec4899' },
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-3xl font-black text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-slate-500 uppercase tracking-widest font-semibold">{label}</p>
        </div>
        {icon && <div className="text-3xl" style={{ color }}>{icon}</div>}
      </div>
    </div>
  )
}

function RoleSummaryCard({ role, count, color }) {
  const roleInfo = { SCHOOL_ADMIN: 'Schools', NGO_ADMIN: 'NGOs', STARTUP_ADMIN: 'Startups', VOLUNTEER: 'Volunteers', SPECIAL_ABLED_PERSON: 'Special Abled', GUARDIAN_CAREGIVER: 'Guardians', USER: 'Users' }
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-center hover:shadow-md transition-shadow">
      <p className="text-2xl font-black" style={{ color: color.icon }}>{count}</p>
      <p className="mt-1 text-xs font-semibold text-slate-600 uppercase tracking-wide">{roleInfo[role] || role}</p>
    </div>
  )
}

export default function AdminApproval() {
  const [tab, setTab] = useState('overview')
  const [pendingUsers, setPendingUsers] = useState([])
  const [orgDetails, setOrgDetails] = useState({})
  const [stats, setStats] = useState(null)
  const [courses, setCourses] = useState([])
  const [products, setProducts] = useState([])
  const [expanded, setExpanded] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState({})
  const [error, setError] = useState('')
  const { user, logout } = useAuth()

  useEffect(() => { 
    fetchPendingUsers()
    fetchStats()
    fetchCourses()
    fetchProducts()
  }, [])

  const fetchStats = async () => {
    setStatsLoading(true)
    try {
      const data = await api.get('/admin/stats')
      setStats(data)
    } catch (err) {
      console.error('Failed to load stats:', err)
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      const data = await api.get('/courses')
      setCourses(Array.isArray(data) ? data.slice(0, 5) : [])
    } catch (err) {
      console.error('Failed to load courses:', err)
    }
  }

  const fetchProducts = async () => {
    try {
      const data = await api.get('/products')
      setProducts(Array.isArray(data) ? data.slice(0, 5) : [])
    } catch (err) {
      console.error('Failed to load products:', err)
    }
  }

  const fetchPendingUsers = async () => {
    setLoading(true)
    try {
      const data = await api.get('/admin/pending')
      setPendingUsers(data || [])
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
      fetchStats()
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
          <a href="/dashboard" className="text-xs font-semibold mt-4 inline-block" style={{ color: TEAL }}>← Back to Dashboard</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-slate-700 text-sm transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Dashboard
            </a>
            <span className="text-slate-200">|</span>
            <h1 className="text-sm font-bold text-slate-900">Super Admin Portal</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={fetchStats} className="text-xs font-semibold hover:opacity-70 transition-opacity" style={{ color: TEAL }}>
              Refresh
            </button>
            <button onClick={() => { logout(); window.location.href = '/' }} className="text-xs font-semibold text-red-500 border border-red-100 px-3 py-1.5 rounded transition-colors hover:bg-red-50">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: TEAL }}>Super Admin</p>
          <h2 className="text-4xl font-black text-slate-900 mb-2">Platform Dashboard</h2>
          <p className="text-slate-600 text-sm">Monitor all platform activity, approvals, users, and content.</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 bg-white sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-6 flex gap-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'approvals', label: 'Pending Approvals' },
            { id: 'courses', label: 'Courses' },
            { id: 'products', label: 'Products' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                tab === t.id
                  ? `border-b-2 text-slate-900`
                  : 'border-b-2 border-transparent text-slate-500 hover:text-slate-700'
              }`}
              style={{ borderBottomColor: tab === t.id ? TEAL : 'transparent', color: tab === t.id ? 'rgb(15, 23, 42)' : undefined }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-lg mb-6">{error}</div>
        )}

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            {statsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse"></div>)}
              </div>
            ) : stats ? (
              <>
                {/* Key Metrics */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-slate-600">Key Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Users" value={stats.totalUsers || 0} icon="👥" color="#3b82f6" />
                    <StatCard label="Active Organizations" value={stats.totalActiveOrganizations || 0} icon="🏢" color="#8b5cf6" />
                    <StatCard label="Total Courses" value={stats.totalCourses || 0} icon="📚" color="#ec4899" />
                    <StatCard label="Total Products" value={stats.totalProducts || 0} icon="🛍️" color="#f59e0b" />
                  </div>
                </div>

                {/* Role Summary */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-slate-600">User Distribution by Role</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <RoleSummaryCard role="SCHOOL_ADMIN" count={stats.totalSchools || 0} color={roleColors.SCHOOL_ADMIN} />
                    <RoleSummaryCard role="NGO_ADMIN" count={stats.totalNGOs || 0} color={roleColors.NGO_ADMIN} />
                    <RoleSummaryCard role="STARTUP_ADMIN" count={stats.totalStartups || 0} color={roleColors.STARTUP_ADMIN} />
                    <RoleSummaryCard role="VOLUNTEER" count={stats.totalVolunteers || 0} color={roleColors.VOLUNTEER} />
                    <RoleSummaryCard role="SPECIAL_ABLED_PERSON" count={stats.totalSpecialAbled || 0} color={roleColors.SPECIAL_ABLED_PERSON} />
                    <RoleSummaryCard role="GUARDIAN_CAREGIVER" count={stats.totalGuardians || 0} color={roleColors.GUARDIAN_CAREGIVER} />
                  </div>
                </div>

                {/* Content Statistics */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-slate-600">Content Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard label="Total Jobs" value={stats.totalJobs || 0} icon="💼" color="#06b6d4" />
                    <StatCard label="Total Events" value={stats.totalEvents || 0} icon="📅" color="#a855f7" />
                    <StatCard label="Total Donations" value={stats.totalDonations || 0} icon="❤️" color="#ef4444" />
                    <StatCard label="Job Applications" value={stats.totalJobApplications || 0} icon="📝" color="#3b82f6" />
                    <StatCard label="Event Applications" value={stats.totalEventApplications || 0} icon="✅" color="#10b981" />
                    <StatCard label="Certifications" value={stats.totalCertifications || 0} icon="🏆" color="#f59e0b" />
                  </div>
                </div>

                {/* Approval Statistics */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-slate-600">Approval Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard label="Pending Approvals" value={stats.pendingApprovals || 0} icon="⏳" color={TEAL} />
                    <StatCard label="Approved Organizations" value={stats.approvedOrganizations || 0} icon="✓" color="#5BCB2B" />
                    <StatCard label="Rejected Applications" value={stats.rejectedApplications || 0} icon="✕" color="#ef4444" />
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* APPROVALS TAB */}
        {tab === 'approvals' && (
          <div className="space-y-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse"></div>)}
              </div>
            ) : pendingUsers.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-16 text-center">
                <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#f0fdf4' }}>
                  <svg className="w-6 h-6" style={{ color: '#5BCB2B' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">All Clear!</h3>
                <p className="text-slate-600 text-sm">No pending approvals at the moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingUsers.map((item) => {
                  const org = orgDetails[item.email]
                  const type = roleTypeMap[item.role]
                  const isExpanded = expanded === item.id
                  const acting = actionLoading[item.id]

                  return (
                    <div key={item.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div className="px-6 py-5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                            style={{ backgroundColor: roleColors[item.role]?.bg, color: roleColors[item.role]?.text }}>
                            {(roleLabel[item.role] || 'U')[0]}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-900 text-sm">{item.name}</span>
                              {item.role && (
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                  style={{ backgroundColor: roleColors[item.role]?.bg, color: roleColors[item.role]?.text }}>
                                  {roleLabel[item.role] || item.role}
                                </span>
                              )}
                              {org && (
                                <span className="text-xs text-slate-500">• {org.name}</span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 truncate">{item.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {org && (
                            <button
                              onClick={() => setExpanded(isExpanded ? null : item.id)}
                              className="text-xs font-semibold border rounded-lg px-3 py-1.5 transition-colors hover:bg-slate-50"
                              style={{ color: TEAL, borderColor: '#c3dff5' }}
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
                            style={{ backgroundColor: '#5BCB2B' }}
                          >
                            {acting === 'approve' ? 'Approving...' : 'Approve'}
                          </button>
                        </div>
                      </div>

                      {isExpanded && org && (
                        <div className="border-t border-slate-100 bg-slate-50 px-6 py-5">
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
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
                                <dt className="text-xs font-semibold text-slate-500">{field.label}</dt>
                                <dd className="text-sm text-slate-900 mt-0.5">
                                  {field.link ? (
                                    <a href={field.value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                      {field.value}
                                    </a>
                                  ) : (
                                    field.value
                                  )}
                                </dd>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* COURSES TAB */}
        {tab === 'courses' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-600">Platform Courses</h3>
            {courses.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
                <p className="text-slate-500 text-sm">No courses available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map(course => (
                  <div key={course.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                    <h4 className="font-bold text-slate-900 text-sm mb-2">{course.name}</h4>
                    <p className="text-xs text-slate-600 mb-3 line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-500 uppercase">{course.instructor || 'N/A'}</span>
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">View</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PRODUCTS TAB */}
        {tab === 'products' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-600">Marketplace Products</h3>
            {products.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
                <p className="text-slate-500 text-sm">No products available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(product => (
                  <div key={product.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    {product.imageUrl && (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-32 object-cover" />
                    )}
                    <div className="p-4">
                      <h4 className="font-bold text-slate-900 text-sm mb-1">{product.name}</h4>
                      <p className="text-xs text-slate-600 mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <span className="text-sm font-bold text-slate-900">₹{product.price}</span>
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">{product.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
