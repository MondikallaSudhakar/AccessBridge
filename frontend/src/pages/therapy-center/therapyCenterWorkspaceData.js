export const THERAPY_CENTER_WORKSPACE_NAV = [
  { to: '/therapy-center', label: 'Home' },
  { to: '/therapy-center/profile', label: 'Profile' },
  {
    to: '/therapy-center/therapy-types',
    label: 'Therapy Types',
    meta: { total: 8, active: 6 },
  },
  { to: '/therapy-center/bookings', label: 'Bookings' },
  { to: '/therapy-center/clients', label: 'Clients' },
  { to: '/therapy-center/appointments', label: 'Appointments' },
  { to: '/therapy-center/progress', label: 'Client Progress' },
  { to: '/therapy-center/requests', label: 'Support Requests' },
  { to: '/therapy-center/events', label: 'Events' },
  { to: '/therapy-center/campaigns', label: 'Campaigns' },
  { to: '/therapy-center/messages', label: 'Messages' },
]

export const THERAPY_CENTER_CAPABILITIES_VIEW = [
  'Therapy center profile and booking requests',
  'Client profiles and therapy progress',
  'Specially-abled persons needing services',
  'Guardian support requests and appointments',
  'Events and awareness programs',
]

export const THERAPY_CENTER_CAPABILITIES_DO = [
  'Create and manage therapy center profile',
  'Add and manage therapy types',
  'View and manage therapy requests',
  'Track therapy sessions and progress',
  'Communicate with clients and guardians',
  'Post events and campaigns',
]

export const THERAPY_CENTER_FEATURES = {
  profile: {
    title: 'Center Profile',
    subtitle: 'Create and manage your therapy center profile and specializations.',
    tab: 'profile',
  },
  'therapy-types': {
    title: 'Therapy Types',
    subtitle: 'Add and manage therapy types, costs, and details.',
    tab: 'therapyTypes',
  },
  bookings: {
    title: 'Bookings',
    subtitle: 'Manage therapy bookings and availability.',
    tab: 'bookings',
  },
  clients: {
    title: 'Clients',
    subtitle: 'View and manage your therapy clients.',
    tab: 'clients',
  },
  appointments: {
    title: 'Appointments',
    subtitle: 'Manage and schedule client appointments.',
    tab: 'appointments',
  },
  progress: {
    title: 'Client Progress',
    subtitle: 'Track and monitor client therapy progress.',
    tab: 'progress',
  },
  requests: {
    title: 'Support Requests',
    subtitle: 'Review and respond to client requests.',
    tab: 'requests',
  },
  events: {
    title: 'Events',
    subtitle: 'Create and manage events and awareness programs.',
    tab: 'events',
  },
  campaigns: {
    title: 'Campaigns',
    subtitle: 'Create and monitor awareness campaigns.',
    tab: 'campaigns',
  },
  messages: {
    title: 'Messages',
    subtitle: 'Open and manage conversations with clients.',
    tab: 'messages',
  },
}
