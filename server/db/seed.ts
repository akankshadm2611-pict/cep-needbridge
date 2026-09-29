/**
 * server/db/seed.ts — Clean, realistic minimal dataset for NeedBridge.
 * Run with: npm run seed
 */
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import {
  UsersRepo,
  NgoProfilesRepo,
  VolunteerProfilesRepo,
  RequirementsRepo,
  CategoriesRepo,
} from './repositories/index.js';
import { isCollectionEmpty } from './fileStore.js';

const ROUNDS = env.BCRYPT_ROUNDS;

async function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, ROUNDS);
}

export async function seedDatabase() {
  console.log('🌱 Seeding minimal clean real-world dataset...');

  // 1. Categories
  await CategoriesRepo.seed([
    { name: 'Education', slug: 'education', active: true },
    { name: 'Food Support', slug: 'food-support', active: true },
    { name: 'Healthcare', slug: 'healthcare', active: true },
    { name: 'Environment', slug: 'environment', active: true },
    { name: 'Disaster Relief', slug: 'disaster-relief', active: true },
  ]);

  if (!isCollectionEmpty('users')) {
    console.log('📦 Data already exists.');
    return;
  }

  // 2. Core Users
  const adminUser = await UsersRepo.create({
    email: 'admin@needbridge.org',
    passwordHash: await hashPassword('Admin@123'),
    role: 'admin',
    status: 'active',
    onboardingComplete: true,
  });

  const ngoUser1 = await UsersRepo.create({
    email: 'helpinghandsngopune@gmail.com',
    passwordHash: await hashPassword('Ngo@1234'),
    role: 'ngo',
    status: 'active',
    onboardingComplete: true,
  });

  const ngoUser2 = await UsersRepo.create({
    email: 'ashafoundation@gmail.com',
    passwordHash: await hashPassword('Ngo@1234'),
    role: 'ngo',
    status: 'active',
    onboardingComplete: true,
  });

  const volUser1 = await UsersRepo.create({
    email: 'aarohi.sharma@example.org',
    passwordHash: await hashPassword('Vol@1234'),
    role: 'volunteer',
    status: 'active',
    onboardingComplete: true,
  });

  // 3. NGO Profiles
  const ngoProfile1 = await NgoProfilesRepo.create({
    userId: ngoUser1.id,
    name: 'Helping Hands Foundation',
    description: 'Providing meal rations and emergency medical supplies across Pune urban slums and shelter homes.',
    organizationType: 'Charitable Trust',
    registrationNumber: 'MAH/2018/0048291',
    causeAreas: ['Food Support', 'Healthcare'],
    sdgTags: [2, 3],
    location: { city: 'Pune', state: 'Maharashtra', address: 'Shivajinagar Relief Hub, Pune 411005', latitude: 18.5314, longitude: 73.8446 },
    contact: { email: 'drives@helpinghandsngo.org', phone: '+91 98220 12345', name: 'Dr. Suresh Kadam' },
    website: 'https://helpinghandsngo.org',
    verificationStatus: 'verified',
    verificationNote: 'All 80G and Trust certificates verified.',
    verificationDocuments: [],
  });

  const ngoProfile2 = await NgoProfilesRepo.create({
    userId: ngoUser2.id,
    name: 'Asha Shiksha Foundation',
    description: 'Teaching STEM, literacy and supplying textbooks for underprivileged students.',
    organizationType: 'Section 8 Company',
    registrationNumber: 'MH/NGO/2021/00721',
    causeAreas: ['Education'],
    sdgTags: [4],
    location: { city: 'Pune', state: 'Maharashtra', address: 'Kothrud Education Center, Pune 411038', latitude: 18.5074, longitude: 73.8077 },
    contact: { email: 'contact@ashafoundation.org', phone: '+91 94225 67890', name: 'Pooja Deshmukh' },
    verificationStatus: 'pending',
    verificationNote: '',
    verificationDocuments: [],
  });

  // 4. Volunteer Profile
  await VolunteerProfilesRepo.create({
    userId: volUser1.id,
    name: 'Aarohi Sharma',
    phone: '+91 99200 11223',
    bio: 'Volunteer educator passionate about community teaching and food drives.',
    contributionType: 'both',
    skills: ['Teaching', 'English', 'Food Packaging'],
    resourceCategories: ['Books', 'Rations & Dry Food'],
    interests: ['Education', 'Food Support'],
    preferredCategories: ['Education', 'Food Support'],
    sdgInterests: [2, 4],
    location: { city: 'Pune', state: 'Maharashtra', latitude: 18.5204, longitude: 73.8567 },
    remoteOk: true,
    availability: { days: ['Saturday', 'Sunday'], hoursPerWeek: 8, timePreference: 'afternoon' },
    reliabilityScore: 92,
  });

  // 5. Clean, Realistic Requirements
  await RequirementsRepo.create({
    ngoId: ngoProfile1.id,
    ngoName: 'Helping Hands Foundation',
    title: 'Weekend Food Packaging & Meal Distribution',
    description: 'Volunteers needed to help pack warm meals and distribute grocery kits to 150 daily-wage families.',
    category: 'Food Support',
    type: 'time',
    skillsRequired: ['Food Packaging', 'Punctuality'],
    volunteersNeeded: 10,
    volunteersAccepted: 3,
    location: { city: 'Pune', state: 'Maharashtra', address: 'Shivajinagar Relief Hub, Pune', latitude: 18.5314, longitude: 73.8446 },
    isRemote: false,
    startDate: '2026-10-15',
    duration: '2 weeks',
    deadline: '2026-10-14',
    urgency: 'high',
    status: 'open',
    sdgTags: [2],
    peopleHelped: 150,
  });

  await RequirementsRepo.create({
    ngoId: ngoProfile1.id,
    ngoName: 'Helping Hands Foundation',
    title: 'Monthly Dry Ration Grocery Kits (50 Kits)',
    description: 'We need 50 dry grocery ration packets containing 10kg Rice, 2kg Lentils, and 1L Cooking Oil for migrant families.',
    category: 'Food Support',
    type: 'goods',
    skillsRequired: [],
    resourceNeeded: {
      itemName: 'Dry Grocery Ration Packets (10kg Rice + 2kg Dal + 1L Oil)',
      unit: 'kits',
      quantityNeeded: 50,
      quantityPledged: 18,
    },
    volunteersNeeded: 0,
    volunteersAccepted: 0,
    location: { city: 'Pune', state: 'Maharashtra', address: 'Shivajinagar Relief Hub, Pune', latitude: 18.5314, longitude: 73.8446 },
    isRemote: false,
    deadline: '2026-10-25',
    urgency: 'critical',
    status: 'open',
    sdgTags: [2],
    peopleHelped: 200,
  });

  await RequirementsRepo.create({
    ngoId: ngoProfile1.id,
    ngoName: 'Helping Hands Foundation',
    title: 'Volunteer Math & Science Tutors',
    description: 'Weekend volunteer tutors needed to teach basic math and science to 60 primary school students.',
    category: 'Education',
    type: 'time',
    skillsRequired: ['Teaching', 'English', 'Mathematics'],
    volunteersNeeded: 6,
    volunteersAccepted: 2,
    location: { city: 'Pune', state: 'Maharashtra', address: 'Shivajinagar Relief Hub, Pune', latitude: 18.5314, longitude: 73.8446 },
    isRemote: false,
    startDate: '2026-10-20',
    duration: '4 weeks',
    deadline: '2026-10-19',
    urgency: 'normal',
    status: 'open',
    sdgTags: [4],
    peopleHelped: 60,
  });

  console.log('✅ Clean realistic seed completed.');
}

// Direct execution
if (process.argv[1]?.includes('seed')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
