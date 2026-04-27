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

export const OPPORTUNITIES = {
  jobs: [
    {
      id: 'job-1',
      title: 'Customer Support Associate',
      org: 'Inclusive Care Services',
      place: 'Remote / Flexible hours',
      summary: 'Text-first support role with assistive tooling and part-time onboarding.',
    },
    {
      id: 'job-2',
      title: 'Data Entry & Admin Assistant',
      org: 'GreenBridge NGO',
      place: 'Hybrid • Delhi NCR',
      summary: 'Structured tasks, screen-reader friendly workflow, and mentor support.',
    },
  ],
  marketplace: [
    {
      id: 'market-1',
      title: 'Affordable Assistive Keyboard',
      org: 'MobilityWorks Startup',
      place: 'Buy now',
      summary: 'Ergonomic keyboard designed for easier typing and low-fatigue use.',
    },
    {
      id: 'market-2',
      title: 'Talking Calculator',
      org: 'AccessTech Startup',
      place: 'Buy now',
      summary: 'Audio feedback calculator for independent learning and daily use.',
    },
  ],
  ngos: [
    {
      id: 'ngo-1',
      title: 'Nearby NGO Services',
      org: 'HopeAbility Foundation',
      place: '2.4 km away',
      summary: 'Mobility support, counselling, and benefits guidance for families.',
    },
    {
      id: 'ngo-2',
      title: 'Assistive Device Help Desk',
      org: 'Unity Support Trust',
      place: '3.1 km away',
      summary: 'Requests for devices, documentation help, and follow-up support.',
    },
  ],
  training: [
    {
      id: 'school-1',
      title: 'Special School & Training Program',
      org: 'Bright Path School',
      place: 'Vocational training',
      summary: 'Life skills, digital literacy, and job-readiness classes.',
    },
    {
      id: 'school-2',
      title: 'Skill Bridge Training',
      org: 'Learning for All Institute',
      place: 'Certification available',
      summary: 'Short-term accessible learning with mentoring and placement help.',
    },
  ],
  events: [
    {
      id: 'event-1',
      title: 'Accessibility Careers Meetup',
      org: 'Community Network',
      place: 'Next Saturday • Hybrid',
      summary: 'Meet employers who design inclusive hiring pipelines.',
    },
    {
      id: 'event-2',
      title: 'Assistive Tech Demo Day',
      org: 'Innovation Hub',
      place: 'This month • On-site',
      summary: 'Try tools, ask questions, and connect with support partners.',
    },
  ],
  campaigns: [
    {
      id: 'campaign-1',
      title: 'Inclusive Hiring Campaign',
      org: 'BetterWork Alliance',
      place: 'Upcoming campaign',
      summary: 'Recruiters looking specifically for accessible work placements.',
    },
    {
      id: 'campaign-2',
      title: 'Mobility Support Drive',
      org: 'Local NGOs Collective',
      place: 'Donate or volunteer',
      summary: 'Community campaign for wheelchairs, aids, and transport support.',
    },
  ],
  schemes: [
    {
      id: 'scheme-1',
      title: 'Govt Disability Benefit Guide',
      org: 'Central schemes',
      place: 'Documents & eligibility',
      summary: 'Shortlist of benefits, registration steps, and required documents.',
    },
    {
      id: 'scheme-2',
      title: 'Employment Assistance Scheme',
      org: 'Public welfare programs',
      place: 'Support and grants',
      summary: 'Job support, training assistance, and assistive aid information.',
    },
  ],
}

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
