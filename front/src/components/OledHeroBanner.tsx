import React from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

interface StatPill {
  label: string;
  value: string;
  icon?: LucideIcon;
}

interface QuickAction {
  label: string;
  href: string;
  icon: LucideIcon;
  primary?: boolean;
  color?: string;
}

interface OledHeroBannerProps {
  imageSrc: string;
  imageAlt: string;
  accentColor: string;       // e.g. "#16a34a"
  accentGlow: string;        // rgba glow for box-shadow
  eyebrow: string;
  title: string;
  subtitle: string;
  stats: StatPill[];
  actions: QuickAction[];
}

const OledHeroBanner: React.FC<OledHeroBannerProps> = ({
  imageSrc,
  imageAlt,
  accentColor: _accentColor,
  accentGlow: _accentGlow,
  eyebrow,
  title,
  subtitle,
  stats,
  actions,
}) => {
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl mb-6 bg-white border border-slate-200 shadow-sm"
      style={{ minHeight: 220 }}
    >
      {/* Framed OLED image positioned on the right half with smooth fade */}
      <div className="absolute right-0 top-0 bottom-0 w-full sm:w-1/2 md:w-5/12 overflow-hidden pointer-events-none">
        <img
          src={imageSrc}
          alt={imageAlt}
          aria-hidden="true"
          className="w-full h-full object-cover object-center"
          style={{ opacity: 0.9 }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, #ffffff 0%, rgba(255,255,255,0.85) 20%, rgba(255,255,255,0.2) 60%, transparent 100%)",
          }}
        />
      </div>

      {/* Emerald decorative top line */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: "linear-gradient(90deg, #059669 0%, #10b981 50%, #34d399 100%)",
        }}
      />

      {/* Content */}
      <div
        className="relative z-10"
        style={{ padding: "clamp(1.25rem, 3vw, 2.25rem)", maxWidth: 660 }}
      >
        {/* Eyebrow badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 12px",
            borderRadius: 99,
            border: "1px solid #a7f3d0",
            background: "#ecfdf5",
            marginBottom: 12,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#059669",
              boxShadow: "0 0 8px rgba(16,185,129,0.5)",
              animation: "status-pulse 2s ease-out infinite",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: "Inter,sans-serif",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#047857",
            }}
          >
            {eyebrow}
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: "Manrope,Inter,sans-serif",
            fontSize: "clamp(1.4rem, 2.5vw, 1.95rem)",
            fontWeight: 800,
            color: "#0f172a",
            letterSpacing: "-0.025em",
            lineHeight: 1.18,
            marginBottom: 8,
          }}
        >
          {title}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: "Inter,sans-serif",
            fontSize: 13.5,
            color: "#475569",
            lineHeight: 1.6,
            marginBottom: 20,
            maxWidth: 520,
          }}
        >
          {subtitle}
        </p>

        {/* Stats row */}
        {stats.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 14px",
                    borderRadius: 10,
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  {Icon && <Icon size={14} style={{ color: "#059669", flexShrink: 0 }} />}
                  <span style={{ fontFamily: "Manrope,Inter,sans-serif", fontSize: 14, fontWeight: 800, color: "#0f172a" }}>
                    {stat.value}
                  </span>
                  <span style={{ fontFamily: "Inter,sans-serif", fontSize: 11, fontWeight: 500, color: "#64748b" }}>
                    {stat.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {actions.map((action) => {
            const Icon = action.icon;
            const isPrimary = action.primary;
            return (
              <Link
                key={action.href}
                to={action.href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "9px 18px",
                  borderRadius: 10,
                  fontFamily: "Inter,sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                  color: isPrimary ? "#ffffff" : "#334155",
                  background: isPrimary ? "#059669" : "#ffffff",
                  border: isPrimary ? "1px solid #047857" : "1px solid #cbd5e1",
                  boxShadow: isPrimary ? "0 4px 14px rgba(5, 150, 105, 0.28)" : "0 1px 2px rgba(0,0,0,0.05)",
                  textDecoration: "none",
                  transition: "all 0.18s ease",
                }}
              >
                <Icon size={15} />
                {action.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OledHeroBanner;
