export const USER_TYPE_GUIDES = [
  {
    role: 'USER',
    label: 'Member / Donor',
    loginPurpose: 'Join to discover verified schools, NGOs, and startups, then support the ones that match your interests.',
    dashboardPath: '/dashboard',
    canView: [
      'Public directory of schools, NGOs, startups, products, and search results',
      'Verified organization profiles with needs, jobs, achievements, services, and marketplace items',
      'Your messages, donation activity, and community updates',
    ],
    canDo: [
      'Browse and search the community directory',
      'Open organization profiles and review public requests',
      'Send messages and make donations',
      'Track impact from the community feed',
    ],
  },
  {
    role: 'SCHOOL_ADMIN',
    label: 'School Admin',
    loginPurpose: 'Join to publish school needs, show achievements, and attract supporters for your institution.',
    dashboardPath: '/school/profile',
    canView: [
      'School profile and public school directory',
      'Needs, achievements, and support requests for schools',
      'Messages and engagement related to the school profile',
    ],
    canDo: [
      'Create and update the school profile',
      'Post needs and close completed requests',
      'Publish achievements and media',
      'Review donor interest and incoming messages',
    ],
  },
  {
    role: 'NGO_ADMIN',
    label: 'NGO Admin',
    loginPurpose: 'Join to run campaigns, recruit support, publish services, and coordinate community response.',
    dashboardPath: '/ngo/profile',
    canView: [
      'NGO profile, NGO directory, and public directory search',
      'Needs, jobs, products, services, and achievements linked to the NGO',
      'Incoming messages from donors and community members',
    ],
    canDo: [
      'Create and update the NGO profile',
      'Post needs, jobs, products, services, and achievements',
      'Close or update open community requests',
      'Reply to messages and manage community engagement',
    ],
  },
  {
    role: 'STARTUP_ADMIN',
    label: 'Startup Admin',
    loginPurpose: 'Join to showcase social-impact products, manage inventory, and reach buyers and partners.',
    dashboardPath: '/startup/profile',
    canView: [
      'Startup profile, verified startup directory, and marketplace listings',
      'Public product catalog and organization details',
      'Community search and directory visibility',
    ],
    canDo: [
      'Create and update the startup profile',
      'List and manage products',
      'Update stock and availability',
      'Promote impact-led products through the marketplace',
    ],
  },
  {
    role: 'SUPER_ADMIN',
    label: 'Super Admin',
    loginPurpose: 'Join to review applications, approve organizations, and moderate the full platform.',
    dashboardPath: '/admin/approvals',
    canView: [
      'Pending approvals and all organization records',
      'Platform-wide moderation queues and user status',
      'Every public and protected management area',
    ],
    canDo: [
      'Approve or reject pending registrations',
      'Verify schools, NGOs, and startups',
      'Moderate records and oversee platform integrity',
    ],
  },
]

export function getUserTypeGuide(role) {
  return USER_TYPE_GUIDES.find((item) => item.role === role) || null
}

export function getRoleLandingPath(role) {
  return getUserTypeGuide(role)?.dashboardPath || '/dashboard'
}