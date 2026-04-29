"use client";

import { useEffect, useState } from "react";
import { UserAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, Sparkles, Heart, Lock, Globe } from "lucide-react";

export default function Home() {
  const { user, loginWithGoogle, loading } = UserAuth();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push("/discussions");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-garden-gradient">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: 360,
            opacity: [0.3, 1, 0.3] 
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 rounded-full border-4 border-[var(--accent-color)] border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-garden-gradient">
      {/* Immersive Background Layers */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.4, 1.1, 1],
            x: [0, 80, -40, 0],
            y: [0, -60, 40, 0],
            borderRadius: ["40%", "60%", "30%", "40%"]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-48 -right-20 w-[600px] h-[600px] bg-[hsla(var(--color-peach),0.4)] opacity-[0.15] blur-[100px]"
        />
        <motion.div 
          animate={{ 
            scale: [1.1, 1, 1.4, 1.1],
            x: [0, -80, 50, 0],
            y: [0, 70, -30, 0],
            borderRadius: ["50%", "30%", "60%", "50%"]
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-48 -left-20 w-[500px] h-[500px] bg-[hsla(var(--color-mint),0.4)] opacity-[0.15] blur-[100px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            x: [-30, 30, -30],
            y: [30, -30, 30],
            borderRadius: ["60%", "40%", "60%"]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[hsla(var(--color-lavender),0.4)] opacity-[0.15] blur-[120px]"
        />
        
        {/* Floating Particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.4, 0],
              y: [-20, -100],
              x: Math.random() * 100 - 50
            }}
            transition={{ 
              duration: 5 + Math.random() * 5, 
              repeat: Infinity, 
              delay: i * 2 
            }}
            className="absolute w-1 h-1 bg-[var(--accent-color)] rounded-full"
            style={{ 
              left: `${10 + i * 15}%`, 
              top: `${80 - i * 10}%` 
            }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
        className="max-w-2xl w-full text-center relative z-10"
      >
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 150, damping: 15, delay: 0.2 }}
          className="mb-10 inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_20px_40px_rgba(0,0,0,0.05)] text-[var(--accent-color)] animate-float"
        >
          <Heart size={40} fill="currentColor" className="drop-shadow-[0_4px_10px_var(--accent-glow)]" />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h1 className="text-7xl font-serif mb-6 tracking-tight text-[hsl(var(--text-primary))] leading-none">
            The <span className="text-[var(--accent-color)] italic">Garden</span>
          </h1>
          
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="h-px w-8 bg-black/10" />
            <p className="text-sm font-black uppercase tracking-[0.4em] text-[hsl(var(--text-secondary))] opacity-60">
              Eirni & Dany
            </p>
            <div className="h-px w-8 bg-black/10" />
          </div>
          
          <p className="text-xl text-[hsl(var(--text-secondary))] mb-16 font-medium leading-relaxed max-w-lg mx-auto">
            Un espace privé, sacré et éternel pour votre amour.<br/>
            <span className="text-sm italic opacity-80">Our sacred space, forever and always.</span>
          </p>
        </motion.div>
        
        <div className="relative group max-w-sm mx-auto">
          <motion.button 
            whileHover={{ scale: 1.04, y: -4 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onClick={loginWithGoogle}
            className="w-full py-5 px-10 bg-[hsl(var(--surface-color))] text-[hsl(var(--text-primary))] rounded-full font-bold text-lg flex items-center justify-center gap-4 border border-[hsla(var(--text-primary),0.1)] shadow-[0_20px_40px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.1)] hover:border-[hsla(var(--text-primary),0.2)] transition-colors relative overflow-hidden"
          >
            {/* Soft background gradient on hover */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="absolute inset-0 bg-gradient-to-r from-[hsla(var(--color-peach),0.2)] via-[hsla(var(--color-lavender),0.2)] to-[hsla(var(--color-mint),0.2)]"
            />
            
            <LogIn size={22} className="group-hover:rotate-12 transition-transform relative z-10" />
            <span className="relative z-10">Entrer dans le Jardin</span>
          </motion.button>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex items-center justify-center gap-6 mt-10"
          >
            <div className="flex items-center gap-2 text-[10px] text-[hsl(var(--text-secondary))] font-black uppercase tracking-widest opacity-60">
              <Lock size={12} />
              Private
            </div>
            <div className="w-1 h-1 bg-black/10 rounded-full" />
            <div className="flex items-center gap-2 text-[10px] text-[hsl(var(--text-secondary))] font-black uppercase tracking-widest opacity-60">
              <Globe size={12} />
              Bilingual
            </div>
            <div className="w-1 h-1 bg-black/10 rounded-full" />
            <div className="flex items-center gap-2 text-[10px] text-[hsl(var(--text-secondary))] font-black uppercase tracking-widest opacity-60">
              <Sparkles size={12} className="text-[var(--accent-color)]" />
              Forever
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Decorative Footer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[10px] font-black text-[hsl(var(--text-secondary))] opacity-30 uppercase tracking-[0.6em] whitespace-nowrap"
      >
        Designed with love for Eirni & Dany
      </motion.div>
    </div>
  );
}
