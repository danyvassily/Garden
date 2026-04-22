"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Image as ImageIcon, Calendar, Map as MapIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/discussions", icon: Compass, label: "Tree" },
    { href: "/gallery", icon: ImageIcon, label: "Album" },
    { href: "/timeline", icon: Calendar, label: "Timeline" },
    { href: "/map", icon: MapIcon, label: "Map" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 glass-heavy border-t border-white/10 flex items-center justify-around px-2 z-[1000] lg:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 w-full">
            <div className={`relative p-2 rounded-xl transition-all ${isActive ? 'text-[var(--accent-color)]' : 'text-secondary'}`}>
              <item.icon size={24} />
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-[var(--accent-color)]/10 rounded-xl"
                />
              )}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-[var(--accent-color)]' : 'text-secondary'}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
