import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { THERAPY_CENTER_FEATURES } from './therapyCenterWorkspaceData'

const TherapyCenterFeaturePage = ({ type }) => {
  const feature = THERAPY_CENTER_FEATURES[type]
  const [therapyTypes, setTherapyTypes] = useState([])
  const [bookings, setBookings] = useState([])
  const [clients, setClients] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
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
  }, [type])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (type === 'therapy-types') {
        // Mock data for therapy types
        setTherapyTypes([
          {
            id: 1,
            typeName: 'Speech Therapy',
            description: 'Speech and language development',
            ageGroup: '0-12',
            sessionDuration: '1 hour',
            frequency: 'Weekly',
            cost: 500,
            status: 'ACTIVE',
          },
          {
            id: 2,
            typeName: 'Physical Therapy',
            description: 'Movement and mobility therapy',
            ageGroup: '5-18',
            sessionDuration: '1 hour',
            frequency: 'Twice Weekly',
            cost: 600,
            status: 'ACTIVE',
          },
        ])
      } else if (type === 'clients') {
        setClients([
          { id: 1, name: 'Rahul Kumar', therapy: 'Speech Therapy', lastSession: '2 days ago', status: 'Active' },
          { id: 2, name: 'Priya Singh', therapy: 'Physical Therapy', lastSession: '3 days ago', status: 'Active' },
        ])
      } else if (type === 'appointments') {
        setAppointments([
          { id: 1, clientName: 'Rahul Kumar', therapyType: 'Speech Therapy', date: '2025-05-10', time: '10:00 AM', status: 'SCHEDULED' },
          { id: 2, clientName: 'Priya Singh', therapyType: 'Physical Therapy', date: '2025-05-10', time: '2:00 PM', status: 'COMPLETED' },
        ])
      } else if (type === 'bookings') {
        setBookings([
          { id: 1, clientName: 'Arun Singh', therapyType: 'Mental Health Counseling', requestDate: '2025-05-08', status: 'PENDING' },
          { id: 2, clientName: 'Maya Patel', therapyType: 'Occupational Therapy', requestDate: '2025-05-07', status: 'CONFIRMED' },
        ])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
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
    try {
      // In a real app, you'd send this to the API
      setTherapyTypes([...therapyTypes, { id: Date.now(), ...therapyForm, status: 'ACTIVE' }])
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
    } catch (error) {
      console.error('Error adding therapy type:', error)
    }
  }

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
                  <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                    Save Therapy Type
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {therapyTypes.map((type) => (
              <div key={type.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                <h3 className="text-lg font-bold text-gray-800">{type.typeName}</h3>
                <p className="text-sm text-gray-600 mt-2">{type.description}</p>
                <div className="mt-4 space-y-1 text-sm text-gray-600">
                  <p><strong>Age Group:</strong> {type.ageGroup}</p>
                  <p><strong>Duration:</strong> {type.sessionDuration}</p>
                  <p><strong>Frequency:</strong> {type.frequency}</p>
                  <p><strong>Cost:</strong> ₹{type.cost}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="bg-blue-50 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-100">Edit</button>
                  <button className="bg-red-50 text-red-600 px-3 py-1 rounded text-sm hover:bg-red-100">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clients View */}
      {type === 'clients' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Client Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Therapy Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Last Session</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-800">{client.name}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{client.therapy}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{client.lastSession}</td>
                  <td className="px-6 py-3">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">{client.status}</span>
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <button className="text-blue-600 hover:underline">View Profile</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Appointments View */}
      {type === 'appointments' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Client Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Therapy Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date & Time</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-800">{apt.clientName}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{apt.therapyType}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{apt.date} at {apt.time}</td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      apt.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {apt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bookings View */}
      {type === 'bookings' && (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{booking.clientName}</h3>
                  <p className="text-gray-600 mt-1">{booking.therapyType}</p>
                  <p className="text-sm text-gray-500 mt-2">Request date: {booking.requestDate}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {booking.status}
                  </span>
                  {booking.status === 'PENDING' && (
                    <>
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Confirm</button>
                      <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Decline</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
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
