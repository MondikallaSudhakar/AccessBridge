import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { THERAPY_CENTER_FEATURES } from './therapyCenterWorkspaceData'

const TherapyCenterFeaturePage = ({ type }) => {
  const feature = THERAPY_CENTER_FEATURES[type]
  const { user } = useAuth()
  const [therapyTypes, setTherapyTypes] = useState([])
  const [center, setCenter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState(null)

  // Form states
  const [therapyForm, setTherapyForm] = useState({
    typeName: '',
    description: '',
    ageGroup: '',
    sessionDuration: '',
    frequency: '',
    cost: '',
    benefits: '',
    prerequisites: '',
  })

  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    phone: '',
    disabilityType: '',
    age: '',
    therapy_type: '',
  })

  const [appointmentForm, setAppointmentForm] = useState({
    clientId: '',
    therapyTypeId: '',
    date: '',
    time: '',
    duration: '',
    status: 'SCHEDULED',
  })

  useEffect(() => {
    fetchData()
  }, [type, user?.email])

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      if (!user?.email) {
        setCenter(null)
        setTherapyTypes([])
        return
      }

      const centerResponse = await api.get(`/therapy-centers/email/${encodeURIComponent(user.email)}`)
      setCenter(centerResponse)

      const types = Array.isArray(centerResponse?.therapyTypes) ? centerResponse.therapyTypes : []
      setTherapyTypes(types)
    } catch (error) {
      setCenter(null)
      setTherapyTypes([])
      setError(error.message || 'Error fetching therapy center data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTherapyType = () => {
    setFormType('therapyType')
    setShowForm(true)
  }

  const handleSubmitTherapyForm = async (e) => {
    e.preventDefault()
    if (!center?.id) {
      setError('Therapy center profile not found. Please complete your profile first.')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await api.post(`/therapy-centers/${center.id}/therapy-types`, {
        ...therapyForm,
        cost: therapyForm.cost === '' ? null : Number(therapyForm.cost),
      })

      const refreshed = await api.get(`/therapy-centers/email/${encodeURIComponent(user.email)}`)
      setCenter(refreshed)
      setTherapyTypes(Array.isArray(refreshed?.therapyTypes) ? refreshed.therapyTypes : [])
      setTherapyForm({
        typeName: '',
        description: '',
        ageGroup: '',
        sessionDuration: '',
        frequency: '',
        cost: '',
        benefits: '',
        prerequisites: '',
      })
      setShowForm(false)
      setSuccess('Therapy type saved successfully.')
    } catch (error) {
      setError(error.message || 'Error adding therapy type')
    } finally {
      setSaving(false)
    }
  }

  const stats = useMemo(() => ({
    therapyTypes: therapyTypes.length,
    activeTypes: therapyTypes.filter((item) => String(item.status || '').toUpperCase() === 'ACTIVE').length,
    approved: center?.status === 'APPROVED' ? 'Approved' : center?.status || 'Pending',
  }), [center?.status, therapyTypes])

  if (!feature) {
    return <div className="text-center text-gray-500">Feature not found</div>
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">{feature.title}</h1>
        <p className="text-gray-600 mt-2">{feature.subtitle}</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {type !== 'therapy-types' && (
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white p-4 shadow-md">
            <p className="text-sm text-gray-500">Therapy Center</p>
            <p className="mt-2 text-xl font-bold text-gray-800">{center?.name || 'Not loaded yet'}</p>
            <p className="mt-1 text-sm text-gray-600">{center?.specialization || 'No specialization set'}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-md">
            <p className="text-sm text-gray-500">Status</p>
            <p className="mt-2 text-xl font-bold text-gray-800">{stats.approved}</p>
            <p className="mt-1 text-sm text-gray-600">{center?.active ? 'Center is visible in listings' : 'Center is not active yet'}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-md">
            <p className="text-sm text-gray-500">Therapy Types</p>
            <p className="mt-2 text-xl font-bold text-gray-800">{stats.therapyTypes}</p>
            <p className="mt-1 text-sm text-gray-600">{stats.activeTypes} active therapy types</p>
          </div>
        </div>
      )}

      {/* Therapy Types View */}
      {type === 'therapy-types' && (
        <div className="space-y-6">
          <button
            onClick={handleAddTherapyType}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Therapy Type
          </button>

          {showForm && formType === 'therapyType' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Add New Therapy Type</h3>
              <form onSubmit={handleSubmitTherapyForm} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Therapy Type Name"
                    value={therapyForm.typeName}
                    onChange={(e) => setTherapyForm({ ...therapyForm, typeName: e.target.value })}
                    className="border rounded-lg px-3 py-2"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Age Group (e.g., 0-5)"
                    value={therapyForm.ageGroup}
                    onChange={(e) => setTherapyForm({ ...therapyForm, ageGroup: e.target.value })}
                    className="border rounded-lg px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Session Duration (e.g., 1 hour)"
                    value={therapyForm.sessionDuration}
                    onChange={(e) => setTherapyForm({ ...therapyForm, sessionDuration: e.target.value })}
                    className="border rounded-lg px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Frequency (e.g., Weekly)"
                    value={therapyForm.frequency}
                    onChange={(e) => setTherapyForm({ ...therapyForm, frequency: e.target.value })}
                    className="border rounded-lg px-3 py-2"
                  />
                  <input
                    type="number"
                    placeholder="Cost per session"
                    value={therapyForm.cost}
                    onChange={(e) => setTherapyForm({ ...therapyForm, cost: e.target.value })}
                    className="border rounded-lg px-3 py-2"
                  />
                </div>
                <textarea
                  placeholder="Description"
                  value={therapyForm.description}
                  onChange={(e) => setTherapyForm({ ...therapyForm, description: e.target.value })}
                  className="border rounded-lg px-3 py-2 w-full"
                  rows="3"
                />
                <textarea
                  placeholder="Benefits"
                  value={therapyForm.benefits}
                  onChange={(e) => setTherapyForm({ ...therapyForm, benefits: e.target.value })}
                  className="border rounded-lg px-3 py-2 w-full"
                  rows="2"
                />
                <textarea
                  placeholder="Prerequisites"
                  value={therapyForm.prerequisites}
                  onChange={(e) => setTherapyForm({ ...therapyForm, prerequisites: e.target.value })}
                  className="border rounded-lg px-3 py-2 w-full"
                  rows="2"
                />
                <div className="flex gap-2">
                  <button type="submit" disabled={saving} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60">
                    {saving ? 'Saving...' : 'Save Therapy Type'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Therapy Types List */}
          {loading ? (
            <div className="rounded-lg bg-white p-6 shadow-md text-gray-600">Loading therapy types from the database...</div>
          ) : therapyTypes.length === 0 ? (
            <div className="rounded-lg bg-white p-6 shadow-md text-gray-600">No therapy types saved yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {therapyTypes.map((therapyType) => (
                <div key={therapyType.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                  <h3 className="text-lg font-bold text-gray-800">{therapyType.typeName}</h3>
                  <p className="text-sm text-gray-600 mt-2">{therapyType.description}</p>
                  <div className="mt-4 space-y-1 text-sm text-gray-600">
                    <p><strong>Age Group:</strong> {therapyType.ageGroup || 'N/A'}</p>
                    <p><strong>Duration:</strong> {therapyType.sessionDuration || 'N/A'}</p>
                    <p><strong>Frequency:</strong> {therapyType.frequency || 'N/A'}</p>
                    <p><strong>Cost:</strong> {therapyType.cost != null ? `₹${therapyType.cost}` : 'N/A'}</p>
                    <p><strong>Status:</strong> {therapyType.status || 'ACTIVE'}</p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button className="bg-blue-50 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-100">Edit</button>
                    <button className="bg-red-50 text-red-600 px-3 py-1 rounded text-sm hover:bg-red-100">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Clients View */}
      {type === 'clients' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 text-gray-600">
            Client records are not yet stored in a therapy-center table. Add client/booking entities if you want these to load from DB.
          </div>
        </div>
      )}

      {/* Appointments View */}
      {type === 'appointments' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 text-gray-600">
            Appointment data is not yet backed by a therapy-center database table.
          </div>
        </div>
      )}

      {/* Bookings View */}
      {type === 'bookings' && (
        <div className="space-y-4">
          <div className="rounded-lg bg-white p-6 shadow-md text-gray-600">
            Booking requests are not yet stored in the database. Connect this page to a bookings table when available.
          </div>
        </div>
      )}

      {/* Default message for other types */}
      {!['therapy-types', 'clients', 'appointments', 'bookings'].includes(type) && (
        <div className="bg-white p-12 rounded-lg shadow-md text-center">
          <p className="text-gray-600 text-lg">Feature page for {feature.title} coming soon...</p>
        </div>
      )}
    </div>
  )
}

export default TherapyCenterFeaturePage
