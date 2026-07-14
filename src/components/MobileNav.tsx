"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { MessageCircle, Images, Timeline } from "lucide-react";

const tabs = [
  { href: "/discussions", label: "Fil Rouge", icon: MessageCircle },
  { href: "/gallery", label: "Album", icon: Images },
  { href: "/timeline", label: "Timeline", icon: Timeline },
];

export default function MobileNav() {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  if (isLanding) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-3 px-4 md:hidden">
      <motion.nav
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
        className="glass flex items-center justify-around rounded-2xl px-2 py-2 w-full max-w-sm"
      >
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex flex-col items-center gap-0.5 py-1 px-4 min-w-[72px]"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute inset-0 rounded-xl bg-white/10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <motion.div
                whileTap={{ scale: 0.85 }}
                className="relative z-10 flex flex-col items-center gap-0.5"
              >
                <motion.div
                  animate={
                    isActive
                      ? { scale: [1, 1.15, 1], transition: { duration: 0.3 } }
                      : {}
                  }
                >
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? "text-peach" : "text-white/40"
                    }`}
                  />
                </motion.div>
                <span
                  className={`text-[10px] font-medium leading-none transition-colors ${
                    isActive ? "text-white/80" : "text-white/30"
                  }`}
                >
                  {tab.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </motion.nav>
    </div>
  );
}
