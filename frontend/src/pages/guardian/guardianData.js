export const GUARDIAN_BOOKMARK_KEY = 'guardian_bookmarks'

export const GUARDIAN_OPPORTUNITIES = {
  jobs: [
    { id: 'g-job-1', title: 'Flexible Office Assistant', org: 'CareBridge Services', place: 'Remote / Part-time', summary: 'Suitable jobs for a dependent person with support scheduling.' },
    { id: 'g-job-2', title: 'Supported Retail Associate', org: 'Helping Hands NGO', place: 'Nearby outlet', summary: 'Mentor-backed role for dependents with guided onboarding.' },
  ],
  schools: [
    { id: 'g-school-1', title: 'Special School Admission', org: 'Bright Future School', place: 'Enrollment open', summary: 'Special schools and training programs with accessible transport.' },
    { id: 'g-school-2', title: 'Therapy Center Intake', org: 'Calm Step Therapy', place: 'Assessment required', summary: 'Speech, occupational, and behavioral therapy support.' },
  ],
  ngos: [
    { id: 'g-ngo-1', title: 'Request NGO Support', org: 'Hope Access NGO', place: 'Care services', summary: 'Transportation aid, documentation help, and community care.' },
    { id: 'g-ngo-2', title: 'Support Services Desk', org: 'Unity Support Trust', place: 'Local network', summary: 'Support services for day-to-day dependent care needs.' },
  ],
  learning: [
    { id: 'g-learn-1', title: 'Learning Resource Library', org: 'SkillPath', place: 'Self-paced', summary: 'Structured learning resources for the dependent person.' },
    { id: 'g-learn-2', title: 'Adaptive Learning Program', org: 'Open Access Academy', place: 'Online + local', summary: 'Guided training for school, work, and daily life skills.' },
  ],
  events: [
    { id: 'g-event-1', title: 'Awareness Program', org: 'Community Inclusion Forum', place: 'This month', summary: 'Events and awareness programs for families and caregivers.' },
    { id: 'g-event-2', title: 'Caregiver Support Meetup', org: 'Neighbourhood Alliance', place: 'Weekly meetup', summary: 'Exchange ideas, resources, and care strategies.' },
  ],
  therapy: [
    { id: 'g-therapy-1', title: 'Book Therapy Session', org: 'Hope Therapy Center', place: 'Available slots', summary: 'Book therapy or training for the dependent person.' },
    { id: 'g-therapy-2', title: 'Training Appointment', org: 'SkillCare Studio', place: 'Flexible times', summary: 'Book practical training sessions and follow-up care.' },
  ],
}

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
