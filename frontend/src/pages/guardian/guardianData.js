import api from '../../services/api'

export const GUARDIAN_BOOKMARK_KEY = 'guardian_bookmarks'

function asArray(data) {
  return Array.isArray(data) ? data : []
}

function text(value, fallback = '') {
  const normalized = typeof value === 'string' ? value.trim() : ''
  return normalized || fallback
}

function joinLocation(...parts) {
  return parts.map((part) => text(part)).filter(Boolean).join(', ')
}

export async function loadGuardianOpportunities() {
  const [jobsResult, schoolsResult, ngosResult, servicesResult, eventsResult, coursesResult] = await Promise.allSettled([
    api.get('/ngos/jobs/all'),
    api.get('/schools'),
    api.get('/ngos'),
    api.get('/ngos/services/all'),
    api.get('/events/public'),
    api.get('/schools/courses/all'),
  ])

  const jobs = asArray(jobsResult.status === 'fulfilled' ? jobsResult.value : [])
    .filter((job) => text(job?.status, 'OPEN').toUpperCase() !== 'CLOSED')
    .map((job) => ({
      id: `jobs-${job.id}`,
      title: text(job.title, 'Untitled job'),
      org: 'NGO Opportunity',
      place: text(job.location, 'Remote / Flexible'),
      summary: text(job.description, 'No job details provided yet.'),
    }))

  const schools = asArray(schoolsResult.status === 'fulfilled' ? schoolsResult.value : [])
    .map((school) => ({
      id: `schools-${school.id}`,
      title: text(school.name, 'Special School'),
      org: text(school.websiteUrl, 'School Directory'),
      place: joinLocation(school.city, school.state) || 'Location not specified',
      summary: text(school.description, 'Specialized school and support services.'),
    }))

  const ngos = asArray(ngosResult.status === 'fulfilled' ? ngosResult.value : [])
    .map((ngo) => ({
      id: `ngos-${ngo.id}`,
      title: text(ngo.name, 'NGO Support'),
      org: text(ngo.registrationNumber, 'NGO Registry'),
      place: joinLocation(ngo.city, ngo.state) || 'Location not specified',
      summary: text(ngo.mission || ngo.description, 'Community support services.'),
    }))

  const learning = asArray(servicesResult.status === 'fulfilled' ? servicesResult.value : [])
    .filter((service) => text(service?.status, 'ACTIVE').toUpperCase() !== 'INACTIVE')
    .map((service) => ({
      id: `learning-${service.id}`,
      title: text(service.title, 'Learning resource'),
      org: text(service.category, 'Service Program'),
      place: text(service.availability, 'Flexible access'),
      summary: text(service.description, 'Adaptive learning support resource.'),
    }))

  const events = asArray(eventsResult.status === 'fulfilled' ? eventsResult.value : [])
    .filter((event) => text(event?.status, 'UPCOMING').toUpperCase() !== 'CANCELLED')
    .map((event) => ({
      id: `events-${event.id}`,
      title: text(event.title, 'Community event'),
      org: text(event.eventType, 'Community Event'),
      place: joinLocation(event.location, event.city, event.state) || 'Venue to be announced',
      summary: text(event.description, 'Event details available on event page.'),
    }))

  const therapy = asArray(coursesResult.status === 'fulfilled' ? coursesResult.value : [])
    .filter((course) => text(course?.status, 'ACTIVE').toUpperCase() !== 'CANCELLED')
    .map((course) => ({
      id: `therapy-${course.id}`,
      title: text(course.courseTitle, 'Therapy / training program'),
      org: text(course.category, 'School Program'),
      place: text(course.instructorName, 'Instructor details available'),
      summary: text(course.description, 'Therapy or training course.'),
    }))

  return {
    jobs,
    schools,
    ngos,
    learning,
    events,
    therapy,
  }
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
