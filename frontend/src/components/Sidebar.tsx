import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { LogOut, User } from "lucide-react";
import BrandLogo from "./BrandLogo";
import { useAuth } from "../context/AuthContext";

interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  items: SidebarItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ items }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <aside
      className="hidden lg:flex flex-col w-60 min-h-screen sticky top-0 bg-white border-r border-slate-200 shadow-sm"
    >
      {/* Logo */}
      <div className="p-5 border-b border-slate-100">
        <BrandLogo size="sm" showTagline />
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "Inter,sans-serif",
              background: "linear-gradient(135deg, #059669, #047857)",
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(5, 150, 105, 0.25)",
            }}
          >
            {user?.name?.[0]?.toUpperCase() ?? <User size={16} />}
          </div>
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontFamily: "Inter,sans-serif",
                fontSize: 13,
                fontWeight: 700,
                color: "#0f172a",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.name ?? "User"}
            </p>
            <p
              style={{
                fontFamily: "Inter,sans-serif",
                fontSize: 11,
                fontWeight: 600,
                textTransform: "capitalize",
                color: "#059669",
                letterSpacing: "0.02em",
              }}
            >
              {user?.role ?? "—"} · Enterprise
            </p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 3 }}>
        {items.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href.split("/").filter(Boolean).length === 1}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 11,
              padding: "9px 12px",
              borderRadius: 10,
              fontFamily: "Inter,sans-serif",
              fontSize: 13,
              fontWeight: isActive ? 700 : 500,
              textDecoration: "none",
              letterSpacing: "-0.01em",
              transition: "all 0.16s ease",
              background: isActive ? "#ecfdf5" : "transparent",
              color: isActive ? "#047857" : "#475569",
              borderLeft: isActive ? "3px solid #059669" : "3px solid transparent",
              paddingLeft: isActive ? 10 : 12,
            })}
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={17}
                  style={{
                    color: isActive ? "#059669" : "#64748b",
                    flexShrink: 0,
                  }}
                />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: "12px 10px", borderTop: "1px solid #f1f5f9" }}>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 12px",
            borderRadius: 10,
            fontFamily: "Inter,sans-serif",
            fontSize: 13,
            fontWeight: 600,
            width: "100%",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#64748b",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#fef2f2";
            (e.currentTarget as HTMLButtonElement).style.color = "#dc2626";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "#64748b";
          }}
        >
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
