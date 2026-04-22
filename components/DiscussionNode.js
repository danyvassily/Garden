"use client";

import { useState, useEffect } from "react";
import { getReplies, addPost, deletePost, updatePost, ratePost, addReaction } from "@/lib/firestore";
import { UserAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Reply, FileText, Image as ImageIcon, ExternalLink, Trash2, Edit2, Check, X, Star, Heart, Smile, Play, Pause, Mic } from "lucide-react";
import FileUpload from "./FileUpload";
import { motion, AnimatePresence } from "framer-motion";
import usePresence from "@/hooks/usePresence";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

function ClientOnlyDate({ date }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !date) return "À l'instant";
  return formatDistanceToNow(date, { addSuffix: true, locale: fr });
}

export default function DiscussionNode({ post, level = 0 }) {
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

  const handleUpdate = async () => {
    if (!editText.trim()) return;
    setSubmitting(true);
    try {
      await updatePost(post.id, editText);
      post.text = editText; // Update local ref
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
    if (!window.confirm("Voulez-vous supprimer le post ?")) return;
    
    try {
      await deletePost(post.id);
      setDeleted(true);
    } catch (error) {
      console.error("Failed to delete post", error);
      alert("Erreur lors de la suppression");
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
      loadReplies();
    } catch (error) {
      console.error("Failed to reply", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (deleted) return null;

  const isImage = post.fileType?.startsWith("image/");

  return (
    <div className="tree-container">
      {/* Dynamic Fil Rouge */}
      <div className="tree-line"></div>
      <motion.div 
        className="fil-rouge"
        initial={{ height: 0 }}
        animate={{ height: "100%" }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      ></motion.div>
      
      {level > 0 && <div className="node-connector"></div>}

      <motion.div 
        initial={{ opacity: 0, x: -30, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: level * 0.1 }}
        className="discussion-node ml-8"
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff3333] to-[#880000] flex items-center justify-center text-xs font-bold">
              {post.authorName?.substring(0, 2).toUpperCase()}
            </div>
            <span className="font-bold text-white text-sm">{post.authorName}</span>
          </div>
          <span className="text-xs text-secondary">
            <ClientOnlyDate date={post.createdAt?.toDate()} />
          </span>
        </div>
        
        <div className="text-gray-200 mb-4 whitespace-pre-wrap leading-relaxed text-sm relative">
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <textarea 
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="input-area min-h-[80px]"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsEditing(false)} className="btn-icon text-xs">
                  <X size={14} /> Annuler
                </button>
                <button onClick={handleUpdate} className="btn-accent px-3 py-1 text-xs" disabled={submitting}>
                  <Check size={14} /> {submitting ? "Enregistrement..." : "Sauvegarder"}
                </button>
              </div>
            </div>
          ) : (
            <>
              {post.text}
              {localRating > 0 && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-2 -top-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1"
                >
                  <Star size={10} fill="white" />
                  {localRating}/100
                </motion.div>
              )}
            </>
          )}
        </div>

        {post.fileUrl && (
          <div className="media-preview">
            {isImage ? (
              <a href={post.fileUrl} target="_blank" rel="noreferrer" className="block relative group">
                <img 
                  src={post.fileUrl} 
                  alt={post.fileName} 
                  className="max-h-80 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ExternalLink className="text-white" />
                </div>
              </a>
            ) : post.fileType?.startsWith("audio/") ? (
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
                <button 
                  className="w-12 h-12 rounded-full bg-[var(--accent-color)] flex items-center justify-center text-white shadow-lg flex-shrink-0"
                  onClick={(e) => {
                    const audio = e.currentTarget.parentElement.querySelector('audio');
                    if (audio.paused) audio.play(); else audio.pause();
                  }}
                >
                  <Play size={20} fill="white" className="ml-1" />
                </button>
                <div className="flex-1">
                  <p className="text-xs font-bold text-white mb-1">Voice Note / Note Vocale</p>
                  <div className="h-1 bg-white/10 rounded-full w-full overflow-hidden">
                    <div className="h-full bg-[var(--accent-color)] w-[30%]"></div>
                  </div>
                </div>
                <audio src={post.fileUrl} className="hidden" onPlay={(e) => {
                  e.currentTarget.parentElement.querySelector('button').innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="white" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
                }} onPause={(e) => {
                  e.currentTarget.parentElement.querySelector('button').innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="white" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
                }} />
              </div>
            ) : (
              <a 
                href={post.fileUrl} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors"
              >
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <FileText size={24} className="text-[#ff3333]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{post.fileName}</p>
                  <p className="text-xs text-secondary">Document PDF</p>
                </div>
                <ExternalLink size={16} className="text-secondary" />
              </a>
            )}
            <div className="citation px-4 py-2 bg-black/20">
              Source : {post.fileName} — Consulté {new Date().toLocaleDateString('fr-FR')}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {post.reactions && Object.entries(post.reactions).map(([emoji, users]) => users.length > 0 && (
            <motion.button
              key={emoji}
              whileTap={{ scale: 0.9 }}
              onClick={() => addReaction(post.id, emoji, user.uid)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-all ${users.includes(user.uid) ? 'bg-[var(--accent-color)] text-white shadow-lg' : 'bg-white/5 border border-white/10 text-secondary'}`}
            >
              <span>{emoji}</span>
              <span className="font-bold">{users.length}</span>
            </motion.button>
          ))}
          
          <div className="relative group/emoji">
            <button className="btn-icon p-1 hover:bg-white/10 rounded-full">
              <Smile size={16} />
            </button>
            <div className="absolute bottom-full left-0 mb-2 p-2 bg-white/90 backdrop-blur rounded-xl shadow-2xl flex gap-2 opacity-0 pointer-events-none group-hover/emoji:opacity-100 group-hover/emoji:pointer-events-auto transition-all z-40">
              {['❤️', '🔥', '😍', '✨', '😂', '😮'].map(emoji => (
                <button 
                  key={emoji} 
                  onClick={() => addReaction(post.id, emoji, user.uid)}
                  className="text-lg hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2">
            <button 
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="btn-icon text-xs py-1 px-2 border border-transparent hover:border-[#444]"
            >
              <Reply size={14} className="text-[var(--accent-color)]" />
              Répondre
            </button>

            {user && user.uid === post.authorId ? (
              <>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="btn-icon text-xs py-1 px-2 text-secondary hover:text-[var(--accent-color)]"
                >
                  <Edit2 size={14} />
                  <span className="ml-1">Modifier</span>
                </button>
                <button 
                  onClick={handleDelete}
                  className="btn-icon text-xs py-1 px-2 text-secondary hover:text-red-500"
                  title="Supprimer"
                >
                  <Trash2 size={14} />
                  <span className="ml-1">Supprimer</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-full border border-white/10 group">
                <span className="text-[10px] text-secondary group-hover:text-[var(--accent-color)] transition-colors">Rate / Noter:</span>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={localRating} 
                  onChange={(e) => handleRate(parseInt(e.target.value))}
                  className="w-20 accent-[var(--accent-color)] cursor-pointer"
                />
                <span className="text-[10px] font-bold text-[var(--accent-color)] w-6">{localRating}</span>
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showReplyBox && (
            <motion.form 
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mt-4 pt-4 border-t border-[#222] overflow-hidden"
              onSubmit={handleReplySubmit}
            >
              <textarea 
                value={replyText}
                onChange={(e) => {
                  setReplyText(e.target.value);
                  setTyping(e.target.value.length > 0);
                }}
                onBlur={() => setTyping(false)}
                placeholder="Ajoutez une ramification..."
                className="input-area min-h-[100px]"
                autoFocus
              />
              <div className="flex items-center justify-between">
                <FileUpload onFileSelect={setSelectedFile} />
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setShowReplyBox(false)}
                    className="btn-icon text-xs"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    className="btn-accent px-4 py-2 text-xs"
                    disabled={submitting || (!replyText.trim() && !selectedFile)}
                  >
                    {submitting ? "Envoi..." : "Ramifier"}
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>

      {replies.length > 0 && (
        <div className="mt-2">
          {replies.map(reply => (
            <DiscussionNode key={reply.id} post={reply} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
