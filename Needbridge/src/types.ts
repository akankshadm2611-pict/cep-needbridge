export type UserRole = 'volunteer' | 'ngo' | 'donor_seeker';

export interface UserCoordinates {
  latitude: number;
  longitude: number;
  label: string;
  city?: string;
  state?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  username?: string;
  password?: string;
  phone?: string;
  skills?: string;
  bio?: string;
  authProvider?: 'email' | 'google';
  avatar?: string;
  organizationName?: string;
  location?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  tagline?: string;
  verified?: boolean;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  joinedDate?: string;
}

export interface Campaign {
  id: string;
  title: string;
  organizationName: string;
  organizationPhone?: string;
  organizationEmail?: string;
  location: string;
  city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  category: 'Education' | 'Environment' | 'Healthcare' | 'Food Support' | 'Women Support' | 'Animal Welfare' | 'Disaster Relief' | 'Community';
  raisedAmount: number;
  targetAmount: number;
  imageUrl: string;
  description: string;
  urgent?: boolean;
  volunteersNeeded?: number;
  volunteersEnrolled?: number;
  beneficiariesCount?: number;
  startDate?: string;
  endDate?: string;
  eventTime?: string;
  requirements?: string[];
  organizerContact?: string;
  perks?: string[];
}

export interface VolunteerOpportunity {
  id: string;
  title: string;
  organizationName: string;
  organizationPhone?: string;
  organizationEmail?: string;
  category: 'Teaching' | 'Environment' | 'Healthcare' | 'Food Distribution' | 'Elderly Care' | 'Animal Care' | 'Logistics' | 'Disaster Relief';
  hoursPerDay: string;
  location: string;
  city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  startsFrom: string;
  endDate?: string;
  timeSlot?: string;
  duration?: string;
  description: string;
  skillsRequired: string[];
  requirementsChecklist?: string[];
  perksAndBenefits?: string[];
  spotsLeft: number;
  totalSpots?: number;
  applied?: boolean;
  imageUrl?: string;
  urgency?: 'High' | 'Normal';
}

export interface VolunteerRequest {
  id: string;
  volunteerName: string;
  volunteerEmail: string;
  avatar: string;
  opportunityTitle: string;
  appliedDate: string;
  status: 'pending' | 'accepted' | 'rejected';
  note?: string;
}

export interface DonationRecord {
  id: string;
  donorName: string;
  donorEmail?: string;
  campaignTitle: string;
  organizationName: string;
  amount: number;
  date: string;
  timeAgo: string;
  receiptNumber: string;
}

export interface BeneficiaryBreakdown {
  children: number;
  women: number;
  elderly: number;
  others: number;
  total: number;
}

export interface ReviewItem {
  id: string;
  authorName: string;
  role: 'Volunteer' | 'NGO Lead' | 'Community Beneficiary' | 'Donor';
  organizationOrCity: string;
  avatar: string;
  rating: number;
  feedback: string;
  date: string;
  category: string;
  verified: boolean;
}

export interface ImpactStats {
  ngosCount: number;
  volunteersCount: number;
  peopleHelpedCount: number;
  fundsRaisedTotal: number;
  hoursVolunteered: number;
  activeDrives: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  text: string;
  timestamp: string;
}
