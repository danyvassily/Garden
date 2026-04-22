"use client";

import { motion } from "framer-motion";
import { Compass } from "lucide-react";

export default function MiniMap({ onClick }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 0.7, scale: 1 }}
      whileHover={{ opacity: 1, scale: 1.1, borderRotate: 360 }}
      className="minimap-container"
      onClick={onClick}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Decorative elements to look like a "travel" map */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 border border-dashed border-[#ff3333]/30 rounded-full"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 border border-dotted border-white/10 rounded-full"
        />
        <Compass size={32} className="text-[#ff3333]" />
      </div>
    </motion.div>
  );
}
