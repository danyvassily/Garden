"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X, Navigation, Compass, Plus, Send, Heart, Map as MapIcon, Star, Search } from "lucide-react";
import Link from "next/link";
import { addPost } from "@/lib/firestore";
import GoogleMapLoader from "@/components/GoogleMapLoader";

export default function MapPage() {
  const { user, loading } = UserAuth();
  const [posts, setPosts] = useState([]);
  const [selectedPin, setSelectedPin] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [viewType, setViewType] = useState('all'); // all, visited, wishlist
  
  // Form states
  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationType, setNewLocationType] = useState("visited");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, "posts"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPosts(all.filter(p => p.lat && p.lng));
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleAddLocation = async (e) => {
    e.preventDefault();
    if (!newLocationName.trim()) return;
    setSubmitting(true);
    try {
      const lat = 48.8566 + (Math.random() - 0.5) * 5;
      const lng = 2.3522 + (Math.random() - 0.5) * 10;
      
      const locationData = {
        name: newLocationName,
        lat,
        lng,
        type: newLocationType
      };

      await addPost(`New adventure in ${newLocationName}!`, user, null, null, locationData);
      setNewLocationName("");
      setShowUpload(false);
    } catch (error) {
      console.error("Failed to add location", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) return null;

  const filteredPosts = posts.filter(p => {
    if (viewType === 'all') return true;
    return p.locationType === viewType;
  });

  return (
    <div className="fixed inset-0 pt-20 flex flex-col bg-[#fdfaf9]">
      {/* Top Header Floating UI */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xl px-4">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-heavy p-4 rounded-3xl shadow-2xl flex items-center justify-between gap-4 border-white/50"
        >
          <div className="flex items-center gap-2 px-3">
            <div className="w-8 h-8 rounded-full bg-[var(--accent-color)] flex items-center justify-center text-white shadow-lg">
              <Compass size={18} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-[var(--text-primary)]">Garden Map</h1>
              <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">Our Adventures</p>
            </div>
          </div>

          <div className="flex bg-black/5 p-1 rounded-2xl">
            {['all', 'visited', 'wishlist'].map((type) => (
              <button
                key={type}
                onClick={() => setViewType(type)}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${viewType === type ? 'bg-white text-[var(--accent-color)] shadow-md' : 'text-secondary hover:text-[var(--text-primary)]'}`}
              >
                {type}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setShowUpload(true)}
            className="w-10 h-10 rounded-full bg-[var(--accent-color)] flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform flex-shrink-0"
          >
            <Plus size={20} />
          </button>
        </motion.div>
      </div>

      {/* Main Map Container */}
      <div className="flex-1 relative">
        <GoogleMapLoader 
          posts={filteredPosts} 
          onPinClick={setSelectedPin} 
          selectedPin={selectedPin}
        />
        
        {/* Floating Side Info (Desktop) / Bottom Sheet (Mobile) */}
        <AnimatePresence>
          {selectedPin && (
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              className="absolute right-6 top-48 bottom-6 w-80 glass-heavy border-white/50 rounded-[2.5rem] p-8 z-[200] shadow-2xl overflow-hidden flex flex-col"
            >
              <button 
                onClick={() => setSelectedPin(null)}
                className="absolute top-6 right-6 p-2 hover:bg-black/5 rounded-full transition-colors"
              >
                <X size={20} className="text-secondary" />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${selectedPin.locationType === 'wishlist' ? 'bg-blue-500/10 text-blue-500' : 'bg-pink-500/10 text-pink-500'}`}>
                  {selectedPin.locationType === 'wishlist' ? <Star size={24} /> : <Heart size={24} />}
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)] text-xl leading-tight">{selectedPin.locationName || "Somewhere"}</h3>
                  <p className="text-[10px] text-secondary font-bold uppercase tracking-widest mt-1">
                    {selectedPin.locationType === 'wishlist' ? 'Dream Journey' : 'Treasured Memory'}
                  </p>
                </div>
              </div>

              {selectedPin.fileUrl && (
                <div className="w-full h-40 rounded-3xl overflow-hidden mb-6 border-4 border-white shadow-xl">
                  <img src={selectedPin.fileUrl} className="w-full h-full object-cover" alt="" />
                </div>
              )}

              <p className="text-[var(--text-secondary)] text-sm leading-relaxed italic mb-8">
                "{selectedPin.text}"
              </p>
              
              <div className="mt-auto space-y-3">
                <Link 
                  href={`/discussions/${selectedPin.id}`}
                  className="btn-accent w-full py-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  <Compass size={16} /> Open Discussion
                </Link>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedPin.lat},${selectedPin.lng}`}
                  target="_blank"
                  className="w-full py-4 rounded-2xl text-xs flex items-center justify-center gap-2 bg-white border border-black/5 hover:bg-black/5 transition-colors font-bold text-[var(--text-primary)]"
                >
                  <Navigation size={16} /> View on Google Maps
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Modal UI */}
        <AnimatePresence>
          {showUpload && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[300] bg-[#fff9f8]/80 backdrop-blur-xl flex items-center justify-center p-6"
            >
              <div className="w-full max-w-md bg-white rounded-[3rem] p-10 shadow-[0_32px_64px_-16px_rgba(255,126,103,0.2)] border border-white relative">
                <button 
                  onClick={() => setShowUpload(false)} 
                  className="absolute top-8 right-8 p-2 hover:bg-black/5 rounded-full"
                >
                  <X size={20} className="text-secondary" />
                </button>
                
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-black text-[var(--text-primary)] mb-2">Pin a Location</h2>
                  <p className="text-secondary text-sm">Where should we go next? / Où allons-nous ?</p>
                </div>
                
                <form onSubmit={handleAddLocation} className="space-y-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={18} />
                    <input 
                      type="text" 
                      value={newLocationName}
                      onChange={(e) => setNewLocationName(e.target.value)}
                      placeholder="Search a place... / Chercher un lieu..."
                      className="w-full bg-[#f8f5f4] border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-[var(--text-primary)] focus:ring-2 ring-[var(--accent-color)]/20 transition-all"
                      autoFocus
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => setNewLocationType('visited')}
                      className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${newLocationType === 'visited' ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/5 text-[var(--accent-color)] shadow-inner' : 'border-black/5 bg-black/5 text-secondary'}`}
                    >
                      <Heart size={24} fill={newLocationType === 'visited' ? 'currentColor' : 'none'} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Been there</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setNewLocationType('wishlist')}
                      className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${newLocationType === 'wishlist' ? 'border-blue-500 bg-blue-500/5 text-blue-500 shadow-inner' : 'border-black/5 bg-black/5 text-secondary'}`}
                    >
                      <Star size={24} fill={newLocationType === 'wishlist' ? 'currentColor' : 'none'} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Must go</span>
                    </button>
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting || !newLocationName.trim()}
                    className="btn-accent w-full py-5 rounded-2xl text-sm font-black flex items-center justify-center gap-3 shadow-2xl shadow-[var(--accent-color)]/30"
                  >
                    {submitting ? "Pinning..." : "Save to Map / Enregistrer"}
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
