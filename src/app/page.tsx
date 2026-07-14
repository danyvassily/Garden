"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Lock, Languages, Infinity as InfinityIcon } from "lucide-react";
import { useEffect, useState, useMemo } from "react";

/* --------------- Floating Particles --------------- */

function Particles() {
  const particles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 8,
      duration: Math.random() * 6 + 4,
    })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* --------------- Animated Blobs --------------- */

function Blobs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Peach blob */}
      <motion.div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, rgba(249,168,160,0.5) 0%, rgba(249,168,160,0) 70%)",
        }}
        animate={{
          x: [0, 60, -30, 40, 0],
          y: [0, -50, 30, -20, 0],
          scale: [1, 1.1, 0.95, 1.05, 1],
        }}
        transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />

      {/* Lavender blob */}
      <motion.div
        className="absolute -bottom-40 right-0 w-[30rem] h-[30rem] rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, rgba(196,164,230,0.5) 0%, rgba(196,164,230,0) 70%)",
        }}
        animate={{
          x: [0, -50, 30, -60, 0],
          y: [0, 40, -30, 50, 0],
          scale: [1, 0.9, 1.1, 0.95, 1],
        }}
        transition={{ duration: 25, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />

      {/* Mint blob */}
      <motion.div
        className="absolute top-1/3 -right-32 w-80 h-80 rounded-full opacity-15"
        style={{
          background:
            "radial-gradient(circle, rgba(110,231,183,0.4) 0%, rgba(110,231,183,0) 70%)",
        }}
        animate={{
          x: [0, 40, -50, 20, 0],
          y: [0, -30, 40, -40, 0],
          scale: [1, 1.05, 0.9, 1.1, 1],
        }}
        transition={{ duration: 30, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
    </div>
  );
}

/* --------------- Floating Heart --------------- */

function FloatingHeart() {
  return (
    <motion.div
      className="absolute top-[10%] right-[15%] hidden md:block pointer-events-none"
      animate={{
        y: [0, -18, 0],
        rotate: [0, -8, 0, 8, 0],
      }}
      transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
    >
      <motion.div
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      >
        <Heart className="w-16 h-16 text-peach/30 fill-peach/20" />
      </motion.div>
    </motion.div>
  );
}

/* --------------- Badges --------------- */

const badges = [
  { icon: Lock, label: "Private" },
  { icon: Languages, label: "Bilingual" },
  { icon: InfinityIcon, label: "Forever" },
];

function Badges() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.6 }}
      className="flex items-center gap-3 flex-wrap justify-center"
    >
      {badges.map((badge) => {
        const Icon = badge.icon;
        return (
          <span
            key={badge.label}
            className="glass flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/60"
          >
            <Icon className="w-3 h-3 text-peach/60" />
            {badge.label}
          </span>
        );
      })}
    </motion.div>
  );
}

/* --------------- Footer --------------- */

function LandingFooter() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5, duration: 0.8 }}
      className="relative z-10 pb-8 text-center"
    >
      <p className="text-xs text-white/20 font-light tracking-wider uppercase">
        ✦ Un jardin secret pour deux âmes sœurs ✦
      </p>
    </motion.footer>
  );
}

/* --------------- Main Landing --------------- */

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-gradient-garden overflow-hidden">
      {/* Background layers */}
      <Blobs />
      <Particles />
      <FloatingHeart />

      {/* Main content */}
      <div className="relative z-10 flex flex-col flex-1 items-center justify-center px-6 gap-10">
        {/* Header section */}
        <div className="flex flex-col items-center gap-4 text-center">
          {/* Animated heart icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}
          >
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
              }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            >
              <Heart className="w-10 h-10 text-peach fill-peach/40" />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="font-serif text-5xl sm:text-6xl md:text-7xl tracking-wide text-white"
          >
            The Garden
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-lg sm:text-xl text-white/60 font-light tracking-wider"
          >
            Eirni & Dany
          </motion.p>
        </div>

        {/* Bilingual phrase */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-sm sm:text-base text-white/40 font-light italic text-center max-w-md leading-relaxed"
        >
          <span>Two souls, one garden.</span>
          <br />
          <span>Deux âmes, un seul jardin.</span>
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <button
            onClick={() => router.push("/discussions")}
            className="group relative overflow-hidden rounded-2xl px-8 py-3.5 font-medium text-sm tracking-wide transition-all"
          >
            {/* Gradient bg */}
            <span className="absolute inset-0 bg-gradient-to-r from-peach/20 via-lavender/20 to-mint/20 rounded-2xl border border-white/10 group-hover:border-white/20 transition-colors" />
            {/* Glow on hover */}
            <span className="absolute inset-0 bg-gradient-to-r from-peach/10 via-lavender/10 to-mint/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
            {/* Content */}
            <span className="relative z-10 flex items-center gap-2 text-white/90 group-hover:text-white transition-colors">
              <Heart className="w-4 h-4 text-peach" />
              Entrer dans le Jardin
            </span>
          </button>
        </motion.div>

        {/* Badges */}
        <Badges />
      </div>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
