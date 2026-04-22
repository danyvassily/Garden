"use client";

import { useEffect } from "react";
import { UserAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn, Sparkles, Heart } from "lucide-react";

export default function Home() {
  const { user, loginWithGoogle, loading } = UserAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/discussions");
    }
  }, [user, loading, router]);

  if (loading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#fdfaf9]">
      {/* Animated Background Elements */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-24 -right-24 w-96 h-96 bg-[var(--accent-color)] opacity-5 blur-[100px] rounded-full"
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          rotate: [0, -90, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-24 -left-24 w-96 h-96 bg-pink-400 opacity-5 blur-[100px] rounded-full"
      />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-xl w-full text-center relative z-10"
      >
        <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-white shadow-2xl shadow-[var(--accent-color)]/20 text-[var(--accent-color)]">
          <Heart size={40} fill="currentColor" />
        </div>

        <h1 className="text-6xl font-black mb-6 tracking-tighter text-[var(--text-primary)]">
          The <span className="text-[var(--accent-color)]">Garden</span>
        </h1>
        
        <p className="text-xl text-secondary mb-12 font-medium leading-relaxed">
          Un espace privé, sacré et éternel pour votre amour.<br/>
          <span className="text-sm opacity-60 uppercase tracking-[0.2em] font-bold">Eirni & Dany</span>
        </p>
        
        <div className="space-y-4">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={loginWithGoogle}
            className="w-full py-5 px-8 bg-[var(--text-primary)] text-white rounded-[2rem] font-bold text-lg flex items-center justify-center gap-3 shadow-2xl shadow-black/20 hover:bg-black transition-all"
          >
            <LogIn size={22} />
            Entrer dans le Jardin
          </motion.button>
          
          <div className="flex items-center justify-center gap-2 text-xs text-secondary font-bold uppercase tracking-widest pt-4">
            <Sparkles size={14} className="text-[var(--accent-color)]" />
            Protected & Private Space
          </div>
        </div>
      </motion.div>

      {/* Decorative Footer */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[10px] font-black text-secondary/30 uppercase tracking-[0.5em] whitespace-nowrap">
        Designed with love for Eirni & Dany
      </div>
    </div>
  );
}
