export const USER_TYPE_GUIDES = [
  {
    role: 'USER',
    label: 'General User / Viewer',
    loginPurpose: 'Explore, learn, and stay aware about the ecosystem without posting.',
    dashboardPath: '/dashboard',
    canView: [
      'Platform updates and awareness content',
      'Success stories from schools, NGOs, and community partners',
      'Product listings, events, and public ecosystem information',
    ],
    canDo: [
      'Browse and search the community directory',
      'View products, events, stories, and updates',
      'Upgrade later to an active role like volunteer, buyer, or organization user',
    ],
  },
  {
    role: 'VOLUNTEER',
    label: 'Normal Public / Volunteer',
    loginPurpose: 'To contribute time, skills, and support to the community.',
      dashboardPath: '/volunteer',
    canView: [
      'NGO needs and requests',
      'Volunteer opportunities',
      'Events and campaigns',
      'Schools needing mentors',
      'Impact stories and community outcomes',
    ],
    canDo: [
      'Register as a volunteer',
      'Apply for volunteering roles',
      'Offer mentorship or training',
      'Join events and campaigns',
      'Support campaigns in the future',
    ],
  },
  {
    role: 'SPECIAL_ABLED_PERSON',
    label: 'Specially Abled Person',
    loginPurpose: 'Join to gain independence through jobs, learning, income, support, and community access.',
    dashboardPath: '/special',
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
    dashboardPath: '/guardian',
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
    role: 'THERAPY_CENTER_ADMIN',
    label: 'Therapy Centers',
    loginPurpose: 'Join to provide therapeutic services, manage therapy programs, and support specially-abled persons and their guardians.',
    dashboardPath: '/therapy-center',
    canView: [
      'Therapy center profile and booking requests',
      'Client profiles and therapy progress',
      'Specially-abled persons needing therapy services',
      'Guardian support requests and appointments',
      'Events and awareness programs',
    ],
    canDo: [
      'Create and update therapy center profile and specializations',
      'Add and manage therapy types with costs and details',
      'View and manage therapy requests from users and guardians',
      'Track therapy sessions and client progress',
      'Communicate with clients and guardians',
      'Post events and awareness campaigns',
      'Manage bookings and appointments',
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