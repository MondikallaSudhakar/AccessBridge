import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import authService from '../../services/authService'

export default function GuardianProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState({ name: '', phone: '', bio: '', dependentName: '', dependentRelation: '', dependentAge: '', dependentNeeds: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!user?.userId && !user?.id) return
      try {
        const current = await authService.getProfile(user.userId || user.id)
        setProfile({
          name: current.name || '',
          phone: current.phone || '',
          bio: current.bio || '',
          dependentName: current.dependentName || '',
          dependentRelation: current.dependentRelation || '',
          dependentAge: current.dependentAge || '',
          dependentNeeds: current.dependentNeeds || '',
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
        dependentName: updated.dependentName || '',
        dependentRelation: updated.dependentRelation || '',
        dependentAge: updated.dependentAge || '',
        dependentNeeds: updated.dependentNeeds || '',
      })
      setMessage('Dependent profile saved.')
    } catch (err) {
      setError(err.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSaveProfile} className="max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-black text-slate-900">Create / manage dependent profile</h2>
      <p className="text-sm text-slate-500">Add details for personalized support and opportunities.</p>

      {message && <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
      {error && <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="mt-4 space-y-4">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Your name</span>
          <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Phone</span>
          <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Dependent name</span>
          <input value={profile.dependentName} onChange={(e) => setProfile({ ...profile, dependentName: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Relationship</span>
          <input value={profile.dependentRelation} onChange={(e) => setProfile({ ...profile, dependentRelation: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="Parent, legal guardian, sibling..." />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Dependent age</span>
          <input value={profile.dependentAge} onChange={(e) => setProfile({ ...profile, dependentAge: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="e.g. 8, 18, 42" />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Dependent needs</span>
          <textarea value={profile.dependentNeeds} onChange={(e) => setProfile({ ...profile, dependentNeeds: e.target.value })} rows={4} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="Therapy, training, support services, school needs, job needs..." />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-400">About your support context</span>
          <textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" />
        </label>
      </div>

      <button type="submit" disabled={saving} className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
        {saving ? 'Saving...' : 'Save Dependent Profile'}
      </button>
    </form>
  )
}
