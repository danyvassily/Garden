"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X, Navigation, Compass, Plus, Send, Heart, Map as MapIcon, Star } from "lucide-react";
import Link from "next/link";
import { addPost } from "@/lib/firestore";

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
        // Filter posts that have location data
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
      // For this demo, we'll pick a random lat/lng near the last one or Europe
      // In a full Google Maps integration, we'd use the Places Autocomplete
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
    <div className="page-container pt-24 px-6 h-screen flex flex-col">
      <header className="mb-8 text-center flex-shrink-0">
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl font-bold bg-gradient-to-r from-[var(--text-primary)] to-[var(--accent-color)] bg-clip-text text-transparent"
        >
          Our Adventures Map
        </motion.h1>
        
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <button 
            onClick={() => setViewType('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewType === 'all' ? 'bg-[var(--accent-color)] text-white shadow-lg' : 'bg-white/5 border border-white/10 text-secondary'}`}
          >
            All Places
          </button>
          <button 
            onClick={() => setViewType('visited')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewType === 'visited' ? 'bg-pink-500 text-white shadow-lg' : 'bg-white/5 border border-white/10 text-secondary'}`}
          >
            <Heart size={12} className="inline mr-1" /> Visited
          </button>
          <button 
            onClick={() => setViewType('wishlist')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewType === 'wishlist' ? 'bg-blue-500 text-white shadow-lg' : 'bg-white/5 border border-white/10 text-secondary'}`}
          >
            <Star size={12} className="inline mr-1" /> Wishlist
          </button>
          
          <button 
            onClick={() => setShowUpload(true)}
            className="px-4 py-1.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all ml-4"
          >
            <Plus size={14} className="inline mr-1" /> Add Place
          </button>
        </div>
      </header>

      <div className="flex-1 rounded-3xl overflow-hidden relative glass border-white/10 mb-8 shadow-2xl bg-[#0a0a0a]">
        {/* Google Maps Integration Placeholder */}
        <div className="absolute inset-0 z-0">
          <iframe 
            width="100%" 
            height="100%" 
            frameBorder="0" 
            style={{ border: 0, filter: 'grayscale(0.8) invert(1) contrast(1.2)' }}
            src={`https://www.google.com/maps/embed/v1/view?key=YOUR_API_KEY_HERE&center=48.8566,2.3522&zoom=4&maptype=roadmap`}
            allowFullScreen
          ></iframe>
          <div className="absolute inset-0 bg-[var(--accent-color)]/5 pointer-events-none"></div>
        </div>

        {/* Overlay for "Add Location" */}
        <AnimatePresence>
          {showUpload && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
            >
              <div className="glass-heavy p-8 rounded-3xl border-white/20 max-w-md w-full shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">Add a New Place</h2>
                  <button onClick={() => setShowUpload(false)} className="text-secondary hover:text-white">
                    <X size={20} />
                  </button>
                </div>
                
                <form onSubmit={handleAddLocation} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-secondary uppercase tracking-widest block mb-2">Location Name</label>
                    <input 
                      type="text" 
                      value={newLocationName}
                      onChange={(e) => setNewLocationName(e.target.value)}
                      placeholder="Paris, Tokyo, Home..."
                      className="input-area h-12"
                      autoFocus
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => setNewLocationType('visited')}
                      className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${newLocationType === 'visited' ? 'bg-pink-500/20 border-pink-500 text-pink-500' : 'bg-white/5 border-white/10 text-secondary'}`}
                    >
                      <Heart size={20} />
                      <span className="text-xs font-bold">Visited</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setNewLocationType('wishlist')}
                      className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${newLocationType === 'wishlist' ? 'bg-blue-500/20 border-blue-500 text-blue-500' : 'bg-white/5 border-white/10 text-secondary'}`}
                    >
                      <Star size={20} />
                      <span className="text-xs font-bold">Wishlist</span>
                    </button>
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting || !newLocationName.trim()}
                    className="btn-accent w-full py-4 mt-4 flex items-center justify-center gap-2"
                  >
                    <Send size={18} /> {submitting ? "Adding..." : "Add to Map"}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Pins (Rendered on top of Google Map) */}
        {filteredPosts.map((post, i) => (
          <motion.button
            key={post.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute z-20 group"
            style={{ 
              left: `${((post.lng + 180) / 360) * 100}%`, 
              top: `${((90 - post.lat) / 180) * 100}%` 
            }}
            onClick={() => setSelectedPin(post)}
          >
            <div className="relative">
              <div className={`p-1.5 rounded-full shadow-lg border-2 border-white transition-all ${post.locationType === 'wishlist' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                {post.locationType === 'wishlist' ? <Star size={12} className="text-white" /> : <Heart size={12} className="text-white" />}
              </div>
              <div className="absolute -inset-1 rounded-full bg-white animate-ping opacity-20"></div>
            </div>
          </motion.button>
        ))}

        {/* Info Overlay */}
        <AnimatePresence>
          {selectedPin && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 glass-heavy border-white/20 rounded-2xl p-6 z-50 shadow-2xl"
            >
              <button 
                onClick={() => setSelectedPin(null)}
                className="absolute top-4 right-4 text-secondary hover:text-white"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${selectedPin.locationType === 'wishlist' ? 'bg-blue-500/20 text-blue-500' : 'bg-pink-500/20 text-pink-500'}`}>
                  {selectedPin.locationType === 'wishlist' ? <Star size={20} /> : <Heart size={20} />}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{selectedPin.locationName || "Adventure"}</h3>
                  <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">{selectedPin.locationType === 'wishlist' ? 'Wishlist / À visiter' : 'Visited / Déjà visité'}</p>
                </div>
              </div>

              <p className="text-gray-300 text-sm italic mb-6">"{selectedPin.text}"</p>
              
              <div className="flex gap-2">
                <Link 
                  href={`/discussions/${selectedPin.id}`}
                  className="btn-accent flex-1 py-2.5 text-xs flex items-center justify-center gap-2"
                >
                  <Compass size={14} /> Open Memory
                </Link>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedPin.lat},${selectedPin.lng}`}
                  target="_blank"
                  className="bg-white/5 border border-white/10 hover:bg-white/10 p-2.5 rounded-xl transition-all"
                >
                  <Navigation size={18} className="text-white" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
