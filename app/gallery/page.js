"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, X, ExternalLink } from "lucide-react";

export default function GalleryPage() {
  const { user, loading } = UserAuth();
  const router = useRouter();
  const [mediaPosts, setMediaPosts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMediaPosts(posts.filter(p => p.fileUrl && p.fileType?.startsWith("image/")));
      });
      return () => unsubscribe();
    }
  }, [user]);

  if (loading || !user) return null;

  return (
    <div className="page-container pt-24 px-6 max-w-6xl mx-auto">
      <header className="mb-12 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-4 bg-gradient-to-r from-[var(--text-primary)] to-[var(--accent-color)] bg-clip-text text-transparent"
        >
          Our Shared Album
        </motion.h1>
        <p className="text-secondary">Capture every moment of our journey together.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mediaPosts.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="aspect-square rounded-2xl overflow-hidden cursor-pointer relative group glass border-white/10"
            onClick={() => setSelectedImage(post)}
          >
            <img 
              src={post.fileUrl} 
              alt={post.fileName} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
              <p className="text-white text-xs font-bold truncate">{post.authorName}</p>
              <p className="text-white/60 text-[10px] truncate">{new Date(post.createdAt?.toDate()).toLocaleDateString()}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {mediaPosts.length === 0 && (
        <div className="text-center py-20 opacity-50">
          <ImageIcon size={48} className="mx-auto mb-4" />
          <p>No photos shared yet. Start your journey in the Tree!</p>
        </div>
      )}

      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12"
            onClick={() => setSelectedImage(null)}
          >
            <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
              <X size={32} />
            </button>
            
            <motion.div 
              layoutId={selectedImage.id}
              className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center"
              onClick={e => e.stopPropagation()}
            >
              <img 
                src={selectedImage.fileUrl} 
                alt={selectedImage.fileName} 
                className="max-h-[80vh] w-auto object-contain rounded-xl shadow-2xl"
              />
              <div className="mt-6 text-center">
                <p className="text-white text-lg font-bold">{selectedImage.text || "Un moment précieux"}</p>
                <p className="text-white/50 text-sm mt-1">Shared by {selectedImage.authorName} — {new Date(selectedImage.createdAt?.toDate()).toLocaleString()}</p>
                <button 
                  onClick={() => router.push(`/discussions/${selectedImage.parentId || selectedImage.id}`)}
                  className="mt-4 flex items-center gap-2 text-[var(--accent-color)] hover:underline mx-auto"
                >
                  <ExternalLink size={16} /> View in Discussion
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
