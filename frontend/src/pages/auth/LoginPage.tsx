import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Mail, ShieldCheck, UploadCloud, Truck, Factory, Globe, ChevronDown, Mic, Sparkles, CheckCircle2, Award } from "lucide-react";
import BrandLogo from "../../components/BrandLogo";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Modal from "../../components/Modal";
import { useAuth } from "../../context/AuthContext";
import { useLanguage, LANGUAGES, type SupportedLanguage } from "../../context/LanguageContext";
import type { UserRole } from "../../types";

interface SegmentInfo {
  role: UserRole;
  label: string;
  tag: string;
  badge: string;
  email: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  color: string;
  benefits: string[];
}

const SEGMENTS: SegmentInfo[] = [
  {
    role: "source",
    label: "Seller",
    tag: "Source / Generator",
    badge: "Sell & Recycle",
    email: "source@example.com",
    description: "Individuals & enterprises selling or disposing of e-waste assets with verified digital manifests.",
    icon: UploadCloud,
    color: "#059669",
    benefits: ["AI YOLOv8 & DINOv2 asset inspection", "Competitive live collector auction", "CPCB Form 1 Green Certificate"],
  },
  {
    role: "collector",
    label: "Collector",
    tag: "Logistics Partner",
    badge: "Pickup & Auction",
    email: "collector@example.com",
    description: "CPCB-authorized collection agents bidding on listings and dispatching smart trucks.",
    icon: Truck,
    color: "#047857",
    benefits: ["Live GPS route telemetry & ETA", "6-Digit Secure Hand-off OTP token", "Automated Razorpay UPI settlement"],
  },
  {
    role: "recycler",
    label: "Disposer",
    tag: "Recycler & Smelter",
    badge: "Refining Facility",
    email: "recycler@example.com",
    description: "R2v3 / CPCB authorized recycling and smelting facilities performing material extraction.",
    icon: Factory,
    color: "#059669",
    benefits: ["Incoming consolidated digital lots", "Hydrometallurgical purity verification", "Cryptographic compliance certification"],
  },
];

const LANG_BCP47: Record<SupportedLanguage, string> = {
  en: "en-IN", hi: "hi-IN", ta: "ta-IN", te: "te-IN", kn: "kn-IN", bn: "bn-IN",
};

const LoginPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>("source");
  const [email, setEmail] = useState("source@example.com");
  const [password, setPassword] = useState("password123");
  const [formError, setFormError] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, isLoading, clearError } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const currentSegment = SEGMENTS.find((s) => s.role === selectedRole) ?? SEGMENTS[0];
  const currentLang = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  const handleSelectSegment = (seg: SegmentInfo) => {
    setSelectedRole(seg.role);
    setEmail(seg.email);
    setPassword("password123");
    setFormError("");
    clearError();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError("");
    clearError();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setFormError("Please enter your password.");
      return;
    }
    try {
      const signedInUser = await signIn({ email: email.trim(), password, role: selectedRole });
      const requestedPath = (location.state as { from?: string } | null)?.from;
      const safeDestination = requestedPath?.startsWith("/" + signedInUser.role) ? requestedPath : "/" + signedInUser.role;
      navigate(safeDestination, { replace: true });
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : "Unable to sign in. Please verify credentials.");
    }
  };

  const startVoiceEmail = () => {
    const SR = (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
               (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = LANG_BCP47[language];
    rec.interimResults = false;
    rec.onstart = () => setMicActive(true);
    rec.onend = () => setMicActive(false);
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript.trim();
      if (transcript.includes("@")) setEmail(transcript);
    };
    try { rec.start(); } catch { setMicActive(false); }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden bg-slate-50">
      {/* FULLSCREEN BACKGROUND 3D WHITE & EMERALD IMAGE */}
      <img
        src="/login-hero-3d.jpg"
        alt="Re-Circuit Global Circular Economy Visualisation"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      {/* Pure white and emerald environmental wash (zero dark tones) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.45) 0%, rgba(240, 253, 244, 0.7) 100%)",
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Top Floating Nav with Back to Home & Language Switcher */}
      <header className="absolute top-4 sm:top-6 left-4 sm:left-8 right-4 sm:right-8 z-20 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-slate-800 bg-white/95 hover:bg-white transition-all shadow-sm backdrop-blur-md border border-slate-200 hover:border-emerald-300"
        >
          <ArrowLeft size={14} className="text-emerald-600" />
          <span>Back to Home</span>
        </Link>

        {/* Language selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold text-slate-800 bg-white/95 hover:bg-white transition-all shadow-sm backdrop-blur-md border border-slate-200 hover:border-emerald-300 cursor-pointer"
          >
            <Globe size={13} className="text-emerald-600" />
            <span>{currentLang.flag} {currentLang.nativeName}</span>
            <ChevronDown size={12} style={{ transform: langOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </button>
          {langOpen && (
            <div className="absolute right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl min-w-[170px] z-50 overflow-hidden py-1">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => { setLanguage(lang.code); setLangOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-xs font-semibold transition-colors cursor-pointer ${
                    lang.code === language ? "bg-emerald-50 text-emerald-700 font-bold" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <div>
                    <div>{lang.nativeName}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{lang.name}</div>
                  </div>
                  {lang.code === language && <span className="ml-auto text-emerald-600 font-bold">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* COMBINED LOGIN SECTION: INTEGRATED 2-COLUMN MNC CARD BLENDING WITH BG IMAGE */}
      <main className="relative z-10 w-full max-w-5xl my-16 shadow-2xl rounded-3xl overflow-hidden border border-white/90 bg-white/90 backdrop-blur-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
          
          {/* LEFT SHOWCASE PANEL: INTEGRATED DIRECTLY WITH THE 3D BACKGROUND ARTWORK */}
          <div className="lg:col-span-5 relative p-6 sm:p-8 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-50/90 via-white/85 to-emerald-100/60 border-b lg:border-b-0 lg:border-r border-emerald-100/80">
            {/* Embedded 3D Artwork in showcase panel */}
            <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full overflow-hidden opacity-30 pointer-events-none">
              <img
                src="/login-hero-3d.jpg"
                alt=""
                className="w-full h-full object-cover object-center filter saturate-150"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-6">
                <BrandLogo size="md" showTagline />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 border border-emerald-300 text-xs font-bold text-emerald-900 mb-4 shadow-xs">
                <ShieldCheck size={14} className="text-emerald-700" />
                <span>CPCB Enterprise Portal</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                India's Verified <span className="text-emerald-600">E-Waste</span> Value Network
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Seamless digital exchange connecting electronics generators, verified collectors, and authorized metallurgical refiners under CPCB E-Waste Rules 2022.
              </p>

              {/* Showcase Feature Pills */}
              <div className="mt-6 space-y-2.5">
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/90 border border-emerald-200/80 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">6-Digit Secure Hand-off OTP</p>
                    <p className="text-[11px] text-slate-500">Collector generates, Source verifies custody</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/90 border border-emerald-200/80 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Razorpay UPI Escrow Settlement</p>
                    <p className="text-[11px] text-slate-500">Direct collector-to-source instant payment</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/90 border border-emerald-200/80 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0">
                    <Award size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">CPCB Form-1 Green Certificate</p>
                    <p className="text-[11px] text-slate-500">Government compliance with QR verification</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Security Footer */}
            <div className="pt-6 mt-6 border-t border-emerald-200/60 flex items-center justify-between text-[11px] font-mono text-emerald-800">
              <span className="flex items-center gap-1"><CheckCircle2 size={13} /> 256-Bit TLS Encryption</span>
              <span>ISO 27001 Certified</span>
            </div>
          </div>

          {/* RIGHT LOGIN FORM PANEL */}
          <div className="lg:col-span-7 p-6 sm:p-8 md:p-10 flex flex-col justify-between bg-white/95 backdrop-blur-md">
            <div>
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {t("signIn")}{" "}
                    <span className="text-emerald-600">Re-Circuit</span>
                  </h1>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    White & Green Edition
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Select your sector to access tailored live inventory & manifests.
                </p>
              </div>

              {/* SECTOR SELECTOR WITH MICRO-ANIMATIONS */}
              <div className="grid grid-cols-3 gap-2.5 p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/80 mb-5">
                {SEGMENTS.map((seg) => {
                  const Icon = seg.icon;
                  const isSelected = seg.role === selectedRole;
                  return (
                    <button
                      type="button"
                      key={seg.role}
                      onClick={() => handleSelectSegment(seg)}
                      className={`sector-card flex flex-col items-center justify-center p-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-white text-emerald-800 shadow-md border border-emerald-300 sector-active"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center mb-1.5 transition-transform ${
                          isSelected ? "scale-110" : ""
                        }`}
                        style={{
                          background: isSelected ? "#ecfdf5" : "#e2e8f0",
                        }}
                      >
                        <Icon size={18} style={{ color: isSelected ? "#059669" : "#64748b" }} />
                      </div>
                      <span className="tracking-tight">{seg.label}</span>
                      <span
                        className="text-[10px] font-mono px-1.5 py-0.2 rounded mt-0.5"
                        style={{
                          background: isSelected ? "#d1fae5" : "#f1f5f9",
                          color: isSelected ? "#047857" : "#64748b",
                        }}
                      >
                        {seg.badge}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Current Sector Summary Pill */}
              <div className="p-3.5 rounded-2xl mb-5 transition-all border border-emerald-200 bg-emerald-50/70">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <currentSegment.icon size={14} className="text-emerald-600" />
                    {currentSegment.label} Portal · {currentSegment.tag}
                  </span>
                  <span className="text-[10px] font-mono font-medium text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    Credentials Auto-Filled
                  </span>
                </div>
                <ul className="text-xs text-slate-600 space-y-1">
                  {currentSegment.benefits.map((b) => (
                    <li key={b} className="flex items-center gap-1.5">
                      <span className="text-emerald-600 font-black">✓</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="relative">
                  <Input
                    label="Registered Corporate / User Email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    leftIcon={<Mail size={15} />}
                    autoComplete="email"
                    id="login-email"
                    required
                  />
                  <button
                    type="button"
                    onClick={startVoiceEmail}
                    aria-label="Voice input"
                    title="Speak to enter email"
                    className={`absolute right-3 top-9 p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      micActive
                        ? "bg-red-600 text-white border-red-700 animate-pulse"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                    }`}
                  >
                    <Mic size={14} />
                  </button>
                </div>

                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock size={15} />}
                  autoComplete="current-password"
                  id="login-password"
                  required
                />

                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-500">
                    Demo: <strong className="text-slate-800">password123</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setForgotOpen(true)}
                    className="font-semibold text-emerald-700 hover:underline cursor-pointer bg-transparent border-0"
                  >
                    Forgot password?
                  </button>
                </div>

                {formError && (
                  <p
                    role="alert"
                    className="text-xs p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium"
                  >
                    {formError}
                  </p>
                )}

                <Button
                  type="submit"
                  fullWidth
                  isLoading={isLoading}
                  id="login-submit"
                  className="py-3 text-sm font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5 bg-emerald-600 hover:bg-emerald-700"
                  style={{
                    boxShadow: "0 8px 20px rgba(5, 150, 105, 0.3)",
                  }}
                >
                  {t("signIn")} → {currentSegment.label} Portal
                </Button>

                <div className="text-center text-xs text-slate-600 pt-1">
                  New to Re-Circuit?{" "}
                  <Link
                    to="/select-role"
                    className="font-bold text-emerald-700 hover:underline"
                  >
                    Register your organisation
                  </Link>
                </div>
              </form>
            </div>

            {/* Footer Security Badges */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>CPCB 2022 Compliant</span>
              <span>Secure Digital Custody Chain</span>
            </div>
          </div>
        </div>
      </main>

      {langOpen && <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />}

      <Modal isOpen={forgotOpen} onClose={() => setForgotOpen(false)} title="Reset your password">
        <p className="text-xs leading-relaxed text-slate-600">
          Password recovery for <strong className="text-emerald-700">{currentSegment.label}</strong> is authenticated via CPCB-registered contact email.
          For demonstration use the default password{" "}
          <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">password123</code>.
        </p>
        <Button fullWidth className="mt-5 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setForgotOpen(false)}>Got it</Button>
      </Modal>
    </div>
  );
};

export default LoginPage;
