export const SCHOOL_WORKSPACE_NAV = [
  { to: '/school-workspace', label: 'Home' },
  { to: '/school-workspace/students', label: 'Students' },
  {
    to: '/school-workspace/programs',
    label: 'Programs',
    meta: { openDate: '2025-03-15', closeDate: '2025-06-30', applied: 34 },
  },
  { to: '/school-workspace/staff', label: 'Staff' },
  {
    to: '/school-workspace/admissions',
    label: 'Admissions',
    meta: { openDate: '2025-04-01', closeDate: '2025-05-20', applied: 18 },
  },
  { to: '/school-workspace/therapy', label: 'Therapy & Support' },
  { to: '/school-workspace/events', label: 'Events' },
  { to: '/school-workspace/achievements', label: 'Achievements' },
  { to: '/school-workspace/ngo-partners', label: 'NGO Partners' },
  { to: '/school-workspace/messages', label: 'Messages' },
]

export const SCHOOL_CAPABILITIES_VIEW = [
  'Student enrolment requests and progress reports',
  'Available NGO support and therapy partners',
  'Government schemes and eligibility guides',
  'Community events and parent communications',
]

export const SCHOOL_CAPABILITIES_DO = [
  'Create and update school / training center profile',
  'Manage student enrolments and therapy sessions',
  'Post programs, events, and achievement stories',
  'Collaborate with NGOs, volunteers, and CSR partners',
]

export const SCHOOL_FEATURES = {
  students: {
    title: 'Students',
    subtitle: 'Manage student enrolments, profiles, and progress tracking.',
    tab: 'students',
    tips: [
      'Add and update student profiles with disability type and support needs',
      'Track attendance, therapy sessions, and milestone progress',
      'Share progress reports with parents and caregivers',
    ],
  },
  programs: {
    title: 'Programs',
    subtitle: 'Publish training programs and curriculum offered by your institution.',
    tab: 'programs',
    tips: [
      'List vocational, life-skills, and academic programs',
      'Specify eligibility, duration, and certification details',
      'Accept enrollments and manage batch sizes',
    ],
  },
  staff: {
    title: 'Staff',
    subtitle: 'Manage teachers, therapists, and support personnel.',
    tab: 'staff',
    tips: [
      'Add staff profiles with specializations and roles',
      'Assign staff to programs or therapy sessions',
      'Track certifications and professional development',
    ],
  },
  admissions: {
    title: 'Admissions',
    subtitle: 'Review and process admission requests from parents and guardians.',
    tab: 'admissions',
    tips: [
      'Review incoming admission applications',
      'Accept, waitlist, or decline with a reason',
      'Schedule assessment visits for prospective students',
    ],
  },
  therapy: {
    title: 'Therapy & Support',
    subtitle: 'Manage therapy bookings, sessions, and special support services.',
    tab: 'therapy',
    tips: [
      'Set available time slots for therapy sessions',
      'Review and confirm bookings from students or guardians',
      'Track session outcomes and therapy goals',
    ],
  },
  events: {
    title: 'Events',
    subtitle: 'Create and manage school events, awareness drives, and open days.',
    tab: 'events',
    tips: [
      'Post events with date, venue, and registration link',
      'Invite parents, NGOs, and community partners',
      'Track RSVPs and participation',
    ],
  },
  achievements: {
    title: 'Achievements',
    subtitle: 'Showcase student achievements, milestones, and impact stories.',
    tab: 'achievements',
    tips: [
      'Add student success stories and milestone events',
      'Publish recognition certificates and awards',
      'Share achievements on the community network',
    ],
  },
  'ngo-partners': {
    title: 'NGO Partners',
    subtitle: 'Connect and collaborate with NGOs for additional support and resources.',
    tab: 'ngoPartners',
    tips: [
      'Browse NGOs offering therapy, devices, and sponsorship',
      'Send partnership requests for resource sharing',
      'Coordinate joint programs and community events',
    ],
  },
  messages: {
    title: 'Messages',
    subtitle: 'Manage communications with parents, NGOs, and community members.',
    tab: 'messages',
    tips: [
      'Respond to parent and guardian inquiries',
      'Coordinate with NGO and volunteer partners',
      'Send announcements and updates to your network',
    ],
  },
}
