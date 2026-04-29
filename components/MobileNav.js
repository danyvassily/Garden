"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Image as ImageIcon, Calendar, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/discussions", icon: Compass, label: "Arbre" },
    { href: "/gallery", icon: ImageIcon, label: "Album" },
    { href: "/timeline", icon: Calendar, label: "Timeline" },
  ];

  // Hide on landing page
  if (pathname === "/") return null;

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md h-16 glass-premium rounded-2xl flex items-center justify-around px-4 z-[1000] md:hidden shadow-2xl">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link 
            key={item.href} 
            href={item.href} 
            className="relative flex flex-col items-center justify-center gap-1 w-full h-full"
          >
            <div className={`relative p-2 rounded-xl transition-all ${isActive ? 'text-[var(--accent-color)]' : 'text-[hsl(var(--text-secondary))] opacity-60'}`}>
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              {isActive && (
                <motion.div 
                  layoutId="mobileActiveTab"
                  className="absolute inset-0 bg-[var(--accent-color)]/10 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </div>
            <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isActive ? 'text-[var(--accent-color)]' : 'text-[hsl(var(--text-secondary))] opacity-40'}`}>
              {item.label}
            </span>
            
            {isActive && (
              <motion.div 
                layoutId="mobileActiveDot"
                className="absolute -bottom-1 w-1 h-1 bg-[var(--accent-color)] rounded-full"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
