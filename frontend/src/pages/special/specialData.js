export const BOOKMARK_KEY = 'special_abled_bookmarks'

export const DISABILITY_OPTIONS = [
  'Visual Disability',
  'Hearing Disability',
  'Physical / Motor Disability',
  'Intellectual / Cognitive Disability',
  'Speech / Communication Disability',
  'Multiple Disability',
  'Other / Not Listed',
]

export const SPECIAL_NAV = [
  { to: '/special', label: 'Home' },
  { to: '/special/profile', label: 'Profile' },
  { to: '/special/jobs', label: 'Jobs' },
  { to: '/special/marketplace', label: 'Marketplace' },
  { to: '/special/ngos', label: 'NGOs' },
  { to: '/special/training', label: 'Training' },
  { to: '/special/events', label: 'Events' },
  { to: '/special/campaigns', label: 'Campaigns' },
  { to: '/special/schemes', label: 'Schemes' },
  { to: '/special/help', label: 'Request Help' },
  { to: '/special/requests', label: 'Request History' },
  { to: '/special/saved', label: 'Saved' },
]

export function loadBookmarks() {
  try {
    const raw = localStorage.getItem(BOOKMARK_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveBookmarks(bookmarks) {
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bookmarks))
}

export function toggleBookmark(bookmarks, id) {
  const next = bookmarks.includes(id)
    ? bookmarks.filter((item) => item !== id)
    : [...bookmarks, id]
  saveBookmarks(next)
  return next
}
