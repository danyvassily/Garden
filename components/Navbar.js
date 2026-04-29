"use client";

import Link from "next/link";
import { UserAuth } from "@/context/AuthContext";
import { LogOut, Home, Compass, Image as ImageIcon, Map as MapIcon, Calendar, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import usePresence from "@/hooks/usePresence";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user, logout } = UserAuth();
  const { partnerStatus } = usePresence(user);
  const pathname = usePathname();

  if (!user) return null;

  const navItems = [
    { href: "/discussions", icon: Compass, label: "Arbre" },
    { href: "/gallery", icon: ImageIcon, label: "Album" },
    { href: "/timeline", icon: Calendar, label: "Timeline" },
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="navbar glass-premium px-4 md:px-8 flex-wrap py-2 gap-y-4"
    >
      <Link href="/discussions" className="flex items-center gap-3 group shrink-0">
        <motion.div 
          whileHover={{ rotate: 180, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="p-2 bg-[var(--accent-color)] rounded-xl shadow-lg shadow-[var(--accent-glow)] shrink-0"
        >
          <Heart size={20} className="text-white fill-white" />
        </motion.div>
        <div className="flex flex-col shrink-0">
          <span className="font-serif text-lg md:text-xl leading-tight tracking-tight whitespace-nowrap">
            The <span className="text-[var(--accent-color)]">Garden</span>
          </span>
          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] opacity-40 whitespace-nowrap">E&D Private</span>
        </div>
      </Link>

      <div className="hidden md:flex items-center gap-8">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all hover:text-[var(--accent-color)] ${isActive ? 'text-[var(--accent-color)]' : 'text-[hsl(var(--text-secondary))]'}`}
            >
              <item.icon size={16} strokeWidth={ isActive ? 3 : 2 } />
              {item.label}
              {isActive && (
                <motion.div 
                  layoutId="navUnderline"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[var(--accent-color)] rounded-full"
                />
              )}
            </Link>
          );
        })}
      </div>
      
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-4 border-r border-black/5 pr-6">
          {partnerStatus && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 border border-white shadow-sm">
              <div className={`w-2 h-2 rounded-full ${partnerStatus.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
              <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">
                {partnerStatus.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          )}
          
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-color)] leading-none mb-1">
              Welcome back
            </span>
            <span className="text-sm font-bold text-[hsl(var(--text-primary))] leading-none">
              {user.displayName?.split(' ')[0] || "Explorateur"}
            </span>
          </div>
        </div>
        
        <button 
          onClick={logout}
          className="p-2.5 rounded-xl bg-black/5 hover:bg-red-500/10 hover:text-red-500 transition-all group"
          title="Se déconnecter"
        >
          <LogOut size={20} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </motion.nav>
  );
}
