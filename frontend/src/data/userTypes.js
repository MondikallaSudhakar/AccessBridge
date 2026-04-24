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
    role: 'SPECIAL_ABLED_PERSON',
    label: 'Specially Abled Person',
    loginPurpose: 'Join to gain independence through jobs, learning, income, support, and community access.',
    dashboardPath: '/special/profile',
    canView: [
      'Disability-friendly job listings and text/audio job application support',
      'Marketplace products and nearby NGO services',
      'Special schools, training programs, events, campaigns, and government schemes',
    ],
    canDo: [
      'Create a profile with skills, disability type, and support needs',
      'Apply for jobs with text or audio support',
      'Request NGO help and enroll in training',
      'Register for events and save opportunities',
    ],
  },
  {
    role: 'GUARDIAN_CAREGIVER',
    label: 'Guardian / Caregiver',
    loginPurpose: 'Join to support and manage opportunities for a dependent person through jobs, care, learning, and support services.',
    dashboardPath: '/guardian/profile',
    canView: [
      'Suitable jobs for dependent persons, special schools, therapy centers, NGOs, and support services',
      'Learning resources, events, awareness programs, and future progress tracking',
      'Dependent profile details used to personalize support opportunities',
    ],
    canDo: [
      'Create and manage a dependent profile',
      'Apply for jobs on behalf of the dependent',
      'Enroll in schools or training, request NGO support, and book therapy or training',
      'Save and track opportunities for later follow-up',
    ],
  },
  {
    role: 'SCHOOL_ADMIN',
    label: 'Special Schools / Training Centers',
    loginPurpose: 'To provide education, training, and student placement opportunities.',
    dashboardPath: '/school/profile',
    canView: [
      'Student profiles and skill tracking',
      'NGO partnerships and collaboration opportunities',
      'Job opportunities and student placement prospects',
      'Events, workshops, and announcements',
      'Volunteer and mentor availability',
    ],
    canDo: [
      'Create and manage student profiles with skills and status',
      'Post courses and training programs with detailed curriculum',
      'Enroll students and track their progress',
      'Upload and manage student skill profiles',
      'Issue certificates and track certifications',
      'Announce admissions, workshops, and events',
      'Partner with NGOs and companies for job placement and training support',
      'Manage volunteers, mentors, and staff availability',
    ],
  },
  {
    role: 'NGO_ADMIN',
    label: 'NGO Admin',
    loginPurpose: 'Join to provide support, expand impact, connect with beneficiaries, and collaborate with schools and CSR partners.',
    dashboardPath: '/ngo/profile',
    canView: [
      'User support requests (help needed), volunteer interest, and partner leads',
      'Special schools, partner organizations, events, campaigns, and NGO requirements',
      'Job opportunities from companies and impact profile details (past campaigns, support provided, total spend)',
    ],
    canDo: [
      'Create and update the NGO profile',
      'Accept or decline support requests and coordinate follow-up',
      'Post events, awareness campaigns, training programs, jobs, and resources (devices/services)',
      'Collaborate with schools/companies and connect users to jobs',
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