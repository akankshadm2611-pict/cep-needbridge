/**
 * server/routes/auth.ts — Auth routes: register, login, logout, me, change-password.
 */
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { UsersRepo, NgoProfilesRepo, VolunteerProfilesRepo } from '../db/repositories/index.js';
import { signToken, requireAuth, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { env } from '../config/env.js';
import type { UserRole } from '../../shared/types.js';

const router = Router();

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: env.COOKIE_SAME_SITE as 'lax' | 'strict' | 'none',
  secure: env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

function loadProfile(user: { id: string; role: UserRole }) {
  if (user.role === 'ngo') return NgoProfilesRepo.findByUserId(user.id) ?? null;
  if (user.role === 'volunteer') return VolunteerProfilesRepo.findByUserId(user.id) ?? null;
  return null;
}

// ─── Register ────────────────────────────────────────────────────────────────

const RegisterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['volunteer', 'ngo', 'admin']).default('volunteer'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

router.post('/register', validate(RegisterSchema), async (req, res, next) => {
  try {
    const { email, password, role, name } = req.body as z.infer<typeof RegisterSchema>;

    const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
    const user = await UsersRepo.create({
      email,
      passwordHash,
      role: role as UserRole,
      status: 'active',
      onboardingComplete: false,
    });

    // Create empty profile record
    if (role === 'ngo') {
      await NgoProfilesRepo.create({
        userId: user.id,
        name: name || email.split('@')[0],
        causeAreas: [],
        sdgTags: [],
        location: { city: '' },
        contact: {},
        verificationStatus: 'pending',
        verificationDocuments: [],
      });
    } else if (role === 'volunteer') {
      await VolunteerProfilesRepo.create({
        userId: user.id,
        name: name || email.split('@')[0],
        contributionType: 'time',
        skills: [],
        resourceCategories: [],
        interests: [],
        preferredCategories: [],
        sdgInterests: [],
        remoteOk: false,
        availability: { days: [] },
        reliabilityScore: 50,
      });
    }

    const token = signToken(user.id, user.role);
    res.cookie('token', token, COOKIE_OPTS);

    res.status(201).json({
      ok: true,
      data: {
        user: UsersRepo.toPublic(user),
        profile: loadProfile(user),
        onboardingRequired: true,
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes('already registered')) {
      res.status(409).json({ ok: false, error: 'An account with this email already exists.' });
    } else {
      next(err);
    }
  }
});

// ─── Login ───────────────────────────────────────────────────────────────────

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/login', validate(LoginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body as z.infer<typeof LoginSchema>;

    const user = UsersRepo.findByEmail(email);
    if (!user) {
      res.status(401).json({ ok: false, error: 'Invalid email or password.' });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({ ok: false, error: 'Your account has been suspended. Contact support.' });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ ok: false, error: 'Invalid email or password.' });
      return;
    }

    const token = signToken(user.id, user.role);
    res.cookie('token', token, COOKIE_OPTS);

    res.json({
      ok: true,
      data: {
        user: UsersRepo.toPublic(user),
        profile: loadProfile(user),
        onboardingRequired: !user.onboardingComplete,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── Logout ──────────────────────────────────────────────────────────────────

router.post('/logout', (req, res) => {
  res.clearCookie('token', COOKIE_OPTS);
  res.clearCookie('token');
  res.json({ ok: true, data: { message: 'Logged out successfully.' } });
});

// ─── Me (current user) ───────────────────────────────────────────────────────

router.get('/me', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = UsersRepo.findById(req.userId!);
    if (!user) {
      res.status(404).json({ ok: false, error: 'User not found.' });
      return;
    }

    let profile = null;
    if (user.role === 'ngo') {
      profile = NgoProfilesRepo.findByUserId(user.id);
    } else if (user.role === 'volunteer') {
      profile = VolunteerProfilesRepo.findByUserId(user.id);
    }

    res.json({
      ok: true,
      data: {
        user: UsersRepo.toPublic(user),
        profile,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── Change Password ──────────────────────────────────────────────────────────

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

router.post('/complete-onboarding', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const updated = await UsersRepo.update(req.userId!, { onboardingComplete: true });
    if (!updated) {
      res.status(404).json({ ok: false, error: 'User not found.' });
      return;
    }
    res.json({
      ok: true,
      data: { user: UsersRepo.toPublic(updated), profile: loadProfile(updated) },
    });
  } catch (err) {
    next(err);
  }
});

router.put('/change-password', requireAuth, validate(ChangePasswordSchema), async (req: AuthRequest, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body as z.infer<typeof ChangePasswordSchema>;
    const user = UsersRepo.findById(req.userId!);
    if (!user) {
      res.status(404).json({ ok: false, error: 'User not found.' });
      return;
    }
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      res.status(400).json({ ok: false, error: 'Current password is incorrect.' });
      return;
    }
    const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS);
    await UsersRepo.update(user.id, { passwordHash, mustChangePassword: false });
    res.json({ ok: true, data: { message: 'Password changed successfully.' } });
  } catch (err) {
    next(err);
  }
});

router.post('/change-password', requireAuth, validate(ChangePasswordSchema), async (req: AuthRequest, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body as z.infer<typeof ChangePasswordSchema>;
    const user = UsersRepo.findById(req.userId!);
    if (!user) {
      res.status(404).json({ ok: false, error: 'User not found.' });
      return;
    }
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      res.status(400).json({ ok: false, error: 'Current password is incorrect.' });
      return;
    }
    const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS);
    await UsersRepo.update(user.id, { passwordHash, mustChangePassword: false });
    res.json({ ok: true, data: { message: 'Password changed successfully.' } });
  } catch (err) {
    next(err);
  }
});

export default router;
