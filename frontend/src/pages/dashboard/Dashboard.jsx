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
    <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Premium Navbar */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-4 h-7 rounded-sm" style={{ backgroundColor: '#1A8FD1', clipPath: 'polygon(0 0, 60% 0, 100% 50%, 60% 100%, 0 100%, 40% 50%)' }}></div>
              <div className="w-4 h-7 rounded-sm -ml-1.5" style={{ backgroundColor: '#5BBE00', clipPath: 'polygon(40% 0, 100% 0, 100% 100%, 40% 100%, 0 50%)' }}></div>
            </div>
            <span className="font-black tracking-tight text-gray-900 text-lg cursor-pointer" onClick={() => navigate('/')}>Inclusive Connect</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-500 hidden md:block">{user?.email}</span>
            <div className="h-5 w-px bg-gray-200 hidden md:block"></div>
            <button onClick={handleLogout} className="text-xs font-bold text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Modern Hero Welcome */}
        <div className="relative rounded-3xl overflow-hidden mb-10 shadow-sm border border-gray-100" style={{ backgroundColor: '#1A8FD1' }}>
          {/* Abstract background shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          <div className="absolute bottom-0 right-40 w-48 h-48 bg-white opacity-5 rounded-full blur-2xl -mb-10 pointer-events-none"></div>
          
          <div className="relative p-10 md:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="text-white">
              <div className="inline-block px-3 py-1 mb-4 rounded-full text-xs font-bold uppercase tracking-widest bg-black bg-opacity-20 backdrop-blur-sm shadow-sm border border-white border-opacity-10">
                {roleLabel} Portal
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">Welcome back!</h1>
              <p className="text-blue-100 text-lg">{user?.email}</p>
            </div>
            {user?.role === 'SCHOOL_ADMIN' && (
              <button onClick={() => navigate('/school/profile')} className="flex items-center gap-2 bg-white text-gray-900 font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                Go to School Dashboard 
                <svg className="w-5 h-5" fill="none" stroke="#1A8FD1" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </button>
            )}
            {user?.role === 'NGO_ADMIN' && (
              <button onClick={() => navigate('/ngo/profile')} className="flex items-center gap-2 bg-white text-gray-900 font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                Go to NGO Dashboard
                <svg className="w-5 h-5" fill="none" stroke="#1A8FD1" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </button>
            )}
            {user?.role === 'STARTUP_ADMIN' && (
              <button onClick={() => navigate('/startup/profile')} className="flex items-center gap-2 bg-white text-gray-900 font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                Go to Startup Dashboard 
                <svg className="w-5 h-5" fill="none" stroke="#1A8FD1" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </button>
            )}
            {user?.role === 'SUPER_ADMIN' && (
              <button onClick={() => navigate('/admin/approvals')} className="flex items-center gap-2 bg-white text-gray-900 font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                Review Approvals
                <svg className="w-5 h-5" fill="none" stroke="#1A8FD1" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Main Quick Access Area */}
          <div className="md:col-span-8 space-y-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Workspace Management</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {user?.role === 'SCHOOL_ADMIN' && (
                <div onClick={() => navigate('/school/profile')} className="group cursor-pointer bg-white rounded-2xl border border-gray-100 shadow-sm p-8 hover:shadow-xl hover:border-green-200 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden flex flex-col h-full">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-50 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 relative z-10" style={{ backgroundColor: '#EEF8E0', color: '#5BBE00' }}>
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
                  </div>
                  <h3 className="text-lg font-black text-gray-900 mb-2 relative z-10">School Dashboard</h3>
                  <p className="text-sm text-gray-500 mb-6 leading-relaxed relative z-10 flex-grow">
                    Update your school's public profile, manage active requirements, post achievements, and interact with the community.
                  </p>
                  <div className="flex items-center mt-auto font-bold text-sm transition-colors group-hover:text-green-600" style={{ color: '#5BBE00' }}>
                    Open Dashboard <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </div>
                </div>
              )}

              {user?.role === 'STARTUP_ADMIN' && (
                <div onClick={() => navigate('/startup/profile')} className="group cursor-pointer bg-white rounded-2xl border border-gray-100 shadow-sm p-8 hover:shadow-xl hover:border-orange-200 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden flex flex-col h-full">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-50 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 relative z-10" style={{ backgroundColor: '#FFF3E0', color: '#e65100' }}>
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                  </div>
                  <h3 className="text-lg font-black text-gray-900 mb-2 relative z-10">Startup Dashboard</h3>
                  <p className="text-sm text-gray-500 mb-6 leading-relaxed relative z-10 flex-grow">
                    Manage your startup's profile and list your assistive products on the community marketplace.
                  </p>
                  <div className="flex items-center mt-auto font-bold text-sm transition-colors group-hover:text-orange-600" style={{ color: '#e65100' }}>
                    Open Dashboard <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </div>
                </div>
              )}

              {user?.role === 'NGO_ADMIN' && (
                <div onClick={() => navigate('/ngo/profile')} className="group cursor-pointer bg-white rounded-2xl border border-gray-100 shadow-sm p-8 hover:shadow-xl hover:border-emerald-200 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden flex flex-col h-full">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-50 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 relative z-10" style={{ backgroundColor: '#EAF6EF', color: '#5BCB2B' }}>
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 1110 0v4m-8 0h6m-9 0h12l-1 9H7l-1-9z" /></svg>
                  </div>
                  <h3 className="text-lg font-black text-gray-900 mb-2 relative z-10">NGO Dashboard</h3>
                  <p className="text-sm text-gray-500 mb-6 leading-relaxed relative z-10 flex-grow">
                    Post requirements, hiring jobs, products, services, and achievements. Services and achievements are shown on NGO profile only.
                  </p>
                  <div className="flex items-center mt-auto font-bold text-sm transition-colors group-hover:text-emerald-700" style={{ color: '#5BCB2B' }}>
                    Open Dashboard <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </div>
                </div>
              )}

              {user?.role === 'SUPER_ADMIN' && (
                <div onClick={() => navigate('/admin/approvals')} className="group cursor-pointer bg-white rounded-2xl border border-gray-100 shadow-sm p-8 hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden flex flex-col h-full">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 relative z-10" style={{ backgroundColor: '#E8F4FC', color: '#1A8FD1' }}>
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h3 className="text-lg font-black text-gray-900 mb-2 relative z-10">Network Approvals</h3>
                  <p className="text-sm text-gray-500 mb-6 leading-relaxed relative z-10 flex-grow">
                    Review pending registrations for NGOs, Schools, and Startups to verify and approve community members for full access.
                  </p>
                  <div className="flex items-center mt-auto font-bold text-sm transition-colors group-hover:text-blue-600" style={{ color: '#1A8FD1' }}>
                    Start Reviewing <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </div>
                </div>
              )}

              {/* Discover Card (For everyone) */}
              <div onClick={() => navigate('/#directory')} className="group cursor-pointer bg-white rounded-2xl border border-gray-100 shadow-sm p-8 hover:shadow-xl hover:border-purple-200 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden flex flex-col h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-50 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 relative z-10 bg-purple-50 text-purple-600">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2 relative z-10">Community Browser</h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed relative z-10 flex-grow">
                  Explore the full public directory of special schools, verified non-profits, and assistive product startups.
                </p>
                <div className="flex items-center mt-auto font-bold text-sm text-purple-600 transition-colors group-hover:text-purple-700">
                  Explore Public Hub <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
              </div>
              
              {/* Marketplace Card (For everyone) */}
              <div onClick={() => navigate('/marketplace')} className="group cursor-pointer bg-white rounded-2xl border border-gray-100 shadow-sm p-8 hover:shadow-xl hover:border-orange-200 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden flex flex-col h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-50 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 relative z-10 bg-orange-50 text-orange-500">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2 relative z-10">Product Marketplace</h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed relative z-10 flex-grow">
                  Discover and procure assistive equipment, educational tools, and resources tailored for inclusive learning.
                </p>
                <div className="flex items-center mt-auto font-bold text-sm text-orange-500 transition-colors group-hover:text-orange-600">
                  Browse Marketplace <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
              </div>

            </div>
          </div>

          {/* Sidebar Area */}
          <div className="md:col-span-4 space-y-6">


            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-800 shadow-md p-8 text-white text-center shadow-lg relative overflow-hidden">
               <div className="absolute top-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl -ml-10 -mt-10 pointer-events-none"></div>
              <div className="w-14 h-14 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center mx-auto mb-5 relative z-10">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-3 relative z-10">Need Support?</h3>
              <p className="text-sm text-gray-300 mb-6 leading-relaxed relative z-10">Our dedicated support team is here to help you navigate and maximize the platform.</p>
              <button className="w-full text-sm font-bold bg-white text-gray-900 py-3 rounded-xl hover:bg-gray-100 hover:shadow-lg transition-all relative z-10">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
