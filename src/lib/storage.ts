import { 
  Campaign, 
  VolunteerOpportunity, 
  VolunteerRequest, 
  DonationRecord, 
  BeneficiaryBreakdown, 
  ReviewItem, 
  UserProfile, 
  UserRole,
  ChatMessage 
} from '../types';
import { 
  mockCampaigns, 
  mockOpportunities, 
  INITIAL_VOLUNTEER_REQUESTS, 
  INITIAL_DONATIONS, 
  INITIAL_BENEFICIARIES, 
  INITIAL_REVIEWS,
  INITIAL_PROFILES 
} from '../data/mockData';

const STORAGE_KEYS = {
  USERS: 'needbridge_users',
  CURRENT_USER: 'needbridge_current_user',
  CAMPAIGNS: 'needbridge_campaigns',
  OPPORTUNITIES: 'needbridge_opportunities',
  VOLUNTEER_REQUESTS: 'needbridge_volunteer_requests',
  DONATIONS: 'needbridge_donations',
  BENEFICIARIES: 'needbridge_beneficiaries',
  REVIEWS: 'needbridge_reviews',
  THEME: 'needbridge_theme',
  MESSAGES: 'needbridge_messages',
};

// Safe JSON parse helper
function getStoredItem<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? (JSON.parse(data) as T) : fallback;
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error);
    return fallback;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to storage:`, error);
  }
}

export const StorageService = {
  // Theme
  getTheme(): 'light' | 'dark' {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.THEME);
      if (stored === 'dark' || stored === 'light') return stored;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  },

  setTheme(theme: 'light' | 'dark'): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error(e);
    }
  },

  // Users Database
  getUsers(): UserProfile[] {
    return getStoredItem<UserProfile[]>(STORAGE_KEYS.USERS, []);
  },

  saveUser(user: UserProfile): void {
    const users = this.getUsers();
    const existingIndex = users.findIndex(
      u => u.email.toLowerCase() === user.email.toLowerCase() || 
           (u.username && user.username && u.username.toLowerCase() === user.username.toLowerCase())
    );
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...user };
    } else {
      users.push(user);
    }
    setStoredItem(STORAGE_KEYS.USERS, users);
  },

  findUser(identifier: string, role?: UserRole): UserProfile | undefined {
    const users = this.getUsers();
    const cleanId = identifier.trim().toLowerCase();
    return users.find(u => 
      (u.email.toLowerCase() === cleanId || (u.username && u.username.toLowerCase() === cleanId)) && 
      (!role || u.role === role)
    );
  },

  isUsernameTaken(username: string, excludeEmail?: string): boolean {
    const users = this.getUsers();
    const cleanUser = username.trim().toLowerCase().replace(/^@/, '');
    return users.some(u => 
      u.username && 
      u.username.toLowerCase().replace(/^@/, '') === cleanUser && 
      (!excludeEmail || u.email.toLowerCase() !== excludeEmail.toLowerCase())
    );
  },

  deleteUser(identifier: string): void {
    const users = this.getUsers();
    const cleanId = identifier.trim().toLowerCase();
    const filtered = users.filter(u => 
      u.id !== identifier &&
      u.email.toLowerCase() !== cleanId &&
      (!u.username || u.username.toLowerCase() !== cleanId)
    );
    setStoredItem(STORAGE_KEYS.USERS, filtered);
    
    const current = this.getCurrentUser();
    if (current && (current.id === identifier || current.email.toLowerCase() === cleanId || (current.username && current.username.toLowerCase() === cleanId))) {
      this.setCurrentUser(null);
    }
  },

  updateUser(identifier: string, updates: Partial<UserProfile>): UserProfile | null {
    const users = this.getUsers();
    const cleanId = identifier.trim().toLowerCase();
    const index = users.findIndex(u => 
      u.id === identifier ||
      u.email.toLowerCase() === cleanId ||
      (u.username && u.username.toLowerCase() === cleanId)
    );
    if (index >= 0) {
      users[index] = { ...users[index], ...updates };
      setStoredItem(STORAGE_KEYS.USERS, users);
      const current = this.getCurrentUser();
      if (current && (current.id === identifier || current.email.toLowerCase() === cleanId || (current.username && current.username.toLowerCase() === cleanId))) {
        this.setCurrentUser(users[index]);
      }
      return users[index];
    }
    return null;
  },

  // Current Session User
  getCurrentUser(): UserProfile | null {
    return getStoredItem<UserProfile | null>(STORAGE_KEYS.CURRENT_USER, null);
  },

  setCurrentUser(user: UserProfile | null): void {
    setStoredItem(STORAGE_KEYS.CURRENT_USER, user);
  },

  // Campaigns
  getCampaigns(): Campaign[] {
    return getStoredItem<Campaign[]>(STORAGE_KEYS.CAMPAIGNS, mockCampaigns);
  },

  saveCampaign(campaign: Campaign): Campaign[] {
    const campaigns = this.getCampaigns();
    const updated = [campaign, ...campaigns];
    setStoredItem(STORAGE_KEYS.CAMPAIGNS, updated);
    return updated;
  },

  updateCampaign(campaignId: string, updates: Partial<Campaign>): Campaign[] {
    const campaigns = this.getCampaigns();
    const updated = campaigns.map(c => c.id === campaignId ? { ...c, ...updates } : c);
    setStoredItem(STORAGE_KEYS.CAMPAIGNS, updated);
    return updated;
  },

  // Volunteer Opportunities
  getOpportunities(): VolunteerOpportunity[] {
    return getStoredItem<VolunteerOpportunity[]>(STORAGE_KEYS.OPPORTUNITIES, mockOpportunities);
  },

  saveOpportunity(opportunity: VolunteerOpportunity): VolunteerOpportunity[] {
    const opportunities = this.getOpportunities();
    const updated = [opportunity, ...opportunities];
    setStoredItem(STORAGE_KEYS.OPPORTUNITIES, updated);
    return updated;
  },

  // Volunteer Requests / Applications
  getVolunteerRequests(): VolunteerRequest[] {
    return getStoredItem<VolunteerRequest[]>(STORAGE_KEYS.VOLUNTEER_REQUESTS, INITIAL_VOLUNTEER_REQUESTS);
  },

  saveVolunteerRequest(request: VolunteerRequest): VolunteerRequest[] {
    const requests = this.getVolunteerRequests();
    const updated = [request, ...requests];
    setStoredItem(STORAGE_KEYS.VOLUNTEER_REQUESTS, updated);
    return updated;
  },

  updateVolunteerRequestStatus(requestId: string, status: 'accepted' | 'rejected'): VolunteerRequest[] {
    const requests = this.getVolunteerRequests();
    const updated = requests.map(r => r.id === requestId ? { ...r, status } : r);
    setStoredItem(STORAGE_KEYS.VOLUNTEER_REQUESTS, updated);
    return updated;
  },

  // Donations
  getDonations(): DonationRecord[] {
    return getStoredItem<DonationRecord[]>(STORAGE_KEYS.DONATIONS, INITIAL_DONATIONS);
  },

  saveDonation(donation: DonationRecord): DonationRecord[] {
    const donations = this.getDonations();
    const updated = [donation, ...donations];
    setStoredItem(STORAGE_KEYS.DONATIONS, updated);
    return updated;
  },

  // Beneficiaries
  getBeneficiaries(): BeneficiaryBreakdown {
    return getStoredItem<BeneficiaryBreakdown>(STORAGE_KEYS.BENEFICIARIES, INITIAL_BENEFICIARIES);
  },

  addBeneficiaries(count: number, category: 'children' | 'women' | 'elderly' | 'others'): BeneficiaryBreakdown {
    const current = this.getBeneficiaries();
    const updated: BeneficiaryBreakdown = {
      ...current,
      [category]: (current[category] || 0) + count,
      total: current.total + count
    };
    setStoredItem(STORAGE_KEYS.BENEFICIARIES, updated);
    return updated;
  },

  // Reviews
  getReviews(): ReviewItem[] {
    return getStoredItem<ReviewItem[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  },

  saveReview(review: ReviewItem): ReviewItem[] {
    const reviews = this.getReviews();
    const updated = [review, ...reviews];
    setStoredItem(STORAGE_KEYS.REVIEWS, updated);
    return updated;
  },

  // Direct Messages between Volunteer / Donor and NGOs
  getMessages(): ChatMessage[] {
    return getStoredItem<ChatMessage[]>(STORAGE_KEYS.MESSAGES, []);
  },

  saveMessage(message: ChatMessage): ChatMessage[] {
    const messages = this.getMessages();
    const updated = [...messages, message];
    setStoredItem(STORAGE_KEYS.MESSAGES, updated);
    return updated;
  },

  getConversation(userAIdOrName: string, userBIdOrName: string): ChatMessage[] {
    const messages = this.getMessages();
    const a = userAIdOrName.toLowerCase();
    const b = userBIdOrName.toLowerCase();
    return messages.filter(
      m => (m.senderId.toLowerCase() === a && m.recipientId.toLowerCase() === b) ||
           (m.senderId.toLowerCase() === b && m.recipientId.toLowerCase() === a) ||
           (m.senderName.toLowerCase() === a && m.recipientName.toLowerCase() === b) ||
           (m.senderName.toLowerCase() === b && m.recipientName.toLowerCase() === a)
    );
  },

  // Clear all data (optional dev/reset utility)
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(k => {
      if (k !== STORAGE_KEYS.THEME) {
        localStorage.removeItem(k);
      }
    });
  }
};
