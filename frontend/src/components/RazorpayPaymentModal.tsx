import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  QrCode,
  Smartphone,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import { formatCurrency } from '../utils/format';

interface RazorpayPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  listingTitle: string;
  sourceName: string;
  sourceUpiId?: string;
  finalBidAmount: number;
  onPaymentSuccess: (details: {
    paymentId: string;
    orderId: string;
    amount: number;
    upiId: string;
    method: string;
  }) => void;
}

const RazorpayPaymentModal: React.FC<RazorpayPaymentModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  listingTitle,
  sourceName,
  sourceUpiId = 'recircuit.source@okhdfcbank',
  finalBidAmount,
  onPaymentSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'upi_apps' | 'upi_id' | 'qr_code' | 'card'>('upi_apps');
  const [customVpa, setCustomVpa] = useState(sourceUpiId);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'success'>('form');
  const [successData, setSuccessData] = useState<{
    paymentId: string;
    orderId: string;
    utr: string;
  } | null>(null);
  const [vpaError, setVpaError] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(900); // 15 mins

  // Generate order id
  const orderId = `order_rc_${bookingId.replace(/\D/g, '') || '9821'}_${Math.random().toString(36).substring(2, 6)}`;

  useEffect(() => {
    if (!isOpen) {
      setPaymentStep('form');
      setIsProcessing(false);
      setSuccessData(null);
    }
  }, [isOpen]);

  // Countdown timer for QR code
  useEffect(() => {
    if (!isOpen || activeTab !== 'qr_code') return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, activeTab]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExecutePayment = (method: string, upiHandle: string) => {
    if (activeTab === 'upi_id') {
      if (!customVpa.includes('@') || customVpa.length < 5) {
        setVpaError('Please enter a valid UPI VPA (e.g. name@okhdfcbank)');
        return;
      }
      setVpaError('');
    }

    setIsProcessing(true);
    setPaymentStep('processing');

    // Simulate authentic Razorpay payment capture & gateway response
    setTimeout(() => {
      const generatedPaymentId = `pay_RC${Date.now().toString().slice(-8)}${Math.floor(100 + Math.random() * 900)}`;
      const generatedUtr = `UTR${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`;

      setSuccessData({
        paymentId: generatedPaymentId,
        orderId,
        utr: generatedUtr,
      });
      setIsProcessing(false);
      setPaymentStep('success');

      // Call parent callback
      onPaymentSuccess({
        paymentId: generatedPaymentId,
        orderId,
        amount: finalBidAmount,
        upiId: upiHandle || customVpa,
        method,
      });
    }, 1800);
  };

  return (
    <Modal isOpen={isOpen} onClose={isProcessing ? () => {} : onClose} size="md">
      <div className="flex flex-col text-slate-900 dark:text-slate-100">
        {/* Razorpay Branded Top Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white rounded-t-2xl -mx-4 -mt-4 sm:-mx-6 sm:-mt-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-lg tracking-tighter shadow-md">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white">Razorpay</span>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-400/30">
                  TRUSTED UPI GATEWAY
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Direct Source Settlement · Instant Release</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">FINAL BID AMOUNT</span>
            <span className="text-lg font-black font-mono text-emerald-400">
              {formatCurrency(finalBidAmount)}
            </span>
          </div>
        </div>

        {/* Processing State */}
        {paymentStep === 'processing' && (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-4">
            <div className="relative w-16 h-16">
              <div className="w-16 h-16 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-blue-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center font-bold text-blue-600 text-sm">
                ₹
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Contacting Bank via Razorpay UPI…
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Authorizing settlement to <span className="font-semibold text-slate-700 dark:text-slate-300">{sourceName}</span>
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Lock size={12} className="text-emerald-500" /> 256-bit SSL Bank Handshake
            </span>
          </div>
        )}

        {/* Success State */}
        {paymentStep === 'success' && successData && (
          <div className="py-8 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-bounce">
              <CheckCircle2 size={38} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-emerald-600 dark:text-emerald-400 block">
                PAYMENT CAPTURED
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                {formatCurrency(finalBidAmount)} Paid to Source
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                Funds have been directly settled to <span className="font-semibold">{sourceName}</span>. The booking is now authorized for final OTP handover.
              </p>
            </div>

            {/* Receipt Box */}
            <div className="w-full bg-slate-50 dark:bg-slate-900/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2 mt-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Razorpay Payment ID:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{successData.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bank UPI Reference / UTR:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{successData.utr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Beneficiary:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{sourceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Asset Lot:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{listingTitle}</span>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={onClose}
              className="bg-emerald-600 hover:bg-emerald-700 text-white w-full text-xs font-bold py-3 mt-2"
            >
              Continue to Pickup OTP Hand-off
            </Button>
          </div>
        )}

        {/* Payment Form State */}
        {paymentStep === 'form' && (
          <div className="pt-4 flex flex-col gap-4">
            {/* Payee Info Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">BENEFICIARY SOURCE</span>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{sourceName}</p>
                <p className="text-slate-500 text-[11px] font-mono mt-0.5">{sourceUpiId}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">ITEM</span>
                <p className="font-medium text-slate-700 dark:text-slate-300 text-xs truncate max-w-[140px]">
                  {listingTitle}
                </p>
              </div>
            </div>

            {/* Method Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('upi_apps')}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'upi_apps'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Smartphone size={14} /> UPI Apps
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('upi_id')}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'upi_id'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Sparkles size={14} /> Custom UPI
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('qr_code')}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'qr_code'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <QrCode size={14} /> QR Code
              </button>
            </div>

            {/* Tab 1: UPI Fast Apps */}
            {activeTab === 'upi_apps' && (
              <div className="space-y-2.5">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select your installed UPI application to authorize the payment via Razorpay:
                </p>

                {[
                  { name: 'Google Pay', handle: `${sourceName.toLowerCase().replace(/\s+/g, '')}@okaxis`, color: '#4285F4', icon: 'G' },
                  { name: 'PhonePe', handle: `${sourceName.toLowerCase().replace(/\s+/g, '')}@ybl`, color: '#5f259f', icon: 'P' },
                  { name: 'Paytm UPI', handle: `${sourceName.toLowerCase().replace(/\s+/g, '')}@paytm`, color: '#00BAF2', icon: '₹' },
                  { name: 'BHIM Government UPI', handle: `${sourceName.toLowerCase().replace(/\s+/g, '')}@upi`, color: '#00833e', icon: 'B' },
                ].map((app) => (
                  <button
                    key={app.name}
                    type="button"
                    onClick={() => handleExecutePayment('UPI_APP', app.handle)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-slate-800/80 flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-sm"
                        style={{ backgroundColor: app.color }}
                      >
                        {app.icon}
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600">
                          {app.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">Pay to {app.handle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                      Pay <ArrowRight size={14} />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Tab 2: Custom UPI ID / VPA */}
            {activeTab === 'upi_id' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter your Virtual Payment Address (VPA) to receive an instant collect request:
                </p>

                <div>
                  <label htmlFor="upi-vpa-input" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Your UPI VPA Address
                  </label>
                  <input
                    id="upi-vpa-input"
                    type="text"
                    value={customVpa}
                    onChange={(e) => setCustomVpa(e.target.value)}
                    placeholder="e.g. mobileNumber@upi or collector@okhdfcbank"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {vpaError && <p className="text-[11px] text-rose-500 mt-1">{vpaError}</p>}
                </div>

                <div className="flex items-center gap-2">
                  {['@okhdfcbank', '@oksbi', '@ybl', '@paytm'].map((suffix) => (
                    <button
                      key={suffix}
                      type="button"
                      onClick={() => {
                        const prefix = customVpa.split('@')[0] || 'collector';
                        setCustomVpa(`${prefix}${suffix}`);
                      }}
                      className="text-[10px] font-mono px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    >
                      {suffix}
                    </button>
                  ))}
                </div>

                <Button
                  variant="primary"
                  onClick={() => handleExecutePayment('UPI_VPA', customVpa)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 mt-1"
                >
                  Verify & Pay {formatCurrency(finalBidAmount)}
                </Button>
              </div>
            )}

            {/* Tab 3: Instant Dynamic UPI QR Code */}
            {activeTab === 'qr_code' && (
              <div className="flex flex-col items-center text-center gap-3 py-2">
                <div className="p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-md">
                  {/* Dynamic SVG UPI QR Code representation */}
                  <div className="w-48 h-48 bg-slate-950 p-2 rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
                    {/* SVG QR Code Pattern */}
                    <svg viewBox="0 0 100 100" className="w-full h-full text-white" fill="currentColor">
                      <path d="M10,10 h30 v30 h-30 z M15,15 v20 h20 v-20 z M20,20 h10 v10 h-10 z" />
                      <path d="M60,10 h30 v30 h-30 z M65,15 v20 h20 v-20 z M70,20 h10 v10 h-10 z" />
                      <path d="M10,60 h30 v30 h-30 z M15,65 v20 h20 v-20 z M20,70 h10 v10 h-10 z" />
                      <path d="M45,10 h10 v10 h-10 z M45,25 h10 v10 h-10 z M45,40 h20 v10 h-20 z" />
                      <path d="M60,45 h10 v10 h-10 z M75,45 h15 v10 h-15 z M80,60 h10 v20 h-10 z" />
                      <path d="M45,60 h15 v10 h-15 z M45,75 h10 v15 h-10 z M60,75 h20 v15 h-20 z" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow">
                        ₹
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Scan with Any UPI App to Settle
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    GPay · PhonePe · Paytm · Amazon Pay · Cred
                  </p>
                  <span className="inline-block font-mono font-bold text-xs text-rose-500 mt-1">
                    Valid for {formatTimer(timerSeconds)}
                  </span>
                </div>

                <Button
                  variant="primary"
                  onClick={() => handleExecutePayment('UPI_QR', sourceUpiId)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5"
                >
                  Simulate QR Payment Approval
                </Button>
              </div>
            )}

            {/* Footer Trust Guarantee */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck size={12} className="text-emerald-500" /> Razorpay SafeEscrow Protection
              </span>
              <span>Ref: {orderId}</span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default RazorpayPaymentModal;
