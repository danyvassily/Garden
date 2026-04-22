"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, ArrowRight, Star } from "lucide-react";
import Link from "next/link";

export default function TimelinePage() {
  const { user, loading } = UserAuth();
  const router = useRouter();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, "posts"), orderBy("createdAt", "asc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPosts(all.filter(p => p.parentId === null)); // Root discussions as milestones
      });
      return () => unsubscribe();
    }
  }, [user]);

  if (loading || !user) return null;

  return (
    <div className="page-container pt-24 px-6 max-w-4xl mx-auto">
      <header className="mb-16 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-4 bg-gradient-to-r from-[var(--text-primary)] to-[var(--accent-color)] bg-clip-text text-transparent"
        >
          Our Timeline
        </motion.h1>
        <p className="text-secondary">Every chapter of our story / Chaque étape de notre histoire.</p>
      </header>

      <div className="relative border-l-2 border-[var(--accent-color)]/30 ml-4 md:ml-24 pb-20">
        {posts.map((post, i) => (
          <motion.div 
            key={post.id}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="mb-12 relative"
          >
            {/* The Dot */}
            <div className="absolute -left-[11px] top-6 w-5 h-5 rounded-full bg-[var(--accent-color)] shadow-[0_0_15px_rgba(255,126,103,0.6)] z-10"></div>
            
            {/* The Date (Desktop) */}
            <div className="hidden md:block absolute -left-28 top-6 text-right w-20">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">
                {post.createdAt?.toDate() ? new Date(post.createdAt.toDate()).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }) : ""}
              </span>
              <span className="text-lg font-black text-[var(--accent-color)] block">
                {post.createdAt?.toDate() ? new Date(post.createdAt.toDate()).getFullYear() : ""}
              </span>
            </div>

            <Link href={`/discussions/${post.id}`}>
              <div className="card ml-8 hover:translate-x-2 transition-transform cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] md:hidden font-bold text-[var(--accent-color)] uppercase tracking-widest">
                    {post.createdAt?.toDate() ? new Date(post.createdAt.toDate()).toLocaleDateString() : ""}
                  </span>
                  {post.rating > 80 && (
                    <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold">
                      <Star size={12} fill="currentColor" /> Amazing Moment
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[var(--accent-color)] transition-colors">
                  {post.text.substring(0, 60)}{post.text.length > 60 ? "..." : ""}
                </h3>
                
                {post.fileUrl && post.fileType?.startsWith("image/") && (
                  <div className="w-full h-40 rounded-xl overflow-hidden mb-4">
                    <img src={post.fileUrl} className="w-full h-full object-cover" alt="" />
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-secondary mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                      {post.authorName?.substring(0, 2).toUpperCase()}
                    </div>
                    <span>Shared by {post.authorName}</span>
                  </div>
                  <ArrowRight size={16} className="text-[var(--accent-color)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}

        {posts.length === 0 && (
          <div className="ml-8 py-10 opacity-50">
            <Calendar size={48} className="mb-4" />
            <p>Our story is just beginning. Post your first discussion to see it here!</p>
          </div>
        )}
      </div>
    </div>
  );
}
