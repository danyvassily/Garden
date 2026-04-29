"use client";

import { useEffect, useState } from "react";
import { UserAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore";
import { addPost, deletePost, addReaction } from "@/lib/firestore";
import { uploadFile } from "@/lib/storage";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquare, Plus, Sparkles, Trash2, Heart, X, Reply, Star } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import VoiceRecorder from "@/components/VoiceRecorder";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import usePresence from "@/hooks/usePresence";
import dynamic from "next/dynamic";
import DiscussionNode from "@/components/DiscussionNode";
import FilRougeTimeline from "@/components/FilRougeTimeline";

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
  const [allPosts, setAllPosts] = useState([]);
  const [newSubject, setNewSubject] = useState("");
  const [newPostText, setNewPostText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedPostModal, setSelectedPostModal] = useState(null);
  const { setTyping } = usePresence(user);

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
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Nouveau message de ${newPost.authorName}!`);
          }
        }
      }
      
      setPosts(rootPosts);
      setAllPosts(all);
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
    if (!window.confirm("Voulez-vous supprimer ce fil de discussion ?")) return;
    
    try {
      await deletePost(postId);
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
      
      await addPost(newPostText, user, null, fileData, null, newSubject);
      setNewPostText("");
      setNewSubject("");
      setSelectedFile(null);
      setAudioBlob(null);
      setShowEditor(false);
      setTyping(false);
    } catch (error) {
      console.error("Failed to add post", error);
      alert("Erreur lors de la sauvegarde : " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

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
    <div className="min-h-screen bg-garden-gradient pb-32">
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-12 md:pt-40 relative z-10">
        <header className="mb-16 text-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-block p-3 rounded-2xl bg-white/40 border border-white mb-6"
          >
            <Heart size={32} className="text-[var(--accent-color)] fill-[var(--accent-color)]" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-serif mb-4 text-[hsl(var(--text-primary))]"
          >
            Le Jardin des Pensées
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[hsl(var(--text-secondary))] max-w-xl mx-auto font-medium"
          >
            Notre espace partagé pour cultiver nos souvenirs et nos discussions.<br/>
            <span className="text-xs uppercase tracking-[0.3em] opacity-50 mt-4 block">Eirni & Dany</span>
          </motion.p>
        </header>

        <div className="max-w-2xl mx-auto mb-20">
          <AnimatePresence mode="wait">
            {!showEditor ? (
              <motion.button 
                key="btn"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -5 }}
                onClick={() => setShowEditor(true)}
                className="w-full card p-8 flex items-center justify-center gap-4 border-dashed border-2 border-black/10 hover:border-[var(--accent-color)] hover:bg-white transition-all cursor-pointer group"
              >
                <div className="p-2 rounded-full bg-[var(--accent-color)]/10 text-[var(--accent-color)] group-hover:scale-110 transition-transform">
                  <Plus size={24} />
                </div>
                <span className="font-bold text-lg">Semer une nouvelle pensée</span>
              </motion.button>
            ) : (
              <motion.div 
                key="editor"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="card shadow-2xl border-[var(--accent-color)]/20"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Sparkles size={20} className="text-[var(--accent-color)]" />
                    <h2 className="text-xl font-bold">Nouvelle Racine</h2>
                  </div>
                  <button onClick={() => setShowEditor(false)} className="text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
                    Annuler
                  </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <input 
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="Sujet de cette pensée..."
                    className="w-full bg-black/5 border border-transparent focus:border-[var(--accent-color)] focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-xl mb-4"
                    disabled={submitting}
                    required
                  />
                  <textarea 
                    value={newPostText}
                    onChange={(e) => {
                      setNewPostText(e.target.value);
                      setTyping(e.target.value.length > 0);
                    }}
                    onBlur={() => setTyping(false)}
                    placeholder="Qu'avez-vous en tête ?"
                    className="w-full bg-black/5 border border-transparent focus:border-[var(--accent-color)] focus:bg-white rounded-2xl p-6 min-h-[150px] outline-none transition-all font-medium text-lg mb-6"
                    disabled={submitting}
                  />
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <FileUpload onFileSelect={setSelectedFile} />
                      <div className="w-px h-8 bg-black/5 hidden md:block"></div>
                      <VoiceRecorder onAudioReady={setAudioBlob} />
                    </div>
                    
                    <button 
                      type="submit"
                      className="btn-accent px-10 py-4 bg-[hsl(var(--text-primary))] text-white rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all"
                      disabled={submitting || (!newPostText.trim() && !selectedFile && !audioBlob)}
                    >
                      {submitting ? "Envoi..." : "Publier dans le Jardin"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-12">
          <div className="flex items-center gap-4 mb-12">
            <MessageSquare size={24} className="text-[var(--accent-color)]" />
            <h2 className="text-2xl font-serif">Fils de discussion</h2>
            <div className="flex-1 h-px bg-black/5" />
          </div>
          
          <div className="w-full">
            {allPosts.length === 0 ? (
              <div className="p-20 text-center card bg-white/40 border-dashed">
                <Sparkles size={48} className="mx-auto mb-6 text-[var(--accent-color)] opacity-20" />
                <p className="text-[hsl(var(--text-secondary))] font-medium">Le jardin est encore calme. Semez votre première pensée.</p>
              </div>
            ) : (
              <FilRougeTimeline allPosts={allPosts} onOpenModal={setSelectedPostModal} />
            )}
          </div>
        </div>
      </div>

      {/* === MODAL: Full Discussion Panel === */}
      <AnimatePresence>
        {selectedPostModal && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPostModal(null)}
              className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-md"
            />

            {/* Panel sliding up from bottom */}
            <motion.div
              key="panel"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-[100] flex justify-center"
            >
              <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-t-[2.5rem] shadow-2xl"
                style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(40px)" }}
                onClick={e => e.stopPropagation()}
              >
                {/* Handle bar */}
                <div className="flex justify-center pt-4 pb-2">
                  <div className="w-12 h-1.5 rounded-full bg-black/10" />
                </div>

                <div className="px-6 md:px-10 pb-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg"
                        style={{ background: selectedPostModal.authorName?.toLowerCase().includes("dany") ? "#5eead4" : "#f9a8d4" }}
                      >
                        {selectedPostModal.authorName?.substring(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-2xl font-serif font-bold text-[hsl(var(--text-primary))]">
                          {selectedPostModal.subject || "Discussion"}
                        </h2>
                        <p className="text-xs font-black uppercase tracking-widest opacity-40">
                          {selectedPostModal.authorName} ·{" "}
                          {selectedPostModal.createdAt?.toDate
                            ? formatDistanceToNow(selectedPostModal.createdAt.toDate(), { addSuffix: true, locale: fr })
                            : "À l'instant"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedPostModal(null)}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors shrink-0"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Full text */}
                  <div className="mb-6 p-5 rounded-2xl bg-black/[0.03] border border-black/5">
                    <p className="text-[hsl(var(--text-primary))] text-base leading-relaxed font-medium whitespace-pre-wrap">
                      {selectedPostModal.text}
                    </p>
                  </div>

                  {/* Action bar: Reactions + Delete */}
                  <div className="flex flex-wrap items-center gap-3 mb-8 pb-6 border-b border-black/5">
                    {/* Emoji reactions */}
                    {["❤️", "🔥", "✨", "😍", "🙏", "💯"].map(emoji => (
                      <motion.button
                        key={emoji}
                        whileHover={{ scale: 1.3 }}
                        whileTap={{ scale: 0.85 }}
                        onClick={() => addReaction(selectedPostModal.id, emoji, user?.uid)}
                        className="text-xl w-10 h-10 flex items-center justify-center rounded-2xl bg-black/[0.04] hover:bg-[var(--accent-color)]/10 transition-colors"
                      >
                        {emoji}
                      </motion.button>
                    ))}

                    <div className="flex-1" />

                    {/* Delete (only own posts) */}
                    {user?.uid === selectedPostModal.authorId && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={async () => {
                          if (!window.confirm("Supprimer cette pensée ?")) return;
                          await deletePost(selectedPostModal.id);
                          setSelectedPostModal(null);
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 text-xs font-black uppercase tracking-widest transition-colors"
                      >
                        <Trash2 size={14} />
                        Supprimer
                      </motion.button>
                    )}
                  </div>

                  {/* Reply form */}
                  <ModalReplyForm post={selectedPostModal} user={user} allPosts={allPosts} />

                  {/* Link to full thread */}
                  <div className="mt-8 flex justify-center">
                    <Link
                      href={`/discussions/${selectedPostModal.parentId || selectedPostModal.id}`}
                      className="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border-2 border-black/10 hover:border-[var(--accent-color)] text-[hsl(var(--text-secondary))] hover:text-[var(--accent-color)] transition-all"
                    >
                      Voir l'arborescence complète →
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-component: Reply form + threaded replies inside modal
function ModalReplyForm({ post, user }) {
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replies, setReplies] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "posts"), where("parentId", "==", post.id));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setReplies(data.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)));
    });
    return () => unsub();
  }, [post.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await addPost(replyText, user, post.id, null);
      setReplyText("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const isDanyPost = post.authorName?.toLowerCase().includes("dany");
  const replyColor = isDanyPost ? "#a78bfa" : "#5eead4"; // New branch gets opposite color

  return (
    <div>
      {/* Existing replies as a mini fil rouge */}
      {replies.length > 0 && (
        <div className="mb-6 relative pl-6 border-l-2 border-dashed" style={{ borderColor: replyColor + "60" }}>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-4">
            {replies.length} ramification{replies.length > 1 ? "s" : ""}
          </p>
          <div className="space-y-4">
            <AnimatePresence>
              {replies.map((reply, i) => {
                const isReplyDany = reply.authorName?.toLowerCase().includes("dany");
                const color = isReplyDany ? "#5eead4" : "#f9a8d4";
                return (
                  <motion.div
                    key={reply.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 p-4 rounded-2xl bg-black/[0.03] border border-black/5"
                  >
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-[10px] font-black shadow-sm shrink-0 mt-0.5"
                      style={{ background: color }}
                    >
                      {reply.authorName?.substring(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider opacity-50">{reply.authorName}</span>
                        <span className="text-[9px] opacity-30">
                          {reply.createdAt?.toDate
                            ? formatDistanceToNow(reply.createdAt.toDate(), { addSuffix: true, locale: fr })
                            : "À l'instant"}
                        </span>
                      </div>
                      <p className="text-sm text-[hsl(var(--text-primary))] leading-relaxed">{reply.text}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Reply input */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: replyColor }} />
          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Nouvelle ramification</span>
        </div>
        <textarea
          value={replyText}
          onChange={e => setReplyText(e.target.value)}
          placeholder="Ajoutez votre réponse..."
          rows={3}
          className="w-full bg-black/[0.04] border border-transparent focus:border-[var(--accent-color)] focus:bg-white rounded-2xl p-4 outline-none transition-all font-medium resize-none text-sm"
          disabled={submitting}
        />
        <div className="flex justify-end">
          <motion.button
            type="submit"
            disabled={submitting || !replyText.trim()}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white text-xs font-black uppercase tracking-widest shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            style={{ background: "linear-gradient(135deg, #e94560, #a855f7)" }}
          >
            <Reply size={14} />
            {submitting ? "Envoi..." : "Répondre"}
          </motion.button>
        </div>
      </form>
    </div>
  );
}

