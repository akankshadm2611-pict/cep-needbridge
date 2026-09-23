import { 
  Campaign, 
  VolunteerOpportunity, 
  VolunteerRequest, 
  DonationRecord, 
  BeneficiaryBreakdown, 
  ReviewItem, 
  UserProfile, 
  ImpactStats 
} from '../types';

export const INITIAL_PROFILES: Record<string, UserProfile> = {
  volunteer: {
    id: 'vol-aarohi-1',
    name: 'Aarohi Sharma',
    role: 'volunteer',
    email: 'aarohi.sharma@example.org',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    location: 'Pune, Maharashtra',
    bio: 'Passionate about youth education and environmental conservation drives.',
    tagline: 'Small actions create big change.'
  },
  ngo: {
    id: 'ngo-helping-hands-1',
    name: 'Helping Hands Foundation',
    role: 'ngo',
    email: 'contact@helpinghandsngo.org',
    organizationName: 'Helping Hands NGO',
    avatar: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=150&auto=format&fit=crop&q=80',
    location: 'Pune & Mumbai, Maharashtra',
    bio: 'Empowering marginalized communities through food security, health camps, and children education.',
    tagline: 'Bridging needs with dedicated action.'
  },
  donor_seeker: {
    id: 'donor-meera-1',
    name: 'Meera Iyer',
    role: 'donor_seeker',
    email: 'meera.iyer@example.org',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    location: 'Pune, Maharashtra',
    bio: 'Social impact investor and community wellbeing advocate.',
    tagline: 'Your kindness creates real change.'
  }
};

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-1',
    title: 'Food for Everyone',
    organizationName: 'Helping Hands NGO',
    organizationPhone: '+91 98220 12345',
    organizationEmail: 'drives@helpinghandsngo.org',
    location: 'Shivajinagar, Pune, Maharashtra',
    city: 'Pune',
    address: 'Community Relief Center, Behind District Court, Shivajinagar, Pune 411005',
    latitude: 18.5314,
    longitude: 73.8446,
    category: 'Food Support',
    raisedAmount: 120000,
    targetAmount: 150000,
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=80',
    description: 'Providing daily warm, nutritious meals and dry grocery ration kits to daily wage workers, shelter homes, and migrant laborers across rural and suburban Pune.',
    urgent: true,
    volunteersNeeded: 25,
    volunteersEnrolled: 20,
    beneficiariesCount: 450,
    startDate: '2026-05-20',
    endDate: '2026-06-20',
    eventTime: '06:00 PM - 09:00 PM (Daily)',
    organizerContact: 'Dr. Suresh Kadam (+91 98220 12345)',
    requirements: [
      'Financial support for raw grains & cooking oil',
      'Food packaging volunteers on weekday evenings',
      'Delivery volunteers with two-wheelers/vans',
      'Strict adherence to food hygiene standards'
    ],
    perks: [
      '100% Tax Exemption 80G Receipt',
      'Monthly Transparent Utilization Report',
      'Digital Certificate of Appreciation'
    ]
  },
  {
    id: 'camp-2',
    title: 'Education Support Program',
    organizationName: 'Asha Foundation',
    organizationPhone: '+91 94225 67890',
    organizationEmail: 'contact@ashafoundation.org',
    location: 'Kothrud, Pune, Maharashtra',
    city: 'Pune',
    address: 'Asha Shiksha Kendra, Near MIT College Road, Kothrud, Pune 411038',
    latitude: 18.5074,
    longitude: 73.8077,
    category: 'Education',
    raisedAmount: 85000,
    targetAmount: 130000,
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80',
    description: 'Supplying school kits, STEM learning materials, digital tablets, and after-school tutoring for 200+ underprivileged students in government schools.',
    urgent: false,
    volunteersNeeded: 15,
    volunteersEnrolled: 11,
    beneficiariesCount: 220,
    startDate: '2026-05-25',
    endDate: '2026-07-15',
    eventTime: '04:00 PM - 07:00 PM (Mon-Fri)',
    organizerContact: 'Pooja Deshmukh (+91 94225 67890)',
    requirements: [
      'Sponsorship for student textbook & stationery kits',
      'Weekend volunteer math & science teachers',
      'Donations of refurbished tablets or laptops'
    ],
    perks: [
      'Verified 80G Tax Exemption Receipt',
      'Direct student progress letter & annual report',
      'Invited to annual school exhibition day'
    ]
  },
  {
    id: 'camp-3',
    title: 'Medical Camp Initiative',
    organizationName: 'Health First NGO',
    organizationPhone: '+91 98810 54321',
    organizationEmail: 'care@healthfirstngo.org',
    location: 'Hadapsar, Pune, Maharashtra',
    city: 'Pune',
    address: 'Primary Health Center Ground, Saswad Road, Hadapsar, Pune 411028',
    latitude: 18.5089,
    longitude: 73.9260,
    category: 'Healthcare',
    raisedAmount: 40000,
    targetAmount: 100000,
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80',
    description: 'Conducting free primary health checkups, vision tests with free spectacles, pediatric consultations, and essential medicine distribution for urban slum clusters.',
    urgent: true,
    volunteersNeeded: 20,
    volunteersEnrolled: 8,
    beneficiariesCount: 300,
    startDate: '2026-06-01',
    endDate: '2026-06-03',
    eventTime: '08:30 AM - 04:30 PM',
    organizerContact: 'Dr. Anita Joshi (+91 98810 54321)',
    requirements: [
      'Funding for prescription drugs and cataract screenings',
      'Paramedical & general queue management volunteers',
      'Volunteer doctors for pediatric & geriatric screening'
    ],
    perks: [
      'Official NGO Health Partner Badge',
      'Tax deductible donation receipt',
      'Volunteer Medical Service Certificate'
    ]
  },
  {
    id: 'camp-4',
    title: 'Clothes Donation Drive',
    organizationName: 'Humanity Care',
    organizationPhone: '+91 98200 98765',
    organizationEmail: 'info@humanitycaremumbai.org',
    location: 'Bandra West, Mumbai, Maharashtra',
    city: 'Mumbai',
    address: 'Bandra Reclamation Community Pavilion, Bandra West, Mumbai 400050',
    latitude: 19.0596,
    longitude: 72.8295,
    category: 'Community',
    raisedAmount: 75000,
    targetAmount: 105000,
    imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&auto=format&fit=crop&q=80',
    description: 'Collecting, sorting, sanitizing, and distributing seasonal clean clothing, raincoats, and blankets to homeless families and shelter residences across Greater Mumbai.',
    urgent: false,
    volunteersNeeded: 18,
    volunteersEnrolled: 14,
    beneficiariesCount: 400,
    startDate: '2026-05-22',
    endDate: '2026-06-10',
    eventTime: '10:00 AM - 05:00 PM',
    organizerContact: 'Vikram Mehta (+91 98200 98765)',
    requirements: [
      'Gently used or new clean clothing for all age groups',
      'Volunteers for sorting, sizing, and packing boxes',
      'Van drivers for transportation to night shelters'
    ],
    perks: [
      'Verified Social Impact Certificate',
      '80G Donation Receipt',
      'Community Contributor Recognition'
    ]
  },
  {
    id: 'camp-5',
    title: 'Clean & Green Coastal Society',
    organizationName: 'Eco Warriors Trust',
    organizationPhone: '+91 98600 11223',
    organizationEmail: 'green@ecowarriorstrust.org',
    location: 'Varsoli Beach, Alibaug, Maharashtra',
    city: 'Alibaug',
    address: 'Varsoli Beach Entrance & Coastal Conservation Point, Alibaug 402201',
    latitude: 18.6548,
    longitude: 72.8682,
    category: 'Environment',
    raisedAmount: 25000,
    targetAmount: 50000,
    imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80',
    description: 'Weekly coastal microplastic cleanup, mangrove sapling plantations, waste segregation bins installation, and community composting training workshops.',
    urgent: false,
    volunteersNeeded: 40,
    volunteersEnrolled: 22,
    beneficiariesCount: 650,
    startDate: '2026-05-28',
    endDate: '2026-06-28',
    eventTime: '07:00 AM - 11:30 AM (Weekends)',
    organizerContact: 'Rohan Sawant (+91 98600 11223)',
    requirements: [
      'Physical cleanup volunteers (gloves & bags provided)',
      'Funding for saplings, tree guards, and coastal bins',
      'Local student volunteers for eco-awareness street plays'
    ],
    perks: [
      'Environmental Stewardship Certificate',
      'Breakfast, Refreshments & Cleanup kit provided',
      'Tree Adoption Digital Certificate'
    ]
  },
  {
    id: 'camp-6',
    title: 'Women Empowerment & Skill Center',
    organizationName: 'Shakti Welfare',
    organizationPhone: '+91 97654 33211',
    organizationEmail: 'shakti@shaktipune.org',
    location: 'Pimpri-Chinchwad, Pune, Maharashtra',
    city: 'Pune',
    address: 'Shakti Center, Sector 24, Pradhikaran, Nigdi, Pimpri-Chinchwad 411044',
    latitude: 18.6558,
    longitude: 73.7719,
    category: 'Women Support',
    raisedAmount: 62000,
    targetAmount: 90000,
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
    description: 'Vocational sewing, computer literacy, accounting basics, and micro-entrepreneurship training for 120 women from marginalized households to achieve financial independence.',
    urgent: false,
    volunteersNeeded: 10,
    volunteersEnrolled: 8,
    beneficiariesCount: 120,
    startDate: '2026-06-05',
    endDate: '2026-08-30',
    eventTime: '02:00 PM - 05:30 PM (Mon-Sat)',
    organizerContact: 'Sunita Patil (+91 97654 33211)',
    requirements: [
      'Funding for industrial sewing machines & laptops',
      'Volunteers for spoken English & basic computer training',
      'Mentorship for small handicraft product marketing'
    ],
    perks: [
      'Quarterly Beneficiary Transformation Digest',
      '80G Tax Exemption Certificate',
      'Handmade gratitude merchandise by women artisans'
    ]
  }
];

export const INITIAL_OPPORTUNITIES: VolunteerOpportunity[] = [
  {
    id: 'opp-1',
    title: 'Teach at Community Learning Center',
    organizationName: 'Helping Hands NGO',
    organizationPhone: '+91 98220 12345',
    organizationEmail: 'volunteer@helpinghandsngo.org',
    category: 'Teaching',
    hoursPerDay: '2 hrs / day',
    location: 'Shivajinagar, Pune, Maharashtra',
    city: 'Pune',
    address: 'Community Learning Hub, Near Shivaji Park, Shivajinagar, Pune 411005',
    latitude: 18.5314,
    longitude: 73.8446,
    startsFrom: '25 May 2026',
    endDate: '25 June 2026',
    timeSlot: '04:00 PM - 06:00 PM (Mon to Fri)',
    duration: '4 Weeks',
    description: 'Teach basic English grammar, mental arithmetic, and engaging science experiments to enthusiastic primary school students from low-income families.',
    skillsRequired: ['Basic English', 'Patience', 'Creativity', 'Elementary Maths'],
    requirementsChecklist: [
      'Age 18+ with high school / college background',
      'Commitment of at least 4 consecutive weeks',
      'Bring your own notebook/pen, teaching aids provided',
      'Positive, supportive, child-friendly attitude'
    ],
    perksAndBenefits: [
      'Official Certificate of Volunteering (Stamped by Registered NGO)',
      'Community Service Hours Creditation (40 Hours)',
      'Letter of Recommendation for top volunteers',
      'Daily tea and snack refreshments provided'
    ],
    spotsLeft: 5,
    totalSpots: 15,
    applied: false,
    imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400&auto=format&fit=crop&q=80',
    urgency: 'Normal'
  },
  {
    id: 'opp-2',
    title: 'Coastal Beach & Mangrove Cleanup Drive',
    organizationName: 'Eco Warriors Trust',
    organizationPhone: '+91 98600 11223',
    organizationEmail: 'join@ecowarriorstrust.org',
    category: 'Environment',
    hoursPerDay: '3.5 hrs / session',
    location: 'Varsoli Beach, Alibaug',
    city: 'Alibaug',
    address: 'Varsoli Beach Main Gate & Coastline, Alibaug, Maharashtra 402201',
    latitude: 18.6548,
    longitude: 72.8682,
    startsFrom: '28 May 2026',
    endDate: '29 May 2026',
    timeSlot: '06:30 AM - 10:00 AM (Weekend)',
    duration: 'Weekend Drive',
    description: 'Join hands with local fishermen and environmentalists to clear marine plastic waste, segregate recyclables, and install coastal awareness signboards.',
    skillsRequired: ['Team Spirit', 'Physical Stamina', 'Environmental Awareness'],
    requirementsChecklist: [
      'Wear sturdy closed shoes and comfortable outdoor clothing',
      'Bring a reusable water bottle and sun cap',
      'Biodegradable gloves and grabbers provided on spot',
      'Participants below 16 must be accompanied by guardian'
    ],
    perksAndBenefits: [
      'Eco-Warrior Impact Certificate of Participation',
      'Fresh coastal breakfast and hydration beverages provided',
      'Hands-on marine waste segregation workshop credit',
      'Free Eco Warriors Trust cotton volunteer t-shirt'
    ],
    spotsLeft: 12,
    totalSpots: 30,
    applied: false,
    imageUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=400&auto=format&fit=crop&q=80',
    urgency: 'High'
  },
  {
    id: 'opp-3',
    title: 'Free Medical Camp & Patient Support',
    organizationName: 'Health First NGO',
    organizationPhone: '+91 98810 54321',
    organizationEmail: 'medical@healthfirstngo.org',
    category: 'Healthcare',
    hoursPerDay: '6 hrs / day',
    location: 'Hadapsar Slum Clusters, Pune',
    city: 'Pune',
    address: 'Primary Health Center Ground, Saswad Road, Hadapsar, Pune 411028',
    latitude: 18.5089,
    longitude: 73.9260,
    startsFrom: '1 June 2026',
    endDate: '2 June 2026',
    timeSlot: '08:30 AM - 02:30 PM (Sat-Sun)',
    duration: '2 Days Weekend',
    description: 'Assist licensed medical doctors with patient registrations, preliminary vitals tracking (BP/Pulse), crowd guidance, and packaging free prescription medicine kits.',
    skillsRequired: ['Empathy', 'Basic First Aid / Vitals Tracking', 'Queue Coordination', 'Marathi / Hindi Spoken'],
    requirementsChecklist: [
      'Nursing, pharmacy, pre-med students or trained volunteers preferred',
      'Arrive 30 minutes prior for the morning briefing',
      'Face masks and sanitizers will be provided',
      'Respect patient privacy and data confidentiality'
    ],
    perksAndBenefits: [
      'Healthcare Volunteer Service Certificate signed by CMO',
      'Clinical field experience hours logbook signoff',
      'Nutritious packed lunch and beverages provided',
      'Medical Kit Appreciation Hamper'
    ],
    spotsLeft: 6,
    totalSpots: 20,
    applied: false,
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&auto=format&fit=crop&q=80',
    urgency: 'High'
  },
  {
    id: 'opp-4',
    title: 'Surplus Food Rescue & Evening Dispatch',
    organizationName: 'Food For Everyone Network',
    organizationPhone: '+91 98234 88776',
    organizationEmail: 'rescue@foodforeveryone.org',
    category: 'Food Distribution',
    hoursPerDay: '3 hrs / evening',
    location: 'Pune Railway Station & Swargate Area',
    city: 'Pune',
    address: 'Food Dispatch Hub, Station Road, Near Pune Junction 411001',
    latitude: 18.5284,
    longitude: 73.8743,
    startsFrom: '22 May 2026',
    endDate: 'Ongoing / Flexible',
    timeSlot: '07:30 PM - 10:30 PM',
    duration: 'Flexible / Ongoing',
    description: 'Coordinate surplus food collection from banquet halls and restaurants, inspect freshness, pack hygienic hot meal containers, and safely distribute to night shelters.',
    skillsRequired: ['Valid Driving License / Bike', 'Punctuality', 'Hygienic Food Handling'],
    requirementsChecklist: [
      'Own two-wheeler or four-wheeler preferred for transit',
      'Strict adherence to the 2-hour food safety temperature rule',
      'Hairnets and disposable gloves mandatory (provided)',
      'Available at least 2 evenings per week'
    ],
    perksAndBenefits: [
      'Verified Hunger Relief Hero Certificate',
      'Fuel reimbursement for distribution routes',
      'Real-time meal impact tracker on your volunteer profile',
      'Community volunteer dinner once a month'
    ],
    spotsLeft: 8,
    totalSpots: 25,
    applied: true,
    imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&auto=format&fit=crop&q=80',
    urgency: 'High'
  },
  {
    id: 'opp-5',
    title: 'Elderly Digital Literacy & Smartphone Mentor',
    organizationName: 'Golden Age Care',
    organizationPhone: '+91 94220 99887',
    organizationEmail: 'seniors@goldenagecare.org',
    category: 'Elderly Care',
    hoursPerDay: '2 hrs / session',
    location: 'Kothrud Senior Center, Pune',
    city: 'Pune',
    address: 'Vrudhashram Community Hall, Paud Road, Kothrud, Pune 411038',
    latitude: 18.5042,
    longitude: 73.8015,
    startsFrom: '5 June 2026',
    endDate: '26 June 2026',
    timeSlot: '10:30 AM - 12:30 PM (Tue & Thu)',
    duration: '3 Weeks',
    description: 'Teach senior citizens step-by-step how to make WhatsApp video calls to family, use UPI payment apps safely against scams, book online doctor appointments, and order medicines.',
    skillsRequired: ['Patience & Warm Demeanor', 'Smartphone Knowledge', 'Clear Communication'],
    requirementsChecklist: [
      'Fluency in Hindi or Marathi or English',
      'Patience to explain smartphone features multiple times with kindness',
      'Basic cyber safety awareness',
      'Commitment to 2 morning sessions per week for 3 weeks'
    ],
    perksAndBenefits: [
      'Senior Care Mentorship Honor Certificate',
      'Heartfelt handmade thank you cards from senior beneficiaries',
      'Tea and traditional snacks during workshop sessions',
      'Eligible for Outstanding Youth Mentor Award'
    ],
    spotsLeft: 4,
    totalSpots: 10,
    applied: false,
    imageUrl: 'https://images.unsplash.com/photo-1516307365426-bea591f05011?w=400&auto=format&fit=crop&q=80',
    urgency: 'Normal'
  }
];

export const INITIAL_VOLUNTEER_REQUESTS: VolunteerRequest[] = [
  {
    id: 'req-1',
    volunteerName: 'Neha Sharma',
    volunteerEmail: 'neha.s@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    opportunityTitle: 'Teaching Program',
    appliedDate: '15 May 2026',
    status: 'pending',
    note: 'B.Ed student with 2 years prior volunteer tutoring experience.'
  },
  {
    id: 'req-2',
    volunteerName: 'Rohan Verma',
    volunteerEmail: 'rohan.v@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    opportunityTitle: 'Food Distribution',
    appliedDate: '14 May 2026',
    status: 'pending',
    note: 'Has two-wheeler vehicle and available every weekday evening.'
  },
  {
    id: 'req-3',
    volunteerName: 'Simran Kaur',
    volunteerEmail: 'simran.k@outlook.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    opportunityTitle: 'Medical Camp',
    appliedDate: '14 May 2026',
    status: 'pending',
    note: 'Nursing student looking to assist with vital sign checks.'
  },
  {
    id: 'req-4',
    volunteerName: 'Aditya Patil',
    volunteerEmail: 'aditya.patil@yahoo.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    opportunityTitle: 'Beach Cleanup',
    appliedDate: '13 May 2026',
    status: 'pending',
    note: 'Environmental science enthusiast leading a student group of 4.'
  },
  {
    id: 'req-5',
    volunteerName: 'Tanvi Desai',
    volunteerEmail: 'tanvi.d@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    opportunityTitle: 'Clothes Donation Drive',
    appliedDate: '12 May 2026',
    status: 'accepted',
    note: 'Assisting in garment sorting and cataloging.'
  }
];

export const INITIAL_DONATIONS: DonationRecord[] = [
  {
    id: 'don-1',
    donorName: 'Priya Mehta',
    donorEmail: 'priya.m@gmail.com',
    campaignTitle: 'Food for Everyone',
    organizationName: 'Helping Hands NGO',
    amount: 5000,
    date: '15 May 2026',
    timeAgo: 'Today',
    receiptNumber: 'REC-2026-8841'
  },
  {
    id: 'don-2',
    donorName: 'Ankit Shah',
    donorEmail: 'ankit.s@gmail.com',
    campaignTitle: 'Medical Camp Initiative',
    organizationName: 'Health First NGO',
    amount: 2500,
    date: '15 May 2026',
    timeAgo: 'Today',
    receiptNumber: 'REC-2026-8842'
  },
  {
    id: 'don-3',
    donorName: 'Rahul Deshmukh',
    donorEmail: 'rahul.d@yahoo.com',
    campaignTitle: 'Education Support Program',
    organizationName: 'Asha Foundation',
    amount: 10000,
    date: '14 May 2026',
    timeAgo: 'Yesterday',
    receiptNumber: 'REC-2026-8839'
  },
  {
    id: 'don-4',
    donorName: 'Sneha Kulkarni',
    donorEmail: 'sneha.k@outlook.com',
    campaignTitle: 'Clothes Donation Drive',
    organizationName: 'Humanity Care',
    amount: 3000,
    date: '13 May 2026',
    timeAgo: '2 days ago',
    receiptNumber: 'REC-2026-8830'
  }
];

export const INITIAL_BENEFICIARIES: BeneficiaryBreakdown = {
  children: 320,
  women: 240,
  elderly: 140,
  others: 120,
  total: 820
};

export const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    authorName: 'Dr. Vivek Ranade',
    role: 'NGO Lead',
    organizationOrCity: 'Helping Hands NGO, Pune',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    feedback: 'NeedBridge has completely eliminated our volunteer recruitment bottlenecks. In just 48 hours, we mobilized 20 committed volunteers for our rural health outreach and collected transparent community donations.',
    date: '12 May 2026',
    category: 'NGO Experience',
    verified: true
  },
  {
    id: 'rev-2',
    authorName: 'Aarohi Sharma',
    role: 'Volunteer',
    organizationOrCity: 'Volunteer Mentor, Pune',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    feedback: 'The ability to find micro-volunteering drives matching my weekend schedule has been life-changing. Everything from attendance logging to verified certificates is crystal clear!',
    date: '10 May 2026',
    category: 'Volunteering',
    verified: true
  },
  {
    id: 'rev-3',
    authorName: 'Sunita Gaikwad',
    role: 'Community Beneficiary',
    organizationOrCity: 'Khadki Community Center',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    feedback: 'When our community schooling wing lacked books and science kits, posting on NeedBridge connected us with Asha Foundation within two days. Our 60 students are now learning joyfully.',
    date: '08 May 2026',
    category: 'Community Impact',
    verified: true
  },
  {
    id: 'rev-4',
    authorName: 'Meera Iyer',
    role: 'Donor',
    organizationOrCity: 'Impact Supporter, Mumbai',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    feedback: 'Transparent milestone updates and instant automated tax receipts give me 100% confidence that every rupee donated goes directly to genuine ground workers and families in need.',
    date: '04 May 2026',
    category: 'Donations',
    verified: true
  }
];

export const INITIAL_STATS: ImpactStats = {
  ngosCount: 520,
  volunteersCount: 14600,
  peopleHelpedCount: 94500,
  fundsRaisedTotal: 4850000,
  hoursVolunteered: 38900,
  activeDrives: 145
};

export const mockCampaigns = INITIAL_CAMPAIGNS;
export const mockOpportunities = INITIAL_OPPORTUNITIES;

