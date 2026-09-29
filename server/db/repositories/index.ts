/**
 * server/db/repositories/index.ts
 *
 * Repository layer interfaces + JSON-file backed implementations.
 * Only this module touches the fileStore. All service code goes through repositories.
 */

import { nanoid } from 'nanoid';
import {
  User,
  NgoProfile,
  VolunteerProfile,
  Requirement,
  Application,
  Notification,
  Category,
} from '../../../shared/types.js';
import { getCollection, setCollection } from '../fileStore.js';

type WithPasswordHash = User & { passwordHash: string; recoveryAnswerHash?: string };

// ---------------------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------------------

function now(): string {
  return new Date().toISOString();
}

export interface FindOptions<T> {
  sort?: { field: keyof T; dir: 'asc' | 'desc' };
  page?: number;
  limit?: number;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function paginate<T>(items: T[], page = 1, limit = 20): PagedResult<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.max(1, Math.min(page, totalPages));
  const start = (safePage - 1) * limit;
  return {
    items: items.slice(start, start + limit),
    total,
    page: safePage,
    limit,
    totalPages,
  };
}

// ---------------------------------------------------------------------------
// Users Repository
// ---------------------------------------------------------------------------

const USERS_COLLECTION = 'users';

export const UsersRepo = {
  findAll(): WithPasswordHash[] {
    return getCollection<WithPasswordHash>(USERS_COLLECTION);
  },

  findById(id: string): WithPasswordHash | undefined {
    return this.findAll().find(u => u.id === id);
  },

  findByEmail(email: string): WithPasswordHash | undefined {
    return this.findAll().find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  find(filter: Partial<User>, opts?: FindOptions<User>): PagedResult<WithPasswordHash> {
    let items = this.findAll().filter(u =>
      Object.entries(filter).every(([k, v]) => (u as any)[k] === v)
    );
    if (opts?.sort) {
      const { field, dir } = opts.sort;
      items.sort((a, b) => {
        const av = String((a as any)[field as string] ?? '');
        const bv = String((b as any)[field as string] ?? '');
        return dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }
    return paginate(items, opts?.page, opts?.limit);
  },

  async create(data: Omit<WithPasswordHash, 'id' | 'createdAt' | 'updatedAt'>): Promise<WithPasswordHash> {
    const users = this.findAll();
    if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error('Email already registered');
    }
    const user: WithPasswordHash = {
      ...data,
      id: nanoid(),
      createdAt: now(),
      updatedAt: now(),
    };
    users.push(user);
    await setCollection(USERS_COLLECTION, users);
    return user;
  },

  async update(id: string, updates: Partial<WithPasswordHash>): Promise<WithPasswordHash | null> {
    const users = this.findAll();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updates, updatedAt: now() };
    await setCollection(USERS_COLLECTION, users);
    return users[idx];
  },

  async delete(id: string): Promise<boolean> {
    const users = this.findAll();
    const filtered = users.filter(u => u.id !== id);
    if (filtered.length === users.length) return false;
    await setCollection(USERS_COLLECTION, filtered);
    return true;
  },

  /** Strip passwordHash before sending to client */
  toPublic(user: WithPasswordHash): User {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, recoveryAnswerHash, ...pub } = user;
    return pub as User;
  },
};

// ---------------------------------------------------------------------------
// NGO Profiles Repository
// ---------------------------------------------------------------------------

const NGO_COLLECTION = 'ngo_profiles';

export const NgoProfilesRepo = {
  findAll(): NgoProfile[] {
    return getCollection<NgoProfile>(NGO_COLLECTION);
  },

  findById(id: string): NgoProfile | undefined {
    return this.findAll().find(n => n.id === id);
  },

  findByUserId(userId: string): NgoProfile | undefined {
    return this.findAll().find(n => n.userId === userId);
  },

  find(filter: Partial<NgoProfile>, opts?: FindOptions<NgoProfile>): PagedResult<NgoProfile> {
    let items = this.findAll().filter(n =>
      Object.entries(filter).every(([k, v]) => (n as any)[k] === v)
    );
    if (opts?.sort) {
      const { field, dir } = opts.sort;
      items.sort((a, b) => {
        const av = String((a as any)[field as string] ?? '');
        const bv = String((b as any)[field as string] ?? '');
        return dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }
    return paginate(items, opts?.page, opts?.limit);
  },

  async create(data: Omit<NgoProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<NgoProfile> {
    const profiles = this.findAll();
    const profile: NgoProfile = {
      ...data,
      id: nanoid(),
      createdAt: now(),
      updatedAt: now(),
    };
    profiles.push(profile);
    await setCollection(NGO_COLLECTION, profiles);
    return profile;
  },

  async update(id: string, updates: Partial<NgoProfile>): Promise<NgoProfile | null> {
    const profiles = this.findAll();
    const idx = profiles.findIndex(p => p.id === id);
    if (idx === -1) return null;
    profiles[idx] = { ...profiles[idx], ...updates, updatedAt: now() };
    await setCollection(NGO_COLLECTION, profiles);
    return profiles[idx];
  },

  async delete(id: string): Promise<boolean> {
    const profiles = this.findAll();
    const filtered = profiles.filter(p => p.id !== id);
    if (filtered.length === profiles.length) return false;
    await setCollection(NGO_COLLECTION, filtered);
    return true;
  },
};

// ---------------------------------------------------------------------------
// Volunteer Profiles Repository
// ---------------------------------------------------------------------------

const VOL_COLLECTION = 'volunteer_profiles';

export const VolunteerProfilesRepo = {
  findAll(): VolunteerProfile[] {
    return getCollection<VolunteerProfile>(VOL_COLLECTION);
  },

  findById(id: string): VolunteerProfile | undefined {
    return this.findAll().find(v => v.id === id);
  },

  findByUserId(userId: string): VolunteerProfile | undefined {
    return this.findAll().find(v => v.userId === userId);
  },

  find(filter: Partial<VolunteerProfile>, opts?: FindOptions<VolunteerProfile>): PagedResult<VolunteerProfile> {
    let items = this.findAll().filter(v =>
      Object.entries(filter).every(([k, v2]) => (v as any)[k] === v2)
    );
    return paginate(items, opts?.page, opts?.limit);
  },

  async create(data: Omit<VolunteerProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<VolunteerProfile> {
    const profiles = this.findAll();
    const profile: VolunteerProfile = {
      ...data,
      id: nanoid(),
      createdAt: now(),
      updatedAt: now(),
    };
    profiles.push(profile);
    await setCollection(VOL_COLLECTION, profiles);
    return profile;
  },

  async update(id: string, updates: Partial<VolunteerProfile>): Promise<VolunteerProfile | null> {
    const profiles = this.findAll();
    const idx = profiles.findIndex(p => p.id === id);
    if (idx === -1) return null;
    profiles[idx] = { ...profiles[idx], ...updates, updatedAt: now() };
    await setCollection(VOL_COLLECTION, profiles);
    return profiles[idx];
  },

  async delete(id: string): Promise<boolean> {
    const profiles = this.findAll();
    const filtered = profiles.filter(p => p.id !== id);
    if (filtered.length === profiles.length) return false;
    await setCollection(VOL_COLLECTION, filtered);
    return true;
  },
};

// ---------------------------------------------------------------------------
// Requirements Repository
// ---------------------------------------------------------------------------

const REQ_COLLECTION = 'requirements';

export const RequirementsRepo = {
  findAll(): Requirement[] {
    return getCollection<Requirement>(REQ_COLLECTION);
  },

  findById(id: string): Requirement | undefined {
    return this.findAll().find(r => r.id === id);
  },

  findByNgoId(ngoId: string): Requirement[] {
    return this.findAll().filter(r => r.ngoId === ngoId);
  },

  find(filter: Partial<Requirement>, opts?: FindOptions<Requirement>): PagedResult<Requirement> {
    let items = this.findAll().filter(r =>
      Object.entries(filter).every(([k, v]) => (r as any)[k] === v)
    );
    if (opts?.sort) {
      const { field, dir } = opts.sort;
      items.sort((a, b) => {
        const av = String((a as any)[field as string] ?? '');
        const bv = String((b as any)[field as string] ?? '');
        return dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }
    return paginate(items, opts?.page, opts?.limit);
  },

  async create(data: Omit<Requirement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Requirement> {
    const reqs = this.findAll();
    const req: Requirement = {
      ...data,
      id: nanoid(),
      createdAt: now(),
      updatedAt: now(),
    };
    reqs.push(req);
    await setCollection(REQ_COLLECTION, reqs);
    return req;
  },

  async update(id: string, updates: Partial<Requirement>): Promise<Requirement | null> {
    const reqs = this.findAll();
    const idx = reqs.findIndex(r => r.id === id);
    if (idx === -1) return null;
    reqs[idx] = { ...reqs[idx], ...updates, updatedAt: now() };
    await setCollection(REQ_COLLECTION, reqs);
    return reqs[idx];
  },

  async delete(id: string): Promise<boolean> {
    const reqs = this.findAll();
    const filtered = reqs.filter(r => r.id !== id);
    if (filtered.length === reqs.length) return false;
    await setCollection(REQ_COLLECTION, filtered);
    return true;
  },

  /** Count accepted applications for this requirement */
  countAccepted(requirementId: string): number {
    return ApplicationsRepo.findAll().filter(
      a => a.requirementId === requirementId && a.status === 'accepted'
    ).length;
  },

  /** Sum pledged quantity for a goods requirement */
  sumPledgedQuantity(requirementId: string): number {
    return ApplicationsRepo.findAll()
      .filter(a => a.requirementId === requirementId && a.status === 'accepted' && a.kind === 'goods')
      .reduce((sum, a) => sum + (a.allocatedQuantity ?? 0), 0);
  },
};

// ---------------------------------------------------------------------------
// Applications Repository
// ---------------------------------------------------------------------------

const APP_COLLECTION = 'applications';

export const ApplicationsRepo = {
  findAll(): Application[] {
    return getCollection<Application>(APP_COLLECTION);
  },

  findById(id: string): Application | undefined {
    return this.findAll().find(a => a.id === id);
  },

  findByRequirementId(requirementId: string): Application[] {
    return this.findAll().filter(a => a.requirementId === requirementId);
  },

  findByVolunteerId(volunteerId: string): Application[] {
    return this.findAll().filter(a => a.volunteerId === volunteerId);
  },

  findExisting(requirementId: string, volunteerId: string): Application | undefined {
    return this.findAll().find(a => a.requirementId === requirementId && a.volunteerId === volunteerId);
  },

  find(filter: Partial<Application>, opts?: FindOptions<Application>): PagedResult<Application> {
    let items = this.findAll().filter(a =>
      Object.entries(filter).every(([k, v]) => (a as any)[k] === v)
    );
    return paginate(items, opts?.page, opts?.limit);
  },

  async create(data: Omit<Application, 'id'>): Promise<Application> {
    const apps = this.findAll();
    // Uniqueness check: one application per volunteer per requirement
    if (apps.find(a => a.requirementId === data.requirementId && a.volunteerId === data.volunteerId)) {
      throw new Error('You have already applied to this requirement');
    }
    const app: Application = { ...data, id: nanoid() };
    apps.push(app);
    await setCollection(APP_COLLECTION, apps);
    return app;
  },

  async update(id: string, updates: Partial<Application>): Promise<Application | null> {
    const apps = this.findAll();
    const idx = apps.findIndex(a => a.id === id);
    if (idx === -1) return null;
    apps[idx] = { ...apps[idx], ...updates };
    await setCollection(APP_COLLECTION, apps);
    return apps[idx];
  },

  async delete(id: string): Promise<boolean> {
    const apps = this.findAll();
    const filtered = apps.filter(a => a.id !== id);
    if (filtered.length === apps.length) return false;
    await setCollection(APP_COLLECTION, filtered);
    return true;
  },
};

// ---------------------------------------------------------------------------
// Notifications Repository
// ---------------------------------------------------------------------------

const NOTIF_COLLECTION = 'notifications';

export const NotificationsRepo = {
  findAll(): Notification[] {
    return getCollection<Notification>(NOTIF_COLLECTION);
  },

  findByUserId(userId: string): Notification[] {
    return this.findAll()
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  findById(id: string): Notification | undefined {
    return this.findAll().find(n => n.id === id);
  },

  countUnread(userId: string): number {
    return this.findAll().filter(n => n.userId === userId && !n.readAt).length;
  },

  async create(data: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const notifs = this.findAll();
    const notif: Notification = { ...data, id: nanoid(), createdAt: now() };
    notifs.push(notif);
    await setCollection(NOTIF_COLLECTION, notifs);
    return notif;
  },

  async markRead(id: string): Promise<Notification | null> {
    const notifs = this.findAll();
    const idx = notifs.findIndex(n => n.id === id);
    if (idx === -1) return null;
    notifs[idx] = { ...notifs[idx], readAt: now() };
    await setCollection(NOTIF_COLLECTION, notifs);
    return notifs[idx];
  },

  async markAllRead(userId: string): Promise<void> {
    const notifs = this.findAll();
    const readAt = now();
    let changed = false;
    notifs.forEach((n, i) => {
      if (n.userId === userId && !n.readAt) {
        notifs[i] = { ...n, readAt };
        changed = true;
      }
    });
    if (changed) await setCollection(NOTIF_COLLECTION, notifs);
  },

  async delete(id: string): Promise<boolean> {
    const notifs = this.findAll();
    const filtered = notifs.filter(n => n.id !== id);
    if (filtered.length === notifs.length) return false;
    await setCollection(NOTIF_COLLECTION, filtered);
    return true;
  },
};

// ---------------------------------------------------------------------------
// Categories Repository
// ---------------------------------------------------------------------------

const CAT_COLLECTION = 'categories';

export const CategoriesRepo = {
  findAll(): Category[] {
    return getCollection<Category>(CAT_COLLECTION);
  },

  findActive(): Category[] {
    return this.findAll().filter(c => c.active);
  },

  async seed(categories: Omit<Category, 'id'>[]): Promise<void> {
    const existing = this.findAll();
    if (existing.length > 0) return;
    const seeded = categories.map(c => ({ ...c, id: nanoid() }));
    await setCollection(CAT_COLLECTION, seeded);
  },
};
