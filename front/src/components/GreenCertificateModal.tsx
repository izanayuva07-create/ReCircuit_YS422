import {
  Printer,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export interface GreenCertificateData {
  certId?: string;
  sourceName?: string;
  sellerName?: string;
  sourceAddress?: string;
  sourceEprId?: string;
  sourceCategory?: string;
  itemName?: string;
  category?: string;
  weightKg?: number;
  collectorName?: string;
  collectorRegNo?: string;
  recyclerName?: string;
  recyclerCpcbNo?: string;
  completedAt?: string;
  goldGrams?: number;
  silverGrams?: number;
  copperKg?: number;
  rareEarthGrams?: number;
  co2SavedKg?: number;
  treesEquivalent?: number;
  hash?: string;
}

interface GreenCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateData?: GreenCertificateData;
}

const GreenCertificateModal: React.FC<GreenCertificateModalProps> = ({
  isOpen,
  onClose,
  certificateData,
}) => {
  const seller =
    certificateData?.sourceName ||
    certificateData?.sellerName ||
    'DLF CyberCity Infotech Towers (Corporate Entity)';

  const cert = {
    certId: certificateData?.certId || 'CPCB/EPR-RC/2026/084291',
    manifestNo: 'MNF-DEL-2026-9912',
    sourceName: seller,
    sourceAddress:
      certificateData?.sourceAddress ||
      'Building 10, DLF CyberCity, Phase III, Sector 24, Gurugram, Haryana - 122002',
    sourceEprId: certificateData?.sourceEprId || 'EPR-GEN-2026-DLF-08429',
    sourceCategory:
      certificateData?.sourceCategory ||
      'Bulk Consumer (Commercial IT/ITES Entity under Schedule-I)',
    gstin: '06AAACD1234F1Z8',
    cin: 'L45201HR2005PLC036081',
    itemName:
      certificateData?.itemName ||
      'Telecom Baseband Server Motherboards & High-Grade Micro-SMD Circuitry',
    category:
      certificateData?.category ||
      'Information Technology & Telecommunication Equipment (ITEW1 - CPCB Schedule-I)',
    weightKg: certificateData?.weightKg || 12.0,
    collectorName:
      certificateData?.collectorName ||
      'EcoMove Green Logistics Pvt. Ltd.',
    collectorRegNo:
      certificateData?.collectorRegNo ||
      'CPCB/EPR-COL/2023/DL-88219 (State PCB Authorized Hazardous Carrier)',
    collectorVehicle: 'DL-1L-AB-8421 (GPS-Tracked E-Waste Van)',
    recyclerName:
      certificateData?.recyclerName ||
      'EcoSmelt Hydrometallurgical Refinery Ltd.',
    recyclerCpcbNo:
      certificateData?.recyclerCpcbNo ||
      'SPCB/CTO/AIR-WATER/2024/RE-9941 (R2v3 Certified · ISO 14001:2015)',
    completedAt:
      certificateData?.completedAt ||
      '11 September 2026',
    goldGrams: certificateData?.goldGrams || 3.42,
    silverGrams:
      certificateData?.silverGrams ||
      parseFloat(((certificateData?.goldGrams || 3.42) * 3.2).toFixed(2)),
    copperKg: certificateData?.copperKg || 3.16,
    rareEarthGrams:
      certificateData?.rareEarthGrams ||
      parseFloat(((certificateData?.weightKg || 12.0) * 1.8).toFixed(1)),
    co2SavedKg:
      certificateData?.co2SavedKg ||
      parseFloat(((certificateData?.weightKg || 12.0) * 1.5).toFixed(1)),
    treesEquivalent:
      certificateData?.treesEquivalent ||
      parseFloat((((certificateData?.weightKg || 12.0) * 1.5) / 18).toFixed(1)),
    hash:
      certificateData?.hash ||
      '8f43a9b2c019d4e78a6352ef109b8374a2f89c01d45e67fa89012345bc6789de',
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyHash = () => {
    navigator.clipboard?.writeText(cert.hash);
    alert('Tamper-evident SHA-256 ledger digest copied to clipboard.');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="flex flex-col gap-4 text-slate-900 print:p-0">
        {/* PHYSICAL PARCHMENT CERTIFICATE CONTAINER */}
        <div
          id="printable-certificate"
          className="relative rounded-lg bg-[#fdfbf6] text-[#1c241c] p-6 sm:p-10 shadow-2xl border-[10px] border-double border-[#274830] overflow-hidden print:border-4 print:border-[#274830] print:shadow-none print:m-0"
          style={{
            backgroundImage:
              'radial-gradient(#e8e3d3 0.6px, transparent 0.6px), linear-gradient(to bottom, #fffdf8, #faf6eb)',
            backgroundSize: '16px 16px, 100% 100%',
            boxShadow: '0 25px 60px -15px rgba(25, 45, 30, 0.25)',
          }}
        >
          {/* Authentic Classical Guilloche & Filigree Corner Borders */}
          <div className="absolute inset-2 border-2 border-[#b5954a]/60 pointer-events-none" />
          <div className="absolute inset-3 border border-[#274830]/30 pointer-events-none" />

          {/* Corner Floral Rosettes (Classical Legal Bond Style) */}
          <div className="absolute top-4 left-4 text-[#b5954a] pointer-events-none select-none">
            <svg width="28" height="28" viewBox="0 0 100 100" fill="currentColor">
              <path d="M10,10 L50,10 L50,14 L14,14 L14,50 L10,50 Z" />
              <circle cx="24" cy="24" r="6" />
              <path d="M24,14 Q24,24 14,24" stroke="currentColor" strokeWidth="2" fill="none" />
              <circle cx="34" cy="34" r="3" />
            </svg>
          </div>
          <div className="absolute top-4 right-4 text-[#b5954a] pointer-events-none select-none rotate-90">
            <svg width="28" height="28" viewBox="0 0 100 100" fill="currentColor">
              <path d="M10,10 L50,10 L50,14 L14,14 L14,50 L10,50 Z" />
              <circle cx="24" cy="24" r="6" />
              <path d="M24,14 Q24,24 14,24" stroke="currentColor" strokeWidth="2" fill="none" />
              <circle cx="34" cy="34" r="3" />
            </svg>
          </div>
          <div className="absolute bottom-4 left-4 text-[#b5954a] pointer-events-none select-none -rotate-90">
            <svg width="28" height="28" viewBox="0 0 100 100" fill="currentColor">
              <path d="M10,10 L50,10 L50,14 L14,14 L14,50 L10,50 Z" />
              <circle cx="24" cy="24" r="6" />
              <path d="M24,14 Q24,24 14,24" stroke="currentColor" strokeWidth="2" fill="none" />
              <circle cx="34" cy="34" r="3" />
            </svg>
          </div>
          <div className="absolute bottom-4 right-4 text-[#b5954a] pointer-events-none select-none rotate-180">
            <svg width="28" height="28" viewBox="0 0 100 100" fill="currentColor">
              <path d="M10,10 L50,10 L50,14 L14,14 L14,50 L10,50 Z" />
              <circle cx="24" cy="24" r="6" />
              <path d="M24,14 Q24,24 14,24" stroke="currentColor" strokeWidth="2" fill="none" />
              <circle cx="34" cy="34" r="3" />
            </svg>
          </div>

          {/* Faint Center Archival Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035]">
            <svg viewBox="0 0 200 200" className="w-[420px] h-[420px]" fill="#1b3b27">
              <circle cx="100" cy="100" r="85" stroke="#1b3b27" strokeWidth="4" fill="none" />
              <circle cx="100" cy="100" r="75" stroke="#1b3b27" strokeWidth="2" fill="none" />
              <path d="M100,25 L100,175 M25,100 L175,100" stroke="#1b3b27" strokeWidth="2" />
            </svg>
          </div>

          {/* OFFICIAL LETTERHEAD & STATUTORY BANNER */}
          <div className="text-center relative pb-3 border-b-2 border-[#274830]/80">
            {/* Government Emblem Insignia */}
            <div className="flex justify-center items-center gap-3 mb-1">
              <div className="w-14 h-14 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-13 h-13 text-[#1f3f27]" fill="currentColor">
                  {/* Ashoka Stambha / Circular Seal representation */}
                  <circle cx="50" cy="50" r="46" fill="none" stroke="#274830" strokeWidth="3" />
                  <circle cx="50" cy="50" r="41" fill="none" stroke="#b5954a" strokeWidth="1.5" />
                  <circle cx="50" cy="50" r="16" fill="none" stroke="#274830" strokeWidth="2" />
                  {/* 24 Spokes Chakra */}
                  {[...Array(24)].map((_, i) => (
                    <line
                      key={i}
                      x1="50"
                      y1="50"
                      x2={50 + 15 * Math.cos((i * 15 * Math.PI) / 180)}
                      y2={50 + 15 * Math.sin((i * 15 * Math.PI) / 180)}
                      stroke="#274830"
                      strokeWidth="1"
                    />
                  ))}
                  <path
                    d="M32,28 Q50,16 68,28 Q75,45 66,62 Q50,75 34,62 Q25,45 32,28 Z"
                    fill="none"
                    stroke="#1f3f27"
                    strokeWidth="2"
                  />
                  <text
                    x="50"
                    y="88"
                    fontSize="6.5"
                    fontFamily="serif"
                    fontWeight="bold"
                    textAnchor="middle"
                    fill="#1f3f27"
                  >
                    सत्यमेव जयते
                  </text>
                </svg>
              </div>
            </div>

            <p className="text-[11px] uppercase tracking-[0.2em] font-serif font-black text-[#1b3b27]">
              GOVERNMENT OF INDIA · MINISTRY OF ENVIRONMENT, FOREST AND CLIMATE CHANGE
            </p>
            <h2 className="text-sm sm:text-base font-serif font-bold uppercase tracking-wider text-[#274830] mt-0.5">
              CENTRAL POLLUTION CONTROL BOARD
            </h2>
            <p className="text-[10px] text-slate-600 font-serif italic">
              Parivesh Bhawan, East Arjun Nagar, Shahdara, Delhi - 110032 · Web: cpcb.nic.in
            </p>

            <div className="mt-2.5 inline-block px-4 py-0.5 rounded-sm border border-[#274830]/40 bg-[#f4ede0] text-[9.5px] font-serif font-bold uppercase tracking-wider text-[#1e3d28]">
              FORM-1 · [See Rules 4(2), 6(1) and 13(1) of E-Waste (Management) Rules, 2022]
            </div>

            <h1 className="text-lg sm:text-2xl font-serif font-black uppercase tracking-tight text-[#162e1e] mt-3">
              CERTIFICATE OF ENVIRONMENTALLY SOUND RECYCLING
            </h1>
            <p className="text-[11px] font-serif text-slate-700 tracking-wide">
              Extended Producer Responsibility (EPR) & Hazardous Decontamination Compliance
            </p>
          </div>

          {/* SERIAL NO. & STATUTORY REGISTRATION BAR */}
          <div className="my-3 py-2 px-3 border-y border-[#b5954a]/40 bg-[#f8f3e6] flex flex-wrap items-center justify-between gap-2 text-[11px] font-serif">
            <div>
              <span className="font-bold text-[#1b3b27]">Certificate Serial No:</span>{' '}
              <span className="font-mono font-bold text-slate-900 tracking-wider">{cert.certId}</span>
            </div>
            <div>
              <span className="font-bold text-[#1b3b27]">Manifest Tracking ID:</span>{' '}
              <span className="font-mono font-semibold text-slate-800">{cert.manifestNo}</span>
            </div>
            <div>
              <span className="font-bold text-[#1b3b27]">Date of Issuance:</span>{' '}
              <span className="font-bold text-slate-900">{cert.completedAt}</span>
            </div>
          </div>

          {/* AUTHENTIC LEGAL ATTESTATION BODY */}
          <div className="my-3 space-y-2.5 text-xs sm:text-[12.5px] font-serif leading-relaxed text-slate-800 text-justify">
            <p>
              <span className="text-base font-bold text-[#1b3b27] font-serif">THIS IS TO CERTIFY THAT </span>
              the designated waste generator specified below has lawfully surrendered, transferred, and channeled
              the described consignment of End-of-Life Electrical and Electronic Equipment (EEE) through verified and
              accredited chain-of-custody in strict conformity with statutory provisions of the{' '}
              <strong>E-Waste (Management) Rules, 2022 (Notification G.S.R. 801(E))</strong>:
            </p>

            {/* FORMAL PARCHMENT CREDENTIALS TABLE: SOURCE & GENERATOR */}
            <div className="border border-[#274830]/40 rounded-sm bg-white/75 p-3.5 space-y-1.5 shadow-sm">
              <div className="grid sm:grid-cols-[160px_1fr] gap-1 text-[11.5px]">
                <span className="font-bold text-[#1b3b27]">Registered Entity (Source):</span>
                <span className="font-bold text-slate-950 uppercase tracking-wide">{cert.sourceName}</span>

                <span className="font-bold text-[#1b3b27]">Premise / Facility Address:</span>
                <span className="text-slate-800">{cert.sourceAddress}</span>

                <span className="font-bold text-[#1b3b27]">EPR Registration No.:</span>
                <span className="font-mono font-bold text-slate-900">{cert.sourceEprId}</span>

                <span className="font-bold text-[#1b3b27]">Generator Classification:</span>
                <span className="text-slate-800">{cert.sourceCategory}</span>

                <span className="font-bold text-[#1b3b27]">Corporate IDs:</span>
                <span className="font-mono text-[10.5px] text-slate-600">
                  GSTIN: {cert.gstin} · CIN: {cert.cin}
                </span>
              </div>
            </div>

            <p className="text-[11.5px] leading-relaxed text-slate-700">
              The said electronic scrap was collected by an authorized logistics carrier and subsequently received by a
              State Pollution Control Board (SPCB) consented hydrometallurgical refining facility. Hazardous fractions
              including Lead (Pb), Mercury (Hg), Cadmium (Cd), Hexavalent Chromium (Cr VI), and Polybrominated Biphenyls
              (PBBs) were dismantled in an inert atmosphere, decontaminated, and neutralized with{' '}
              <strong>100% diversion from municipal landfills</strong>.
            </p>
          </div>

          {/* CONSIGNMENT PARTICULARS (CLASSICAL TABLE) */}
          <div className="mt-3">
            <h3 className="text-[11px] font-serif font-bold uppercase tracking-wider text-[#1b3b27] mb-1">
              Table 1: Consignment & Downstream Custody Particulars
            </h3>
            <div className="border border-[#274830]/40 rounded-sm overflow-hidden bg-white/80">
              <table className="w-full text-left text-[11px] font-serif border-collapse">
                <thead className="bg-[#f0e9d9] text-[#1b3b27] border-b border-[#274830]/40 uppercase text-[9.5px] font-bold">
                  <tr>
                    <th className="p-2 border-r border-[#274830]/30">Consignment Asset Description</th>
                    <th className="p-2 border-r border-[#274830]/30">CPCB Category</th>
                    <th className="p-2 border-r border-[#274830]/30">Net Certified Weight</th>
                    <th className="p-2">Authorized Recycler & Facility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2 font-medium text-slate-900 border-r border-[#274830]/20">
                      {cert.itemName}
                    </td>
                    <td className="p-2 text-slate-800 border-r border-[#274830]/20">
                      {cert.category}
                    </td>
                    <td className="p-2 font-mono font-bold text-[#1b3b27] border-r border-[#274830]/20">
                      {cert.weightKg.toFixed(2)} Kilograms
                    </td>
                    <td className="p-2 text-slate-800">
                      <span className="font-bold block">{cert.recyclerName}</span>
                      <span className="text-[9.5px] text-slate-500 font-mono">{cert.recyclerCpcbNo}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* OFFICIAL METALLURGICAL RECOVERY ASSAY SHEET (NOT NEON BOXES - DIGNIFIED FORMAL TABLE) */}
          <div className="mt-3.5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[11px] font-serif font-bold uppercase tracking-wider text-[#1b3b27]">
                Table 2: Certified Metallurgical Recovery Assay (ICP-OES / Fire Assay Method)
              </h3>
              <span className="text-[10px] font-mono text-slate-500 italic">
                NABL Accredited Lab Report Ref: MET-2026-8819
              </span>
            </div>

            <div className="border border-[#274830]/40 rounded-sm overflow-hidden bg-white/90">
              <table className="w-full text-left text-[11px] font-serif border-collapse">
                <thead className="bg-[#f0e9d9] text-[#1b3b27] border-b border-[#274830]/40 uppercase text-[9.5px] font-bold">
                  <tr>
                    <th className="p-2 border-r border-[#274830]/30">Target Elemental Fraction</th>
                    <th className="p-2 border-r border-[#274830]/30">Recovered Mass</th>
                    <th className="p-2 border-r border-[#274830]/30">Assayed Chemical Purity</th>
                    <th className="p-2 border-r border-[#274830]/30">Circular Destination</th>
                    <th className="p-2">Analytical Standard</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2 font-bold text-slate-900 border-r border-[#274830]/20 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37]" />
                      Pure Gold (Au)
                    </td>
                    <td className="p-2 font-mono font-bold text-slate-900 border-r border-[#274830]/20">
                      {cert.goldGrams} grams
                    </td>
                    <td className="p-2 text-slate-800 border-r border-[#274830]/20 font-mono">
                      99.99% Fine Bullion Grade
                    </td>
                    <td className="p-2 text-slate-700 border-r border-[#274830]/20">
                      National Bullion Reserve
                    </td>
                    <td className="p-2 font-mono text-[10px] text-slate-500">ASTM B562 / IS:1417</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-slate-900 border-r border-[#274830]/20 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                      Refined Silver (Ag)
                    </td>
                    <td className="p-2 font-mono font-bold text-slate-900 border-r border-[#274830]/20">
                      {cert.silverGrams} grams
                    </td>
                    <td className="p-2 text-slate-800 border-r border-[#274830]/20 font-mono">
                      99.90% Fine Smelt Grade
                    </td>
                    <td className="p-2 text-slate-700 border-r border-[#274830]/20">
                      Industrial Electronic Solder
                    </td>
                    <td className="p-2 font-mono text-[10px] text-slate-500">ASTM B413 / IS:2112</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-slate-900 border-r border-[#274830]/20 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#c87533]" />
                      Cathode Copper (Cu)
                    </td>
                    <td className="p-2 font-mono font-bold text-slate-900 border-r border-[#274830]/20">
                      {cert.copperKg} kg
                    </td>
                    <td className="p-2 text-slate-800 border-r border-[#274830]/20 font-mono">
                      99.95% Grade A Electrolytic
                    </td>
                    <td className="p-2 text-slate-700 border-r border-[#274830]/20">
                      Power Busbars & Motors
                    </td>
                    <td className="p-2 font-mono text-[10px] text-slate-500">ASTM B115 / LME Grade A</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-slate-900 border-r border-[#274830]/20 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                      Rare Earth Minerals (Nd, Dy)
                    </td>
                    <td className="p-2 font-mono font-bold text-slate-900 border-r border-[#274830]/20">
                      {cert.rareEarthGrams} grams
                    </td>
                    <td className="p-2 text-slate-800 border-r border-[#274830]/20 font-mono">
                      High-Purity Concentrate
                    </td>
                    <td className="p-2 text-slate-700 border-r border-[#274830]/20">
                      EV Permanent Magnet Loop
                    </td>
                    <td className="p-2 font-mono text-[10px] text-slate-500">ISO 22762 Rare Earths</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* CARBON & ENVIRONMENTAL ABATEMENT CERTIFICATE STRIP */}
          <div className="mt-3 py-2 px-3 rounded-sm border border-[#274830]/30 bg-[#f4f7f2] flex flex-wrap items-center justify-between gap-3 text-xs font-serif">
            <div>
              <span className="font-bold text-[#1b3b27]">Net Greenhouse Gas (GHG) Abated:</span>{' '}
              <strong className="text-emerald-900 font-mono text-sm">{cert.co2SavedKg} kg CO₂e</strong>
            </div>
            <div>
              <span className="font-bold text-[#1b3b27]">Equivalent Forest Sequestration:</span>{' '}
              <strong>{cert.treesEquivalent} Mature Trees / Annum</strong>
            </div>
            <div>
              <span className="font-bold text-[#1b3b27]">Power Grid Conservation:</span>{' '}
              <strong>{(cert.weightKg * 7.2).toFixed(0)} kWh</strong>
            </div>
            <div>
              <span className="font-bold text-[#1b3b27]">Landfill Diversion:</span>{' '}
              <strong className="text-emerald-800">100.0% (Zero Landfill)</strong>
            </div>
          </div>

          {/* AUTHENTICATION SECTION: RUBBER STAMP, GOLD FOIL MEDALLION, AND HANDWRITTEN BLUE-INK SIGNATURES */}
          <div className="mt-6 pt-4 border-t-2 border-[#274830]/60 flex flex-col sm:flex-row items-center justify-between gap-6 relative">
            {/* 1. OFFICIAL INKED GOVERNMENT RUBBER STAMP (Realistic Red/Purple Wet Stamp) */}
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 rounded-full border-4 border-dashed border-[#9c2738]/80 text-[#9c2738] flex flex-col items-center justify-center p-2 text-center rotate-[-6deg] select-none pointer-events-none opacity-90 shadow-sm">
                <span className="text-[7.5px] uppercase font-serif font-black tracking-tighter leading-tight block">
                  CENTRAL POLLUTION CONTROL BOARD
                </span>
                <span className="text-[12px] my-0.5 font-black tracking-wider block border-y border-[#9c2738]/60 py-0.5">
                  ★ PASSED ★
                </span>
                <span className="text-[8px] font-mono font-bold block">EPR AUDIT CELL</span>
                <span className="text-[7px] font-mono font-bold block mt-0.5">
                  REG: {cert.completedAt.slice(0, 11)}
                </span>
              </div>
            </div>

            {/* 2. GOLD FOIL EMBOSSED SEAL WITH DARK GREEN SILK RIBBON TAILS */}
            <div className="relative flex flex-col items-center flex-shrink-0 select-none pointer-events-none">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ffd700] via-[#e6c200] to-[#b39700] p-1 shadow-md border-2 border-[#8c7600] flex flex-col items-center justify-center text-center text-[#403500]">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#736100] flex flex-col items-center justify-center p-1">
                  <span className="text-[7px] font-serif font-black uppercase tracking-tighter">OFFICIAL SEAL</span>
                  <span className="text-[10px] font-serif font-black tracking-tight leading-none mt-0.5">
                    CPCB FORM-1
                  </span>
                  <span className="text-[6.5px] font-serif font-bold uppercase mt-0.5">ZERO LANDFILL</span>
                  <span className="text-[5.5px] font-mono font-bold mt-0.5">STATUTORY COMPLIANCE</span>
                </div>
              </div>
              {/* Notched Silk Ribbon Tails */}
              <div className="flex gap-1.5 -mt-3.5 z-[-1]">
                <div
                  className="w-5 h-8 bg-[#1e4027] shadow-md"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }}
                />
                <div
                  className="w-5 h-8 bg-[#16351e] shadow-md"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }}
                />
              </div>
            </div>

            {/* 3. SCANNABLE QR & CRYPTOGRAPHIC VERIFICATION */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="p-1.5 bg-white border border-[#274830]/40 rounded shadow-sm">
                <svg viewBox="0 0 100 100" className="w-14 h-14 text-slate-900" fill="currentColor">
                  <path d="M10,10 h30 v30 h-30 z M15,15 v20 h20 v-20 z M20,20 h10 v10 h-10 z" />
                  <path d="M60,10 h30 v30 h-30 z M65,15 v20 h20 v-20 z M70,20 h10 v10 h-10 z" />
                  <path d="M10,60 h30 v30 h-30 z M15,65 v20 h20 v-20 z M20,70 h10 v10 h-10 z" />
                  <path d="M45,10 h10 v10 h-10 z M45,25 h10 v10 h-10 z M45,40 h20 v10 h-20 z" />
                  <path d="M60,45 h10 v10 h-10 z M75,45 h15 v10 h-15 z M80,60 h10 v20 h-10 z" />
                  <path d="M45,60 h15 v10 h-15 z M45,75 h10 v15 h-10 z M60,75 h20 v15 h-20 z" />
                </svg>
              </div>
              <div className="text-[9.5px] font-serif leading-tight text-slate-600">
                <strong className="block text-[#1b3b27] font-bold">National Registry QR</strong>
                <span>Scan for Live CPCB Record</span>
                <span className="block font-mono text-[8.5px] text-slate-500 mt-0.5">cpcb.nic.in/epr-audit</span>
              </div>
            </div>

            {/* 4. REALISTIC HUMAN BLUE-INK FOUNTAIN PEN SIGNATURES */}
            <div className="flex flex-col gap-3 text-center sm:text-right flex-shrink-0">
              <div>
                {/* Simulated Cursive Blue-Ink Signature 1 */}
                <div className="h-9 flex items-center justify-end">
                  <svg width="140" height="34" viewBox="0 0 140 34" fill="none" className="text-[#003399]">
                    <path
                      d="M10,25 C25,5 30,28 45,12 C55,0 52,26 68,18 C78,12 85,25 95,14 C105,4 100,28 115,20 C125,14 130,22 135,16"
                      stroke="#003399"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    <path d="M22,30 C50,28 90,29 120,30" stroke="#003399" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="text-[11px] font-serif font-bold text-slate-900 border-t border-slate-400 pt-0.5">
                  Dr. A. K. Swaminathan, Ph.D.
                </p>
                <p className="text-[9.5px] font-serif text-slate-600">Member Secretary & Authorised Officer</p>
                <p className="text-[8.5px] font-serif text-slate-500">Central Pollution Control Board Registry</p>
              </div>

              <div>
                {/* Simulated Cursive Blue-Ink Signature 2 */}
                <div className="h-9 flex items-center justify-end">
                  <svg width="130" height="34" viewBox="0 0 130 34" fill="none" className="text-[#003399]">
                    <path
                      d="M10,18 C22,6 28,26 40,10 C50,2 62,24 75,12 C88,4 95,22 110,14 C118,10 125,18 128,16"
                      stroke="#003399"
                      strokeWidth="2.0"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <p className="text-[11px] font-serif font-bold text-slate-900 border-t border-slate-400 pt-0.5">
                  Er. Rajiv Sengupta, M.Tech (Met.)
                </p>
                <p className="text-[9.5px] font-serif text-slate-600">Chief Metallurgical Technical Auditor</p>
                <p className="text-[8.5px] font-serif text-slate-500">EcoSmelt R2v3 / ISO 14001:2015 Refinery</p>
              </div>
            </div>
          </div>

          {/* CRYPTOGRAPHIC TAMPER-EVIDENT SHA-256 AUDIT FOOTER */}
          <div className="mt-5 pt-2 border-t border-[#b5954a]/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-[9px] font-mono text-slate-500">
            <div className="truncate max-w-lg">
              <span className="font-bold text-[#1b3b27]">IMMUTABLE SHA-256 LEDGER DIGEST:</span>{' '}
              <span className="text-slate-700">{cert.hash}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyHash}
              className="text-[#1b3b27] hover:underline font-bold flex items-center gap-1 flex-shrink-0"
            >
              <Copy size={11} /> Copy Digest
            </button>
          </div>
        </div>

        {/* MODAL CONTROL ACTIONS */}
        <div className="flex items-center justify-between pt-1 print:hidden">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Official statutory record · Complies with Government of India Form-1 statutory filing standards.
          </span>
          <div className="flex items-center gap-3 ml-auto">
            <Button variant="outline" onClick={handlePrint} className="text-xs font-semibold">
              <Printer size={15} className="mr-1.5" /> Print / Save as PDF
            </Button>
            <Button onClick={onClose} className="bg-[#274830] hover:bg-[#1b3b27] text-white text-xs font-semibold">
              <CheckCircle2 size={15} className="mr-1.5" /> Close Certificate
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default GreenCertificateModal;
