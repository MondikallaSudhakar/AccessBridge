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
  const [jobsResult, schoolsResult, ngosResult, eventsResult, coursesResult, therapyCentersResult] = await Promise.allSettled([
    api.get('/ngos/jobs/all'),
    api.get('/schools'),
    api.get('/ngos'),
    api.get('/events/public'),
    api.get('/schools/courses/all'),
    api.get('/therapy-centers/approved'),
  ])

  const schoolsRaw = asArray(schoolsResult.status === 'fulfilled' ? schoolsResult.value : [])
  const coursesRaw = asArray(coursesResult.status === 'fulfilled' ? coursesResult.value : [])
  const therapyCentersRaw = asArray(therapyCentersResult.status === 'fulfilled' ? therapyCentersResult.value : [])
  const schoolNameById = new Map(
    schoolsRaw.map((school) => [String(school.id), text(school.name, 'School / Training Center')])
  )

  const schoolLocation = (school) => joinLocation(school.city, school.state, school.country) || 'Location not specified'

  const jobs = asArray(jobsResult.status === 'fulfilled' ? jobsResult.value : [])
    .filter((job) => text(job?.status, 'OPEN').toUpperCase() !== 'CLOSED')
    .map((job) => ({
      id: `jobs-${job.id}`,
      title: text(job.title, 'Untitled job'),
      org: 'NGO Opportunity',
      place: text(job.location, 'Remote / Flexible'),
      summary: text(job.description, 'No job details provided yet.'),
    }))

  const schools = schoolsRaw.map((school) => ({
    id: `schools-${school.id}`,
    sourceId: school.id,
    title: text(school.name, 'School / Training Center'),
    org: school.specialSchool ? 'Special School' : 'School',
    place: schoolLocation(school),
    summary: text(
      school.description || school.mission,
      school.verified ? 'Verified school profile and services.' : 'School profile and services.'
    ),
  }))

  const ngos = asArray(ngosResult.status === 'fulfilled' ? ngosResult.value : [])
    .map((ngo) => ({
      id: `ngos-${ngo.id}`,
      title: text(ngo.name, 'NGO Support'),
      org: text(ngo.registrationNumber, 'NGO Registry'),
      place: joinLocation(ngo.city, ngo.state) || 'Location not specified',
      summary: text(ngo.mission || ngo.description, 'Community support services.'),
    }))

  const learning = coursesRaw
    .filter((course) => text(course?.status, 'ACTIVE').toUpperCase() !== 'CANCELLED')
    .map((course) => ({
      id: `learning-course-${course.id}`,
      sourceId: course.id,
      title: text(course.courseTitle, 'Learning course'),
      org: schoolNameById.get(String(course.schoolId)) || 'School / Training Center',
      place: text(course.category, 'Course Program'),
      summary: text(course.description, 'Course details will be shared during enrollment.'),
    }))

  const events = asArray(eventsResult.status === 'fulfilled' ? eventsResult.value : [])
    .filter((event) => text(event?.status, 'UPCOMING').toUpperCase() !== 'CANCELLED')
    .map((event) => ({
      id: `events-${event.id}`,
      sourceId: event.id,
      title: text(event.title, 'Community event'),
      org: text(event.eventType, 'Community Event'),
      place: joinLocation(event.location, event.city, event.state) || 'Venue to be announced',
      summary: text(event.description, 'Event details available on event page.'),
      registrationFee: event.registrationFee ?? 0,
    }))

  const therapy = coursesRaw
    .filter((course) => text(course?.status, 'ACTIVE').toUpperCase() !== 'CANCELLED')
    .filter((course) => {
      const category = text(course?.category).toUpperCase()
      const title = text(course?.courseTitle).toUpperCase()
      const description = text(course?.description).toUpperCase()
      return category.includes('THERAPY')
        || category.includes('SPECIAL')
        || title.includes('THERAPY')
        || description.includes('THERAPY')
    })
    .map((course) => ({
      id: `therapy-${course.id}`,
      sourceId: course.id,
      title: text(course.courseTitle, 'Therapy / training program'),
      org: schoolNameById.get(String(course.schoolId)) || 'School / Training Center',
      place: text(course.category, 'Therapy Program'),
      summary: text(course.description, 'Therapy or training course.'),
    }))
    .concat(
      therapyCentersRaw
        .map((center) => ({
          id: `therapy-center-${center.id}`,
          sourceId: center.id,
          title: text(center.name, 'Therapy Center'),
          org: text(center.specialization, 'Therapy Center'),
          place: joinLocation(center.address, center.city, center.state) || 'Location not specified',
          summary: text(center.description || center.bio, text(center.therapistsInfo, 'Professional therapy services available.')),
        }))
    )

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
  { to: '/guardian/schools', label: 'Schools' },
  { to: '/guardian/ngos', label: 'NGO Support' },
  { to: '/guardian/learning', label: 'Learning' },
  { to: '/guardian/events', label: 'Events' },
  { to: '/guardian/therapy', label: 'Therapy' },
  { to: '/guardian/help', label: 'Request Help' },
  { to: '/guardian/requests', label: 'Request History' },
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
