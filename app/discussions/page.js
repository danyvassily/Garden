"use client";

import { useEffect, useState } from "react";
import { UserAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { getRootPosts, addPost, deletePost } from "@/lib/firestore";
import { uploadFile } from "@/lib/storage";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquare, Plus, Sparkles, Trash2, Edit2, Mic } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import VoiceRecorder from "@/components/VoiceRecorder";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import usePresence from "@/hooks/usePresence";

function ClientOnlyDate({ date }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !date) return "À l'instant";
  return formatDistanceToNow(date, { addSuffix: true, locale: fr });
}

export default function DiscussionsPage() {
  const { user, loading } = UserAuth();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [newPostText, setNewPostText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const loadPosts = () => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const rootPosts = all.filter(p => p.parentId === null);
      
      // Notification logic
      if (posts.length > 0 && rootPosts.length > posts.length) {
        const newPost = rootPosts[0];
        if (newPost.authorId !== user.uid) {
          // Play a sound or show a notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`New post from ${newPost.authorName}!`);
          }
        }
      }
      
      setPosts(rootPosts);
    });
    return unsubscribe;
  };

  useEffect(() => {
    if (user) {
      const unsubscribe = loadPosts();
      return () => unsubscribe();
    }
  }, [user]);

  const handleDeletePost = async (e, postId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Voulez-vous supprimer le post ?")) return;
    
    try {
      await deletePost(postId);
      loadPosts();
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPostText.trim() && !selectedFile && !audioBlob) return;

    setSubmitting(true);
    try {
      let fileData = null;
      if (selectedFile) {
        fileData = await uploadFile(selectedFile);
      } else if (audioBlob) {
        const audioFile = new File([audioBlob], `voice_note_${Date.now()}.webm`, { type: 'audio/webm' });
        fileData = await uploadFile(audioFile);
      }
      
      await addPost(newPostText, user, null, fileData);
      setNewPostText("");
      setSelectedFile(null);
      setAudioBlob(null);
      setShowEditor(false);
      setTyping(false);
    } catch (error) {
      console.error("Failed to add post", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) return (
    <div className="page-container flex items-center justify-center">
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-12 h-12 rounded-full border-2 border-[#ff3333] border-t-transparent animate-spin"
      />
    </div>
  );

  return (
    <div className="page-container pt-20">
      <div className="max-w-4xl mx-auto relative z-10">
        <header className="mb-12 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-4 bg-gradient-to-r from-[var(--text-primary)] to-[var(--accent-color)] bg-clip-text text-transparent"
          >
            Eirni & Dany's Garden
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-secondary"
          >
            Our bilingual space for thoughts and memories / Notre jardin de pensées.
          </motion.p>
        </header>

        <div className="mb-12">
          {!showEditor ? (
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowEditor(true)}
              className="w-full card p-6 flex items-center justify-center gap-3 border-dashed border-2 border-[#333] hover:border-[#ff3333] transition-all cursor-pointer bg-white/5"
            >
              <Plus className="text-[#ff3333]" />
              <span className="font-medium">Démarrer une nouvelle discussion</span>
            </motion.button>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card border-[#ff3333]/30"
            >
              <div className="flex items-center gap-2 mb-6">
                <Sparkles size={20} className="text-[#ff3333]" />
                <h2 className="text-xl font-bold">Nouvelle Racine</h2>
              </div>
              
              <form onSubmit={handleSubmit}>
                <textarea 
                  value={newPostText}
                  onChange={(e) => {
                    setNewPostText(e.target.value);
                    setTyping(e.target.value.length > 0);
                  }}
                  onBlur={() => setTyping(false)}
                  placeholder="What's on your mind? / De quoi voulez-vous discuter ?"
                  className="input-area"
                  disabled={submitting}
                  autoFocus
                />
                
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <FileUpload onFileSelect={setSelectedFile} />
                    <div className="w-px h-6 bg-white/10"></div>
                    <VoiceRecorder onAudioReady={setAudioBlob} />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <button 
                      type="button" 
                      onClick={() => setShowEditor(false)}
                      className="btn-icon"
                    >
                      Cancel / Annuler
                    </button>
                    <button 
                      type="submit"
                      className="btn-accent px-8"
                      disabled={submitting || (!newPostText.trim() && !selectedFile && !audioBlob)}
                    >
                      {submitting ? "Sending..." : "Post / Publier"}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <MessageSquare size={24} className="text-[#ff3333]" />
            Fils Actifs
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.length === 0 ? (
              <div className="col-span-full p-12 text-center card bg-white/2 border-dashed">
                <p className="text-secondary">Aucun voyage n'a encore commencé.</p>
              </div>
            ) : (
              posts.map((post, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={post.id}
                  className="relative group"
                >
                  <div className="card h-full flex flex-col hover:border-[#ff3333]/50 transition-all relative">
                    {/* Delete Button - Positioned absolutely and outside the link area */}
                    {user && user.uid === post.authorId && (
                      <button 
                        onClick={(e) => handleDeletePost(e, post.id)}
                        className="btn-delete"
                        title="Supprimer la discussion"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}

                    <Link href={`/discussions/${post.id}`} className="flex-1 flex flex-col p-6">
                      <div className="flex justify-between items-start mb-4 pr-8">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#ff3333]/20 flex items-center justify-center text-[10px] font-bold text-[#ff3333]">
                            {post.authorName?.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-bold text-sm">{post.authorName}</span>
                        </div>
                        <span className="text-[10px] text-secondary uppercase tracking-wider">
                          <ClientOnlyDate date={post.createdAt?.toDate()} />
                        </span>
                      </div>
                      
                      <p className="text-gray-300 text-sm line-clamp-3 mb-6 flex-1">
                        {post.text}
                      </p>
                      
                      {post.fileUrl && (
                        <div className="mb-4 flex items-center gap-2 text-[10px] text-[#ff3333] bg-[#ff3333]/10 w-fit px-2 py-1 rounded">
                          <Sparkles size={10} />
                          Contient un média
                        </div>
                      )}
                      
                      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-xs text-secondary group">
                        <span>Entrer dans l'arborescence</span>
                        <motion.span 
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="text-[#ff3333]"
                        >
                          →
                        </motion.span>
                      </div>
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
