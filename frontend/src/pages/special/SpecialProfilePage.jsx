import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import authService from '../../services/authService'
import { DISABILITY_OPTIONS } from './specialData'

export default function SpecialProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState({ name: '', phone: '', bio: '', disabilityType: '', skills: '', supportNeeds: '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!user?.userId && !user?.id) return
      try {
        const current = await authService.getProfile(user.userId || user.id)
        setProfile({
          name: current.name || '',
          phone: current.phone || '',
          bio: current.bio || '',
          disabilityType: current.disabilityType || '',
          skills: current.skills || '',
          supportNeeds: current.supportNeeds || '',
        })
      } catch (err) {
        setError(err.message || 'Failed to load profile')
      }
    }

    load()
  }, [user])

  const handleSaveProfile = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    try {
      const updated = await authService.updateProfile(user.userId || user.id, profile)
      setProfile({
        name: updated.name || '',
        phone: updated.phone || '',
        bio: updated.bio || '',
        disabilityType: updated.disabilityType || '',
        skills: updated.skills || '',
        supportNeeds: updated.supportNeeds || '',
      })
      setMessage('Profile saved successfully.')
    } catch (err) {
      setError(err.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSaveProfile} className="max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-black text-slate-900">Create / update profile</h2>
        <p className="text-sm text-slate-500">Add skills, needs, and disability type for better opportunities.</p>
      </div>

      {message && <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
      {error && <div className="mb-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Name</span>
          <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Phone</span>
          <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Disability type</span>
        <select value={profile.disabilityType} onChange={(e) => setProfile({ ...profile, disabilityType: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500">
          <option value="">Select one</option>
          {DISABILITY_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>

      <label className="mt-4 block">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Skills</span>
        <textarea value={profile.skills} onChange={(e) => setProfile({ ...profile, skills: e.target.value })} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="E.g. communication, computer basics, teaching, coding" />
      </label>

      <label className="mt-4 block">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Support needs</span>
        <textarea value={profile.supportNeeds} onChange={(e) => setProfile({ ...profile, supportNeeds: e.target.value })} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="E.g. transport support, assistive tech, flexible hours" />
      </label>

      <label className="mt-4 block">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-400">About you</span>
        <textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="Introduce yourself and the kind of opportunities you want." />
      </label>

      <button type="submit" disabled={saving} className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-opacity disabled:opacity-60">
        {saving ? 'Saving profile...' : 'Save Profile'}
      </button>
    </form>
  )
}
