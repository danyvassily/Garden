"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, X, ExternalLink, Plus, Send, Heart } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import { addPost } from "@/lib/firestore";
import { uploadFile } from "@/lib/storage";

export default function GalleryPage() {
  const { user, loading } = UserAuth();
  const router = useRouter();
  const [mediaPosts, setMediaPosts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [newPhotoText, setNewPhotoText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setSubmitting(true);
    try {
      const fileData = await uploadFile(selectedFile);
      await addPost(newPhotoText || "Moment partagé dans l'album", user, null, fileData);
      setNewPhotoText("");
      setSelectedFile(null);
      setShowUpload(false);
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setSubmitting(false);
    }
  };

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
      <div className="max-w-7xl mx-auto px-6 py-24 relative z-10">
        <header className="mb-20 text-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-block p-3 rounded-2xl bg-white/40 border border-white mb-6"
          >
            <ImageIcon size={32} className="text-[var(--accent-color)]" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-serif mb-4 text-[hsl(var(--text-primary))]"
          >
            Notre Album Partagé
          </motion.h1>
          <p className="text-[hsl(var(--text-secondary))] font-medium mb-10">
            Capturer chaque instant de notre voyage ensemble.<br/>
            <span className="text-xs uppercase tracking-[0.4em] opacity-40 mt-2 block">Our Visual Journey</span>
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUpload(true)}
            className="btn-accent inline-flex items-center gap-3 px-8 py-4 bg-[hsl(var(--text-primary))] text-white rounded-2xl shadow-xl font-bold"
          >
            <Plus size={20} /> Ajouter une photo
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
                <h2 className="text-xl font-bold">Nouveau Souvenir</h2>
                <button onClick={() => setShowUpload(false)} className="text-[hsl(var(--text-secondary))] hover:text-black">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleUpload}>
                <textarea 
                  value={newPhotoText}
                  onChange={(e) => setNewPhotoText(e.target.value)}
                  placeholder="Écrivez une légende..."
                  className="w-full bg-black/5 border border-transparent focus:border-[var(--accent-color)] focus:bg-white rounded-2xl p-6 min-h-[100px] outline-none transition-all font-medium mb-6"
                />
                <div className="flex items-center justify-between">
                  <FileUpload onFileSelect={setSelectedFile} />
                  <button 
                    type="submit" 
                    disabled={submitting || !selectedFile}
                    className="btn-accent px-8 py-3 bg-[hsl(var(--text-primary))] text-white rounded-xl font-bold shadow-lg"
                  >
                    {submitting ? "Partage..." : "Enregistrer"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {mediaPosts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 10) * 0.05 }}
              className="aspect-square rounded-2xl overflow-hidden cursor-pointer relative group bg-white/40 border border-white shadow-sm"
              onClick={() => setSelectedImage(post)}
            >
              <img 
                src={post.fileUrl} 
                alt={post.fileName} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                <p className="text-white text-xs font-black uppercase tracking-widest">{post.authorName}</p>
                <p className="text-white/60 text-[10px] font-medium">{new Date(post.createdAt?.toDate()).toLocaleDateString()}</p>
              </div>
              
              <div className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                <Heart size={12} className="text-white fill-white" />
              </div>
            </motion.div>
          ))}
        </div>

        {mediaPosts.length === 0 && (
          <div className="text-center py-32 card bg-white/40 border-dashed border-2">
            <ImageIcon size={64} className="mx-auto mb-6 text-[var(--accent-color)] opacity-20" />
            <p className="font-medium text-[hsl(var(--text-secondary))]">Aucune photo partagée pour le moment. Commencez votre voyage !</p>
          </div>
        )}

        <AnimatePresence>
          {selectedImage && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6"
              onClick={() => setSelectedImage(null)}
            >
              <button className="absolute top-10 right-10 text-white/40 hover:text-white transition-colors p-2">
                <X size={32} />
              </button>
              
              <motion.div 
                layoutId={selectedImage.id}
                className="relative max-w-6xl w-full h-full flex flex-col items-center justify-center"
                onClick={e => e.stopPropagation()}
              >
                <img 
                  src={selectedImage.fileUrl} 
                  alt={selectedImage.fileName} 
                  className="max-h-[75vh] w-auto object-contain rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.5)]"
                />
                <div className="mt-10 text-center max-w-2xl">
                  <h3 className="text-white text-2xl font-serif mb-2">{selectedImage.text || "Un moment précieux"}</h3>
                  <p className="text-white/40 text-xs font-black uppercase tracking-[0.3em]">
                    Partagé par {selectedImage.authorName} — {new Date(selectedImage.createdAt?.toDate()).toLocaleString()}
                  </p>
                  
                  <Link 
                    href={`/discussions/${selectedImage.parentId || selectedImage.id}`}
                    className="mt-8 inline-flex items-center gap-3 text-[var(--accent-color)] font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors border border-[var(--accent-color)]/30 px-6 py-3 rounded-full hover:bg-[var(--accent-color)]"
                  >
                    <ExternalLink size={14} /> Voir la discussion
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
