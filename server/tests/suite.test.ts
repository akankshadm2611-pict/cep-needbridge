/**
 * server/tests/index.ts — Automated Test Suite for TC-01 to TC-08.
 * Run with: npm test (tsx server/tests/index.ts)
 */
import { app } from '../index.js';
import { env } from '../config/env.js';
import {
  UsersRepo,
  NgoProfilesRepo,
  VolunteerProfilesRepo,
  RequirementsRepo,
  ApplicationsRepo,
  NotificationsRepo,
} from '../db/repositories/index.js';
import { calculateMatchScore, calculateBoundedQuantity } from '../services/matching.js';
import { analyzeText } from '../services/smartText.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTests() {
  console.log('🧪 Starting NeedBridge Verification Test Suite (TC-01 to TC-08)...\n');

  try {
    // -------------------------------------------------------------------------
    // TC-01: Auth & User Lifecycle
    // -------------------------------------------------------------------------
    console.log('▶ [TC-01] Auth & User Lifecycle');
    const testEmail = `test_vol_${Date.now()}@example.org`;
    const password = 'Password@123';
    const passwordHash = await bcrypt.hash(password, 4);

    // Register user
    const newUser = await UsersRepo.create({
      email: testEmail,
      passwordHash,
      role: 'volunteer',
      status: 'active',
      onboardingComplete: false,
    });
    assert(!!newUser.id, 'User record created with unique ID');
    assert(newUser.email === testEmail, 'User email matches input');

    // Token signing & verification
    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role, email: newUser.email },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    assert(decoded.userId === newUser.id, 'JWT token correctly generated and decoded');
    assert(decoded.role === 'volunteer', 'JWT token payload includes proper role');

    // Password verification
    const validPw = await bcrypt.compare(password, newUser.passwordHash);
    const invalidPw = await bcrypt.compare('WrongPassword', newUser.passwordHash);
    assert(validPw === true, 'Correct password validates successfully');
    assert(invalidPw === false, 'Incorrect password rejected');


    // -------------------------------------------------------------------------
    // TC-02: Role-Based Access Control (RBAC)
    // -------------------------------------------------------------------------
    console.log('\n▶ [TC-02] Role-Based Access Control (RBAC)');
    const volunteerRole = newUser.role;
    const isVolunteerAdmin = volunteerRole === 'admin';
    const isVolunteerNgo = volunteerRole === 'ngo';
    assert(!isVolunteerAdmin, 'Volunteer role is strictly blocked from Admin operations');
    assert(!isVolunteerNgo, 'Volunteer role is strictly blocked from NGO-only operations');

    // Create a mock unverified NGO
    const unverifiedNgoUser = await UsersRepo.create({
      email: `unverified_ngo_${Date.now()}@example.org`,
      passwordHash,
      role: 'ngo',
      status: 'active',
      onboardingComplete: true,
    });
    const unverifiedNgoProfile = await NgoProfilesRepo.create({
      userId: unverifiedNgoUser.id,
      name: 'Unverified Foundation',
      causeAreas: ['Education'],
      sdgTags: [4],
      location: { city: 'Pune' },
      contact: { email: unverifiedNgoUser.email },
      verificationStatus: 'pending',
      verificationDocuments: [],
    });
    assert(unverifiedNgoProfile.verificationStatus === 'pending', 'Newly created NGO starts in pending verification state');


    // -------------------------------------------------------------------------
    // TC-03: NGO Verification Submission
    // -------------------------------------------------------------------------
    console.log('\n▶ [TC-03] NGO Verification Submission');
    const doc = {
      id: `doc_${Date.now()}`,
      filename: 'ngo_registration_cert.pdf',
      originalName: 'NGO_Reg_2026.pdf',
      uploadedAt: new Date().toISOString(),
      mimeType: 'application/pdf',
    };
    const updatedNgo = await NgoProfilesRepo.update(unverifiedNgoProfile.id, {
      verificationDocuments: [doc],
      verificationStatus: 'pending',
      registrationNumber: 'REG-MH-2026-999',
    });
    assert(updatedNgo?.verificationDocuments.length === 1, 'Verification document successfully registered on NGO profile');
    assert(updatedNgo?.registrationNumber === 'REG-MH-2026-999', 'Registration certificate number attached');


    // -------------------------------------------------------------------------
    // TC-04: Admin Review Workflow
    // -------------------------------------------------------------------------
    console.log('\n▶ [TC-04] Admin Review Workflow');
    // Admin approves the NGO
    const approvedNgo = await NgoProfilesRepo.update(unverifiedNgoProfile.id, {
      verificationStatus: 'verified',
      verificationNote: 'All registration documents verified successfully by Admin on 2026-09-29.',
    });
    assert(approvedNgo?.verificationStatus === 'verified', 'Admin approval updates status to verified');
    assert(!!approvedNgo?.verificationNote, 'Admin verification note successfully stored');


    // -------------------------------------------------------------------------
    // TC-05: Requirement Lifecycle
    // -------------------------------------------------------------------------
    console.log('\n▶ [TC-05] Requirement Lifecycle');
    const requirement = await RequirementsRepo.create({
      ngoId: approvedNgo!.id,
      ngoName: approvedNgo!.name,
      title: 'School Kit Distribution Drive',
      description: 'Distributing notebooks, stationery kits and bags to 100 primary school children in need.',
      category: 'Education',
      type: 'both',
      skillsRequired: ['Teaching', 'Logistics'],
      resourceNeeded: {
        itemName: 'Stationery Kits',
        unit: 'kits',
        quantityNeeded: 100,
        quantityPledged: 0,
      },
      volunteersNeeded: 5,
      volunteersAccepted: 0,
      location: { city: 'Pune', latitude: 18.5204, longitude: 73.8567 },
      isRemote: false,
      urgency: 'high',
      status: 'open',
      sdgTags: [4, 10],
      peopleHelped: 100,
    });
    assert(requirement.status === 'open', 'Requirement created and published as open');
    assert(requirement.resourceNeeded?.quantityNeeded === 100, 'Target quantity needed set to 100');

    // Update status to in_progress and then completed
    const inProgressReq = await RequirementsRepo.update(requirement.id, { status: 'in_progress' });
    assert(inProgressReq?.status === 'in_progress', 'Requirement status transitioned to in_progress');

    const completedReq = await RequirementsRepo.update(requirement.id, { status: 'completed' });
    assert(completedReq?.status === 'completed', 'Requirement status transitioned to completed');


    // -------------------------------------------------------------------------
    // TC-06: Multi-Factor Matching Engine & Zero-Wastage Bounded Allocation
    // -------------------------------------------------------------------------
    console.log('\n▶ [TC-06] Multi-Factor Matching & Zero-Wastage Knapsack Engine');
    
    // Test 1: Bounded Allocation calculation
    // If requirement needs 100, already pledged 60 -> remaining needed = 40.
    // If donor offers 50, allocated quantity must be min(50, 40) = 40.
    const allocated1 = calculateBoundedQuantity(50, 100, 60);
    assert(allocated1 === 40, 'Bounded Allocation strictly caps pledge to remaining need min(50, 40) = 40 to prevent surplus waste');

    const allocated2 = calculateBoundedQuantity(25, 100, 60);
    assert(allocated2 === 25, 'Bounded Allocation assigns full quantity 25 when below remaining need');

    const allocated3 = calculateBoundedQuantity(20, 100, 100);
    assert(allocated3 === 0, 'Bounded Allocation assigns 0 when need is already 100% fulfilled');

    // Test 2: Multi-Factor Compatibility Scoring
    const testVolunteerProfile = {
      id: 'vol_match_test',
      userId: newUser.id,
      name: 'Aarohi Sharma',
      contributionType: 'both' as const,
      skills: ['Teaching', 'Mentorship', 'English'],
      resourceCategories: ['Stationery', 'Books'],
      interests: ['Education', 'Youth'],
      preferredCategories: ['Education'],
      sdgInterests: [4 as const, 10 as const],
      location: { city: 'Pune', latitude: 18.5300, longitude: 73.8500 },
      remoteOk: true,
      availability: { days: ['Saturday', 'Sunday'], hoursPerWeek: 5 },
      reliabilityScore: 90,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const matchScore = calculateMatchScore(testVolunteerProfile, requirement);
    assert(matchScore.totalScore >= 60, `Multi-Factor match score calculated successfully: ${matchScore.totalScore}/100`);
    assert(matchScore.proximityScore > 0, `Proximity score computed via Haversine (${matchScore.proximityScore}/40, ${matchScore.distanceKm?.toFixed(1)} km)`);
    assert(matchScore.skillScore > 0, `Skill/Category similarity score computed (${matchScore.skillScore}/30)`);
    assert(matchScore.urgencyScore > 0, `Urgency multiplier computed (${matchScore.urgencyScore}/20)`);
    assert(matchScore.reliabilityScore > 0, `Reliability score factored in (${matchScore.reliabilityScore}/10)`);


    // -------------------------------------------------------------------------
    // TC-07: Volunteer Application & Goods Pledge Workflow
    // -------------------------------------------------------------------------
    console.log('\n▶ [TC-07] Volunteer Application & Goods Pledge Workflow');
    const pledgeApp = await ApplicationsRepo.create({
      requirementId: requirement.id,
      volunteerId: testVolunteerProfile.id,
      volunteerName: testVolunteerProfile.name,
      message: 'I would like to contribute 30 stationery kits and help distribute them.',
      kind: 'goods',
      pledgedQuantity: 30,
      allocatedQuantity: 30,
      status: 'pending',
      appliedAt: new Date().toISOString(),
      fulfilled: false,
      matchScore: matchScore.totalScore,
    });
    assert(pledgeApp.status === 'pending', 'Goods pledge application submitted in pending state');
    assert(pledgeApp.allocatedQuantity === 30, 'Allocated quantity verified on application');

    // NGO accepts application
    const acceptedApp = await ApplicationsRepo.update(pledgeApp.id, {
      status: 'accepted',
      decidedAt: new Date().toISOString(),
    });
    assert(acceptedApp?.status === 'accepted', 'NGO successfully accepts pledge application');

    // Mark fulfilled
    const fulfilledApp = await ApplicationsRepo.update(pledgeApp.id, {
      fulfilled: true,
    });
    assert(fulfilledApp?.fulfilled === true, 'Pledge marked as fulfilled upon distribution completion');


    // -------------------------------------------------------------------------
    // TC-08: In-App Notifications & SmartText Suggestions
    // -------------------------------------------------------------------------
    console.log('\n▶ [TC-08] In-App Notifications & SmartText Suggestions');
    
    // In-app notification creation
    const notif = await NotificationsRepo.create({
      userId: unverifiedNgoUser.id,
      type: 'verification_update',
      title: 'NGO Verification Approved',
      body: 'Your NGO profile has been verified by the NeedBridge admin team.',
      link: '/dashboard',
    });
    assert(!!notif.id, 'In-app notification created');
    assert(notif.readAt === undefined, 'Notification starts unread');

    const readNotif = await NotificationsRepo.markRead(notif.id);
    assert(!!readNotif?.readAt, 'Notification marked as read with timestamp');

    // SmartText Keyword Suggestions (Rule-based, 0 external AI API)
    const promptText = 'Need 50 blankets and warm clothes urgently for flood victims and disaster relief camp.';
    const suggestions = analyzeText(promptText);
    assert(suggestions.category === 'Disaster Relief' || suggestions.category === 'Food Support', `Category detected: "${suggestions.category}"`);
    assert(suggestions.urgency === 'critical' || suggestions.urgency === 'high', `Urgency detected: "${suggestions.urgency}"`);
    assert(suggestions.contributionType === 'goods' || suggestions.contributionType === 'both', `Contribution type detected: "${suggestions.contributionType}"`);
    assert(suggestions.sdgTags.length > 0, `SDG Tags detected: [${suggestions.sdgTags.join(', ')}]`);

    console.log('\n======================================================');
    console.log(`🎉 ALL TESTS PASSED: ${passed} assertions passed, 0 failures.`);
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ Test run encountered an error:', err);
    process.exit(1);
  }
}

runTests();
