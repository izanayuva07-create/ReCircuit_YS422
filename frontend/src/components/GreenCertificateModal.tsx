import React from 'react';
import {
  Printer,
  ShieldCheck,
  Award,
  CheckCircle2,
  FileCheck,
  Copy,
} from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

interface GreenCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateData?: {
    certId?: string;
    itemName?: string;
    category?: string;
    weightKg?: number;
    sellerName?: string;
    collectorName?: string;
    recyclerName?: string;
    completedAt?: string;
    goldGrams?: number;
    copperKg?: number;
    co2SavedKg?: number;
    hash?: string;
  };
}

const GreenCertificateModal: React.FC<GreenCertificateModalProps> = ({
  isOpen,
  onClose,
  certificateData,
}) => {
  const cert = {
    certId: certificateData?.certId || 'CPCB-RC-2026-IND-84291',
    itemName: certificateData?.itemName || 'Enterprise Server Motherboard & Micro-SMD Components',
    category: certificateData?.category || 'IT & Telecom Equipment (ITEW1)',
    weightKg: certificateData?.weightKg || 4.8,
    sellerName: certificateData?.sellerName || 'Verified Source Partner',
    collectorName: certificateData?.collectorName || 'EcoLogix Green Logistics (CPCB/REG/2023)',
    recyclerName: certificateData?.recyclerName || 'EcoSmelt Hydrometallurgical Refinery (R2v3/CPCB)',
    completedAt: certificateData?.completedAt || new Date().toISOString().slice(0, 10),
    goldGrams: certificateData?.goldGrams || 1.35,
    copperKg: certificateData?.copperKg || 1.82,
    co2SavedKg: certificateData?.co2SavedKg || 42.6,
    hash:
      certificateData?.hash ||
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyHash = () => {
    navigator.clipboard?.writeText(cert.hash);
    alert('Cryptographic SHA-256 validation hash copied to clipboard.');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex flex-col gap-5 p-2 sm:p-4 text-slate-900 dark:text-slate-100 print:p-0">
        {/* Certificate Card Printable Container */}
        <div
          id="printable-certificate"
          className="relative rounded-3xl border-4 border-double border-emerald-600/60 bg-gradient-to-b from-emerald-50/40 via-white to-emerald-50/20 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 p-6 sm:p-8 shadow-2xl overflow-hidden print:border-none print:shadow-none"
        >
          {/* Watermark Logo in Background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
            <Award size={400} />
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-emerald-600/30 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <ShieldCheck size={32} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-emerald-700 dark:text-emerald-400 block">
                  CPCB E-Waste Rules 2022 · Form-1 Standard
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50">
                  Green Compliance Certificate
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Safe Destruction, Traceable Custody & Critical Mineral Recovery
                </p>
              </div>
            </div>

            <div className="text-right self-end sm:self-auto">
              <span className="text-[10px] font-mono text-slate-400 block">Certificate No.</span>
              <span className="text-sm font-mono font-bold text-emerald-700 dark:text-emerald-300">
                {cert.certId}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Date: {cert.completedAt}</span>
            </div>
          </div>

          {/* Main Statement */}
          <div className="my-5 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            This is to certify that the electronic waste item detailed below has been formally collected,
            inventoried, and destructed in accordance with statutory environmental guidelines. All hazardous
            constituents have been safely neutralized, and recyclable elements extracted for circular
            manufacturing.
          </div>

          {/* Two-Column Custody Ledger */}
          <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-emerald-950/5 dark:bg-slate-800/40 border border-emerald-600/20 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Recovered Asset Details
              </span>
              <p className="font-bold text-slate-900 dark:text-slate-100 mt-1">{cert.itemName}</p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                Category: {cert.category} · Net Weight: {cert.weightKg} kg
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Audited Hand-off Chain
              </span>
              <p className="text-slate-700 dark:text-slate-300 mt-1">
                <span className="font-semibold">Generator:</span> {cert.sellerName}
              </p>
              <p className="text-slate-700 dark:text-slate-300 text-[11px]">
                <span className="font-semibold">Collector:</span> {cert.collectorName}
              </p>
              <p className="text-slate-700 dark:text-slate-300 text-[11px]">
                <span className="font-semibold">Recycler / Smelter:</span> {cert.recyclerName}
              </p>
            </div>
          </div>

          {/* Material Yield & Ecological Impact Grid */}
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                Precious Gold (Au)
              </span>
              <span className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5 block">
                {cert.goldGrams}g
              </span>
              <span className="text-[10px] text-slate-400">99.9% Purity</span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                Electrolytic Copper
              </span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                {cert.copperKg} kg
              </span>
              <span className="text-[10px] text-slate-400">Grade A Cathode</span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                CO2e Abated
              </span>
              <span className="text-lg font-black text-teal-600 dark:text-teal-400 mt-0.5 block">
                {cert.co2SavedKg} kg
              </span>
              <span className="text-[10px] text-slate-400">Avoided Emissions</span>
            </div>
          </div>

          {/* Cryptographic SHA-256 Audit Bar */}
          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] text-slate-400 font-mono">
            <div className="flex items-center gap-1.5 truncate max-w-md">
              <FileCheck size={14} className="text-emerald-500 flex-shrink-0" />
              <span className="truncate">SHA-256: {cert.hash}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyHash}
              className="text-emerald-600 hover:text-emerald-500 font-sans font-semibold flex items-center gap-1 self-end sm:self-auto"
            >
              <Copy size={12} /> Copy Audit Hash
            </button>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 print:hidden">
          <Button variant="outline" onClick={handlePrint}>
            <Printer size={16} className="mr-2" /> Print Certificate
          </Button>
          <Button onClick={onClose}>
            <CheckCircle2 size={16} className="mr-2" /> Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default GreenCertificateModal;
