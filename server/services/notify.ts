/**
 * server/services/notify.ts — In-app notification service.
 */

import { NotificationsRepo } from '../db/repositories/index.js';
import type { Notification } from '../../shared/types.js';

type NotifInput = Omit<Notification, 'id' | 'createdAt'>;

export async function createNotification(data: NotifInput): Promise<Notification> {
  return NotificationsRepo.create(data);
}

export async function notifyApplicationDecision(
  volunteerId: string,
  requirementTitle: string,
  requirementId: string,
  accepted: boolean
): Promise<void> {
  await createNotification({
    userId: volunteerId,
    type: accepted ? 'application_accepted' : 'application_rejected',
    title: accepted
      ? `Your application was accepted! 🎉`
      : `Update on your application`,
    body: accepted
      ? `Your application for "${requirementTitle}" has been accepted. The NGO will contact you soon.`
      : `Thank you for applying to "${requirementTitle}". The NGO has filled this requirement, but your enthusiasm is appreciated.`,
    link: `/requirements/${requirementId}`,
  });
}

export async function notifyPledgeAccepted(
  volunteerId: string,
  requirementTitle: string,
  requirementId: string,
  allocatedQty: number,
  unit: string
): Promise<void> {
  await createNotification({
    userId: volunteerId,
    type: 'application_accepted',
    title: `Your pledge was accepted! 🎉`,
    body: `${allocatedQty} ${unit} for "${requirementTitle}" accepted. Please coordinate delivery with the NGO.`,
    link: `/requirements/${requirementId}`,
  });
}

export async function notifyNewApplication(
  ngoUserId: string,
  volunteerName: string,
  requirementTitle: string,
  requirementId: string
): Promise<void> {
  await createNotification({
    userId: ngoUserId,
    type: 'general',
    title: `New application from ${volunteerName}`,
    body: `${volunteerName} has applied for "${requirementTitle}". Review and respond.`,
    link: `/requirements/${requirementId}/applications`,
  });
}

export async function notifyVerificationUpdate(
  ngoUserId: string,
  status: 'verified' | 'rejected',
  note?: string
): Promise<void> {
  await createNotification({
    userId: ngoUserId,
    type: 'verification_update',
    title: status === 'verified' ? `Your NGO is Verified! ✅` : `Verification Update — Action Needed`,
    body:
      status === 'verified'
        ? `Congratulations! Your NGO has been verified. You can now publish requirements.`
        : `Your verification was not approved. Admin note: ${note ?? 'Please re-upload documents.'}`,
    link: '/ngo/profile',
  });
}

export async function notifyDeadlineApproaching(
  ngoUserId: string,
  requirementTitle: string,
  requirementId: string,
  daysLeft: number
): Promise<void> {
  await createNotification({
    userId: ngoUserId,
    type: 'deadline_approaching',
    title: `Deadline in ${daysLeft} day${daysLeft === 1 ? '' : 's'}: ${requirementTitle}`,
    body: `Your requirement "${requirementTitle}" deadline is approaching. Review applications and close or extend the requirement.`,
    link: `/requirements/${requirementId}`,
  });
}

export async function notifyPledgeFulfilled(
  volunteerUserId: string,
  requirementTitle: string,
  requirementId: string,
  ngoName: string,
  hasProofImage: boolean
): Promise<void> {
  await createNotification({
    userId: volunteerUserId,
    type: 'pledge_fulfilled',
    title: `Donation Verified & Utilized! 🌟`,
    body: `${ngoName} has confirmed delivery and verified utilization for "${requirementTitle}". ${hasProofImage ? 'Photo proof of impact is now available in your dashboard!' : ''}`,
    link: `/dashboard`,
  });
}
