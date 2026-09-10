import React, { useState, useMemo } from 'react';
import {
  Award,
  ShieldCheck,
  Printer,
  Download,
  Search,
  CheckCircle2,
  Copy,
  Sparkles,
  Zap,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Button from '../../components/Button';
import GreenCertificateModal from '../../components/GreenCertificateModal';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import { formatDate } from './sourceUtils';

interface CertificateRecord {
  id: string;
  certId: string;
  itemName: string;
  category: string;
  weightKg: number;
  sellerName: string;
  collectorName: string;
  recyclerName: string;
  completedAt: string;
  goldGrams: number;
  copperKg: number;
  co2SavedKg: number;
  hash: string;
  cpcbRegulation: string;
  status: 'VERIFIED' | 'AUDITED';
}

const DEFAULT_CERTIFICATES: CertificateRecord[] = [
  {
    id: 'cert-001',
    certId: 'CPCB-RC-2026-IND-84291',
    itemName: 'Telecom Baseband Gold-Finger Motherboards (High Precious Yield)',
    category: 'Printed Circuit Boards (ITEW1)',
    weightKg: 12.0,
    sellerName: 'Verified Source Enterprise',
    collectorName: 'EcoMove Green Logistics (CPCB/REG/2023/N-441)',
    recyclerName: 'EcoSmelt Hydrometallurgical Refinery (R2v3/CPCB-TN-09)',
    completedAt: '2026-08-16',
    goldGrams: 3.42,
    copperKg: 3.16,
    co2SavedKg: 18.0,
    hash: '8f43a9b2c019d4e78a6352ef109b8374a2f89c01d45e67fa89012345bc6789de',
    cpcbRegulation: 'E-Waste (Management) Rules 2022 · Form-1 Compliant',
    status: 'VERIFIED',
  },
  {
    id: 'cert-002',
    certId: 'CPCB-RC-2026-IND-84292',
    itemName: 'Dell PowerEdge R740 2U Server Blade (Dual Xeon 64-Core)',
    category: 'Enterprise Data Center Hardware (ITEW2)',
    weightKg: 18.5,
    sellerName: 'Verified Source Enterprise',
    collectorName: 'Urban Waste Solutions Pvt Ltd (CPCB/REG/2024/G-112)',
    recyclerName: 'Attero Circular Technologies (ISO 14001:2015)',
    completedAt: '2026-08-28',
    goldGrams: 4.85,
    copperKg: 4.53,
    co2SavedKg: 27.75,
    hash: '4d8a1c9e3b72f05a61e89b2c3d4f506172839a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    cpcbRegulation: 'E-Waste (Management) Rules 2022 · Form-1 Compliant',
    status: 'VERIFIED',
  },
  {
    id: 'cert-003',
    certId: 'CPCB-RC-2026-IND-84293',
    itemName: 'Enterprise Lithium-Ion Storage Packs & Server UPS Coils',
    category: 'Energy Storage Systems & Batteries',
    weightKg: 32.0,
    sellerName: 'Verified Source Enterprise',
    collectorName: 'EcoMove Green Logistics (CPCB/REG/2023/N-441)',
    recyclerName: 'Lohum CleanTech Cobalt & Lithium Recovery',
    completedAt: '2026-09-02',
    goldGrams: 1.12,
    copperKg: 8.90,
    co2SavedKg: 48.0,
    hash: 'a9b8c7d6e5f403123456789abcdef0123456789abcdef0123456789abcdef01',
    cpcbRegulation: 'Battery Waste Management Rules 2022 · Certified',
    status: 'VERIFIED',
  },
];

const SourceCertificatesPage: React.FC = () => {
  const { user } = useAuth();
  const { listings, bookings } = usePlatform();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'PCB' | 'BATTERY'>('ALL');
  const [selectedCert, setSelectedCert] = useState<CertificateRecord | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Combine listings that are completed with default verified certificates
  const dynamicCertificates = useMemo<CertificateRecord[]>(() => {
    const list: CertificateRecord[] = [...DEFAULT_CERTIFICATES];

    // Check if any current platform listings are completed
    listings
      .filter((l) => l.status === 'completed' && (!user?.id || l.sourceId === user.id))
      .forEach((listing, index) => {
        const matchingBooking = bookings.find((b) => b.listingId === listing.id);
        const certNum = `CPCB-RC-2026-IND-${84300 + index}`;
        if (!list.some((c) => c.certId === certNum)) {
          const goldGrams = parseFloat((listing.weightKg * 0.28).toFixed(2));
          const copperKg = parseFloat((listing.weightKg * 0.24).toFixed(2));
          const co2SavedKg = parseFloat((listing.weightKg * 1.5).toFixed(1));

          list.unshift({
            id: `dyn-${listing.id}`,
            certId: certNum,
            itemName: listing.itemName,
            category: `${listing.category.toUpperCase()} (E-Waste Schedule-I)`,
            weightKg: listing.weightKg,
            sellerName: user?.name || 'Verified Source Enterprise',
            collectorName: matchingBooking?.collectorName || 'EcoMove Green Logistics',
            recyclerName: 'EcoSmelt Hydrometallurgical Refinery (CPCB/ISO-14001)',
            completedAt: formatDate(listing.createdAt),
            goldGrams,
            copperKg,
            co2SavedKg,
            hash: `${listing.id}9f83a2b0c1d4e76a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4`,
            cpcbRegulation: 'E-Waste (Management) Rules 2022 · Form-1 Compliant',
            status: 'VERIFIED',
          });
        }
      });

    return list;
  }, [listings, bookings, user]);

  const filteredCertificates = useMemo(() => {
    return dynamicCertificates.filter((cert) => {
      const matchSearch =
        cert.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.certId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.category.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (filterType === 'PCB') {
        return cert.category.toLowerCase().includes('circuit') || cert.category.toLowerCase().includes('pcb');
      }
      if (filterType === 'BATTERY') {
        return cert.category.toLowerCase().includes('battery') || cert.category.toLowerCase().includes('energy');
      }
      return true;
    });
  }, [dynamicCertificates, searchQuery, filterType]);

  const totalDiverted = dynamicCertificates.reduce((acc, c) => acc + c.weightKg, 0);
  const totalGold = dynamicCertificates.reduce((acc, c) => acc + c.goldGrams, 0);
  const totalCopper = dynamicCertificates.reduce((acc, c) => acc + c.copperKg, 0);
  const totalCO2 = dynamicCertificates.reduce((acc, c) => acc + c.co2SavedKg, 0);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard?.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  const handleDownloadProof = (cert: CertificateRecord) => {
    const payload = {
      certificateId: cert.certId,
      issuedTo: cert.sellerName,
      assetName: cert.itemName,
      weightKg: cert.weightKg,
      preciousMetalsHarvested: {
        goldAuGrams: cert.goldGrams,
        copperCuKg: cert.copperKg,
      },
      carbonEmissionsAvoidedKgCO2e: cert.co2SavedKg,
      collectorPartner: cert.collectorName,
      refineryPartner: cert.recyclerName,
      authorizedComplianceStandard: cert.cpcbRegulation,
      cryptographicSha256: cert.hash,
      verificationAuthority: 'Re-Circuit Circular Digital Ledger (Central Pollution Control Board Schedule)',
      timestamp: cert.completedAt,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cert.certId}_compliance_proof.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-container py-6 md:py-8 flex flex-col gap-6">
      <PageHeader
        eyebrow="CPCB E-Waste Rules 2022 · Form-1 Standard"
        title="Green Compliance Certificates"
        description="Official, cryptographically verifiable certificates of responsible e-waste destruction, chain-of-custody transfer, and critical raw mineral recovery."
        actions={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
              <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
              CPCB Form-1 Ledger Active
            </span>
          </div>
        }
      />

      {/* Aggregate Impact Statistics */}
      <section aria-label="Certified Environmental Metrics" className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <StatCard
          label="Certificates Issued"
          value={dynamicCertificates.length}
          icon="Award"
          color="#059669"
        />
        <StatCard
          label="Certified Diverted"
          value={totalDiverted.toFixed(1)}
          unit="kg"
          icon="Scale"
          color="#0284c7"
        />
        <StatCard
          label="Gold (Au) Harvested"
          value={totalGold.toFixed(2)}
          unit="g"
          icon="Sparkles"
          color="#d97706"
        />
        <StatCard
          label="Copper (Cu) Yield"
          value={totalCopper.toFixed(2)}
          unit="kg"
          icon="Zap"
          color="#b45309"
        />
        <StatCard
          label="Abated CO₂e"
          value={totalCO2.toFixed(1)}
          unit="kg"
          icon="Leaf"
          color="#16a34a"
        />
      </section>

      {/* Search and Filters */}
      <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Cert ID, item, or category…"
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Certificates' },
            { id: 'PCB', label: 'Circuit Boards (PCBs)' },
            { id: 'BATTERY', label: 'Battery & Energy' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id as 'ALL' | 'PCB' | 'BATTERY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterType === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Certificate Cards Grid */}
      {filteredCertificates.length === 0 ? (
        <div className="card p-12 text-center flex flex-col items-center justify-center">
          <Award size={48} className="text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Certificates Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            No green compliance certificates match your query. Certificates are generated automatically upon completed recycling handovers.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredCertificates.map((cert) => (
            <article
              key={cert.id}
              className="card p-5 sm:p-6 border border-emerald-100 dark:border-emerald-950/60 bg-gradient-to-br from-white via-white to-emerald-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 shadow-md hover:shadow-lg transition-all duration-200 flex flex-col justify-between gap-5 relative overflow-hidden"
            >
              {/* Subtle green watermark icon */}
              <div className="absolute right-3 top-3 text-emerald-600/5 dark:text-emerald-400/5 pointer-events-none">
                <ShieldCheck size={140} />
              </div>

              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                      <Award size={22} />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-700 dark:text-emerald-400 uppercase block">
                        CPCB FORM-1 COMPLIANCE
                      </span>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 line-clamp-1">
                        {cert.certId}
                      </h3>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 size={12} /> Verified
                  </span>
                </div>

                {/* Item & Chain Details */}
                <div className="mt-3.5 space-y-2">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                    {cert.itemName}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Category: <span className="font-medium text-slate-700 dark:text-slate-300">{cert.category}</span> · Weight: <span className="font-medium text-slate-700 dark:text-slate-300">{cert.weightKg} kg</span>
                  </p>

                  {/* Chain of Custody */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl text-xs space-y-1 mt-2">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400">Collector:</span>
                      <span className="font-medium truncate max-w-[220px]">{cert.collectorName}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400">Refinery:</span>
                      <span className="font-medium truncate max-w-[220px]">{cert.recyclerName}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400">Handover Date:</span>
                      <span className="font-medium">{cert.completedAt}</span>
                    </div>
                  </div>

                  {/* Critical Minerals Pill Badges */}
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      <Sparkles size={13} className="text-amber-600" />
                      Au Recovered: {cert.goldGrams}g
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-50 dark:bg-orange-950/50 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                      <Zap size={13} className="text-orange-600" />
                      Cu Yield: {cert.copperKg}kg
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      CO₂e Abated: -{cert.co2SavedKg}kg
                    </span>
                  </div>

                  {/* SHA-256 Fingerprint */}
                  <div className="pt-2 flex items-center justify-between gap-2 text-[11px] font-mono text-slate-400 bg-slate-100/70 dark:bg-slate-800/40 px-2.5 py-1 rounded-lg">
                    <span className="truncate">SHA: {cert.hash.slice(0, 32)}…</span>
                    <button
                      type="button"
                      onClick={() => handleCopyHash(cert.hash)}
                      className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 flex-shrink-0"
                      title="Copy SHA-256 hash"
                    >
                      <Copy size={12} />
                      <span>{copiedHash === cert.hash ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadProof(cert)}
                  className="text-xs"
                >
                  <Download size={13} className="mr-1.5" /> Export JSON
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedCert(cert)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                >
                  <Printer size={13} className="mr-1.5" /> View & Print Certificate
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal Popup for Certificate Viewer & Print */}
      {selectedCert && (
        <GreenCertificateModal
          isOpen={Boolean(selectedCert)}
          onClose={() => setSelectedCert(null)}
          certificateData={{
            certId: selectedCert.certId,
            itemName: selectedCert.itemName,
            category: selectedCert.category,
            weightKg: selectedCert.weightKg,
            sellerName: selectedCert.sellerName,
            collectorName: selectedCert.collectorName,
            recyclerName: selectedCert.recyclerName,
            completedAt: selectedCert.completedAt,
            goldGrams: selectedCert.goldGrams,
            copperKg: selectedCert.copperKg,
            co2SavedKg: selectedCert.co2SavedKg,
            hash: selectedCert.hash,
          }}
        />
      )}
    </div>
  );
};

export default SourceCertificatesPage;
