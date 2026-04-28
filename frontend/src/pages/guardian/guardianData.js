export const GUARDIAN_BOOKMARK_KEY = 'guardian_bookmarks'



export const GUARDIAN_NAV = [
  { to: '/guardian', label: 'Home' },
  { to: '/guardian/profile', label: 'Dependent Profile' },
  { to: '/guardian/jobs', label: 'Jobs' },
  { to: '/guardian/schools', label: 'Schools & Therapy' },
  { to: '/guardian/ngos', label: 'NGO Support' },
  { to: '/guardian/learning', label: 'Learning' },
  { to: '/guardian/events', label: 'Events' },
  { to: '/guardian/therapy', label: 'Book Therapy' },
  { to: '/guardian/help', label: 'Request Help' },
  { to: '/guardian/saved', label: 'Saved' },
  { to: '/guardian/progress', label: 'Track Progress' },
]

export function readGuardianBookmarks() {
  try {
    const raw = localStorage.getItem(GUARDIAN_BOOKMARK_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function writeGuardianBookmarks(items) {
  localStorage.setItem(GUARDIAN_BOOKMARK_KEY, JSON.stringify(items))
}

export function toggleGuardianBookmark(current, id) {
  const next = current.includes(id)
    ? current.filter((item) => item !== id)
    : [...current, id]
  writeGuardianBookmarks(next)
  return next
}
