import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { THERAPY_CENTER_CAPABILITIES_VIEW, THERAPY_CENTER_CAPABILITIES_DO } from './therapyCenterWorkspaceData'

const TherapyCenterHome = () => {
  const { user } = useAuth()
  const [center, setCenter] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCenter = async () => {
      if (!user?.email) {
        setLoading(false)
        return
      }

      try {
        const response = await api.get(`/therapy-centers/email/${encodeURIComponent(user.email)}`)
        setCenter(response)
      } catch {
        setCenter(null)
      } finally {
        setLoading(false)
      }
    }

    loadCenter()
  }, [user?.email])

  const stats = useMemo(() => {
    const types = Array.isArray(center?.therapyTypes) ? center.therapyTypes : []
    return {
      therapyTypes: types.length,
      activeTypes: types.filter((item) => String(item.status || '').toUpperCase() === 'ACTIVE').length,
      capacity: center?.capacity ?? 'N/A',
      status: center?.status || 'PENDING',
    }
  }, [center])

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Welcome back, {user?.name}</h1>
        <p className="text-gray-600 mt-2">Manage your therapy center and serve your clients</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-500 text-sm font-medium">Active Clients</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">N/A</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-500 text-sm font-medium">Therapy Types</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{loading ? '...' : stats.therapyTypes}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-500 text-sm font-medium">Center Status</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{loading ? '...' : stats.status}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-500 text-sm font-medium">Capacity</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{loading ? '...' : stats.capacity}</p>
        </div>
      </div>

      {center && (
        <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-800">{center.name}</h2>
          <p className="mt-2 text-gray-600">{center.specialization || 'Therapy center profile'}</p>
          <p className="mt-1 text-sm text-gray-500">{center.address}</p>
          <p className="mt-1 text-sm text-gray-500">{stats.activeTypes} active therapy types</p>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Can View */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">What You Can View</h2>
            <ul className="space-y-3">
              {THERAPY_CENTER_CAPABILITIES_VIEW.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-green-500 font-bold text-lg">✓</span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Can Do */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">What You Can Do</h2>
            <ul className="space-y-3">
              {THERAPY_CENTER_CAPABILITIES_DO.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-blue-500 font-bold text-lg">→</span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column - Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-md h-fit">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="pb-4 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-800">New booking request</p>
              <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
            </div>
            <div className="pb-4 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-800">Client completed session</p>
              <p className="text-xs text-gray-500 mt-1">Yesterday at 3:30 PM</p>
            </div>
            <div className="pb-4">
              <p className="text-sm font-medium text-gray-800">New support request</p>
              <p className="text-xs text-gray-500 mt-1">2 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TherapyCenterHome
