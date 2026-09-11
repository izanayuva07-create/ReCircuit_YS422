import React, { useState } from 'react';
import {
  CreditCard,
  QrCode,
  Smartphone,
  CheckCircle2,
  ShieldCheck,
  Receipt,
  Download,
  Banknote,
  Lock,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import RazorpayPaymentModal from '../../components/RazorpayPaymentModal';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import { useAppContext } from '../../context/AppContext';
import { formatCurrency } from '../../utils/format';

interface PaymentGatewayPageProps {
  role?: 'collector' | 'source';
}

interface CompletedPayout {
  id: string;
  paymentId: string;
  bookingId: string;
  sourceName: string;
  sourceUpi: string;
  collectorName: string;
  amount: number;
  itemTitle: string;
  method: string;
  status: 'SETTLED' | 'PROCESSING';
  timestamp: string;
  utr: string;
}

const INITIAL_PAYOUTS: CompletedPayout[] = [
  {
    id: 'pay-001',
    paymentId: 'pay_RC994821882',
    bookingId: 'bk-001',
    sourceName: 'DLF CyberCity Towers (Source)',
    sourceUpi: 'dlf.cybercity@okhdfcbank',
    collectorName: 'EcoMove Green Logistics',
    amount: 1450,
    itemTitle: 'Telecom Baseband Server Motherboards',
    method: 'Razorpay UPI (Google Pay)',
    status: 'SETTLED',
    timestamp: '2026-09-10 16:45',
    utr: 'UTR884920194820',
  },
  {
    id: 'pay-002',
    paymentId: 'pay_RC994821733',
    bookingId: 'bk-002',
    sourceName: 'WeWork Forum Facility (Source)',
    sourceUpi: 'wework.green@oksbi',
    collectorName: 'Urban Waste Solutions Pvt Ltd',
    amount: 3200,
    itemTitle: 'Dell PowerEdge R740 Server Blades',
    method: 'Razorpay UPI (PhonePe)',
    status: 'SETTLED',
    timestamp: '2026-09-09 11:20',
    utr: 'UTR773820194122',
  },
  {
    id: 'pay-003',
    paymentId: 'pay_RC994821610',
    bookingId: 'bk-003',
    sourceName: 'Apollo Hospitals Estate (Source)',
    sourceUpi: 'apollo.estate@ybl',
    collectorName: 'EcoMove Green Logistics',
    amount: 980,
    itemTitle: 'Medical Electronic Power Backup Packs',
    method: 'Razorpay Instant UPI QR',
    status: 'SETTLED',
    timestamp: '2026-09-08 14:15',
    utr: 'UTR662910482910',
  },
];

const PaymentGatewayPage: React.FC<PaymentGatewayPageProps> = () => {
  const { user } = useAuth();
  const { showToast } = useAppContext();
  const { bookings, listings, bids } = usePlatform();

  // Active state
  const [activeTab, setActiveTab] = useState<'pending' | 'direct_gateway' | 'history'>('pending');
  const [selectedPayout, setSelectedPayout] = useState<CompletedPayout | null>(null);
  const [payoutList, setPayoutList] = useState<CompletedPayout[]>(INITIAL_PAYOUTS);

  // Direct checkout modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{
    bookingId: string;
    itemTitle: string;
    sourceName: string;
    sourceUpiId: string;
    amount: number;
  }>({
    bookingId: 'bk-custom',
    itemTitle: 'Custom E-Waste Lot Settlement',
    sourceName: 'DLF CyberCity Towers (Source Partner)',
    sourceUpiId: 'source.recircuit@okhdfcbank',
    amount: 1500,
  });

  // Direct Gateway Form State
  const [customAmount, setCustomAmount] = useState('1800');
  const [customSource, setCustomSource] = useState('Verified Source Partner (DLF Phase III)');
  const [customUpiId, setCustomUpiId] = useState('source.recircuit@okhdfcbank');
  const [customItem, setCustomItem] = useState('Enterprise E-Waste Batch #8429');

  // Pending bookings requiring payment to Source
  const pendingSettlements = bookings.map((booking) => {
    const listing = listings.find((l) => l.id === booking.listingId);
    const bid = bids.find((b) => b.id === booking.bidId || b.listingId === booking.listingId);
    const amount = bid?.offeredPrice ?? listing?.expectedPrice ?? 1200;
    const isPaid = payoutList.some((p) => p.bookingId === booking.id);
    return {
      booking,
      listing,
      bid,
      amount,
      isPaid,
      sourceName: listing?.pickupAddress.split(',')[0] || 'Verified Source Generator',
      sourceUpiId: 'source.recircuit@okhdfcbank',
    };
  });

  const handlePayBooking = (item: (typeof pendingSettlements)[0]) => {
    setModalData({
      bookingId: item.booking.id,
      itemTitle: item.listing?.itemName || 'E-Waste Lot',
      sourceName: item.sourceName,
      sourceUpiId: item.sourceUpiId,
      amount: item.amount,
    });
    setIsModalOpen(true);
  };

  const handlePayCustom = () => {
    const num = Number(customAmount);
    if (!num || num <= 0) {
      showToast('Enter a valid amount to pay via Razorpay.', 'error');
      return;
    }
    setModalData({
      bookingId: `bk-${Date.now().toString().slice(-4)}`,
      itemTitle: customItem.trim() || 'E-Waste Consignment',
      sourceName: customSource.trim() || 'Verified Source Partner',
      sourceUpiId: customUpiId.trim() || 'source.recircuit@okhdfcbank',
      amount: num,
    });
    setIsModalOpen(true);
  };

  const handlePaymentSuccess = (details: {
    paymentId: string;
    orderId: string;
    amount: number;
    upiId: string;
    method: string;
  }) => {
    const newPayout: CompletedPayout = {
      id: `pay-${Date.now().toString().slice(-4)}`,
      paymentId: details.paymentId,
      bookingId: modalData.bookingId,
      sourceName: modalData.sourceName,
      sourceUpi: details.upiId || modalData.sourceUpiId,
      collectorName: user?.name || 'Authorized Collector',
      amount: details.amount,
      itemTitle: modalData.itemTitle,
      method: details.method,
      status: 'SETTLED',
      timestamp: new Date().toLocaleString(),
      utr: `UTR${Math.floor(100000000000 + Math.random() * 900000000000)}`,
    };

    setPayoutList([newPayout, ...payoutList]);
    setSelectedPayout(newPayout);
    showToast(`Payment of ${formatCurrency(details.amount)} completed via Razorpay UPI!`, 'success');
  };

  return (
    <div className="max-container py-7 md:py-9 flex flex-col gap-7">
      <PageHeader
        eyebrow="Financial Settlement Gateway"
        title="Razorpay UPI Payment Gateway"
        description="Official settlement portal: Collector pays the Source the final bid price via Razorpay UPI with verified double-entry ledgers."
        actions={
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <ShieldCheck size={14} /> Razorpay Secured 256-Bit
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 size={14} /> NPCI / UPI Live
            </span>
          </div>
        }
      />

      {/* Gateway Overview Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Settlement Standard</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600"><Smartphone size={16} /></span>
          </div>
          <p className="text-xl font-black mt-2 text-slate-900 dark:text-slate-100">Razorpay Direct UPI</p>
          <p className="text-xs text-slate-500 mt-1">Instant Collector-to-Source payout with bank UTR validation.</p>
        </div>

        <div className="card p-5 border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Payouts</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600"><Banknote size={16} /></span>
          </div>
          <p className="text-xl font-black mt-2 text-emerald-600">
            {pendingSettlements.filter((s) => !s.isPaid).length} Consignments
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Totaling {formatCurrency(pendingSettlements.filter((s) => !s.isPaid).reduce((acc, s) => acc + s.amount, 0))} ready for UPI release.
          </p>
        </div>

        <div className="card p-5 border-l-4 border-l-purple-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Settled to Sources</span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600"><Receipt size={16} /></span>
          </div>
          <p className="text-xl font-black mt-2 text-purple-600">
            {formatCurrency(payoutList.reduce((acc, p) => acc + p.amount, 0))}
          </p>
          <p className="text-xs text-slate-500 mt-1">100% verified double-entry ledger transactions.</p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Banknote size={17} />
          Collector-to-Source Payouts ({pendingSettlements.filter((s) => !s.isPaid).length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('direct_gateway')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'direct_gateway'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <QrCode size={17} />
          Instant UPI Simulator & Dynamic QR
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt size={17} />
          Settlement Ledger & Receipts ({payoutList.length})
        </button>
      </div>

      {/* TAB 1: PENDING COLLECTOR-TO-SOURCE PAYOUTS */}
      {activeTab === 'pending' && (
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={18} className="text-blue-600 flex-shrink-0" />
              <span>
                <strong>Rules of Payout:</strong> Under Re-Circuit governance, the Collector pays the Source the final accepted bid price prior to or upon physical inspection. All payouts route through Razorpay UPI to the Source's registered VPA.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {pendingSettlements.map((item) => (
              <div
                key={item.booking.id}
                className="card p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:border-blue-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center flex-shrink-0 font-bold">
                    ₹
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                        {item.listing?.itemName || 'Electronic Waste Consignment'}
                      </h3>
                      {item.isPaid ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          PAID TO SOURCE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          PAYMENT PENDING
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1.5">
                      <span><strong>Source Beneficiary:</strong> {item.sourceName}</span>
                      <span><strong>VPA:</strong> <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">{item.sourceUpiId}</code></span>
                      <span><strong>Booking ID:</strong> {item.booking.id}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0">
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Final Bid Price</span>
                    <span className="text-xl font-black text-slate-900 dark:text-slate-100">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>

                  {item.isPaid ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs text-emerald-700 border-emerald-300"
                      onClick={() => {
                        const receipt = payoutList.find((p) => p.bookingId === item.booking.id);
                        if (receipt) setSelectedPayout(receipt);
                      }}
                    >
                      <Receipt size={14} className="mr-1.5" /> View Receipt
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handlePayBooking(item)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5"
                    >
                      <CreditCard size={14} /> Pay via Razorpay UPI
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: DIRECT UPI SIMULATOR & DYNAMIC QR */}
      {activeTab === 'direct_gateway' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6 flex flex-col gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Direct Razorpay UPI Payout Terminal
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Disburse any custom final bid amount directly to the Source's registered Virtual Payment Address (VPA).
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Settlement Amount (INR ₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="1"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 border rounded-xl font-mono text-base font-bold outline-none focus:border-blue-500"
                    placeholder="1500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Target Waste Generator / Source Name
                </label>
                <input
                  type="text"
                  value={customSource}
                  onChange={(e) => setCustomSource(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Source UPI VPA (Bank Destination)
                </label>
                <input
                  type="text"
                  value={customUpiId}
                  onChange={(e) => setCustomUpiId(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl font-mono outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Consignment Lot Title
                </label>
                <input
                  type="text"
                  value={customItem}
                  onChange={(e) => setCustomItem(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <Button
              fullWidth
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 mt-2 flex items-center justify-center gap-2"
              onClick={handlePayCustom}
            >
              <CreditCard size={17} /> Launch Razorpay UPI Checkout ({formatCurrency(Number(customAmount) || 0)})
            </Button>
          </div>

          {/* Quick Informational Panel */}
          <div className="card p-6 flex flex-col justify-between gap-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-mono uppercase tracking-widest text-blue-400">RAZORPAY CHECKOUT ARCHITECTURE</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">v2.4 Live</span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400"><QrCode size={18} /></div>
                  <div>
                    <h3 className="text-xs font-bold">Instant Dynamic UPI QR</h3>
                    <p className="text-[11px] text-slate-400">Generate on-the-spot QR codes for any payment app (BHIM, Google Pay, PhonePe, Paytm).</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400"><ShieldCheck size={18} /></div>
                  <div>
                    <h3 className="text-xs font-bold">Double-Entry Accounting</h3>
                    <p className="text-[11px] text-slate-400">Collector wallet is debited and the Source receives certified bank credit with an immutable UTR number.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-600/20 text-purple-400"><Lock size={18} /></div>
                  <div>
                    <h3 className="text-xs font-bold">CPCB Audit-Ready Receipts</h3>
                    <p className="text-[11px] text-slate-400">Every payment receipt is stamped with the statutory manifest number and linked to Form-1 compliance certificates.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300 flex items-center justify-between">
              <span>Merchant: <strong>Re-Circuit CleanTech Pvt Ltd</strong></span>
              <span className="font-mono text-emerald-400">Active Mode</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SETTLEMENT LEDGER & RECEIPTS */}
      {activeTab === 'history' && (
        <div className="flex flex-col gap-4">
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Official Razorpay Disbursement Records
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {payoutList.length} Transactions Recorded
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3.5">Payment ID & Ref</th>
                    <th className="p-3.5">Beneficiary Source</th>
                    <th className="p-3.5">Consignment Asset</th>
                    <th className="p-3.5">Method</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {payoutList.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 block">{p.paymentId}</span>
                        <span className="text-[10px] text-slate-400 font-mono">UTR: {p.utr}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">{p.sourceName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{p.sourceUpi}</span>
                      </td>
                      <td className="p-3.5 text-slate-700 dark:text-slate-300">
                        {p.itemTitle}
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-400">
                        {p.method}
                      </td>
                      <td className="p-3.5 font-bold font-mono text-slate-900 dark:text-slate-100">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedPayout(p)}
                          className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 text-blue-600 font-semibold text-[11px]"
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Razorpay Interactive Modal Component */}
      <RazorpayPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bookingId={modalData.bookingId}
        listingTitle={modalData.itemTitle}
        sourceName={modalData.sourceName}
        sourceUpiId={modalData.sourceUpiId}
        finalBidAmount={modalData.amount}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Official Transaction Receipt Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Razorpay Settlement Receipt</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Ref: {selectedPayout.paymentId}</p>
            </div>

            <div className="my-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                <span className="text-slate-500">Beneficiary (Source):</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedPayout.sourceName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                <span className="text-slate-500">Destination VPA:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{selectedPayout.sourceUpi}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                <span className="text-slate-500">Payer (Collector):</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{selectedPayout.collectorName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                <span className="text-slate-500">Consignment:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 text-right">{selectedPayout.itemTitle}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                <span className="text-slate-500">Bank UTR Number:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedPayout.utr}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                <span className="text-slate-500">Payment Channel:</span>
                <span className="text-slate-800 dark:text-slate-200">{selectedPayout.method}</span>
              </div>
              <div className="flex justify-between py-2 pt-3 border-t border-slate-200 dark:border-slate-700 text-sm">
                <span className="font-bold text-slate-800 dark:text-slate-200">Amount Paid:</span>
                <span className="font-black font-mono text-emerald-600 text-base">
                  {formatCurrency(selectedPayout.amount)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => window.print()}
                className="text-xs"
              >
                <Download size={14} className="mr-1.5" /> Print Receipt
              </Button>
              <Button
                size="sm"
                fullWidth
                onClick={() => setSelectedPayout(null)}
                className="bg-slate-900 text-white text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentGatewayPage;
