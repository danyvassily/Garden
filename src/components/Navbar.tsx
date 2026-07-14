"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Images, Timeline } from "lucide-react";

const navLinks = [
  { href: "/discussions", label: "Fil Rouge", icon: MessageCircle },
  { href: "/gallery", label: "Album", icon: Images },
  { href: "/timeline", label: "Timeline", icon: Timeline },
];

export default function Navbar() {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  if (isLanding) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="glass flex items-center gap-6 rounded-2xl px-5 py-3 w-full max-w-2xl"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0 group"
        >
          <motion.span
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className="text-lg"
          >
            <Heart className="w-5 h-5 text-peach fill-peach" />
          </motion.span>
          <span className="font-serif text-base tracking-wide text-white/90 group-hover:text-white transition-colors">
            The Garden
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="navbar-indicator"
                    className="absolute inset-0 rounded-xl bg-white/10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <link.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </motion.nav>
    </header>
  );
}
