"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ArrowRight, Star, Plus, Send, X, Heart } from "lucide-react";
import Link from "next/link";
import FileUpload from "@/components/FileUpload";
import { addPost } from "@/lib/firestore";
import { uploadFile } from "@/lib/storage";

export default function TimelinePage() {
  const { user, loading } = UserAuth();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [newText, setNewText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    if (!newText.trim() && !selectedFile) return;
    setSubmitting(true);
    try {
      let fileData = null;
      if (selectedFile) fileData = await uploadFile(selectedFile);
      await addPost(newText, user, null, fileData);
      setNewText("");
      setSelectedFile(null);
      setShowUpload(false);
    } catch (error) {
      console.error("Failed to add milestone", error);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, "posts"), orderBy("createdAt", "asc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPosts(all.filter(p => p.parentId === null));
      });
      return () => unsubscribe();
    }
  }, [user]);

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-garden-gradient">
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-12 h-12 rounded-full border-2 border-[var(--accent-color)] border-t-transparent"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-garden-gradient pb-24">
      <div className="max-w-4xl mx-auto px-6 py-24 relative z-10">
        <header className="mb-20 text-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-block p-3 rounded-2xl bg-white/40 border border-white mb-6"
          >
            <Calendar size={32} className="text-[var(--accent-color)]" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-serif mb-4 text-[hsl(var(--text-primary))]"
          >
            Notre Histoire
          </motion.h1>
          <p className="text-[hsl(var(--text-secondary))] font-medium mb-10">
            Chaque chapitre de notre voyage, gravé dans le temps.<br/>
            <span className="text-xs uppercase tracking-[0.4em] opacity-40 mt-2 block">Our Sacred Timeline</span>
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUpload(true)}
            className="btn-accent inline-flex items-center gap-3 px-8 py-4 bg-[hsl(var(--text-primary))] text-white rounded-2xl shadow-xl font-bold"
          >
            <Plus size={20} /> Ajouter un souvenir
          </motion.button>
        </header>

        <AnimatePresence>
          {showUpload && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mb-20 card glass-premium p-8 rounded-3xl max-w-xl mx-auto shadow-2xl z-50"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold">Nouveau Chapitre</h2>
                <button onClick={() => setShowUpload(false)} className="text-[hsl(var(--text-secondary))] hover:text-black">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleAddMilestone}>
                <textarea 
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Que s'est-il passé aujourd'hui ?"
                  className="w-full bg-black/5 border border-transparent focus:border-[var(--accent-color)] focus:bg-white rounded-2xl p-6 min-h-[120px] outline-none transition-all font-medium mb-6"
                />
                <div className="flex items-center justify-between">
                  <FileUpload onFileSelect={setSelectedFile} />
                  <button 
                    type="submit" 
                    disabled={submitting || (!newText.trim() && !selectedFile)}
                    className="btn-accent px-8 py-3 bg-[hsl(var(--text-primary))] text-white rounded-xl font-bold shadow-lg"
                  >
                    {submitting ? "Partage..." : "Enregistrer"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative border-l-2 border-[var(--accent-color)]/20 ml-8 md:ml-32">
          {posts.map((post, i) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="mb-16 relative"
            >
              {/* Dot with Glow */}
              <div className="absolute -left-[11px] top-10 w-5 h-5 rounded-full bg-[var(--accent-color)] shadow-[0_0_20px_var(--accent-glow)] border-4 border-white z-10" />
              
              {/* Date Indicator (Desktop) */}
              <div className="hidden md:block absolute -left-36 top-10 text-right w-24 pr-4">
                <span className="text-[10px] font-black text-[hsl(var(--text-secondary))] uppercase tracking-[0.2em] block opacity-40">
                  {post.createdAt?.toDate() ? new Date(post.createdAt.toDate()).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }) : ""}
                </span>
                <span className="text-3xl font-serif text-[var(--accent-color)] block leading-tight">
                  {post.createdAt?.toDate() ? new Date(post.createdAt.toDate()).getFullYear() : ""}
                </span>
              </div>

              <Link href={`/discussions/${post.id}`}>
                <div className="card ml-12 p-8 hover:translate-x-2 bg-white/60 backdrop-blur-sm group transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-[10px] md:hidden font-black text-[var(--accent-color)] uppercase tracking-widest bg-[var(--accent-color)]/10 px-2 py-1 rounded">
                      {post.createdAt?.toDate() ? new Date(post.createdAt.toDate()).toLocaleDateString('fr-FR') : ""}
                    </span>
                    {post.rating > 80 && (
                      <div className="flex items-center gap-2 text-[var(--accent-color)] text-[10px] font-black uppercase tracking-widest">
                        <Star size={14} fill="currentColor" /> Moment Précieux
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-serif text-[hsl(var(--text-primary))] mb-4 group-hover:text-[var(--accent-color)] transition-colors leading-tight">
                    {post.text.length > 80 ? post.text.substring(0, 80) + "..." : post.text}
                  </h3>
                  
                  {post.fileUrl && post.fileType?.startsWith("image/") && (
                    <div className="w-full aspect-video rounded-2xl overflow-hidden mb-6 shadow-inner bg-black/5">
                      <img src={post.fileUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-[hsl(var(--text-secondary))] mt-6 pt-6 border-t border-black/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-black/5 flex items-center justify-center text-[10px] font-black uppercase">
                        {post.authorName?.substring(0, 1)}
                      </div>
                      <span className="font-bold opacity-60">Par {post.authorName}</span>
                    </div>
                    <motion.div 
                      whileHover={{ x: 5 }}
                      className="text-[var(--accent-color)] opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2 font-black uppercase tracking-widest"
                    >
                      Découvrir <ArrowRight size={14} />
                    </motion.div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}

          {posts.length === 0 && (
            <div className="ml-12 py-20 text-center card bg-white/40 border-dashed border-2">
              <Heart size={48} className="mx-auto mb-6 text-[var(--accent-color)] opacity-20" />
              <p className="font-medium text-[hsl(var(--text-secondary))]">Notre histoire attend son premier chapitre.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
