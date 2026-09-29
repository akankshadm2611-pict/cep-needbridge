/**
 * src/components/PledgeModal.tsx — Apply for volunteer time or pledge resources.
 * Features live zero-wastage bounded quantity calculation.
 */

import React, { useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { X, Heart, Package, Clock, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Requirement } from '../../shared/types';

interface PledgeModalProps {
  requirement: Requirement | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function PledgeModal({ requirement, onClose, onSuccess }: PledgeModalProps) {
  const { isAuthenticated, user } = useAuth();
  const [kind, setKind] = useState<'time' | 'goods'>(
    requirement?.type === 'goods' ? 'goods' : 'time'
  );
  const [offeredQty, setOfferedQty] = useState<number>(10);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!requirement) return null;

  const resource = requirement.resourceNeeded;
  const remainingNeeded = resource
    ? Math.max(0, resource.quantityNeeded - resource.quantityPledged)
    : 0;

  // Live Bounded Allocation: min(offered, remainingNeeded)
  const allocatedQty = kind === 'goods' ? Math.min(offeredQty, remainingNeeded) : 0;
  const surplusPrevented = kind === 'goods' && offeredQty > remainingNeeded ? offeredQty - remainingNeeded : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Please sign in or register to submit an application or pledge.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.applications.applyOrPledge({
        requirementId: requirement.id,
        kind,
        message,
        pledgedQuantity: kind === 'goods' ? offeredQty : undefined,
      });

      setSuccess(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1600);
    } catch (err: any) {
      setError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              {kind === 'time' ? 'Volunteer Your Time' : 'Pledge Donated Resources'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              For: <span className="font-medium text-teal-600 dark:text-teal-400">{requirement.title}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">
              {kind === 'time' ? 'Application Sent!' : 'Pledge Registered!'}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
              {kind === 'time'
                ? 'The NGO coordinator has been notified and will review your profile.'
                : `Thank you! ${allocatedQty} ${resource?.unit || 'items'} have been allocated toward this requirement.`}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Type Selector (if requirement supports both) */}
            {requirement.type === 'both' && (
              <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setKind('time')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                    kind === 'time'
                      ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  Volunteer Time
                </button>
                <button
                  type="button"
                  onClick={() => setKind('goods')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                    kind === 'goods'
                      ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  Pledge Goods
                </button>
              </div>
            )}

            {/* Goods Pledge: Bounded Quantity Calculation Card */}
            {kind === 'goods' && resource && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <span>Resource Required:</span>
                  <span className="text-slate-900 dark:text-white">{resource.itemName}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Current Need Status:</span>
                  <span>
                    {resource.quantityPledged} / {resource.quantityNeeded} {resource.unit} (
                    <strong className="text-teal-600 dark:text-teal-400">{remainingNeeded} {resource.unit} remaining</strong>)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    How many {resource.unit} can you provide?
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={offeredQty}
                    onChange={(e) => setOfferedQty(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none dark:text-white"
                  />
                </div>

                {/* Live Zero Wastage Allocation Preview */}
                <div className="p-3 bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 rounded-lg space-y-1.5 text-xs text-teal-900 dark:text-teal-200">
                  <div className="flex items-center justify-between font-bold">
                    <span>Allocated for this Requirement:</span>
                    <span className="text-sm text-teal-700 dark:text-teal-300">
                      {allocatedQty} {resource.unit}
                    </span>
                  </div>
                  {surplusPrevented > 0 ? (
                    <p className="text-[11px] text-teal-800 dark:text-teal-300/80">
                      ✨ Zero-Wastage Guard: Capped at remaining need ({remainingNeeded} {resource.unit}). {surplusPrevented} {resource.unit} saved from over-supply wastage!
                    </p>
                  ) : (
                    <p className="text-[11px] text-teal-800 dark:text-teal-300/80">
                      ✓ Exactly fulfills a portion of the active requirement.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Time Volunteer info */}
            {kind === 'time' && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Volunteers Required:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {requirement.volunteersAccepted} / {requirement.volunteersNeeded} spots filled
                  </span>
                </div>
                {requirement.skillsRequired.length > 0 && (
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Preferred skills: </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {requirement.skillsRequired.join(', ')}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Location: </span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {requirement.isRemote ? 'Remote / Online' : requirement.location.city}
                  </span>
                </div>
              </div>
            )}

            {/* Message input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Optional Note / Availability Details
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Let the NGO know about your schedule, pickup details, or experience..."
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none dark:text-white"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || (kind === 'goods' && remainingNeeded <= 0)}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all"
              >
                {isSubmitting ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <Heart className="w-4 h-4 fill-current" />
                    <span>{kind === 'time' ? 'Confirm Volunteer Application' : 'Confirm Resource Pledge'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
