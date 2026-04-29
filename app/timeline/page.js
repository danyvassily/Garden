"use client";

import { useState, useEffect, useRef } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Star, Plus, X, Heart, Clock, Sparkles, Image as ImageIcon } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import { addPost } from "@/lib/firestore";
import { uploadFile } from "@/lib/storage";
import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-garden-gradient">
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid #e94560", borderTopColor: "transparent" }}
      />
    </div>
  );
}

// Category tags for memories
const CATEGORIES = [
  { id: "moment", label: "✨ Moment", color: "#f59e0b" },
  { id: "voyage", label: "🗺️ Voyage", color: "#10b981" },
  { id: "surprise", label: "🎁 Surprise", color: "#8b5cf6" },
  { id: "quotidien", label: "🌿 Quotidien", color: "#06b6d4" },
  { id: "emotion", label: "❤️ Émotion", color: "#e94560" },
];

export default function TimelinePage() {
  const { user, loading } = UserAuth();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newText, setNewText] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("moment");
  const [submitting, setSubmitting] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, "posts"), orderBy("createdAt", "asc"));
      const unsub = onSnapshot(q, (snap) => {
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setPosts(all.filter(p => p.parentId === null));
      });
      return () => unsub();
    }
  }, [user]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newText.trim() && !selectedFile) return;
    setSubmitting(true);
    try {
      let fileData = null;
      if (selectedFile) fileData = await uploadFile(selectedFile);
      await addPost(newText, user, null, fileData, null, newSubject || undefined);
      setNewText(""); setNewSubject(""); setSelectedFile(null); setShowModal(false);
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  if (loading || !user) return <Spinner />;

  const getCategory = (post) => CATEGORIES.find(c => c.id === post.category) || CATEGORIES[0];

  return (
    <div style={{ minHeight: "100vh", background: "hsl(var(--bg-color))", backgroundImage: "radial-gradient(circle at 10% 10%, hsla(var(--color-peach), 0.4) 0%, transparent 60%), radial-gradient(circle at 90% 10%, hsla(var(--color-lavender), 0.4) 0%, transparent 60%), radial-gradient(circle at 50% 90%, hsla(var(--color-mint), 0.4) 0%, transparent 60%)", paddingBottom: 80 }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "140px 24px 60px" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", marginBottom: 64 }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{ display: "inline-flex", padding: 14, borderRadius: 20, background: "rgba(233,69,96,0.1)", marginBottom: 20 }}
          >
            <Calendar size={36} color="#e94560" />
          </motion.div>
          <h1 style={{ fontFamily: "var(--font-serif, serif)", fontSize: 48, fontWeight: 700, color: "#1a1a2e", margin: "0 0 12px", letterSpacing: "-0.02em" }}>
            Notre Histoire
          </h1>
          <p style={{ color: "#888", fontSize: 14, fontWeight: 500, marginBottom: 32 }}>
            Chaque chapitre de notre voyage, gravé dans le temps
          </p>
          <motion.button
            onClick={() => setShowModal(true)}
            whileHover={{ scale: 1.06, y: -3 }}
            whileTap={{ scale: 0.94 }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "14px 28px", borderRadius: 18,
              background: "linear-gradient(135deg, #e94560, #a855f7)",
              color: "#fff", border: "none", cursor: "pointer",
              fontWeight: 800, fontSize: 13, letterSpacing: "0.08em",
              textTransform: "uppercase",
              boxShadow: "0 8px 24px rgba(233,69,96,0.35)",
            }}
          >
            <Plus size={18} /> Nouveau Chapitre
          </motion.button>
        </motion.div>

        {/* Timeline */}
        {posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: "center", padding: "80px 32px", borderRadius: 28, border: "2px dashed rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.5)" }}
          >
            <Heart size={56} color="#e94560" strokeWidth={1.5} style={{ margin: "0 auto 20px", display: "block", opacity: 0.3 }} />
            <p style={{ color: "#888", fontWeight: 500 }}>Notre histoire attend son premier chapitre.</p>
          </motion.div>
        ) : (
          <div style={{ position: "relative" }}>
            {/* Central glowing thread */}
            <div style={{
              position: "absolute",
              left: "50%",
              top: 0, bottom: 0,
              width: 3,
              marginLeft: -1.5,
              background: "linear-gradient(to bottom, #e94560, #a855f7, #5eead4, #e94560)",
              backgroundSize: "100% 400%",
              borderRadius: 8,
              opacity: 0.35,
            }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
              {posts.map((post, i) => {
                const isLeft = i % 2 === 0;
                const cat = getCategory(post);
                const date = post.createdAt?.toDate?.();
                const isDany = post.authorName?.toLowerCase().includes("dany");
                const authorColor = isDany ? "#5eead4" : "#f9a8d4";
                const isHovered = hoveredId === post.id;

                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, x: isLeft ? -60 : 60 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6, type: "spring", bounce: 0.35 }}
                    style={{ position: "relative", display: "flex", justifyContent: isLeft ? "flex-start" : "flex-end", alignItems: "center" }}
                    onMouseEnter={() => setHoveredId(post.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    {/* Central dot */}
                    <div style={{
                      position: "absolute",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 18, height: 18,
                      borderRadius: "50%",
                      background: cat.color,
                      border: "4px solid white",
                      boxShadow: `0 0 16px ${cat.color}80`,
                      zIndex: 10,
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      ...(isHovered ? { transform: "translateX(-50%) scale(1.4)", boxShadow: `0 0 28px ${cat.color}` } : {}),
                    }} />

                    {/* Horizontal connector */}
                    <div style={{
                      position: "absolute",
                      top: "50%",
                      left: isLeft ? "calc(50% + 9px)" : undefined,
                      right: isLeft ? undefined : "calc(50% + 9px)",
                      width: "calc(50% - 60px - 9px)",
                      height: 2,
                      background: `linear-gradient(${isLeft ? "to right" : "to left"}, ${cat.color}50, transparent)`,
                      zIndex: 1,
                    }} />

                    {/* Card */}
                    <motion.div
                      whileHover={{ y: -6, scale: 1.02 }}
                      style={{
                        width: "44%",
                        marginLeft: isLeft ? 0 : undefined,
                        marginRight: !isLeft ? 0 : undefined,
                        padding: 0,
                        borderRadius: 24,
                        overflow: "hidden",
                        background: "rgba(255,255,255,0.92)",
                        backdropFilter: "blur(20px)",
                        border: "2px solid rgba(255,255,255,0.8)",
                        boxShadow: isHovered ? `0 20px 60px ${cat.color}30, 0 8px 20px rgba(0,0,0,0.08)` : "0 6px 24px rgba(0,0,0,0.07)",
                        transition: "box-shadow 0.3s ease",
                        cursor: "pointer",
                      }}
                    >
                      {/* Category bar */}
                      <div style={{ height: 4, background: cat.color, opacity: 0.8 }} />

                      {/* Image if present */}
                      {post.fileUrl && post.fileType?.startsWith("image/") && (
                        <div style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden" }}>
                          <img
                            src={post.fileUrl}
                            alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.7s ease", transform: isHovered ? "scale(1.06)" : "scale(1)" }}
                          />
                        </div>
                      )}

                      <div style={{ padding: "20px 22px" }}>
                        {/* Category badge + date */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                          <span style={{
                            fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em",
                            padding: "3px 8px", borderRadius: 8,
                            background: cat.color + "18", color: cat.color,
                          }}>
                            {cat.label}
                          </span>
                          <span style={{ fontSize: 9, opacity: 0.4, fontWeight: 700, textTransform: "uppercase" }}>
                            {date ? format(date, "d MMM yyyy", { locale: fr }) : ""}
                          </span>
                        </div>

                        {/* Title */}
                        {post.subject && (
                          <h3 style={{ fontFamily: "var(--font-serif, serif)", fontSize: 16, fontWeight: 700, color: "#1a1a2e", margin: "0 0 8px", lineHeight: 1.3 }}>
                            {post.subject}
                          </h3>
                        )}

                        {/* Text preview */}
                        <p style={{ fontSize: 12, color: "#555", lineHeight: 1.6, margin: 0, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {post.text}
                        </p>

                        {/* Footer */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 24, height: 24, borderRadius: 8, background: authorColor, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 900 }}>
                              {post.authorName?.substring(0, 1).toUpperCase()}
                            </div>
                            <span style={{ fontSize: 9, opacity: 0.45, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                              {date ? formatDistanceToNow(date, { addSuffix: true, locale: fr }) : ""}
                            </span>
                          </div>
                          {post.rating > 80 && (
                            <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#f59e0b", fontSize: 9, fontWeight: 800 }}>
                              <Star size={10} fill="#f59e0b" /> Précieux
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>

            {/* End of thread marker */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: 48 }}>
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg, #e94560, #a855f7)", boxShadow: "0 0 20px rgba(233,69,96,0.5)" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Add Memory Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(12px)", zIndex: 90 }}
            />
            <motion.div
              key="modal"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              style={{
                position: "fixed", bottom: 0, left: 0, right: 0,
                zIndex: 100, display: "flex", justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "100%", maxWidth: 600, maxHeight: "90vh", overflowY: "auto",
                  borderRadius: "28px 28px 0 0",
                  background: "rgba(255,255,255,0.97)",
                  backdropFilter: "blur(40px)",
                  boxShadow: "0 -20px 80px rgba(0,0,0,0.12)",
                }}
                onClick={e => e.stopPropagation()}
              >
                {/* Handle */}
                <div style={{ display: "flex", justifyContent: "center", padding: "16px 0 8px" }}>
                  <div style={{ width: 40, height: 4, borderRadius: 8, background: "rgba(0,0,0,0.1)" }} />
                </div>

                <div style={{ padding: "0 28px 32px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <div>
                      <h2 style={{ fontFamily: "var(--font-serif, serif)", fontSize: 24, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>Nouveau Chapitre</h2>
                      <p style={{ fontSize: 11, color: "#aaa", margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.15em" }}>Graver un souvenir</p>
                    </div>
                    <button onClick={() => setShowModal(false)} style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(0,0,0,0.05)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <X size={16} color="#888" />
                    </button>
                  </div>

                  <form onSubmit={handleAdd}>
                    {/* Subject */}
                    <input
                      value={newSubject}
                      onChange={e => setNewSubject(e.target.value)}
                      placeholder="Titre du chapitre..."
                      style={{
                        width: "100%", boxSizing: "border-box",
                        padding: "12px 16px", marginBottom: 12,
                        borderRadius: 14, border: "1.5px solid rgba(0,0,0,0.07)",
                        background: "rgba(0,0,0,0.03)", fontSize: 15, fontWeight: 600,
                        color: "#1a1a2e", outline: "none", fontFamily: "var(--font-serif, serif)",
                      }}
                    />

                    {/* Content */}
                    <textarea
                      value={newText}
                      onChange={e => setNewText(e.target.value)}
                      placeholder="Décris ce moment..."
                      rows={4}
                      style={{
                        width: "100%", boxSizing: "border-box",
                        padding: "14px 16px", marginBottom: 16,
                        borderRadius: 14, border: "1.5px solid rgba(0,0,0,0.07)",
                        background: "rgba(0,0,0,0.03)", fontSize: 13, fontWeight: 500,
                        color: "#333", outline: "none", resize: "none",
                      }}
                    />

                    {/* Category selector */}
                    <div style={{ marginBottom: 20 }}>
                      <p style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: "#aaa", marginBottom: 8 }}>Catégorie</p>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {CATEGORIES.map(cat => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedCategory(cat.id)}
                            style={{
                              padding: "6px 12px", borderRadius: 10, border: "2px solid",
                              borderColor: selectedCategory === cat.id ? cat.color : "rgba(0,0,0,0.08)",
                              background: selectedCategory === cat.id ? cat.color + "18" : "transparent",
                              color: selectedCategory === cat.id ? cat.color : "#888",
                              fontSize: 11, fontWeight: 700, cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* File Upload */}
                    <div style={{ marginBottom: 20 }}>
                      <FileUpload onFileSelect={setSelectedFile} />
                    </div>

                    {/* Submit */}
                    <motion.button
                      type="submit"
                      disabled={submitting || (!newText.trim() && !selectedFile)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        width: "100%", padding: "14px", borderRadius: 16,
                        background: "linear-gradient(135deg, #e94560, #a855f7)",
                        color: "#fff", border: "none", cursor: "pointer",
                        fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em",
                        boxShadow: "0 8px 24px rgba(233,69,96,0.3)",
                        opacity: (submitting || (!newText.trim() && !selectedFile)) ? 0.5 : 1,
                      }}
                    >
                      {submitting ? "Enregistrement..." : "✨ Graver ce souvenir"}
                    </motion.button>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
