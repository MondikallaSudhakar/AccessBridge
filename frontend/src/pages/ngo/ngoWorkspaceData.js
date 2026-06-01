export const NGO_WORKSPACE_NAV = [
  { to: '/ngo', label: 'Home' },
  {
    to: '/ngo/requirements',
    label: 'Requirements',
    meta: { openDate: '2025-04-01', closeDate: '2025-05-15', applied: 7 },
  },
  { to: '/ngo/support-requests', label: 'Support Requests' },
  { to: '/ngo/volunteers', label: 'Volunteers' },
  { to: '/ngo/campaigns', label: 'Campaigns' },
  { to: '/ngo/events', label: 'Events' },
  {
    to: '/ngo/jobs',
    label: 'Jobs',
    meta: { openDate: '2025-04-10', closeDate: '2025-05-31', applied: 23 },
  },
  { to: '/ngo/products', label: 'Products' },
  { to: '/ngo/orders', label: 'Orders' },
  { to: '/ngo/services', label: 'Test' },
  { to: '/ngo/schoolsPartners', label: 'schoolsPartners',},
  { to: '/ngo/achievements', label: 'Achievements' },
  // { to: '/ngo/messages', label: 'Messages' },
  { to: '/ngo/csr', label: 'Corporate CSR' },
]

export const NGO_CAPABILITIES_VIEW = [
  'Support requests from users and beneficiaries',
  'Special schools, partners, events, and campaigns',
  'Jobs and impact profile details',
  'Volunteers and collaboration opportunities',
]

export const NGO_CAPABILITIES_DO = [
  'Create and update NGO profile',
  'Accept or decline support requests',
  'Post jobs, products, services, events, and campaigns',
  'Collaborate with schools, startups, and CSR partners',
]

export const NGO_FEATURES = {
  requirements: {
    title: 'Requirements',
    subtitle: 'Post and manage support requirements for your NGO.',
    tab: 'requirements',
  },
  'support-requests': {
    title: 'Support Requests',
    subtitle: 'Review incoming requests and coordinate follow-up.',
    tab: 'supportRequests',
  },
  volunteers: {
    title: 'Volunteer Opportunities',
    subtitle: 'Post volunteer roles and manage volunteer applications.',
    tab: 'volunteers',
  },
  campaigns: {
    title: 'Campaigns',
    subtitle: 'Create and monitor awareness and impact campaigns.',
    tab: 'campaigns',
  },
  events: {
    title: 'Events',
    subtitle: 'Create and manage events for specially-abled persons and the community.',
    tab: 'events',
  },
  jobs: {
    title: 'Jobs',
    subtitle: 'Post inclusive jobs and connect beneficiaries to work.',
    tab: 'jobs',
  },
  products: {
    title: 'Products',
    subtitle: 'Publish products and social-impact resources.',
    tab: 'products',
  },
  services: {
    title: 'Services',
    subtitle: 'List NGO services and beneficiary support options.',
    tab: 'services',
  },
  schoolsPartners: {
    title: 'Schools & Partners',
    subtitle: 'Collaborate with schools and training centers.',
    tab: 'schoolsPartners',
  },
  achievements: {
    title: 'Achievements',
    subtitle: 'Showcase impact milestones and stories.',
    tab: 'achievements',
  },
  // messages: {
  //   title: 'Messages',
  //   subtitle: 'Open and manage conversations with users.',
  //   tab: 'messages',
  // },
  csr: {
    title: 'Corporate CSR',
    subtitle: 'Track CSR collaboration opportunities and partnership flow.',
    tab: 'overview',
  },
}