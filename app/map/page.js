"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X, Navigation, Compass } from "lucide-react";
import Link from "next/link";

export default function MapPage() {
  const { user, loading } = UserAuth();
  const [posts, setPosts] = useState([]);
  const [selectedPin, setSelectedPin] = useState(null);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, "posts"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Mock locations for existing posts if they don't have one
        // In a real app, users would pick a location. For now, let's distribute them.
        setPosts(all.filter(p => p.parentId === null).map((p, i) => ({
          ...p,
          lat: p.lat || (48.8566 + (Math.random() - 0.5) * 10), // Default around Europe
          lng: p.lng || (2.3522 + (Math.random() - 0.5) * 20)
        })));
      });
      return () => unsubscribe();
    }
  }, [user]);

  if (loading || !user) return null;

  return (
    <div className="page-container pt-24 px-6 h-screen flex flex-col">
      <header className="mb-8 text-center flex-shrink-0">
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl font-bold bg-gradient-to-r from-[var(--text-primary)] to-[var(--accent-color)] bg-clip-text text-transparent"
        >
          Our Adventures Map
        </motion.h1>
        <p className="text-secondary text-sm">Every place we've shared a memory / Partout où nous avons créé un souvenir.</p>
      </header>

      <div className="flex-1 rounded-3xl overflow-hidden relative glass border-white/10 mb-8 shadow-2xl bg-slate-900/50">
        {/* Simple Abstract SVG Map Background */}
        <svg viewBox="0 0 800 400" className="w-full h-full opacity-20">
          <path fill="currentColor" className="text-[var(--accent-color)]" d="M150,150 Q200,100 250,150 T350,150 T450,150 T550,150" />
          <circle cx="200" cy="200" r="100" fill="currentColor" className="text-white/5" />
          <circle cx="600" cy="150" r="80" fill="currentColor" className="text-white/5" />
        </svg>

        {/* The Grid/Compass background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <Compass size={300} className="text-white" />
        </div>

        {/* Pins */}
        {posts.map((post, i) => (
          <motion.button
            key={post.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="absolute z-20 group"
            style={{ 
              left: `${((post.lng + 180) / 360) * 100}%`, 
              top: `${((90 - post.lat) / 180) * 100}%` 
            }}
            onClick={() => setSelectedPin(post)}
          >
            <div className="relative">
              <MapPin 
                size={24} 
                className={`transition-colors ${selectedPin?.id === post.id ? 'text-white' : 'text-[var(--accent-color)]'}`} 
                fill={selectedPin?.id === post.id ? 'var(--accent-color)' : 'transparent'}
              />
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white animate-ping"></div>
              
              {/* Tooltip on Hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white text-black text-[10px] font-bold rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {post.authorName}: {post.text.substring(0, 20)}...
              </div>
            </div>
          </motion.button>
        ))}

        {/* Selected Pin Details Overlay */}
        <AnimatePresence>
          {selectedPin && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="absolute right-4 top-4 bottom-4 w-72 glass-heavy border-white/20 rounded-2xl p-6 z-50 flex flex-col shadow-2xl"
            >
              <button 
                onClick={() => setSelectedPin(null)}
                className="absolute top-4 right-4 text-secondary hover:text-white"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-2 mb-4">
                <Navigation size={16} className="text-[var(--accent-color)]" />
                <h3 className="font-bold text-white text-sm">Memory Location</h3>
              </div>

              {selectedPin.fileUrl && selectedPin.fileType?.startsWith("image/") && (
                <div className="w-full h-32 rounded-xl overflow-hidden mb-4 border border-white/10">
                  <img src={selectedPin.fileUrl} className="w-full h-full object-cover" alt="" />
                </div>
              )}

              <p className="text-gray-200 text-sm italic mb-4">"{selectedPin.text}"</p>
              
              <div className="mt-auto pt-4 border-t border-white/10">
                <p className="text-[10px] text-secondary font-bold uppercase tracking-widest mb-2">By {selectedPin.authorName}</p>
                <Link 
                  href={`/discussions/${selectedPin.id}`}
                  className="btn-accent w-full py-2 text-xs flex items-center justify-center gap-2"
                >
                  <Compass size={14} /> Open Discussion
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Background instructions */}
        <div className="absolute bottom-6 left-6 text-white/30 text-[10px] font-bold uppercase tracking-widest">
          Coordinates System Active // Private Couple Map
        </div>
      </div>
    </div>
  );
}
