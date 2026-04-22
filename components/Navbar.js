"use client";

import Link from "next/link";
import { UserAuth } from "@/context/AuthContext";
import { LogOut, Home, Compass, Image as ImageIcon, Map as MapIcon, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import usePresence from "@/hooks/usePresence";

export default function Navbar() {
  const { user, logout } = UserAuth();
  const { partnerStatus } = usePresence(user);

  if (!user) return null;

  return (
    <nav className="navbar">
      <Link href="/discussions" className="flex items-center gap-3 font-bold text-xl group">
        <motion.div 
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.5 }}
          className="p-1.5 bg-[#ff3333] rounded-lg shadow-[0_0_15px_rgba(255,51,51,0.5)]"
        >
          <Compass size={24} className="text-white" />
        </motion.div>
        <span className="tracking-tighter flex items-center gap-2">
          <span className="text-[var(--accent-color)]">EIRNI</span>
          <span className="text-[var(--text-primary)]">&</span>
          <span className="text-[var(--accent-color)]">DANY</span>
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-6">
        <Link href="/discussions" className="flex items-center gap-2 text-sm font-bold hover:text-[var(--accent-color)] transition-colors">
          <Compass size={18} /> Arbre
        </Link>
        <Link href="/gallery" className="flex items-center gap-2 text-sm font-bold hover:text-[var(--accent-color)] transition-colors">
          <ImageIcon size={18} /> Album
        </Link>
        <Link href="/timeline" className="flex items-center gap-2 text-sm font-bold hover:text-[var(--accent-color)] transition-colors">
          <Calendar size={18} /> Timeline
        </Link>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="hidden md:flex flex-col items-end">
          <div className="flex items-center gap-2">
            {partnerStatus && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                <div className={`w-1.5 h-1.5 rounded-full ${partnerStatus.isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-500'}`}></div>
                <span className="text-[10px] text-secondary font-medium">Partner</span>
              </div>
            )}
            <span className="text-xs font-bold text-white uppercase tracking-widest">
              {user.displayName || "Explorateur"}
            </span>
          </div>
          <AnimatePresence>
            {partnerStatus?.isTyping && (
              <motion.span 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="text-[10px] text-[var(--accent-color)] font-bold italic"
              >
                The other is typing...
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        
        <button 
          onClick={logout}
          className="p-2 border border-[#333] rounded-xl hover:bg-red-500/10 hover:border-red-500/50 transition-all group"
          title="Se déconnecter"
        >
          <LogOut size={20} className="text-secondary group-hover:text-[#ff3333] transition-colors" />
        </button>
      </div>
    </nav>
  );
}
