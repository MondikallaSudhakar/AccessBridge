export const VOLUNTEER_WORKSPACE_NAV = [
  { to: '/volunteer', label: 'Home' },
  { to: '/volunteer/opportunities', label: 'Opportunities' },
  { to: '/volunteer/ngo-needs', label: 'NGO Needs' },
  { to: '/volunteer/events', label: 'Events & Campaigns' },
  { to: '/volunteer/schools', label: 'Schools & Mentors' },
  { to: '/volunteer/stories', label: 'Impact Stories' },
  { to: '/volunteer/applications', label: 'My Applications' },
]

export const VOLUNTEER_CAPABILITIES_VIEW = [
  'NGO volunteer opportunities and support needs',
  'Events, campaigns, and community initiatives',
  'Schools needing mentors and support',
  'Impact stories and success cases',
]

export const VOLUNTEER_CAPABILITIES_DO = [
  'Create volunteer profile with skills and availability',
  'Apply for volunteer opportunities posted by NGOs',
  'Track volunteer applications and status',
  'Join events and campaigns',
]

export const VOLUNTEER_FEATURES = {
  opportunities: {
    title: 'Volunteer Opportunities',
    subtitle: 'Browse and apply for volunteer roles posted by NGOs.',
  },
  'ngo-needs': {
    title: 'NGO Needs & Requests',
    subtitle: 'View support requests and volunteer needs from organizations.',
  },
  events: {
    title: 'Events & Campaigns',
    subtitle: 'Participate in community events and awareness campaigns.',
  },
  schools: {
    title: 'Schools & Mentor Roles',
    subtitle: 'Find schools looking for mentors and supporters.',
  },
  stories: {
    title: 'Impact Stories',
    subtitle: 'Read stories of volunteers and their impact in communities.',
  },
  applications: {
    title: 'My Applications',
    subtitle: 'Track your volunteer applications and their status.',
  },
}

export async function loadVolunteerOpportunities() {
  try {
    const [
      opportunitiesRes,
      ngoNeedsRes,
      eventsRes,
      schoolNeedsRes,
      storiesRes,
    ] = await Promise.allSettled([
      fetch('http://localhost:8081/api/volunteer-opportunities').then(r => r.ok ? r.json() : []),
      fetch('http://localhost:8081/api/ngos/needs').then(r => r.ok ? r.json() : []),
      fetch('http://localhost:8081/api/events/public').then(r => r.ok ? r.json() : []),
      fetch('http://localhost:8081/api/schools/needs').then(r => r.ok ? r.json() : []),
      fetch('http://localhost:8081/api/achievements').then(r => r.ok ? r.json() : []),
    ])

    return {
      opportunities: opportunitiesRes.status === 'fulfilled' ? Array.isArray(opportunitiesRes.value) ? opportunitiesRes.value : [] : [],
      ngoNeeds: ngoNeedsRes.status === 'fulfilled' ? Array.isArray(ngoNeedsRes.value) ? ngoNeedsRes.value : [] : [],
      events: eventsRes.status === 'fulfilled' ? Array.isArray(eventsRes.value) ? eventsRes.value : [] : [],
      schoolNeeds: schoolNeedsRes.status === 'fulfilled' ? Array.isArray(schoolNeedsRes.value) ? schoolNeedsRes.value : [] : [],
      stories: storiesRes.status === 'fulfilled' ? Array.isArray(storiesRes.value) ? storiesRes.value : [] : [],
    }
  } catch (err) {
    return {
      opportunities: [],
      ngoNeeds: [],
      events: [],
      schoolNeeds: [],
      stories: [],
    }
  }
}
