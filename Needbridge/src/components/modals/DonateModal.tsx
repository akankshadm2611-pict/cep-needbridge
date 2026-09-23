import React, { useState } from 'react';
import { X, Heart, ShieldCheck, CheckCircle2, Sparkles, CreditCard, Wallet } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Campaign, DonationRecord } from '../../types';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign | null;
  onDonateSuccess: (donation: DonationRecord) => void;
}

export const DonateModal: React.FC<DonateModalProps> = ({
  isOpen,
  onClose,
  campaign,
  onDonateSuccess,
}) => {
  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState('Meera Iyer');
  const [donorEmail, setDonorEmail] = useState('meera.iyer@example.org');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !campaign) return null;

  const quickAmounts = [500, 1000, 2500, 5000];

  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = customAmount ? parseInt(customAmount, 10) : amount;
    if (!finalAmount || isNaN(finalAmount)) return;

    setProcessing(true);

    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0d9488', '#f59e0b', '#8b5cf6', '#10b981']
      });

      const newDonation: DonationRecord = {
        id: `don-${Date.now()}`,
        donorName: donorName.trim() || 'Anonymous Donor',
        donorEmail: donorEmail.trim(),
        campaignTitle: campaign.title,
        organizationName: campaign.organizationName,
        amount: finalAmount,
        date: '15 May 2026',
        timeAgo: 'Just now',
        receiptNumber: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`
      };

      onDonateSuccess(newDonation);

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2200);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 via-purple-800 to-teal-700 p-5 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-4 h-4 text-purple-200 fill-purple-200" />
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-200">
              Verified Direct Donation
            </span>
          </div>
          <h3 className="text-xl font-bold font-display">{campaign.title}</h3>
          <p className="text-xs text-purple-100 mt-0.5">Organized by {campaign.organizationName}</p>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Donation Successful!</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
              Thank you, {donorName}! ₹{customAmount || amount} has been securely transferred to {campaign.organizationName}. Tax receipt has been generated.
            </p>
          </div>
        ) : (
          <form onSubmit={handleDonate} className="p-6 space-y-4">
            
            {/* Amount Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Select Amount (INR)
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2.5">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setAmount(amt);
                      setCustomAmount('');
                    }}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      amount === amt && !customAmount
                        ? 'border-purple-600 dark:border-purple-500 bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 ring-2 ring-purple-600/20'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800/50'
                    }`}
                  >
                    ₹{amt.toLocaleString()}
                  </button>
                ))}
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-500 dark:text-slate-400">₹</span>
                <input
                  type="number"
                  placeholder="Or enter custom amount"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                  }}
                  className="w-full pl-8 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>
            </div>

            {/* Donor info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Receipt Email</label>
                <input
                  type="email"
                  required
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-2 text-center rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                    paymentMethod === 'upi' ? 'border-purple-600 dark:border-purple-500 bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800'
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  UPI / QR
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2 text-center rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                    paymentMethod === 'card' ? 'border-purple-600 dark:border-purple-500 bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-2 text-center rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                    paymentMethod === 'netbanking' ? 'border-purple-600 dark:border-purple-500 bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800'
                  }`}
                >
                  NetBanking
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={processing}
                className="w-full py-2.5 bg-gradient-to-r from-purple-700 to-purple-800 hover:from-purple-800 hover:to-purple-900 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-800/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-75"
              >
                {processing ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    <span>Confirm & Donate ₹{(customAmount ? parseInt(customAmount, 10) : amount).toLocaleString()}</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Eligible for 80G Indian Tax Deduction Certificate</span>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
