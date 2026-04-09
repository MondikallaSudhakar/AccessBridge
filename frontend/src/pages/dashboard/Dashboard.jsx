import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const roleLabel = {
    USER: 'Member',
    SCHOOL_ADMIN: 'School Admin',
    NGO_ADMIN: 'NGO Admin',
    STARTUP_ADMIN: 'Startup Admin',
    SUPER_ADMIN: 'Super Admin',
  }[user?.role] || user?.role

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <div className="w-3.5 h-6 rounded-sm" style={{ backgroundColor: '#1A8FD1', clipPath: 'polygon(0 0, 60% 0, 100% 50%, 60% 100%, 0 100%, 40% 50%)' }}></div>
              <div className="w-3.5 h-6 rounded-sm -ml-1" style={{ backgroundColor: '#5BBE00', clipPath: 'polygon(40% 0, 100% 0, 100% 100%, 40% 100%, 0 50%)' }}></div>
            </div>
            <span className="font-bold text-gray-900 text-sm">Inclusive Connect</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden md:block">{user?.email}</span>

            {user?.role === 'SUPER_ADMIN' && (
              <a href="/admin/approvals" className="text-xs font-semibold border-r pr-4 hover:opacity-80 transition-opacity" style={{ color: '#1A8FD1' }}>
                Approvals
              </a>
            )}
            {user?.role === 'SCHOOL_ADMIN' && (
              <a href="/school/profile" className="text-xs font-semibold border-r pr-4 hover:opacity-80 transition-opacity" style={{ color: '#5BBE00' }}>
                School Profile
              </a>
            )}

            <button onClick={handleLogout} className="text-xs font-semibold text-red-500 hover:text-red-700 border border-red-100 px-3 py-1.5 rounded transition-colors">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#1A8FD1' }}>{roleLabel}</p>
          <h1 className="text-3xl font-black text-gray-900">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Welcome back, {user?.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Account Info */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Account</p>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Role</span>
                <span className="font-semibold text-gray-900">{roleLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="font-semibold" style={{ color: '#5BBE00' }}>Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Email</span>
                <span className="font-medium text-gray-700 text-xs max-w-[140px] truncate">{user?.email}</span>
              </div>
            </div>
          </div>

          {/* Role-specific Quick Actions */}
          {user?.role === 'SCHOOL_ADMIN' && (
            <div className="bg-white rounded-xl border shadow-sm p-6 hover:shadow-md transition-shadow" style={{ borderColor: '#c8ead8' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#5BBE00' }}>Manage</p>
              <h3 className="font-bold text-gray-900 mb-1">School Profile</h3>
              <p className="text-xs text-gray-400 mb-5 leading-relaxed">
                Update your school's public listing — it appears in the community directory on the home page.
              </p>
              <a
                href="/school/profile"
                className="inline-flex items-center gap-2 text-xs font-semibold text-white px-4 py-2 rounded hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#5BBE00' }}
              >
                Edit School Profile →
              </a>
            </div>
          )}

          {user?.role === 'SUPER_ADMIN' && (
            <div className="bg-white rounded-xl border shadow-sm p-6 hover:shadow-md transition-shadow" style={{ borderColor: '#c3dff5' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#1A8FD1' }}>Admin</p>
              <h3 className="font-bold text-gray-900 mb-1">Pending Approvals</h3>
              <p className="text-xs text-gray-400 mb-5 leading-relaxed">
                Review and approve organizations waiting to join the platform.
              </p>
              <a
                href="/admin/approvals"
                className="inline-flex items-center gap-2 text-xs font-semibold text-white px-4 py-2 rounded hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#1A8FD1' }}
              >
                View Approvals →
              </a>
            </div>
          )}

          {/* Community Links */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Explore</p>
            <div className="space-y-3 text-sm">
              <a href="/#directory" className="flex justify-between items-center group">
                <span className="text-gray-600 group-hover:text-gray-900 transition-colors">Public Directory</span>
                <span className="text-xs font-semibold group-hover:opacity-70 transition-opacity" style={{ color: '#1A8FD1' }}>View →</span>
              </a>
              <a href="/marketplace" className="flex justify-between items-center group">
                <span className="text-gray-600 group-hover:text-gray-900 transition-colors">Marketplace</span>
                <span className="text-xs font-semibold group-hover:opacity-70 transition-opacity" style={{ color: '#1A8FD1' }}>View →</span>
              </a>
              <a href="/" className="flex justify-between items-center group">
                <span className="text-gray-600 group-hover:text-gray-900 transition-colors">Home Page</span>
                <span className="text-xs font-semibold group-hover:opacity-70 transition-opacity" style={{ color: '#1A8FD1' }}>View →</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
