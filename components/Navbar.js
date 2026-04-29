"use client";

import Link from "next/link";
import { UserAuth } from "@/context/AuthContext";
import { LogOut, Compass, Image as ImageIcon, Calendar, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import usePresence from "@/hooks/usePresence";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user, logout } = UserAuth();
  const { partnerStatus } = usePresence(user);
  const pathname = usePathname();

  if (!user) return null;

  const navItems = [
    { href: "/discussions", icon: Compass, label: "Fil Rouge" },
    { href: "/gallery", icon: ImageIcon, label: "Album" },
    { href: "/timeline", icon: Calendar, label: "Timeline" },
  ];

  const firstName = user.displayName?.split(" ")[0] || "Toi";
  const isDany = firstName.toLowerCase().includes("dany");
  const avatarColor = isDany ? "#5eead4" : "#f9a8d4";

  return (
    <motion.nav
      initial={{ y: -120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 24, delay: 0.1 }}
      style={{
        position: "fixed",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        width: "calc(100% - 32px)",
        maxWidth: 900,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 16px",
        borderRadius: 24,
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        border: "1.5px solid rgba(255,255,255,0.9)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <motion.div
          whileHover={{ rotate: 20, scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400 }}
          style={{
            width: 38, height: 38,
            borderRadius: 12,
            background: "linear-gradient(135deg, #e94560, #a855f7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(233,69,96,0.35)",
            flexShrink: 0,
          }}
        >
          <Heart size={18} color="#fff" fill="#fff" />
        </motion.div>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
          <span style={{ fontFamily: "var(--font-serif, serif)", fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em", color: "#1a1a2e" }}>
            The <span style={{ color: "#e94560" }}>Garden</span>
          </span>
          <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.35, color: "#1a1a2e" }}>
            E&D Private
          </span>
        </div>
      </Link>

      {/* Center Nav Items — hidden on mobile */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }} className="hidden md:flex">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 14px",
                  borderRadius: 14,
                  background: isActive ? "rgba(233,69,96,0.1)" : "transparent",
                  border: isActive ? "1.5px solid rgba(233,69,96,0.2)" : "1.5px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <item.icon
                  size={15}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  color={isActive ? "#e94560" : "#888"}
                />
                <span style={{
                  fontSize: 11, fontWeight: 800, textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: isActive ? "#e94560" : "#888",
                }}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="navPill"
                    style={{
                      position: "absolute",
                      bottom: -20, left: "50%",
                      transform: "translateX(-50%)",
                      width: 4, height: 4,
                      borderRadius: "50%",
                      background: "#e94560",
                    }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Right: Presence + User + Logout */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Partner Online Indicator */}
        {partnerStatus && (
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "5px 10px",
            borderRadius: 20,
            background: partnerStatus.isOnline ? "rgba(34,197,94,0.08)" : "rgba(0,0,0,0.04)",
            border: `1px solid ${partnerStatus.isOnline ? "rgba(34,197,94,0.2)" : "rgba(0,0,0,0.06)"}`,
          }} className="hidden md:flex">
            <div style={{
              width: 7, height: 7, borderRadius: "50%",
              background: partnerStatus.isOnline ? "#22c55e" : "#ccc",
              boxShadow: partnerStatus.isOnline ? "0 0 6px rgba(34,197,94,0.6)" : "none",
              animation: partnerStatus.isOnline ? "pulse 2s infinite" : "none",
            }} />
            <span style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.6 }}>
              {partnerStatus.isOnline ? "En ligne" : "Hors ligne"}
            </span>
          </div>
        )}

        {/* User Avatar + Name */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="hidden md:flex">
          <div style={{
            width: 34, height: 34, borderRadius: 11,
            background: avatarColor,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 900, fontSize: 13,
            boxShadow: `0 2px 8px ${avatarColor}80`,
          }}>
            {firstName.substring(0, 1).toUpperCase()}
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "#e94560", opacity: 0.8 }}>
              Bonjour
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>
              {firstName}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: "rgba(0,0,0,0.06)" }} className="hidden md:block" />

        {/* Logout */}
        <motion.button
          onClick={logout}
          whileHover={{ scale: 1.08, rotate: 8 }}
          whileTap={{ scale: 0.92 }}
          title="Se déconnecter"
          style={{
            width: 36, height: 36, borderRadius: 12,
            background: "rgba(0,0,0,0.04)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#888", transition: "all 0.2s ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "#ef4444"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,0.04)"; e.currentTarget.style.color = "#888"; }}
        >
          <LogOut size={16} />
        </motion.button>
      </div>
    </motion.nav>
  );
}
