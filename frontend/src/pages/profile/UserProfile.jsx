import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import authService from '../../services/authService'

const initialForm = {
  name: '',
  phone: '',
  address: '',
  bio: '',
}

export default function UserProfile() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const currentUserId = user?.userId ?? user?.id
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUserId) return

      setLoading(true)
      setError('')

      try {
        const profile = await authService.getProfile(currentUserId)
        setForm({
          name: profile?.name || '',
          phone: profile?.phone || '',
          address: profile?.address || '',
          bio: profile?.bio || '',
        })
      } catch (err) {
        setError(err.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [currentUserId])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!currentUserId) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await authService.updateProfile(currentUserId, {
        name: form.name,
        phone: form.phone,
        address: form.address,
        bio: form.bio,
      })
      setSuccess('Profile updated successfully.')
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="rounded-[28px] bg-gradient-to-r from-[#0f766e] to-[#115e59] text-white p-8 shadow-[0_18px_40px_rgba(15,118,110,.22)] relative overflow-hidden mb-8">
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/70 mb-2">Profile</p>
          <h1 className="text-3xl sm:text-4xl font-black mb-3">Delivery address</h1>
          <p className="text-white/75 max-w-2xl">Keep your address current so marketplace orders and checkout can use the right delivery location.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[24px] shadow-[0_10px_30px_rgba(15,23,42,.06)] border border-slate-100 p-6 sm:p-8">
            {error && <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 font-semibold">{error}</div>}
            {success && <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 font-semibold">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-teal-500 focus:bg-white transition-colors"
                  placeholder="Your name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Phone</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-teal-500 focus:bg-white transition-colors"
                    placeholder="Mobile number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Bio</label>
                  <input
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-teal-500 focus:bg-white transition-colors"
                    placeholder="Short profile note"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Delivery Address</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={5}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-teal-500 focus:bg-white transition-colors resize-none"
                  placeholder="House number, street, city, state, pin code"
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving || loading}
                  className="px-5 py-3 rounded-xl text-white font-bold transition-all disabled:bg-slate-300 disabled:cursor-not-allowed"
                  style={!saving && !loading ? { background: 'linear-gradient(135deg, #0f766e, #14b8a6)' } : undefined}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/cart')}
                  className="px-5 py-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Back to Cart
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-[24px] shadow-[0_10px_30px_rgba(15,23,42,.06)] border border-slate-100 p-6 h-fit">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400 mb-3">Account</p>
            <div className="space-y-3 text-sm text-slate-600">
              <div>
                <p className="font-bold text-slate-900 mb-1">Email</p>
                <p>{user?.email}</p>
              </div>
              <div>
                <p className="font-bold text-slate-900 mb-1">Role</p>
                <p>{user?.role}</p>
              </div>
              <div>
                <p className="font-bold text-slate-900 mb-1">Saved address</p>
                <p className="whitespace-pre-line">{form.address || 'No address saved yet'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}