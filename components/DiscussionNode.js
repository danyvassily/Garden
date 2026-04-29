"use client";

import { useState, useEffect, useRef } from "react";
import { getReplies, addPost, deletePost, updatePost, ratePost, addReaction } from "@/lib/firestore";
import { UserAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Reply, FileText, Image as ImageIcon, ExternalLink, Trash2, Edit2, Check, X, Star, Heart, Smile, Play, Pause, Mic, Sparkles } from "lucide-react";
import FileUpload from "./FileUpload";
import { motion, AnimatePresence } from "framer-motion";
import usePresence from "@/hooks/usePresence";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function ClientOnlyDate({ date }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !date) return "À l'instant";
  return formatDistanceToNow(date, { addSuffix: true, locale: fr });
}

export default function DiscussionNode({ post, level = 0, isLast = false }) {
  const { user } = UserAuth();
  const { setTyping } = usePresence(user);
  const [replies, setReplies] = useState([]);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post.text);
  const [localRating, setLocalRating] = useState(post.rating || 0);

  // Refs for GSAP
  const nodeRef = useRef(null);
  const svgRef = useRef(null);
  const pathRef = useRef(null);

  const loadReplies = () => {
    const q = query(collection(db, "posts"), where("parentId", "==", post.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReplies(data.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)));
    });
    return unsubscribe;
  };

  useEffect(() => {
    if (post && !deleted) {
      const unsubscribe = loadReplies();
      return () => unsubscribe();
    }
  }, [post, deleted]);

  // GSAP ScrollTrigger Animation for the Red Thread
  useEffect(() => {
    if (level > 0 && pathRef.current && nodeRef.current) {
      const pathLength = pathRef.current.getTotalLength();
      
      // Reset stroke to hidden
      gsap.set(pathRef.current, { strokeDasharray: pathLength, strokeDashoffset: pathLength });

      const st = ScrollTrigger.create({
        trigger: nodeRef.current,
        start: "top 85%", // Starts animating when comment is 85% down the viewport
        end: "top 40%",   // Finishes when comment is 40% down
        scrub: 1,         // Smooth scrubbing
        animation: gsap.to(pathRef.current, {
          strokeDashoffset: 0,
          ease: "none"
        })
      });

      return () => {
        st.kill();
      };
    }
  }, [level, replies.length]);

  const handleUpdate = async () => {
    if (!editText.trim()) return;
    setSubmitting(true);
    try {
      await updatePost(post.id, editText);
      post.text = editText;
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update post", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRate = async (value) => {
    try {
      await ratePost(post.id, value);
      setLocalRating(value);
    } catch (error) {
      console.error("Failed to rate post", error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Voulez-vous supprimer ce message ?")) return;
    try {
      await deletePost(post.id);
      setDeleted(true);
    } catch (error) {
      console.error("Failed to delete post", error);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim() && !selectedFile) return;

    setSubmitting(true);
    try {
      let fileData = null;
      if (selectedFile) {
        const { uploadFile } = await import("@/lib/storage");
        fileData = await uploadFile(selectedFile);
      }
      await addPost(replyText, user, post.id, fileData);
      setReplyText("");
      setSelectedFile(null);
      setShowReplyBox(false);
      setTyping(false);
    } catch (error) {
      console.error("Failed to reply", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (deleted) return null;

  const isImage = post.fileType?.startsWith("image/");

  return (
    <div className="relative" ref={nodeRef}>
      {/* GSAP Animated SVG Connector */}
      {level > 0 && (
        <svg 
          ref={svgRef}
          className="absolute left-[-3rem] md:left-[-4rem] top-[-2rem] w-[3rem] md:w-[4rem] h-[calc(100%+2rem)] pointer-events-none z-0" 
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          {/* Vertical line continuing downwards (hidden if this is the last child) */}
          {!isLast && (
            <line x1="0" y1="0" x2="0" y2="100" stroke="var(--accent-color)" strokeWidth="4" vectorEffect="non-scaling-stroke" strokeDasharray="4 4" opacity="0.3" />
          )}
          
          {/* Curved branch to the right for this specific comment */}
          <path 
            ref={pathRef}
            d="M 0,0 L 0,20 Q 0,40 100,40" 
            fill="none" 
            stroke="url(#gradientThread)" 
            strokeWidth="5" 
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
          />
          
          <defs>
            <linearGradient id="gradientThread" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--accent-color)" />
              <stop offset="100%" stopColor="#ffb3c6" />
            </linearGradient>
          </defs>
        </svg>
      )}

      <div className={`flex flex-col ${level > 0 ? 'ml-12 md:ml-16 relative z-10' : ''}`}>
        <motion.div 
          initial={{ opacity: 0, x: level > 0 ? -20 : 0, y: level === 0 ? 20 : 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          className={`card mb-8 group relative ${level === 0 ? 'bg-white/70 shadow-xl border-[var(--accent-color)]/20' : 'bg-white/60 backdrop-blur-md shadow-lg hover:border-[var(--accent-color)]/50 transition-colors'}`}
        >
          {/* Rating Badge */}
          {localRating > 0 && !isEditing && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -right-3 -top-3 p-1.5 rounded-2xl bg-white shadow-xl border border-yellow-100 flex items-center gap-2 z-20"
            >
              <div className="bg-yellow-400 p-1 rounded-lg">
                <Star size={12} fill="white" className="text-white" />
              </div>
              <span className="text-xs font-black tracking-tighter pr-1">{localRating}</span>
            </motion.div>
          )}

          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[hsl(var(--text-primary))] text-white flex items-center justify-center text-xs font-black shadow-lg">
                {post.authorName?.substring(0, 1).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm leading-tight">{post.authorName}</span>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                  <ClientOnlyDate date={post.createdAt?.toDate()} />
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {user && user.uid === post.authorId && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setIsEditing(true)} className="p-2 rounded-xl hover:bg-black/5 text-[hsl(var(--text-secondary))]" title="Modifier">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={handleDelete} className="p-2 rounded-xl hover:bg-red-50 text-red-500" title="Supprimer">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-[hsl(var(--text-primary))] mb-6 whitespace-pre-wrap leading-relaxed font-medium">
            {isEditing ? (
              <div className="flex flex-col gap-4">
                <textarea 
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full bg-black/5 border border-[var(--accent-color)] rounded-2xl p-6 min-h-[100px] outline-none font-medium"
                  autoFocus
                />
                <div className="flex justify-end gap-3">
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-xs font-black uppercase tracking-widest opacity-40">
                    Annuler
                  </button>
                  <button onClick={handleUpdate} className="btn-accent px-6 py-2 rounded-xl text-white text-xs font-bold bg-[hsl(var(--text-primary))]" disabled={submitting}>
                    {submitting ? "Enregistrement..." : "Sauvegarder"}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-lg">{post.text}</p>
            )}
          </div>

          {/* Media Section */}
          {post.fileUrl && (
            <div className="mb-6 rounded-2xl overflow-hidden border border-black/5 shadow-inner bg-black/5">
              {isImage ? (
                <a href={post.fileUrl} target="_blank" rel="noreferrer" className="block relative group/img">
                  <img 
                    src={post.fileUrl} 
                    alt={post.fileName} 
                    className="max-h-[500px] w-full object-contain transition-transform duration-700 group-hover/img:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30">
                      <ExternalLink size={20} />
                    </div>
                  </div>
                </a>
              ) : post.fileType?.startsWith("audio/") ? (
                <div className="p-6 flex items-center gap-6">
                  <button 
                    className="w-14 h-14 rounded-2xl bg-[var(--accent-color)] flex items-center justify-center text-white shadow-xl shadow-[var(--accent-glow)] flex-shrink-0"
                    onClick={(e) => {
                      const audio = e.currentTarget.parentElement.querySelector('audio');
                      if (audio.paused) audio.play(); else audio.pause();
                    }}
                  >
                    <Play size={24} fill="white" className="ml-1" />
                  </button>
                  <div className="flex-1">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--accent-color)] mb-3">Note Vocale</p>
                    <div className="h-1.5 bg-black/5 rounded-full w-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "35%" }}
                        className="h-full bg-[var(--accent-color)]"
                      />
                    </div>
                  </div>
                  <audio src={post.fileUrl} className="hidden" />
                </div>
              ) : (
                <a href={post.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-6 hover:bg-black/5 transition-colors">
                  <div className="p-3 bg-[var(--accent-color)]/10 rounded-2xl text-[var(--accent-color)]">
                    <FileText size={28} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{post.fileName}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Document partagé</p>
                  </div>
                  <ExternalLink size={18} className="opacity-20" />
                </a>
              )}
            </div>
          )}

          {/* Actions & Reactions Bar */}
          <div className="flex flex-wrap items-center gap-3 border-t border-black/5 pt-4 mt-2">
            <button 
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--accent-color)] hover:bg-[var(--accent-color)]/10 px-4 py-2 rounded-xl transition-all"
            >
              <Reply size={16} />
              Répondre
            </button>

            <div className="relative group/emoji">
              <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/5 hover:bg-black/10 transition-all text-[hsl(var(--text-secondary))]">
                <Smile size={16} />
              </button>
              <div className="absolute bottom-full left-0 mb-2 p-2 glass-premium rounded-2xl shadow-2xl flex gap-1 opacity-0 pointer-events-none group-hover/emoji:opacity-100 group-hover/emoji:pointer-events-auto transition-all z-50">
                {['❤️', '🔥', '😍', '✨', '🙏', '💯'].map(emoji => (
                  <button 
                    key={emoji} 
                    onClick={() => addReaction(post.id, emoji, user.uid)}
                    className="text-xl p-2 hover:scale-125 transition-transform active:scale-90"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {post.reactions && Object.entries(post.reactions).map(([emoji, users]) => users.length > 0 && (
                  <motion.button
                    key={emoji}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => addReaction(post.id, emoji, user.uid)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all border ${users.includes(user.uid) ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-white shadow-md' : 'bg-white border-black/5 text-[hsl(var(--text-secondary))] hover:bg-black/5'}`}
                  >
                    <span>{emoji}</span>
                    <span className="font-black">{users.length}</span>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            {user && user.uid !== post.authorId && (
              <div className="ml-auto flex items-center gap-3 px-4 py-2 rounded-xl bg-black/5 group/rate">
                <Star size={14} className="text-yellow-400 group-hover/rate:scale-125 transition-transform" />
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={localRating} 
                  onChange={(e) => handleRate(parseInt(e.target.value))}
                  className="w-20 md:w-24 accent-[var(--accent-color)] cursor-pointer"
                />
                <span className="text-[10px] font-black text-[var(--accent-color)] w-6">{localRating}</span>
              </div>
            )}
          </div>

          {/* Reply Box */}
          <AnimatePresence>
            {showReplyBox && (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-8 pt-8 border-t-2 border-dashed border-black/5"
                onSubmit={handleReplySubmit}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={16} className="text-[var(--accent-color)]" />
                  <span className="text-xs font-black uppercase tracking-widest opacity-40">Nouvelle Ramification</span>
                </div>
                <textarea 
                  value={replyText}
                  onChange={(e) => {
                    setReplyText(e.target.value);
                    setTyping(e.target.value.length > 0);
                  }}
                  onBlur={() => setTyping(false)}
                  placeholder="Écrivez votre réponse..."
                  className="w-full bg-black/5 border border-transparent focus:border-[var(--accent-color)] focus:bg-white rounded-2xl p-6 min-h-[100px] outline-none transition-all font-medium mb-6"
                  autoFocus
                />
                <div className="flex items-center justify-between">
                  <FileUpload onFileSelect={setSelectedFile} />
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setShowReplyBox(false)} className="px-4 py-2 text-xs font-black uppercase tracking-widest opacity-40">
                      Annuler
                    </button>
                    <button type="submit" className="btn-accent px-8 py-3 bg-[hsl(var(--text-primary))] text-white rounded-xl font-bold shadow-lg" disabled={submitting || (!replyText.trim() && !selectedFile)}>
                      {submitting ? "Envoi..." : "Répondre"}
                    </button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Recursive Replies */}
        {replies.length > 0 && (
          <div className="replies-container">
            {replies.map((reply, index) => (
              <DiscussionNode key={reply.id} post={reply} level={level + 1} isLast={index === replies.length - 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
